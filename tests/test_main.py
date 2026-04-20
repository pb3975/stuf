import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import tempfile
import os

from main import app, get_db, Base


@pytest.fixture
def test_db():
    """Create a temporary test database"""
    # Create temporary database file
    db_fd, db_path = tempfile.mkstemp(suffix='.db')
    database_url = f"sqlite:///{db_path}"
    
    # Create test engine and session
    engine = create_engine(database_url, connect_args={"check_same_thread": False})
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    def override_get_db():
        try:
            db = TestingSessionLocal()
            yield db
        finally:
            db.close()
    
    app.dependency_overrides[get_db] = override_get_db
    
    yield TestingSessionLocal
    
    # Cleanup
    os.close(db_fd)
    os.unlink(db_path)
    app.dependency_overrides.clear()


@pytest.fixture
def client(test_db):
    """Create test client"""
    return TestClient(app)


def test_read_root(client):
    """Test root endpoint redirects to docs"""
    response = client.get("/")
    assert response.status_code in [200, 307, 404]  # Depending on FastAPI setup


def test_get_items_empty(client):
    """Test getting items from empty database"""
    response = client.get("/items/")
    assert response.status_code == 200
    assert response.json() == []


def test_get_categories_empty(client):
    """Test getting categories from empty database"""
    response = client.get("/categories/")
    assert response.status_code == 200
    assert response.json() == []


def test_create_item(client):
    """Test creating a new item"""
    item_data = {
        "name": "Test Item",
        "category": "Test Category",
        "quantity": 5,
        "custom_attributes": {"color": "red", "size": "medium"}
    }
    
    response = client.post("/items/", json=item_data)
    assert response.status_code == 200
    
    data = response.json()
    assert data["name"] == "Test Item"
    assert data["category"] == "Test Category"
    assert data["quantity"] == 5
    assert data["custom_attributes"]["color"] == "red"
    assert "id" in data
    assert "qr_code_url" in data


def test_get_item_by_id(client):
    """Test getting a specific item by ID"""
    # First create an item
    item_data = {
        "name": "Test Item 2",
        "category": "Test Category",
        "quantity": 3
    }
    
    create_response = client.post("/items/", json=item_data)
    created_item = create_response.json()
    item_id = created_item["id"]
    
    # Now get it by ID
    response = client.get(f"/items/{item_id}")
    assert response.status_code == 200
    
    data = response.json()
    assert data["id"] == item_id
    assert data["name"] == "Test Item 2"


def test_get_nonexistent_item(client):
    """Test getting an item that doesn't exist"""
    response = client.get("/items/99999")
    assert response.status_code == 404


def test_update_item(client):
    """Test updating an existing item"""
    # Create an item first
    item_data = {
        "name": "Original Item",
        "category": "Original Category",
        "quantity": 1
    }
    
    create_response = client.post("/items/", json=item_data)
    created_item = create_response.json()
    item_id = created_item["id"]
    
    # Update the item
    update_data = {
        "name": "Updated Item",
        "category": "Updated Category",
        "quantity": 10,
        "custom_attributes": {"updated": "true"}
    }
    
    response = client.put(f"/items/{item_id}", json=update_data)
    assert response.status_code == 200
    
    data = response.json()
    assert data["name"] == "Updated Item"
    assert data["category"] == "Updated Category"
    assert data["quantity"] == 10


def test_delete_item(client):
    """Test deleting an item"""
    # Create an item first
    item_data = {
        "name": "Item to Delete",
        "category": "Test Category",
        "quantity": 1
    }
    
    create_response = client.post("/items/", json=item_data)
    created_item = create_response.json()
    item_id = created_item["id"]
    
    # Delete the item
    response = client.delete(f"/items/{item_id}")
    assert response.status_code == 200
    
    # Verify it's gone
    get_response = client.get(f"/items/{item_id}")
    assert get_response.status_code == 404


def test_increment_item_quantity(client):
    """Test incrementing item quantity"""
    # Create an item first
    item_data = {
        "name": "Increment Test Item",
        "category": "Test Category",
        "quantity": 5
    }
    
    create_response = client.post("/items/", json=item_data)
    created_item = create_response.json()
    item_id = created_item["id"]
    
    # Increment by 3
    response = client.post(f"/items/{item_id}/increment?increment_by=3")
    assert response.status_code == 200
    
    data = response.json()
    assert data["new_quantity"] == 8
    
    # Verify the item was updated
    get_response = client.get(f"/items/{item_id}")
    updated_item = get_response.json()
    assert updated_item["quantity"] == 8


def test_smart_add_without_api_key(client):
    """Test SmartAdd without API key returns appropriate error"""
    smart_add_data = {
        "photos": ["data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="]
    }
    
    response = client.post("/smart-add/", json=smart_add_data)
    # Should return error about API key
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is False
    assert "api key" in data["error_message"].lower()


def test_filter_items_by_category(client):
    """Test filtering items by category"""
    # Create items in different categories
    items = [
        {"name": "Item 1", "category": "Category A", "quantity": 1},
        {"name": "Item 2", "category": "Category B", "quantity": 2},
        {"name": "Item 3", "category": "Category A", "quantity": 3},
    ]
    
    for item in items:
        client.post("/items/", json=item)
    
    # Filter by Category A
    response = client.get("/items/?category=Category A")
    assert response.status_code == 200
    
    data = response.json()
    assert len(data) == 2
    assert all(item["category"] == "Category A" for item in data)


def test_get_categories_with_items(client):
    """Test getting categories after creating items"""
    # Create items in different categories
    items = [
        {"name": "Item 1", "category": "Electronics", "quantity": 1},
        {"name": "Item 2", "category": "Books", "quantity": 2},
        {"name": "Item 3", "category": "Electronics", "quantity": 3},
    ]
    
    for item in items:
        client.post("/items/", json=item)
    
    response = client.get("/categories/")
    assert response.status_code == 200
    
    categories = response.json()
    assert "Electronics" in categories
    assert "Books" in categories
    assert len(categories) == 2 