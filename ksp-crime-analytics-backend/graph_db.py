import os
from config import NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD

# Attempt to load neo4j driver, fallback to log-only if not present
try:
    from neo4j import GraphDatabase
    NEO4J_AVAILABLE = True
except ImportError:
    NEO4J_AVAILABLE = False

class GraphDBClient:
    def __init__(self):
        self.driver = None
        if NEO4J_AVAILABLE:
            try:
                self.driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))
                # Quick test connection
                self.driver.verify_connectivity()
                print("Neo4j Graph Database connected successfully.")
            except Exception as e:
                print(f"Warning: Failed to connect to Neo4j database at {NEO4J_URI}. Error: {e}")
                print("Proceeding in graph simulation mode (Cypher queries will be printed but not executed).")
                self.driver = None
        else:
            print("Warning: 'neo4j' package is not installed.")
            print("Proceeding in graph simulation mode (Cypher queries will be printed but not executed).")

    def close(self):
        if self.driver:
            self.driver.close()

    def create_graph_entities(self, fir_number, extraction_data):
        """
        Creates Neo4j graph nodes and relationships based on LLM extracted JSON output.
        extraction_data structure:
        {
          "suspects": ["Name1", "Name2"],
          "victims": ["Name3"],
          "modus_operandi": "Description",
          "locations": ["Loc1"],
          "associations": []
        }
        """
        suspects = extraction_data.get("suspects", [])
        victims = extraction_data.get("victims", [])
        modus_operandi = extraction_data.get("modus_operandi", "")
        locations = extraction_data.get("locations", [])
        
        # Build Cypher Queries
        queries = []
        
        # 1. Create Incident Node
        queries.append((
            "MERGE (i:Incident {fir_number: $fir_number}) RETURN i",
            {"fir_number": fir_number}
        ))
        
        # 2. Add Modus Operandi Node & Relationship
        if modus_operandi:
            queries.append((
                "MERGE (mo:ModusOperandi {description: $mo_desc})\n"
                "WITH mo\n"
                "MATCH (i:Incident {fir_number: $fir_number})\n"
                "MERGE (i)-[:HAS_MO]->(mo)",
                {"fir_number": fir_number, "mo_desc": modus_operandi}
            ))
            
        # 3. Add Suspects & ACCUSED relationships
        for name in suspects:
            queries.append((
                "MERGE (p:Person {name: $name})\n"
                "WITH p\n"
                "MATCH (i:Incident {fir_number: $fir_number})\n"
                "MERGE (p)-[:ACCUSED_IN]->(i)",
                {"fir_number": fir_number, "name": name}
            ))
            
        # 4. Add Victims & VICTIM_OF relationships
        for name in victims:
            queries.append((
                "MERGE (p:Person {name: $name})\n"
                "WITH p\n"
                "MATCH (i:Incident {fir_number: $fir_number})\n"
                "MERGE (p)-[:VICTIM_OF]->(i)",
                {"fir_number": fir_number, "name": name}
            ))

        # 5. Add Locations & OCCURRED_AT relationships
        for loc in locations:
            queries.append((
                "MERGE (l:Location {name: $loc_name})\n"
                "WITH l\n"
                "MATCH (i:Incident {fir_number: $fir_number})\n"
                "MERGE (i)-[:OCCURRED_AT]->(l)",
                {"fir_number": fir_number, "loc_name": loc}
            ))

        # Execute or Simulation logs
        if self.driver:
            with self.driver.session() as session:
                for query, params in queries:
                    try:
                        session.run(query, **params)
                    except Exception as e:
                        print(f"Cypher execution failed: {e}")
        else:
            print(f"\n--- [Cypher Graph Simulation] Ingesting incident: {fir_number} ---")
            for query, params in queries:
                print(f"QUERY:\n{query}\nPARAMS: {params}\n")
            print("--------------------------------------------------------------------\n")
