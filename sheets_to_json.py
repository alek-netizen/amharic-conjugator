"""
Google Sheets to JSON Converter for Amharic Verb Conjugations

This script fetches data from a published Google Sheet and converts it to JSON format.
Handles the format where tenses are column headers and persons are rows.

Usage:
    python sheets_to_json.py <SHEET_URL> output.json
"""

import json
import sys
import csv
import urllib.request
import urllib.error
from io import StringIO
import re
import os
import time

# #region agent log
def log_debug(location, message, data=None, hypothesis_id=None):
    log_path = r"c:\Users\aleks\OneDrive\Pulpit\amharic-conjugator\.cursor\debug.log"
    try:
        with open(log_path, 'a', encoding='utf-8') as f:
            entry = {
                "sessionId": "debug-session",
                "runId": "run1",
                "hypothesisId": hypothesis_id or "A",
                "location": location,
                "message": message,
                "data": data or {},
                "timestamp": int(time.time() * 1000)
            }
            f.write(json.dumps(entry) + "\n")
    except: pass
# #endregion

# Map sheet tense names to JSON tense names
TENSE_MAP = {
    "past simple": "perfect",
    "imprf. comp.": "imperfective_compound",
    "gerund": "gerund",
    "compound gerund": "compound_gerund",
    "jussive/imperative": "jussive_imperative",
    "n. past simple": "negative_perfect",
    "n. imperfective": "negative_imperfective",
    "n. imperative/jussive": "negative_jussive_imperative"
}

# Map person labels to person codes
PERSON_MAP = {
    # English labels
    "i": "1sg",
    "you (m.)": "2sgm",
    "you (f.)": "2sgf",
    "he": "3sgm",
    "she": "3sgf",
    "we": "1pl",
    "you": "2pl",
    "they": "3pl",
    # Amharic labels
    "እኔ": "1sg",
    "አንተ": "2sgm",
    "አንቺ": "2sgf",
    "እሱ": "3sgm",
    "እሷ": "3sgf",
    "እኛ": "1pl",
    "እናንተ": "2pl",
    "እነሱ": "3pl",
}

def normalize_person(person_str):
    """Normalize person string to match PERSON_MAP keys"""
    if not person_str:
        return None
    person_clean = person_str.strip()

    # Support patterns like "I / እኔ" or "you (m.) / አንተ"
    if "/" in person_clean:
        parts = [p.strip() for p in person_clean.split("/", 1)]
    else:
        parts = [person_clean]

    candidates = []
    for part in parts:
        lower = part.lower()
        # Handle English variations
        if lower.startswith("you (m"):
            lower = "you (m.)"
        elif lower.startswith("you (f"):
            lower = "you (f.)"
        candidates.append(lower)
        candidates.append(part)  # original (for Amharic)

    for cand in candidates:
        if cand in PERSON_MAP:
            return cand
    return None

def extract_verb_info(verb_str):
    """Extract verb root and English meaning from string like 'ደረሰ - arrive'"""
    if not verb_str or " - " not in verb_str:
        return None, None
    
    parts = verb_str.split(" - ", 1)
    root = parts[0].strip()
    english = parts[1].strip() if len(parts) > 1 else ""
    
    # Clean up English (remove quotes if present)
    english = english.strip('"')
    
    return root, english

def is_verb_row(row):
    """Check if a row contains a verb definition"""
    if not row or len(row) == 0:
        return False
    first_col = row[0].strip() if row[0] else ""
    return " - " in first_col and first_col[0] not in ["I", "i", "Y", "y", "H", "h", "W", "w", "T", "t"]

def is_person_row(row):
    """Check if a row contains person labels"""
    if not row or len(row) == 0:
        return False
    first_col = row[0].strip().lower() if row[0] else ""
    return first_col in ["i", "you (m.)", "you (f.)", "he", "she", "we", "you", "they"]

