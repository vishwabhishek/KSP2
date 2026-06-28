import json
import re
from datetime import datetime
from config import SCHEMA_MAPPING
from database import SessionLocal, Incident, Entity, init_db
from graph_db import GraphDBClient

# Clean up json strings returned by the model
def clean_llm_json(response_text):
    try:
        # Search for code blocks containing json
        match = re.search(r"```json\s*(.*?)\s*```", response_text, re.DOTALL)
        json_content = match.group(1) if match else response_text
        
        # Replace python style single quotes if any
        json_content = json_content.replace("'", '"')
        return json.loads(json_content.strip())
    except Exception as e:
        print(f"Error parsing model response to JSON: {e}. Raw response: {response_text}")
        return None

def parse_source_record(raw_record):
    """
    Applies the SCHEMA_MAPPING configuration to translate a raw source dictionary 
    into standard internal values.
    """
    mapped_data = {}
    
    # 1. FIR Number
    mapped_data["fir_number"] = str(raw_record.get(SCHEMA_MAPPING["fir_number"], "")).strip()
    
    # 2. District
    mapped_data["district"] = str(raw_record.get(SCHEMA_MAPPING["district"], "")).strip()
    
    # 3. Police Station
    mapped_data["police_station"] = str(raw_record.get(SCHEMA_MAPPING["police_station"], "")).strip()
    
    # 4. IPC Sections
    mapped_data["ipc_sections"] = str(raw_record.get(SCHEMA_MAPPING["ipc_sections"], "")).strip()
    
    # 5. Modus Operandi Narrative Text
    mapped_data["modus_operandi_text"] = str(raw_record.get(SCHEMA_MAPPING["modus_operandi_text"], "")).strip()
    
    # 6. Latitude Co-ordinate (float conversion)
    try:
        mapped_data["latitude"] = float(raw_record.get(SCHEMA_MAPPING["latitude"]))
    except (TypeError, ValueError):
        mapped_data["latitude"] = None
        
    # 7. Longitude Co-ordinate (float conversion)
    try:
        mapped_data["longitude"] = float(raw_record.get(SCHEMA_MAPPING["longitude"]))
    except (TypeError, ValueError):
        mapped_data["longitude"] = None
        
    # 8. Timestamp
    raw_time = raw_record.get(SCHEMA_MAPPING["timestamp"])
    if raw_time:
        # Support basic timestamp parsing (supports common formats, fallback to now)
        try:
            # Try ISO format
            mapped_data["timestamp"] = datetime.fromisoformat(str(raw_time))
        except ValueError:
            try:
                # Try common KSP format "YYYY-MM-DD HH:MM:SS"
                mapped_data["timestamp"] = datetime.strptime(str(raw_time), "%Y-%m-%d %H:%M:%S")
            except ValueError:
                mapped_data["timestamp"] = datetime.utcnow()
    else:
        mapped_data["timestamp"] = datetime.utcnow()
        
    return mapped_data

def ingest_raw_records(records_list):
    """
    Ingests multiple raw dictionaries from a dataset source using the mapper.
    """
    session = SessionLocal()
    count = 0
    for record in records_list:
        mapped = parse_source_record(record)
        if not mapped["fir_number"]:
            continue
            
        # Check if record already exists to prevent duplicate key constraint
        existing = session.query(Incident).filter(Incident.fir_number == mapped["fir_number"]).first()
        if existing:
            continue
            
        incident = Incident(
            fir_number=mapped["fir_number"],
            district=mapped["district"],
            police_station=mapped["police_station"],
            timestamp=mapped["timestamp"],
            latitude=mapped["latitude"],
            longitude=mapped["longitude"],
            ipc_sections=mapped["ipc_sections"],
            modus_operandi_text=mapped["modus_operandi_text"],
            processed=False
        )
        session.add(incident)
        count += 1
        
    session.commit()
    session.close()
    print(f"Successfully mapped and ingested {count} new incident records into SQL database.")

async def process_unresolved_entities(llm_client):
    """
    Queries SQLite database for un-processed incidents, passes narratives to the Qwen LLM, 
    populates local Entity SQL tables, and syncs Cypher queries to Neo4j.
    """
    session = SessionLocal()
    graph_client = GraphDBClient()
    
    unprocessed = session.query(Incident).filter(Incident.processed == False).all()
    print(f"Found {len(unprocessed)} unprocessed records. Initiating AI extraction pipeline...")
    
    for incident in unprocessed:
        narrative = incident.modus_operandi_text or ""
        if not narrative:
            # Skip if there's no text narrative to analyze
            incident.processed = True
            session.add(incident)
            continue
            
        print(f"Extracting entities for FIR: {incident.fir_number}...")
        
        # Craft Prompt
        system_prompt = (
            "You are an expert criminologist AI system working for the State Crime Records Bureau.\n"
            "Analyze the provided text and extract entities strictly into this JSON format:\n"
            "{\n"
            "  \"suspects\": [], \"victims\": [], \"modus_operandi\": \"\", \"locations\": [], \"associations\": []\n"
            "}"
        )
        
        try:
            response = llm_client.chat_completion(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Analyze this case text: {narrative}"}
                ],
                max_tokens=1000,
                temperature=0.1
            )
            
            payload = clean_llm_json(response.choices[0].message.content)
            
            if payload:
                # 1. Save extracted entities to SQL tables
                for suspect in payload.get("suspects", []):
                    entity = Entity(incident_id=incident.id, name=suspect, type="Suspect")
                    session.add(entity)
                    
                for victim in payload.get("victims", []):
                    entity = Entity(incident_id=incident.id, name=victim, type="Victim")
                    session.add(entity)
                
                # 2. Sync to Neo4j Graph database
                graph_client.create_graph_entities(incident.fir_number, payload)
                
                incident.processed = True
                session.add(incident)
                print(f"Successfully processed and mapped graph nodes for FIR: {incident.fir_number}")
            else:
                print(f"Skipping FIR {incident.fir_number} due to invalid JSON payload.")
                
        except Exception as e:
            print(f"Failed to extract entities for FIR {incident.fir_number}: {e}")
            
    session.commit()
    session.close()
    graph_client.close()
