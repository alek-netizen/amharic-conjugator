# verbs.json Structure Outline

## Overview
This JSON file contains Amharic verb conjugations organized by verb class. The file is approximately 44,525 lines long.

## Top-Level Structure

```json
{
  "1": { ... },  // Verb class 1
  "3": { ... },  // Verb class 3
  "4": { ... },  // Verb class 4
  "7": { ... }   // Verb class 7
}
```

## Verb Classes
- **Class 1**: Lines 2-2747
- **Class 3**: Lines 2748-6522
- **Class 4**: Lines 6523-8584
- **Class 7**: Lines 8585-44524

## Standard Verb Structure

Each verb class contains multiple verbs, where each verb is keyed by its Amharic fidel (script) form:

```json
{
  "ደረሰ": {
    "english": "arrive",
    "perfect": { ... },
    "imperfective_compound": { ... },
    "gerund": { ... },
    "compound_gerund": { ... },
    "jussive_imperative": { ... },
    "negative_perfect": { ... },
    "negative_imperfective": { ... },
    "negative_jussive_imperative": { ... },
    "infinitive": { ... }
  }
}
```

## Tense/Aspect Forms

### 1. **perfect**
   Past tense (completed action)
   
### 2. **imperfective_compound**
   Future tense (compound form)
   
### 3. **gerund**
   Gerund form (having done X)
   
### 4. **compound_gerund**
   Compound gerund form
   
### 5. **jussive_imperative**
   Jussive and imperative forms
   
### 6. **negative_perfect**
   Negative past tense
   
### 7. **negative_imperfective**
   Negative present/imperfective
   
### 8. **negative_jussive_imperative**
   Negative jussive and imperative
   
### 9. **infinitive**
   Infinitive form (base form)

## Person/Number Conjugations

Most tenses use person/number keys with object structure:

```json
{
  "1sg": {
    "fidel": "ደረስኩ",
    "translit": "därräsku",
    "en": "I came"
  },
  "2sgm": { ... },  // 2nd person singular masculine
  "2sgf": { ... },  // 2nd person singular feminine
  "3sgm": { ... },  // 3rd person singular masculine
  "3sgf": { ... },  // 3rd person singular feminine
  "1pl": { ... },   // 1st person plural
  "2pl": { ... },   // 2nd person plural
  "3pl": { ... }    // 3rd person plural
}
```

### Person/Number Keys:
- `1sg` - First person singular (I)
- `2sgm` - Second person singular masculine (you m.)
- `2sgf` - Second person singular feminine (you f.)
- `3sgm` - Third person singular masculine (he)
- `3sgf` - Third person singular feminine (she)
- `1pl` - First person plural (we)
- `2pl` - Second person plural (you pl.)
- `3pl` - Third person plural (they)

### Conjugation Fields:
- `fidel` - Amharic script (Ge'ez script)
- `translit` - Transliteration (romanized form)
- `en` - English translation

## Infinitive Structure

The infinitive form is simpler, containing only fidel and translit:

```json
"infinitive": {
  "fidel": "መድረስ",
  "translit": "mädräs"
}
```

## Special Cases

### Verb "አለ" (have) - Class 7

The verb "አለ" (have) uses **array-based structure** for some tenses instead of object-based:

```json
{
  "አለ": {
    "english": "have",
    "present": {
      "fidel": [ "አለኝ", "አለህ", ... ],
      "translit": [ "alläññ", "alläh", ... ],
      "english": [ "I have", "you (m.) have", ... ]
    },
    "negative_present": { ... },
    "negative_past_simple": { ... }
  }
}
```

**Array-based tenses for "አለ":**
- `present` - Present tense (array format)
- `negative_present` - Negative present (array format)
- `negative_past_simple` - Negative past simple (array format)

These arrays contain 10 elements (including respectful forms):
1. 1sg (I)
2. 2sgm (you m.)
3. 2sgf (you f.)
4. 3sgm (he)
5. 3sgf (she)
6. 1pl (we)
7. 2pl (you pl.)
8. 3pl (they)
9. 2sg respectful (you resp.)
10. 3sg respectful (he/she resp.)

## Example Verb Entry

```json
{
  "1": {
    "ደረሰ": {
      "english": "arrive",
      "perfect": {
        "1sg": {
          "fidel": "ደረስኩ",
          "translit": "därräsku",
          "en": "I came"
        },
        // ... other persons
      },
      "imperfective_compound": { ... },
      "gerund": { ... },
      "compound_gerund": { ... },
      "jussive_imperative": { ... },
      "negative_perfect": { ... },
      "negative_imperfective": { ... },
      "negative_jussive_imperative": { ... },
      "infinitive": {
        "fidel": "መድረስ",
        "translit": "mädräs"
      }
    }
  }
}
```

## Notes

- All Amharic text is in fidel (Ge'ez script)
- Transliterations use a romanization system
- English translations are provided for all conjugated forms
- Most verbs follow the standard object-based structure
- The verb "አለ" (have) is a special case with array-based forms for some tenses
- The file contains comprehensive conjugations for 4 verb classes

