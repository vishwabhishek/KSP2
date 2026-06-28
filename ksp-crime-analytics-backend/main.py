import sys
import os
import math
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'lib'))

from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from huggingface_hub import InferenceClient
import uvicorn
import csv
import io
import json

app = FastAPI()

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load environment variables from .env file if it exists (local development)
for env_path in [os.path.join(os.path.dirname(__file__), '.env'), os.path.join(os.path.dirname(__file__), '..', '.env')]:
    if os.path.exists(env_path):
        with open(env_path, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, val = line.split('=', 1)
                    os.environ[key.strip()] = val.strip().strip('"').strip("'")

# Securely grab environment variables configured in Catalyst Console or local .env
HF_TOKEN = os.getenv("HF_SECURE_TOKEN")
# Using a trusted endpoint running Qwen 2.5 (72B)
client = InferenceClient(model="Qwen/Qwen2.5-72B-Instruct", token=HF_TOKEN)

# Import DB and ingestion utilities (dependencies are imported after environment loading)
from database import init_db, SessionLocal, Incident, Entity
from ingestion import ingest_raw_records, process_unresolved_entities

# Initialize SQLite database schema
init_db()

pipeline_running = False

@app.post("/api/v1/upload-csv")
async def upload_csv(file: UploadFile = File(...)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed.")
    try:
        content = await file.read()
        csv_text = content.decode('utf-8-sig')
        reader = csv.DictReader(io.StringIO(csv_text))
        records = [row for row in reader]
        
        # Run standard ingestion to SQL
        ingest_raw_records(records)
        return {"status": "success", "message": f"Successfully ingested {len(records)} raw incident logs."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error parsing and ingesting CSV: {str(e)}")

@app.post("/api/v1/run-pipeline")
async def run_pipeline(background_tasks: BackgroundTasks):
    global pipeline_running
    if pipeline_running:
        return {"status": "error", "message": "AI Entity Extraction pipeline is already running."}
        
    session = SessionLocal()
    unprocessed_count = session.query(Incident).filter(Incident.processed == False).count()
    session.close()
    
    if unprocessed_count == 0:
        return {"status": "success", "message": "All incident records have already been processed."}
        
    def run_pipeline_sync():
        global pipeline_running
        pipeline_running = True
        import asyncio
        try:
            # Run the async pipeline processing synchronously in the background thread
            asyncio.run(process_unresolved_entities(client))
        except Exception as e:
            print(f"Error in background pipeline execution: {e}")
        finally:
            pipeline_running = False

    background_tasks.add_task(run_pipeline_sync)
    return {
        "status": "success",
        "message": f"AI Pipeline started in the background. Processing {unprocessed_count} unresolved incident records."
    }

@app.get("/api/v1/stats")
async def get_stats():
    session = SessionLocal()
    try:
        total_incidents = session.query(Incident).count()
        processed_incidents = session.query(Incident).filter(Incident.processed == True).count()
        unprocessed_incidents = total_incidents - processed_incidents
        suspects_count = session.query(Entity).filter(Entity.type == 'Suspect').count()
        victims_count = session.query(Entity).filter(Entity.type == 'Victim').count()
        
        # Aggregate stats by district
        districts_query = session.query(Incident.district, Incident.processed).all()
        districts_map = {}
        for dist, processed in districts_query:
            if not dist:
                dist = "Unknown"
            if dist not in districts_map:
                districts_map[dist] = {"total": 0, "processed": 0}
            districts_map[dist]["total"] += 1
            if processed:
                districts_map[dist]["processed"] += 1
                
        districts_list = [
            {
                "districtName": dist,
                "incidentCount": stats["total"],
                "processedCount": stats["processed"],
                "riskStatus": "critical" if stats["total"] - stats["processed"] > 10 else "warning" if stats["total"] - stats["processed"] > 0 else "stable"
            }
            for dist, stats in districts_map.items()
        ]
        
        return {
            "status": "success",
            "metrics": {
                "totalIncidents": total_incidents,
                "processedIncidents": processed_incidents,
                "unprocessedIncidents": unprocessed_incidents,
                "suspectsCount": suspects_count,
                "victimsCount": victims_count
            },
            "districtsList": districts_list
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        session.close()

@app.get("/api/v1/incidents")
async def get_incidents(page: int = 1, limit: int = 50):
    session = SessionLocal()
    try:
        offset = (page - 1) * limit
        incidents = session.query(Incident).order_by(Incident.timestamp.desc()).offset(offset).limit(limit).all()
        
        result = []
        for inc in incidents:
            entities = [{"name": ent.name, "type": ent.type} for ent in inc.entities]
            result.append({
                "id": inc.id,
                "fir_number": inc.fir_number,
                "district": inc.district,
                "police_station": inc.police_station,
                "timestamp": inc.timestamp.isoformat() if inc.timestamp else None,
                "latitude": inc.latitude,
                "longitude": inc.longitude,
                "ipc_sections": inc.ipc_sections,
                "modus_operandi_text": inc.modus_operandi_text,
                "processed": inc.processed,
                "entities": entities
            })
        
        total = session.query(Incident).count()
        return {
            "status": "success",
            "incidents": result,
            "total": total,
            "page": page,
            "limit": limit
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        session.close()

@app.post("/api/v1/simulate-forecast")
async def simulate_forecast(payload: dict):
    prompt = payload.get("prompt")
    context = payload.get("context", {})
    if not prompt:
        raise HTTPException(status_code=400, detail="No prompt query provided.")
        
    system_prompt = (
        "You are an AI Criminal Analyst for the Karnataka State Police (KSP).\n"
        "Analyze the dynamic simulation metrics and spatial temporal indicators. Provide a concise, highly professional intelligence assessment."
    )
    
    try:
        response = client.chat_completion(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Simulation Parameters: {json.dumps(context)}\nUser Query: {prompt}"}
            ],
            max_tokens=800,
            temperature=0.7
        )
        return {"status": "success", "result": response.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/network")
async def get_network():
    session = SessionLocal()
    try:
        incidents = session.query(Incident).all()
        entities = session.query(Entity).all()
        
        # 1. Identify unique suspects and map their cases
        suspects_by_case = {}  # incident_id -> list of suspect names
        case_by_id = {}        # incident_id -> Incident object
        suspect_cases = {}     # suspect_name -> list of Incident objects
        
        for inc in incidents:
            case_by_id[inc.id] = inc
            suspects_by_case[inc.id] = []
            
        for ent in entities:
            if ent.type == "Suspect":
                name = ent.name.strip()
                if not name:
                    continue
                suspects_by_case[ent.incident_id].append(name)
                if name not in suspect_cases:
                    suspect_cases[name] = []
                if case_by_id.get(ent.incident_id):
                    suspect_cases[name].append(case_by_id[ent.incident_id])
                    
        # 2. Build the Co-Offending NetworkX Graph
        import networkx as nx
        G_co = nx.Graph()
        
        # Add all suspects as nodes
        for name in suspect_cases.keys():
            G_co.add_node(name)
            
        # Add co-offending edges (cliques within each case)
        for inc_id, suspects in suspects_by_case.items():
            if len(suspects) > 1:
                for i in range(len(suspects)):
                    for j in range(i + 1, len(suspects)):
                        s1, s2 = suspects[i], suspects[j]
                        if G_co.has_edge(s1, s2):
                            G_co[s1][s2]['weight'] = G_co[s1][s2].get('weight', 1) + 1
                        else:
                            G_co.add_edge(s1, s2, weight=1)
                            
        # 3. Calculate Network Metrics
        num_nodes = G_co.number_of_nodes()
        num_edges = G_co.number_of_edges()
        
        density = nx.density(G_co) if num_nodes > 1 else 0.0
        clustering = nx.average_clustering(G_co) if num_nodes > 1 else 0.0
        
        # Centrality scores
        degree_cent = nx.degree_centrality(G_co) if num_nodes > 0 else {}
        
        # PageRank (with fallback if solver fails to converge)
        try:
            pagerank = nx.pagerank(G_co, alpha=0.85) if num_nodes > 0 else {}
        except Exception:
            pagerank = degree_cent
            
        try:
            betweenness = nx.betweenness_centrality(G_co) if num_nodes > 0 else {}
        except Exception:
            betweenness = {}
            
        # Community detection (gang discovery)
        communities_list = []
        community_map = {}  # suspect_name -> community_id
        if num_nodes > 1:
            try:
                from networkx.algorithms.community import greedy_modularity_communities
                communities = list(greedy_modularity_communities(G_co))
                for c_idx, comm in enumerate(communities):
                    comm_members = list(comm)
                    communities_list.append({
                        "id": f"gang-{c_idx}",
                        "name": f"Gang Clique-{c_idx + 1}",
                        "members": comm_members
                    })
                    for m in comm_members:
                        community_map[m] = c_idx
            except Exception as e:
                print(f"Community detection error: {e}")
                
        # Handle isolates / default community for those not grouped
        for name in suspect_cases.keys():
            if name not in community_map:
                c_idx = len(communities_list)
                communities_list.append({
                    "id": f"gang-{c_idx}",
                    "name": f"Independent-{name}",
                    "members": [name]
                })
                community_map[name] = c_idx

        # 4. Link Prediction (Jaccard on graph structure)
        predicted_links = []
        if num_nodes > 2:
            try:
                preds = nx.jaccard_coefficient(G_co)
                for u, v, p in preds:
                    if p > 0.0:  # Only suggest if there is mutual co-offender overlap
                        predicted_links.append({
                            "source": u,
                            "target": v,
                            "score": float(round(p, 2))
                        })
            except Exception as e:
                print(f"Link prediction error: {e}")
                
        # 5. Behavioral / MO Similarity Matching
        behavioral_links = []
        STOPWORDS = {"the", "and", "was", "with", "from", "that", "this", "their", "they", "were", "been", "have", "reported", "complainant", "stolen", "stole", "police", "scene", "reported"}
        
        def compute_mo_similarity(mo1, mo2):
            if not mo1 or not mo2:
                return 0.0
            words1 = set(w.lower().strip(",.!?\"'") for w in mo1.split() if len(w) > 3) - STOPWORDS
            words2 = set(w.lower().strip(",.!?\"'") for w in mo2.split() if len(w) > 3) - STOPWORDS
            if not words1 or not words2:
                return 0.0
            return len(words1.intersection(words2)) / len(words1.union(words2))
            
        suspects_list = list(suspect_cases.keys())
        for i in range(len(suspects_list)):
            for j in range(i + 1, len(suspects_list)):
                s1, s2 = suspects_list[i], suspects_list[j]
                
                # Construct composite MO text from all associated cases
                mo1 = " ".join([c.modus_operandi_text or "" for c in suspect_cases[s1]])
                mo2 = " ".join([c.modus_operandi_text or "" for c in suspect_cases[s2]])
                
                sim = compute_mo_similarity(mo1, mo2)
                if sim > 0.12:  # Similarity threshold
                    behavioral_links.append({
                        "source": s1,
                        "target": s2,
                        "score": float(round(sim, 2))
                    })
                    
        # 6. Build React Flow Nodes & Edges
        nodes = []
        edges = []
        
        # Color codes for communities
        colors = ["#7f1d1d", "#064e3b", "#581c87", "#7c2d12", "#0f172a", "#1e3a8a", "#3b0764", "#031c30"]
        borders = ["#ef4444", "#34d399", "#c084fc", "#fb923c", "#38bdf8", "#60a5fa", "#e879f9", "#00d8f6"]
        
        # Suspect nodes
        for name in suspect_cases.keys():
            c_id = community_map.get(name, 0)
            color = colors[c_id % len(colors)]
            border = borders[c_id % len(borders)]
            
            nodes.append({
                "id": f"suspect-{name}",
                "data": {
                    "label": f"SUSPECT: {name}",
                    "name": name,
                    "type": "Suspect",
                    "community": communities_list[c_id]["name"] if c_id < len(communities_list) else "Independent",
                    "pagerank": float(round(pagerank.get(name, 0.0), 3)),
                    "betweenness": float(round(betweenness.get(name, 0.0), 3)),
                    "degree": G_co.degree(name),
                    "cases": [c.fir_number for c in suspect_cases[name]]
                },
                "style": {
                    "backgroundColor": color,
                    "color": "#f3f4f6",
                    "border": f"1px solid {border}",
                    "borderRadius": "4px",
                    "fontSize": "10px",
                    "fontFamily": "monospace",
                    "padding": "6px",
                    "width": 140
                }
            })
            
        # Incident nodes
        for inc in incidents:
            nodes.append({
                "id": f"incident-{inc.id}",
                "data": {
                    "label": f"CASE: {inc.fir_number}\n({inc.police_station})",
                    "fir_number": inc.fir_number,
                    "police_station": inc.police_station,
                    "district": inc.district,
                    "timestamp": inc.timestamp.isoformat() if inc.timestamp else None,
                    "modus_operandi": inc.modus_operandi_text,
                    "type": "Incident"
                },
                "style": {
                    "backgroundColor": "#1e1b4b",
                    "color": "#ffffff",
                    "border": "2px solid #ef4444",
                    "borderRadius": "4px",
                    "fontSize": "10px",
                    "fontFamily": "monospace",
                    "fontWeight": "bold",
                    "padding": "6px",
                    "width": 150
                }
            })
            
            # Map entities (Victims, etc.) that are NOT suspects
            for ent in inc.entities:
                if ent.type != "Suspect":
                    nodes.append({
                        "id": f"entity-{ent.id}",
                        "data": {
                            "label": f"{ent.type.upper()}: {ent.name}",
                            "name": ent.name,
                            "type": ent.type,
                            "incident_id": inc.id
                        },
                        "style": {
                            "backgroundColor": "#064e3b" if ent.type == "Victim" else "#1e293b",
                            "color": "#f3f4f6",
                            "border": "1px solid #34d399" if ent.type == "Victim" else "1px solid #475569",
                            "borderRadius": "4px",
                            "fontSize": "10px",
                            "fontFamily": "monospace",
                            "padding": "6px",
                            "width": 140
                        }
                    })
                    # Link victim/property to the incident
                    edges.append({
                        "id": f"edge-entity-{ent.id}-incident-{inc.id}",
                        "source": f"entity-{ent.id}",
                        "target": f"incident-{inc.id}",
                        "label": ent.type.upper(),
                        "style": {"stroke": "#34d399" if ent.type == "Victim" else "#475569"},
                        "labelStyle": {"fill": "#9ca3af", "fontSize": 8, "fontFamily": "monospace"}
                    })
                    
        # Add ACCUSED edges (Suspect -> Incident)
        for name, cases in suspect_cases.items():
            for c in cases:
                edges.append({
                    "id": f"edge-suspect-{name}-incident-{c.id}",
                    "source": f"suspect-{name}",
                    "target": f"incident-{c.id}",
                    "label": "ACCUSED",
                    "style": {"stroke": "#ef4444", "strokeWidth": 2},
                    "labelStyle": {"fill": "#f87171", "fontSize": 8, "fontFamily": "monospace"},
                    "animated": True
                })
                
        # Add CO_OFFENDER edges (Suspect -> Suspect)
        for s1, s2, data in G_co.edges(data=True):
            edges.append({
                "id": f"edge-cooffend-{s1}-{s2}",
                "source": f"suspect-{s1}",
                "target": f"suspect-{s2}",
                "label": f"CO-OFFEND ({data['weight']})",
                "style": {"stroke": "#ea580c", "strokeWidth": 2 + data['weight'], "strokeDasharray": "5 5"},
                "labelStyle": {"fill": "#fb923c", "fontSize": 8, "fontFamily": "monospace"}
            })
            
        # Add BEHAVIORAL_SIMILARITY edges (Suspect -> Suspect)
        for b_link in behavioral_links:
            s1, s2 = b_link["source"], b_link["target"]
            # Avoid duplicating co-offender links visually or just draw a distinct dashed line
            edges.append({
                "id": f"edge-behavioral-{s1}-{s2}",
                "source": f"suspect-{s1}",
                "target": f"suspect-{s2}",
                "label": f"MO SIMILAR ({b_link['score']})",
                "style": {"stroke": "#f59e0b", "strokeWidth": 1.5, "strokeDasharray": "3 3"},
                "labelStyle": {"fill": "#fbbf24", "fontSize": 8, "fontFamily": "monospace"}
            })
            
        # Add PREDICTED_LINK edges (Suspect -> Suspect)
        for p_link in predicted_links:
            s1, s2 = p_link["source"], p_link["target"]
            # Show a dotted pink line
            edges.append({
                "id": f"edge-predicted-{s1}-{s2}",
                "source": f"suspect-{s1}",
                "target": f"suspect-{s2}",
                "label": f"SNA PRED ({p_link['score']})",
                "style": {"stroke": "#ec4899", "strokeWidth": 1.5, "strokeDasharray": "1 3"},
                "labelStyle": {"fill": "#f472b6", "fontSize": 8, "fontFamily": "monospace"}
            })
            
        # 7. Position nodes (Radial Layout)
        total_nodes = len(nodes)
        center_x = 500
        center_y = 400
        radius = 280
        
        for i, node in enumerate(nodes):
            angle = (2 * 3.14159 * i) / (total_nodes or 1)
            # Layout grouping: cases near center, suspects in middle, victims on outside
            if node["id"].startswith("incident-"):
                current_radius = radius - 150
            elif node["id"].startswith("suspect-"):
                current_radius = radius
            else:
                current_radius = radius + 110
                
            node["position"] = {
                "x": center_x + current_radius * math.cos(angle),
                "y": center_y + current_radius * math.sin(angle)
            }
            
        # 8. Construct rankings
        pagerank_rank = [{"name": name, "score": float(round(score, 3))} for name, score in sorted(pagerank.items(), key=lambda x: x[1], reverse=True)]
        betweenness_rank = [{"name": name, "score": float(round(score, 3))} for name, score in sorted(betweenness.items(), key=lambda x: x[1], reverse=True)]
        degree_rank = [{"name": name, "score": G_co.degree(name)} for name, _ in sorted(degree_cent.items(), key=lambda x: x[1], reverse=True)]
        
        avg_degree = sum(dict(G_co.degree()).values()) / (num_nodes or 1)
        
        return {
            "status": "success",
            "nodes": nodes,
            "edges": edges,
            "metrics": {
                "density": float(round(density, 3)),
                "clustering": float(round(clustering, 3)),
                "gangCount": len(communities_list),
                "avgDegree": float(round(avg_degree, 2)),
                "totalSuspects": num_nodes,
                "totalIncidents": len(incidents)
            },
            "rankings": {
                "influence": pagerank_rank,
                "brokerage": betweenness_rank,
                "activity": degree_rank
            },
            "communities": communities_list,
            "predictedLinks": predicted_links,
            "behavioralMatches": behavioral_links
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        session.close()

@app.post("/api/v1/analyze-incident")
async def analyze_incident(raw_fir_text: dict):
    narrative = raw_fir_text.get("text")
    if not narrative:
        raise HTTPException(status_code=400, detail="No crime log text provided.")

    system_prompt = (
        "You are an expert criminologist AI system working for the State Crime Records Bureau.\n"
        "Analyze the provided text and extract entities strictly into this JSON format:\n"
        "{\n"
        "  'suspects': [], 'victims': [], 'modus_operandi': '', 'locations': [], 'associations': []\n"
        "}"
    )

    try:
        response = client.chat_completion(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Analyze this case text: {narrative}"}
            ],
            max_tokens=1000,
            temperature=0.1
        )
        return {"status": "success", "graph_payload": response.choices[0].message.content}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    port = int(os.environ.get("X_ZOHO_CATALYST_LISTEN_PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