def sheets_to_json(sheet_url, output_file):
    """Fetch Google Sheet CSV and convert to verbs.json format"""
    
    # Load existing verbs to preserve English translations
    existing_verbs = {}
    if os.path.exists(output_file):
        try:
            with open(output_file, 'r', encoding='utf-8') as f:
                existing_verbs = json.load(f)
            print(f"Loaded existing {output_file} with {len(existing_verbs)} verbs")
        except:
            print(f"Could not load existing {output_file}, starting fresh")
    
    # #region agent log
    log_debug("sheets_to_json.py:109", "Function entry", {"sheet_url": sheet_url[:50] + "..." if len(sheet_url) > 50 else sheet_url, "output_file": output_file}, "D")
    # #endregion
    
    # #region agent log
    log_debug("sheets_to_json.py:112", "Before first print", {}, "C")
    # #endregion
    print(f"Fetching data from Google Sheets...")
    # #region agent log
    log_debug("sheets_to_json.py:114", "After first print, before URL fetch", {}, "C")
    # #endregion
    
    try:
        # #region agent log
        log_debug("sheets_to_json.py:117", "Before urllib.request.urlopen", {}, "D")
        # #endregion
        # Fetch the CSV data
        with urllib.request.urlopen(sheet_url) as response:
            # #region agent log
            log_debug("sheets_to_json.py:120", "URL opened successfully", {"status": response.status if hasattr(response, 'status') else 'unknown'}, "D")
            # #endregion
            csv_data = response.read().decode('utf-8')
            # #region agent log
            log_debug("sheets_to_json.py:123", "CSV data read", {"data_length": len(csv_data), "first_100_chars": csv_data[:100]}, "D")
            # #endregion
    except urllib.error.URLError as e:
        # #region agent log
        log_debug("sheets_to_json.py:126", "URLError exception", {"error": str(e), "type": type(e).__name__}, "E")
        # #endregion
        print(f"Error fetching sheet: {e}")
        print("\nMake sure:")
        print("1. The sheet is published to web (File > Share > Publish to web)")
        print("2. The URL is accessible")
        sys.exit(1)
    except Exception as e:
        # #region agent log
        log_debug("sheets_to_json.py:133", "Unexpected exception in fetch", {"error": str(e), "type": type(e).__name__}, "E")
        # #endregion
        print(f"Unexpected error: {e}")
        sys.exit(1)
    
    # Parse CSV
    csv_reader = csv.reader(StringIO(csv_data))
    rows = list(csv_reader)
    
    if not rows:
        print("Error: Sheet appears to be empty")
        sys.exit(1)
    
    # Get header row (first row)
    header = rows[0] if rows else []
    if len(header) < 2:
        print("Error: Invalid header row")
        sys.exit(1)
    
    # Map column indices to tense names
    tense_columns = {}
    for idx, col in enumerate(header[1:], start=1):  # Skip first column (person/verb)
        col_clean = col.strip().lower()
        # Exact matching with fallback
        matched = False
        for sheet_tense, json_tense in TENSE_MAP.items():
            if col_clean == sheet_tense.lower():
                tense_columns[idx] = json_tense
                matched = True
                break
        
        # If no exact match, try partial matching (but be more careful)
        if not matched:
            # Try specific patterns
            if "past simple" in col_clean and "n." not in col_clean:
                tense_columns[idx] = "perfect"
            elif "imprf" in col_clean and "n." not in col_clean:
                tense_columns[idx] = "imperfective_compound"
            elif col_clean == "gerund":
                tense_columns[idx] = "gerund"
            elif "compound gerund" in col_clean:
                tense_columns[idx] = "compound_gerund"
            elif "jussive" in col_clean and "n." not in col_clean:
                tense_columns[idx] = "jussive_imperative"
            elif "n. past simple" in col_clean:
                tense_columns[idx] = "negative_perfect"
            elif "n. imperfective" in col_clean:
                tense_columns[idx] = "negative_imperfective"
            elif "n. imperative" in col_clean or "n. jussive" in col_clean:
                tense_columns[idx] = "negative_jussive_imperative"
    
    print(f"Found {len(tense_columns)} tense columns: {list(tense_columns.values())}")
    
    verbs = {}
    current_verb_root = None
    current_verb_english = None
    current_infinitive = None  # {"fidel": str, "translit": str}
    current_section = 'fidel'  # Start with fidel section
    block_stage = 0  # 0: fidel, 1: translit, 2: en
    person_data = {}  # Temporary storage for current verb
    
    # Process rows starting from row 2 (skip header)
    for row_num, row in enumerate(rows[1:], start=2):
        # Check if row is empty
        is_empty = not row or all(not cell or not cell.strip() for cell in row)
        if is_empty:
            # Empty row: advance section for current verb (fidel -> translit -> en)
            if current_verb_root and block_stage < 2:
                block_stage += 1
                current_section = ['fidel', 'translit', 'en'][block_stage]
            continue
        first_col = row[0].strip() if row[0] else ""
        
        # Check if this is a verb definition row
        if is_verb_row(row):
            # Save previous verb if exists
            if current_verb_root and person_data:
                verb_entry = {
                    "english": current_verb_english or "",
                    **person_data
                }
                if current_infinitive:
                    verb_entry["infinitive"] = current_infinitive
                
                # Merge with existing verb to preserve English translations
                if current_verb_root in existing_verbs:
                    existing_entry = existing_verbs[current_verb_root]
                    for tense_key, tense_data in verb_entry.items():
                        if tense_key == "english" or tense_key == "infinitive":
                            continue
                        if isinstance(tense_data, dict):
                            for person_key, form_data in tense_data.items():
                                if isinstance(form_data, dict) and person_key in existing_entry.get(tense_key, {}):
                                    existing_form = existing_entry[tense_key][person_key]
                                    if existing_form.get("en", "").strip():
                                        form_data["en"] = existing_form["en"]
                
                verbs[current_verb_root] = verb_entry
            
            # Start new verb
            current_verb_root, current_verb_english = extract_verb_info(first_col)
            current_infinitive = None
            # If the verb row has extra columns, treat col1/col2 as infinitive fidel/translit
            if len(row) > 1 and row[1].strip():
                current_infinitive = {
                    "fidel": row[1].strip(),
                    "translit": row[2].strip() if len(row) > 2 else ""
                }
            if current_verb_root:
                person_data = {}
                current_section = 'fidel'  # Reset to fidel for new verb
                block_stage = 0
                print(f"Processing verb: {current_verb_root} - {current_verb_english}")
            continue
        
        # Check if this is a person row
        person_normalized = normalize_person(first_col)
        if person_normalized and person_normalized in PERSON_MAP:
            person_code = PERSON_MAP[person_normalized]
            
            row_text = " ".join(row[1:]) if len(row) > 1 else ""
            has_amharic = bool(re.search(r'[\u1200-\u137F]', row_text))
            has_latin = bool(re.search(r'[a-zA-Z]', row_text))

            # Section is determined by block_stage (empty rows between blocks)
            
            # Safety check: if we're in fidel section but see no Amharic, might be wrong
            # But don't override if we're already in translit or en (trust empty row detection)
            if current_section == 'fidel' and not has_amharic and row_text.strip():
                # Might have missed an empty row, but don't auto-switch to avoid confusion
                pass
            
            # Process each tense column
            for col_idx, tense_name in tense_columns.items():
                if col_idx >= len(row):
                    continue
                
                cell_value = row[col_idx].strip() if row[col_idx] else ""
                if not cell_value:
                    continue
                
                # Initialize tense if needed
                if tense_name not in person_data:
                    person_data[tense_name] = {}
                
                # Initialize person if needed
                if person_code not in person_data[tense_name]:
                    person_data[tense_name][person_code] = {
                        "fidel": "",
                        "translit": "",
                        "en": ""
                    }
                
                # Set the appropriate field based on current section
                if current_section == 'fidel':
                    person_data[tense_name][person_code]["fidel"] = cell_value
                elif current_section == 'translit':
                    person_data[tense_name][person_code]["translit"] = cell_value
                elif current_section == 'en':
                    # Only update English if not already present in existing data
                    if current_verb_root in existing_verbs and \
                       tense_name in existing_verbs[current_verb_root] and \
                       person_code in existing_verbs[current_verb_root][tense_name] and \
                       existing_verbs[current_verb_root][tense_name][person_code].get("en", "").strip():
                        # Preserve existing English translation
                        person_data[tense_name][person_code]["en"] = existing_verbs[current_verb_root][tense_name][person_code]["en"]
                    else:
                        person_data[tense_name][person_code]["en"] = cell_value
    
    # Save last verb
    if current_verb_root and person_data:
        verb_entry = {
            "english": current_verb_english or "",
            **person_data
        }
        if current_infinitive:
            verb_entry["infinitive"] = current_infinitive
        
        # Merge with existing verb to preserve English translations
        if current_verb_root in existing_verbs:
            existing_entry = existing_verbs[current_verb_root]
            for tense_key, tense_data in verb_entry.items():
                if tense_key == "english" or tense_key == "infinitive":
                    continue
                if isinstance(tense_data, dict):
                    for person_key, form_data in tense_data.items():
                        if isinstance(form_data, dict) and person_key in existing_entry.get(tense_key, {}):
                            existing_form = existing_entry[tense_key][person_key]
                            if existing_form.get("en", "").strip():
                                form_data["en"] = existing_form["en"]
        
        verbs[current_verb_root] = verb_entry
    
    # Add any verbs from existing_verbs that were not in the sheet
    for verb_key, verb_data in existing_verbs.items():
        if verb_key not in verbs:
            verbs[verb_key] = verb_data
            print(f"Added existing verb not found in sheet: {verb_key}")
    
    # #region agent log
    log_debug("sheets_to_json.py:317", "Before file write", {"verb_count": len(verbs), "output_file": output_file}, "D")
    # #endregion
    
    # Write to JSON file
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(verbs, f, ensure_ascii=False, indent=2)
        # #region agent log
        log_debug("sheets_to_json.py:323", "File write successful", {"verb_count": len(verbs)}, "D")
        # #endregion
    except Exception as e:
        # #region agent log
        log_debug("sheets_to_json.py:326", "File write exception", {"error": str(e), "type": type(e).__name__}, "E")
        # #endregion
        print(f"Error writing file: {e}")
        sys.exit(1)
    
    # #region agent log
    log_debug("sheets_to_json.py:331", "Before summary prints", {}, "C")
    # #endregion
    print(f"\n✓ Converted {len(verbs)} verb(s) to {output_file}")
    tenses = set()
    for v in verbs.values():
        tenses.update(k for k in v.keys() if k != 'english')
    print(f"  Tenses found: {sorted(tenses)}")
    
    # Show sample
    if verbs:
        first_verb = list(verbs.keys())[0]
        print(f"\nSample verb: {first_verb}")
        print(f"  English: {verbs[first_verb].get('english', 'N/A')}")
        print(f"  Tenses: {[k for k in verbs[first_verb].keys() if k != 'english']}")
    
    # #region agent log
    log_debug("sheets_to_json.py:344", "Function exit", {"verb_count": len(verbs)}, "D")
    # #endregion
    return verbs

