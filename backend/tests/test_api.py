from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["model_ready"] is True

def test_config_endpoint():
    response = client.get("/api/config")
    assert response.status_code == 200
    data = response.json()
    assert "max_text_length" in data
    assert "supported_audio_extensions" in data

def test_query_text_valid():
    response = client.post("/api/query/text", json={"text": "When will semester exams begin?"})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ("answered", "clarification_needed")
    assert "predicted_intent" in data
    assert "explanation" in data

def test_query_text_empty():
    response = client.post("/api/query/text", json={"text": "   "})
    assert response.status_code == 400

def test_analytics_summary():
    response = client.get("/api/analytics/summary")
    assert response.status_code == 200
    data = response.json()
    assert "total_queries" in data
    assert "sentiment_breakdown" in data

def test_evaluation_endpoint():
    response = client.get("/api/evaluation")
    assert response.status_code == 200
    data = response.json()
    assert "generated" in data
