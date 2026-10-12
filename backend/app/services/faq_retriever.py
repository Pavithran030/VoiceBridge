from typing import Optional, Tuple, Dict, Any, List
from pathlib import Path
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from ..config import settings
from .preprocessing import clean_for_vectorizer

class FaqRetriever:
    """
    TF-IDF and Cosine Similarity FAQ Retrieval Service.
    Indexes college FAQs and retrieves closest matching entry.
    """
    def __init__(self, faq_file: Optional[Path] = None):
        self.faq_file = faq_file or settings.FAQ_FILE
        self.faqs: List[Dict[str, Any]] = []
        self.vectorizer: Optional[TfidfVectorizer] = None
        self.tfidf_matrix = None
        self.load_index()

    def load_index(self) -> None:
        """Load FAQ records from CSV and build TF-IDF search index."""
        if not self.faq_file.exists():
            print(f"[FaqRetriever] Warning: FAQ file {self.faq_file} does not exist.")
            return

        df = pd.read_csv(self.faq_file)
        df = df.fillna("")
        
        self.faqs = df.to_dict(orient="records")
        
        # Build composite text for rich semantic retrieval: question + keywords + office
        corpus = []
        for item in self.faqs:
            text = f"{item.get('question', '')} {item.get('keywords', '')} {item.get('office_or_category', '')}"
            corpus.append(clean_for_vectorizer(text))

        self.vectorizer = TfidfVectorizer(
            ngram_range=(1, 2),
            sublinear_tf=True
        )
        self.tfidf_matrix = self.vectorizer.fit_transform(corpus)

    def retrieve(self, query: str) -> Tuple[Optional[Dict[str, Any]], float]:
        """
        Rank candidate FAQs by cosine similarity.
        Returns (top_faq_dict, similarity_score).
        Cosine similarity is treated strictly as a relevance metric in [0, 1].
        """
        if not self.faqs or self.vectorizer is None or self.tfidf_matrix is None:
            return None, 0.0

        cleaned_query = clean_for_vectorizer(query)
        if not cleaned_query:
            return None, 0.0

        query_vec = self.vectorizer.transform([cleaned_query])
        sims = cosine_similarity(query_vec, self.tfidf_matrix)[0]

        best_idx = int(sims.argmax())
        best_score = float(sims[best_idx])

        # Cosine similarity bounded to 0.0 - 1.0
        normalized_score = max(0.0, min(1.0, round(best_score, 4)))
        return self.faqs[best_idx], normalized_score

_retriever_instance: Optional[FaqRetriever] = None

def get_faq_retriever() -> FaqRetriever:
    global _retriever_instance
    if _retriever_instance is None:
        _retriever_instance = FaqRetriever()
    return _retriever_instance