if __name__ == "__main__":
    # Default configuration (can be overridden with command line args)
    DEFAULT_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSs_l1AP5nI-w0b58U9V6nX6VSmRD3tPgO232ur6kURWO4GjV66w_JuQHP5UfD3p-vaJcZ848rExAx3/pub?gid=67784640&single=true&output=csv"
    DEFAULT_OUTPUT_FILE = "verbs.json"
    
    if len(sys.argv) >= 3:
        # Use command line arguments
        sheet_url = sys.argv[1]
        output_file = sys.argv[2]
    elif len(sys.argv) == 1:
        # Use default configuration (for sync_sheets.py functionality)
        sheet_url = DEFAULT_SHEET_URL
        output_file = DEFAULT_OUTPUT_FILE
        print(f"Syncing from Google Sheets to {output_file}...")
    else:
        print("Usage: python sheets_to_json.py [<SHEET_URL> <output.json>]")
        print("\nIf no arguments provided, uses default configuration.")
        print("\nExample with arguments:")
        print('  python sheets_to_json.py "https://docs.google.com/spreadsheets/d/.../pub?gid=..." verbs.json')
        sys.exit(1)
    
    try:
        sheets_to_json(sheet_url, output_file)
        if len(sys.argv) == 1:
            print("✓ Sync complete!")
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
