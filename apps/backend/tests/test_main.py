from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)

def test_test_endpoint():
    """Test the /test endpoint returns correct message"""
    response = client.get("/test")
    assert response.status_code == 200
    assert response.json() == {"message": "Backend is up and running"}

def test_health_check():
    """Test the /healthz endpoint returns healthy status"""
    response = client.get("/healthz")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "jobprep-backend" 