import re
import string

# Contraction mapping to normalize input while preserving negation semantics
CONTRACTIONS = {
    "don't": "do not",
    "doesn't": "does not",
    "didn't": "did not",
    "won't": "will not",
    "can't": "cannot",
    "couldn't": "could not",
    "shouldn't": "should not",
    "wouldn't": "would not",
    "isn't": "is not",
    "aren't": "are not",
    "wasn't": "was not",
    "weren't": "were not",
    "haven't": "have not",
    "hasn't": "has not",
    "hadn't": "had not",
    "it's": "it is",
    "i'm": "i am",
    "you're": "you are",
    "we're": "we are",
    "they're": "they are",
    "that's": "that is",
    "what's": "what is",
    "where's": "where is",
    "who's": "who is",
    "how's": "how is",
}

# Negation terms that must be preserved
NEGATION_WORDS = {"not", "never", "no", "neither", "nor", "none", "without", "hardly", "barely"}

def expand_contractions(text: str) -> str:
    """Expand standard English contractions into full forms."""
    words = text.split()
    expanded = []
    for word in words:
        lower_word = word.lower()
        if lower_word in CONTRACTIONS:
            expanded.append(CONTRACTIONS[lower_word])
        else:
            # Handle trailing punctuation
            stripped = lower_word.strip(string.punctuation)
            if stripped in CONTRACTIONS:
                expanded.append(CONTRACTIONS[stripped])
            else:
                expanded.append(word)
    return " ".join(expanded)

def normalize_text(text: str) -> str:
    """
    Normalize text for model inputs while preserving semantic meaning:
    - Strips leading/trailing whitespace
    - Normalizes internal multiple spaces
    - Expands common contractions
    - Lowercases text
    - Preserves numbers, course codes (e.g. B.Tech, CSE), dates, and negation words
    """
    if not text or not text.strip():
        return ""
    
    # Expand contractions
    expanded = expand_contractions(text.strip())
    
    # Lowercase
    normalized = expanded.lower()
    
    # Clean multiple spaces and whitespace artifacts
    normalized = re.sub(r"\s+", " ", normalized).strip()
    
    return normalized

def clean_for_vectorizer(text: str) -> str:
    """
    Clean text for TF-IDF vectorization:
    - Normalizes text
    - Retains letters, digits, and specific separators
    - Removes isolated disruptive punctuation but keeps keywords
    """
    norm = normalize_text(text)
    if not norm:
        return ""
    
    # Replace disruptive punctuation with space, preserving alphanumeric
    cleaned = re.sub(r"[^\w\s\-\.]", " ", norm)
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return cleaned
