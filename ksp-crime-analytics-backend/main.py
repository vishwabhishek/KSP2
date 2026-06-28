import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'lib'))

from fastapi import FastAPI, HTTPException, Depends
from huggingface_hub import InferenceClient
import uvicorn

app = FastAPI()

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

@app.post("/api/v1/analyze-incident")
async def analyze_incident(raw_fir_text: dict):
    narrative = raw_fir_text.get("text")
    if not narrative:
        raise HTTPException(status_code=400, detail="No crime log text provided.")

    # Engineering a strict JSON constraint system prompt
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
            temperature=0.1 # Low temperature ensures strict factual data parsing
        )
        
        # In a full deployment, pass this clean json output 
        # directly to a Neo4j database instance to draw nodes.
        return {"status": "success", "graph_payload": response.choices[0].message.content}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    # Read the explicit internal port provided by Zoho Catalyst
    port = int(os.environ.get("X_ZOHO_CATALYST_LISTEN_PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
