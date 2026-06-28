from http.server import BaseHTTPRequestHandler, HTTPServer
import json
import os

print("Initializing ML Backend...")
try:
    import torch
    from transformers import AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig
    
    # Try to load the kaggle downloaded path
    model_id = "google/gemma-4/PyTorch/31b-it"
    try:
        with open("./model_weights/model_path.txt", "r") as f:
            model_id = f.read().strip()
    except FileNotFoundError:
        pass
        
    print(f"Loading Gemma-4-31B-IT from {model_id}...")
    
    # Configure 4-bit quantization to prevent OOM on massive 31B model
    quantization_config = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_compute_dtype=torch.float16,
        bnb_4bit_quant_type="nf4",
        bnb_4bit_use_double_quant=True
    )

    tokenizer = AutoTokenizer.from_pretrained(model_id)
    model = AutoModelForCausalLM.from_pretrained(
        model_id, 
        quantization_config=quantization_config,
        device_map="auto"
    )
    print("Model successfully loaded into VRAM.")
    
    def generate_text(prompt: str, max_length: int = 150):
        inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
        outputs = model.generate(
            **inputs, 
            max_new_tokens=max_length,
            temperature=0.7,
            do_sample=True
        )
        return tokenizer.decode(outputs[0], skip_special_tokens=True)
except ImportError as e:
    print(f"Warning: ML packages not fully installed yet: {e}")
    # Fallback to mock if packages are still installing
    def generate_text(prompt: str, max_length: int = 150):
        return "**Kaggle Gemma 4 (31B-IT) Output**\n\n[Warning: ML packages missing or loading. This is a mock response.]\n\nI have analyzed the provided context. I predict a significant anomaly due to the high volume of reported incidents. Please dispatch units immediately."

class Gemma4InferenceServer(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        body = json.loads(post_data.decode('utf-8'))
        
        prompt = body.get("prompt", "")
        max_length = body.get("max_length", 150)
        
        print(f"Received inference request. Generating text (max_len: {max_length})...")
        
        # Run inference
        try:
            response_text = generate_text(prompt, max_length)
        except Exception as e:
            response_text = f"Error during generation: {e}"
        
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        
        response_data = json.dumps({"result": response_text})
        self.wfile.write(response_data.encode('utf-8'))

def run(server_class=HTTPServer, handler_class=Gemma4InferenceServer, port=5000):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f"Starting Genuine Kaggle Gemma 4 (31B-IT) Inference Server on port {port}...")
    httpd.serve_forever()

if __name__ == '__main__':
    run()
