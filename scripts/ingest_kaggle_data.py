import csv
import json
import os

DATA_DIR = "./data/kaggle_crime/crime" # updated to look inside crime/
OUTPUT_DIR = "./src/utils/real_data"
os.makedirs(OUTPUT_DIR, exist_ok=True)

nature_of_complaints = []
try:
    with open(f"{DATA_DIR}/27_Nature_of_complaints_received_by_police.csv", "r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row.get("Area_Name") == "Karnataka":
                nature_of_complaints.append(row)
except Exception as e:
    print("Error reading 27_Nature_of_complaints_received_by_police.csv:", e)

with open(f"{OUTPUT_DIR}/nature_of_complaints.json", "w") as f:
    json.dump(nature_of_complaints, f, indent=2)

print(f"Ingested {len(nature_of_complaints)} records for nature of complaints.")
