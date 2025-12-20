"""
Import verbs from Google Sheets TSV to "2A (4B 02)" section in verbs.json

The TSV format has:
- Header row with tense names
- Verb row: root - english, infinitive fidel, infinitive translit
- 8 rows of fidel conjugations
- Row with "infinitive transliteration" label
- Transliteration of infinitive (single cell)
- 8 rows of transliterations
"""

import json
import urllib.request
import urllib.error
import sys
import re

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

# Person order (8 persons)
PERSON_ORDER = ["1sg", "2sgm", "2sgf", "3sgm", "3sgf", "1pl", "2pl", "3pl"]

def extract_verb_info(verb_str):
    """Extract verb root and English meaning from string like 'አሰበ - think, intend'"""
    if not verb_str or " - " not in verb_str:
        return None, None
    
    parts = verb_str.split(" - ", 1)
    root = parts[0].strip()
    english = parts[1].strip() if len(parts) > 1 else ""
    
    return root, english

def is_verb_row(row):
    """Check if a row contains a verb definition"""
    if not row or len(row) == 0:
        return False
    first_col = row[0].strip() if row[0] else ""
    # Check if it contains " - " and starts with Amharic character
    return " - " in first_col and bool(re.search(r'[\u1200-\u137F]', first_col))

def parse_tsv_verbs(sheet_url):
    """Fetch TSV from Google Sheets and parse verbs"""
    
    print(f"Fetching data from Google Sheets...")
    try:
        with urllib.request.urlopen(sheet_url) as response:
            tsv_data = response.read().decode('utf-8')
    except urllib.error.URLError as e:
        print(f"Error fetching sheet: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"Unexpected error: {e}")
        sys.exit(1)
    
    # Parse TSV
    lines = tsv_data.strip().split('\n')
    rows = []
    for line in lines:
        # TSV uses tab separator
        row = line.split('\t')
        rows.append(row)
    
    if not rows:
        print("Error: Sheet appears to be empty")
        sys.exit(1)
    
    # Get header row (first row)
    header = rows[0] if rows else []
    if len(header) < 2:
        print("Error: Invalid header row")
        sys.exit(1)
    
    # Map column indices to tense names (skip first column which is empty)
    tense_columns = {}
    for idx, col in enumerate(header[1:], start=1):
        # Clean column name: strip whitespace, newlines, carriage returns, and convert to lowercase
        col_clean = col.strip().strip('\r\n').lower()
        matched = False
        
        # Try exact match first
        for sheet_tense, json_tense in TENSE_MAP.items():
            if col_clean == sheet_tense.lower():
                tense_columns[idx] = json_tense
                matched = True
                break
        
        # Fallback: try partial matching (check in order of specificity)
        if not matched:
            if "n. past simple" in col_clean:
                tense_columns[idx] = "negative_perfect"
            elif "past simple" in col_clean:
                tense_columns[idx] = "perfect"
            elif "n. imperfective" in col_clean:
                tense_columns[idx] = "negative_imperfective"
            elif "imprf" in col_clean and "n." not in col_clean:
                tense_columns[idx] = "imperfective_compound"
            elif col_clean == "gerund":
                tense_columns[idx] = "gerund"
            elif "compound gerund" in col_clean:
                tense_columns[idx] = "compound_gerund"
            elif ("n. imperative" in col_clean or "n. jussive" in col_clean):
                tense_columns[idx] = "negative_jussive_imperative"
            elif "jussive" in col_clean and "imperative" in col_clean and "n." not in col_clean:
                tense_columns[idx] = "jussive_imperative"
    
    # Debug: print all header columns
    print(f"Header columns: {[repr(col.strip()) for col in header[1:9]]}")
    print(f"Found {len(tense_columns)} tense columns: {list(tense_columns.values())}")
    print(f"Tense column indices: {tense_columns}")
    
    verbs = {}
    i = 1  # Start after header
    
    while i < len(rows):
        row = rows[i]
        
        # Check if this is a verb definition row
        if is_verb_row(row):
            verb_root, verb_english = extract_verb_info(row[0])
            if not verb_root:
                i += 1
                continue
            
            # Get infinitive from columns 1 and 2 (if present)
            infinitive_fidel = row[1].strip() if len(row) > 1 and row[1] else ""
            infinitive_translit = ""
            
            print(f"Processing verb: {verb_root} - {verb_english}")
            
            # Initialize verb entry
            verb_entry = {
                "english": verb_english or "",
            }
            if infinitive_fidel:
                verb_entry["infinitive"] = {
                    "fidel": infinitive_fidel,
                    "translit": ""
                }
            
            # Process 8 rows of fidel conjugations
            person_data = {}
            for person_idx, person_code in enumerate(PERSON_ORDER):
                i += 1
                if i >= len(rows):
                    break
                
                fidel_row = rows[i]
                
                # Process each tense column
                for col_idx, tense_name in tense_columns.items():
                    if col_idx >= len(fidel_row):
                        continue
                    
                    cell_value = fidel_row[col_idx].strip() if fidel_row[col_idx] else ""
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
                    
                    person_data[tense_name][person_code]["fidel"] = cell_value
            
            # Look for infinitive transliteration row
            i += 1
            if i < len(rows):
                inf_row = rows[i]
                first_col = inf_row[0].strip().lower() if inf_row[0] else ""
                
                # Check if this is the infinitive transliteration row
                # The transliteration is in column 1 (index 1) of the same row
                if "infinitive" in first_col and "translit" in first_col:
                    if len(inf_row) > 1 and inf_row[1]:
                        infinitive_translit = inf_row[1].strip()
                        if infinitive_translit and "infinitive" in verb_entry:
                            verb_entry["infinitive"]["translit"] = infinitive_translit
                    i += 1
                
                # Process 8 rows of transliterations
                for person_idx, person_code in enumerate(PERSON_ORDER):
                    if i >= len(rows):
                        break
                    
                    translit_row = rows[i]
                    
                    # Process each tense column
                    for col_idx, tense_name in tense_columns.items():
                        if col_idx >= len(translit_row):
                            continue
                        
                        cell_value = translit_row[col_idx].strip() if translit_row[col_idx] else ""
                        if not cell_value:
                            continue
                        
                        if tense_name in person_data and person_code in person_data[tense_name]:
                            person_data[tense_name][person_code]["translit"] = cell_value
                    
                    i += 1
            
            # Add person data to verb entry
            verb_entry.update(person_data)
            verbs[verb_root] = verb_entry
        
        i += 1
    
    return verbs

def add_to_2A_section(verbs_dict, json_file):
    """Add verbs to '2A (4B 02)' section in verbs.json"""
    
    # Load existing JSON
    print(f"Loading {json_file}...")
    try:
        with open(json_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except FileNotFoundError:
        print(f"Error: {json_file} not found")
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON: {e}")
        sys.exit(1)
    
    # Initialize "2A (4B 02)" section if it doesn't exist
    if "2A (4B 02)" not in data:
        data["2A (4B 02)"] = {}
    
    # Add or update verbs
    added_count = 0
    updated_count = 0
    
    for verb_root, verb_data in verbs_dict.items():
        if verb_root in data["2A (4B 02)"]:
            # Merge with existing verb (preserve existing data, update with new)
            existing = data["2A (4B 02)"][verb_root]
            
            # Update English if provided
            if verb_data.get("english"):
                existing["english"] = verb_data["english"]
            
            # Update infinitive if provided
            if verb_data.get("infinitive"):
                if "infinitive" not in existing:
                    existing["infinitive"] = {}
                if verb_data["infinitive"].get("fidel"):
                    existing["infinitive"]["fidel"] = verb_data["infinitive"]["fidel"]
                if verb_data["infinitive"].get("translit"):
                    existing["infinitive"]["translit"] = verb_data["infinitive"]["translit"]
            
            # Update tense data
            for tense_name, tense_data in verb_data.items():
                if tense_name in ["english", "infinitive"]:
                    continue
                
                if tense_name not in existing:
                    existing[tense_name] = {}
                
                for person_code, form_data in tense_data.items():
                    if person_code not in existing[tense_name]:
                        existing[tense_name][person_code] = {"fidel": "", "translit": "", "en": ""}
                    
                    # Update fidel and translit, preserve en
                    if form_data.get("fidel"):
                        existing[tense_name][person_code]["fidel"] = form_data["fidel"]
                    if form_data.get("translit"):
                        existing[tense_name][person_code]["translit"] = form_data["translit"]
                    # Preserve existing English translation
            
            updated_count += 1
            print(f"  Updated: {verb_root}")
        else:
            data["2A (4B 02)"][verb_root] = verb_data
            added_count += 1
            print(f"  Added: {verb_root}")
    
    # Write back to JSON
    print(f"\nWriting to {json_file}...")
    try:
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"✓ Successfully added {added_count} new verb(s) and updated {updated_count} existing verb(s)")
    except Exception as e:
        print(f"Error writing file: {e}")
        sys.exit(1)

if __name__ == "__main__":
    SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS_5PZic6ibNY-6rEUzac1_EQ9gtQ2CbOyO91h6-vNnYKCfYmI3QnVRY_HPbYJZEbqD3g3FS-THsdAc/pub?gid=0&single=true&output=tsv"
    JSON_FILE = "verbs.json"
    
    print("Importing verbs from Google Sheets to '2A (4B 02)' section...\n")
    
    # Parse verbs from TSV
    verbs = parse_tsv_verbs(SHEET_URL)
    
    if not verbs:
        print("No verbs found in sheet")
        sys.exit(1)
    
    print(f"\nParsed {len(verbs)} verb(s) from sheet")
    
    # Add to JSON file
    add_to_2A_section(verbs, JSON_FILE)

