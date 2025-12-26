#!/usr/bin/env python3
"""
Sync verbs from folders to verbs.json lists with matching names.
Merges verbs from folder files into verbs.json without deleting existing verbs.
Each file may contain one or more lists (as keys), and those are synced to matching lists in verbs.json.
"""

import json
import os
from pathlib import Path

def load_json_file(file_path):
    """Load a JSON file, return None if file doesn't exist"""
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return None
    except json.JSONDecodeError as e:
        print(f"  Warning: Error reading {file_path}: {e}")
        return None

def is_verb_object(obj):
    """Check if an object looks like a verb (has 'english' key or tense keys)"""
    if not isinstance(obj, dict):
        return False
    # Check for common verb keys
    verb_keys = ['english', 'perfect', 'imperfective_compound', 'gerund', 'compound_gerund', 
                 'jussive_imperative', 'negative_perfect', 'negative_imperfective', 
                 'negative_jussive_imperative', 'infinitive']
    return any(key in obj for key in verb_keys)

def merge_verbs(target_dict, source_dict):
    """
    Merge source verbs into target dict.
    Source verbs take precedence (update existing), but we don't delete verbs from target.
    Returns count of verbs added/updated.
    """
    updated_count = 0
    added_count = 0
    
    for verb_key, verb_data in source_dict.items():
        if not is_verb_object(verb_data):
            continue  # Skip non-verb entries
        
        if verb_key in target_dict:
            # Update existing verb
            target_dict[verb_key] = verb_data
            updated_count += 1
        else:
            # Add new verb
            target_dict[verb_key] = verb_data
            added_count += 1
    
    return added_count, updated_count

def sync_file(verbs_json_data, file_path):
    """
    Sync a single JSON file into verbs.json.
    The file may contain one or more lists (as top-level keys).
    Returns dict with list_name -> (added_count, updated_count)
    """
    file_data = load_json_file(file_path)
    if file_data is None:
        return {}
    
    if not isinstance(file_data, dict):
        return {}
    
    results = {}
    
    # Process each top-level key in the file
    for list_name, list_data in file_data.items():
        if not isinstance(list_data, dict):
            continue
        
        # Check if this looks like a list of verbs (dict with verb objects)
        # vs. a single verb object
        if is_verb_object(list_data):
            # This is a single verb, not a list - skip or handle differently
            continue
        
        # This looks like a list of verbs
        # Initialize list in verbs.json if it doesn't exist
        if list_name not in verbs_json_data:
            verbs_json_data[list_name] = {}
        
        # Merge verbs from file into verbs.json
        added, updated = merge_verbs(verbs_json_data[list_name], list_data)
        if added > 0 or updated > 0:
            results[list_name] = (added, updated)
    
    return results

def sync_folder(verbs_json_data, folder_path):
    """
    Sync all JSON files from a folder into verbs.json
    Returns dict with list_name -> (added_count, updated_count)
    """
    if not os.path.exists(folder_path):
        print(f"  Folder {folder_path} does not exist, skipping")
        return {}
    
    # Get all JSON files in the folder
    json_files = list(Path(folder_path).glob("*.json"))
    
    if not json_files:
        print(f"  No JSON files found in {folder_path}")
        return {}
    
    all_results = {}
    
    # Process each JSON file in the folder
    for json_file in sorted(json_files):
        file_results = sync_file(verbs_json_data, json_file)
        
        # Aggregate results
        for list_name, (added, updated) in file_results.items():
            if list_name not in all_results:
                all_results[list_name] = [0, 0]
            all_results[list_name][0] += added
            all_results[list_name][1] += updated
        
        if file_results:
            # Show summary for this file
            file_summary = []
            for list_name, (added, updated) in file_results.items():
                parts = []
                if added > 0:
                    parts.append(f"+{added}")
                if updated > 0:
                    parts.append(f"~{updated}")
                file_summary.append(f"{list_name}: {', '.join(parts)}")
            print(f"    {json_file.name}: {'; '.join(file_summary)}")
    
    return all_results

def main():
    print("Syncing verbs from folders to verbs.json...\n")
    
    # Load verbs.json
    verbs_json_path = "verbs.json"
    if not os.path.exists(verbs_json_path):
        print(f"Error: {verbs_json_path} not found!")
        return
    
    print(f"Loading {verbs_json_path}...")
    with open(verbs_json_path, "r", encoding="utf-8") as f:
        verbs_json_data = json.load(f)
    
    # Get list of folder names (numbers and "irregular")
    verbs_folder = Path("verbs")
    folders = [d.name for d in verbs_folder.iterdir() if d.is_dir() and d.name != "__pycache__"]
    
    # Sort folders (handle numeric folders properly)
    def sort_key(folder_name):
        if folder_name == "irregular":
            return (1, folder_name)  # Put irregular at the end
        try:
            return (0, int(folder_name))  # Numeric folders first, sorted by number
        except ValueError:
            return (0, folder_name)  # Other folders sorted alphabetically
    
    folders_sorted = sorted(folders, key=sort_key)
    
    total_added_all = 0
    total_updated_all = 0
    all_lists_synced = set()
    
    # Sync each folder
    for folder_name in folders_sorted:
        folder_path = verbs_folder / folder_name
        
        print(f"\nSyncing folder '{folder_name}' from {folder_path}:")
        folder_results = sync_folder(verbs_json_data, folder_path)
        
        # Aggregate totals
        for list_name, (added, updated) in folder_results.items():
            total_added_all += added
            total_updated_all += updated
            all_lists_synced.add(list_name)
        
        if folder_results:
            # Show summary for this folder
            folder_summary = []
            for list_name, (added, updated) in folder_results.items():
                parts = []
                if added > 0:
                    parts.append(f"+{added} added")
                if updated > 0:
                    parts.append(f"~{updated} updated")
                folder_summary.append(f"{list_name}: {', '.join(parts)}")
            print(f"  Summary: {'; '.join(folder_summary)}")
        else:
            print(f"  No changes")
    
    # Save updated verbs.json
    print(f"\n\nTotal: +{total_added_all} verbs added, ~{total_updated_all} verbs updated")
    print(f"Lists synced: {', '.join(sorted(all_lists_synced))}")
    
    if total_added_all > 0 or total_updated_all > 0:
        print(f"\nSaving {verbs_json_path}...")
        with open(verbs_json_path, "w", encoding="utf-8") as f:
            json.dump(verbs_json_data, f, indent=2, ensure_ascii=False)
        print("✓ Sync complete!")
    else:
        print("\nNo changes to save.")

if __name__ == "__main__":
    main()
