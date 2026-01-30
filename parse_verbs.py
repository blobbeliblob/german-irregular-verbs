import json
import pandas as pd
import re

# Read the Excel file, skip first 3 rows (header rows)
df = pd.read_excel('verbs.xlsx', header=None, skiprows=3)

# Conjugation order for each tense
pronouns = ['ich', 'du', 'er/sie/es', 'wir', 'ihr', 'sie/Sie']

# Patterns to remove subjects from German verb forms
subject_patterns = [
    r'^ich\s+',
    r'^du\s+',
    r'^er/sie/es\s+',
    r'^er/si/es\s+',  # Handle typo variant
    r'^wir\s+',
    r'^ihr\s+',
    r'^sie/Sie\s+',
]

def remove_subject(text):
    """Remove the subject pronoun from the beginning of a German verb form."""
    text = str(text).strip()
    for pattern in subject_patterns:
        text = re.sub(pattern, '', text, flags=re.IGNORECASE)
    return text.strip()

# Column layout based on Excel inspection:
# Col 0: Infinitive
# Col 1: NaN (stem for English row)
# Cols 2-7: Present (ich, du, er/sie/es, wir, ihr, sie/Sie)
# Col 8: Partizip II
# Cols 9-14: Perfekt conjugations (ich, du, er/sie/es, wir, ihr, sie/Sie)
# Col 15: NaN (participle for English row)
# Cols 16-21: Imperfekt conjugations (ich, du, er/sie/es, wir, ihr, sie/Sie)

verbs = []

# Process pairs of rows (German row followed by English row)
for i in range(0, len(df) - 1, 2):
    german_row = df.iloc[i]
    english_row = df.iloc[i + 1]
    
    # Skip if infinitive is empty
    if pd.isna(german_row[0]) or str(german_row[0]).strip() == '':
        continue
    
    verb = {
        'infinitive': str(german_row[0]).strip(),
        'translation': str(english_row[0]).strip() if not pd.isna(english_row[0]) else '',
        'present': {},
        'perfekt': {},
        'imperfekt': {}
    }
    
    # Present tense: columns 2-7
    for j, pronoun in enumerate(pronouns):
        col_idx = 2 + j
        german_val = german_row[col_idx] if not pd.isna(german_row[col_idx]) else ''
        english_val = english_row[col_idx] if not pd.isna(english_row[col_idx]) else ''
        verb['present'][pronoun] = {
            'german': remove_subject(german_val),
            'english': str(english_val).strip()
        }
    
    # Perfekt: columns 9-14
    for j, pronoun in enumerate(pronouns):
        col_idx = 9 + j
        german_val = german_row[col_idx] if col_idx < len(german_row) and not pd.isna(german_row[col_idx]) else ''
        english_val = english_row[col_idx] if col_idx < len(english_row) and not pd.isna(english_row[col_idx]) else ''
        verb['perfekt'][pronoun] = {
            'german': remove_subject(german_val),
            'english': str(english_val).strip()
        }
    
    # Imperfekt: columns 16-21
    for j, pronoun in enumerate(pronouns):
        col_idx = 16 + j
        german_val = german_row[col_idx] if col_idx < len(german_row) and not pd.isna(german_row[col_idx]) else ''
        english_val = english_row[col_idx] if col_idx < len(english_row) and not pd.isna(english_row[col_idx]) else ''
        verb['imperfekt'][pronoun] = {
            'german': remove_subject(german_val),
            'english': str(english_val).strip()
        }
    
    verbs.append(verb)

# Write to JSON file
with open('verbs.json', 'w', encoding='utf-8') as f:
    json.dump(verbs, f, ensure_ascii=False, indent=2)

print(f"Successfully parsed {len(verbs)} verbs and saved to verbs.json")
