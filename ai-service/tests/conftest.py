import os
import sys
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app import create_app  # noqa: E402


@pytest.fixture
def app(monkeypatch):
    monkeypatch.setenv("GROQ_API_KEY", "")   # force offline mode
    monkeypatch.setenv("REDIS_HOST", "127.0.0.1")
    monkeypatch.setenv("REDIS_PORT", "1")    # unreachable → in-memory fallback
    a = create_app()
    a.testing = True
    return a


@pytest.fixture
def client(app):
    return app.test_client()
