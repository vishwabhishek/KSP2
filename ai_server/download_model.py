import os
import kagglehub

print("Authenticating with Kaggle...")
print("Fetching Gemma-4-31B-IT from Kaggle... This may take a while depending on your bandwidth.")

try:
    path = kagglehub.model_download("google/gemma-4/PyTorch/31b-it")
    print("Model successfully downloaded to:", path)
    
    # Save the path to a config file for main.py to read
    os.makedirs("./model_weights", exist_ok=True)
    with open("./model_weights/model_path.txt", "w") as f:
        f.write(path)
except Exception as e:
    print(f"Failed to download the model from Kaggle: {e}")
    print("Please ensure you have configured your Kaggle API credentials.")
