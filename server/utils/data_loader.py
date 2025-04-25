import os
import json

#Load Level data
def load_level_data(level_id):
    #filepath = f"server/levels/level_{level_id}.json"
    filepath = f"server/levels/levels.json"
    if not os.path.exists(filepath):
        print(f"[ERROR] Level data file not found: {filepath}")
        return None
    try:
        with open(filepath, "r") as f:
            data = json.load(f)
            # Validate required fields

        if not all(k in data[int(level_id)-1] for k in ["level_id", "mission", "dataset"]):
            print(f"[ERROR] Missing required fields in: {filepath}")
            return None
        return data[int(level_id)-1]
    except Exception as e:
        print(f"[ERROR] Failed to load level data: {e}")
        return None
    
def level_title():
    filepath = f"server/levels/levels.json"
    if not os.path.exists(filepath):
        print(f"[ERROR] Level data file not found: {filepath}")
        return None
    
    try:
        with open(filepath, "r") as f:
            data = json.load(f)
            return data
    except Exception as e:
        print(f"[ERROR] Failed to load level data: {e}")
        return None
    
def concepts():
    filepath = f"server/levels/concepts.json"
    if not os.path.exists(filepath):
        print(f"[ERROR] Concepts data not found: {filepath}")
        return None
    
    try:
        with open(filepath, "r") as f:
            concepts_data = json.load(f)
            return concepts_data
    except Exception as e:
        print(f"[ERROR] Failed to load level data: {e}")
        return None
        
    