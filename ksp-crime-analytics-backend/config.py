import os

# Database configurations
# Uses local SQLite for Phase 1 prototype, switches to PostgreSQL in production
SQL_DATABASE_URI = os.getenv("SQL_DATABASE_URI", "sqlite:///ksp_crime_analytics.db")

# Neo4j Graph Database configurations
NEO4J_URI = os.getenv("NEO4J_URI", "bolt://localhost:7687")
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "password")

# Schema mapping dictionary
# Maps internal standardized field names to the raw CSV dataset column names.
# To support the official KSP dataset later, only change the values in this dictionary.
SCHEMA_MAPPING = {
    # Internal Standardized Field Name -> External Source Column Name
    "fir_number": os.getenv("MAP_FIR_NUMBER", "FIRNo"),
    "district": os.getenv("MAP_DISTRICT", "District_Name"),
    "police_station": os.getenv("MAP_POLICE_STATION", "PS_Name"),
    "timestamp": os.getenv("MAP_TIMESTAMP", "FIR_Date_Time"),
    "latitude": os.getenv("MAP_LATITUDE", "Latitude"),
    "longitude": os.getenv("MAP_LONGITUDE", "Longitude"),
    "ipc_sections": os.getenv("MAP_IPC_SECTIONS", "Act_Section"),
    "modus_operandi_text": os.getenv("MAP_MODUS_OPERANDI", "FIR_Narrative")
}
