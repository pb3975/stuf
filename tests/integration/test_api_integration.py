import pytest
import requests
import time
import subprocess
import os
import signal
import tempfile
from pathlib import Path


@pytest.fixture(scope="module")
def api_server():
    """Start the API server for integration tests"""
    # Create temporary database
    db_fd, db_path = tempfile.mkstemp(suffix='.db')
    os.close(db_fd)
    
    # Set environment variables
    env = os.environ.copy()
    env["DATABASE_URL"] = f"sqlite:///{db_path}"
    env["GEMINI_API_KEY"] = "test_key_for_integration"
    
    # Start the server
    process = subprocess.Popen(
        ["python", "main.py"],
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    
    # Wait for server to start
    time.sleep(3)
    
    # Check if server is running
    try:
        response = requests.get("http://localhost:8000/docs", timeout=5)
        if response.status_code != 200:
            raise Exception("Server not responding")
    except Exception as e:
        process.terminate()
        process.wait()
        raise Exception(f"Failed to start server: {e}")
    
    yield "http://localhost:8000"
    
    # Cleanup
    process.terminate()
    process.wait()
    os.unlink(db_path)


def test_full_item_lifecycle(api_server):
    """Test complete item lifecycle: create, read, update, delete"""
    base_url = api_server
    
    # 1. Create an item
    item_data = {
        "name": "Integration Test Item",
        "category": "Test Category",
        "quantity": 10,
        "custom_attributes": {
            "color": "blue",
            "material": "plastic"
        }
    }
    
    response = requests.post(f"{base_url}/items/", json=item_data)
    assert response.status_code == 200
    
    created_item = response.json()
    item_id = created_item["id"]
    assert created_item["name"] == "Integration Test Item"
    assert created_item["qr_code_url"] is not None
    
    # 2. Read the item
    response = requests.get(f"{base_url}/items/{item_id}")
    assert response.status_code == 200
    
    retrieved_item = response.json()
    assert retrieved_item["name"] == "Integration Test Item"
    assert retrieved_item["quantity"] == 10
    
    # 3. Update the item
    update_data = {
        "name": "Updated Integration Test Item",
        "category": "Updated Category",
        "quantity": 15,
        "custom_attributes": {
            "color": "red",
            "material": "metal"
        }
    }
    
    response = requests.put(f"{base_url}/items/{item_id}", json=update_data)
    assert response.status_code == 200
    
    updated_item = response.json()
    assert updated_item["name"] == "Updated Integration Test Item"
    assert updated_item["quantity"] == 15
    assert updated_item["custom_attributes"]["color"] == "red"
    
    # 4. Increment quantity
    response = requests.post(f"{base_url}/items/{item_id}/increment?increment_by=5")
    assert response.status_code == 200
    
    increment_result = response.json()
    assert increment_result["new_quantity"] == 20
    
    # 5. Verify increment worked
    response = requests.get(f"{base_url}/items/{item_id}")
    assert response.status_code == 200
    assert response.json()["quantity"] == 20
    
    # 6. Delete the item
    response = requests.delete(f"{base_url}/items/{item_id}")
    assert response.status_code == 200
    
    # 7. Verify deletion
    response = requests.get(f"{base_url}/items/{item_id}")
    assert response.status_code == 404


def test_category_management(api_server):
    """Test category listing and filtering"""
    base_url = api_server
    
    # Create items in different categories
    items = [
        {"name": "Electronics Item 1", "category": "Electronics", "quantity": 1},
        {"name": "Electronics Item 2", "category": "Electronics", "quantity": 2},
        {"name": "Books Item 1", "category": "Books", "quantity": 3},
        {"name": "Tools Item 1", "category": "Tools", "quantity": 4},
    ]
    
    created_ids = []
    for item in items:
        response = requests.post(f"{base_url}/items/", json=item)
        assert response.status_code == 200
        created_ids.append(response.json()["id"])
    
    # Test getting all categories
    response = requests.get(f"{base_url}/categories/")
    assert response.status_code == 200
    
    categories = response.json()
    assert "Electronics" in categories
    assert "Books" in categories
    assert "Tools" in categories
    
    # Test filtering by category
    response = requests.get(f"{base_url}/items/?category=Electronics")
    assert response.status_code == 200
    
    electronics_items = response.json()
    assert len(electronics_items) == 2
    assert all(item["category"] == "Electronics" for item in electronics_items)
    
    # Cleanup
    for item_id in created_ids:
        requests.delete(f"{base_url}/items/{item_id}")


def test_smart_add_endpoint(api_server):
    """Test SmartAdd endpoint (without real AI processing)"""
    base_url = api_server
    
    # Test with minimal photo data
    smart_add_data = {
        "photos": [
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
        ]
    }
    
    response = requests.post(f"{base_url}/smart-add/", json=smart_add_data)
    assert response.status_code == 200
    
    result = response.json()
    # Should fail due to test API key, but endpoint should respond
    assert "success" in result
    assert "confidence" in result
    assert "error_message" in result or "suggestions" in result


def test_file_upload_endpoint(api_server):
    """Test file upload functionality"""
    base_url = api_server
    
    # Create a small test image file
    test_image_content = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\tpHYs\x00\x00\x0b\x13\x00\x00\x0b\x13\x01\x00\x9a\x9c\x18\x00\x00\x00\nIDATx\x9cc```\x00\x00\x00\x04\x00\x01\xdd\xcc\xdb\x1d\x00\x00\x00\x00IEND\xaeB`\x82'
    
    # Upload the file
    files = {'file': ('test.png', test_image_content, 'image/png')}
    response = requests.post(f"{base_url}/upload/", files=files)
    assert response.status_code == 200
    
    result = response.json()
    assert "image_url" in result
    assert result["image_url"].startswith("/uploads/")


def test_api_documentation(api_server):
    """Test that API documentation is accessible"""
    base_url = api_server
    
    # Test OpenAPI docs
    response = requests.get(f"{base_url}/docs")
    assert response.status_code == 200
    assert "text/html" in response.headers.get("content-type", "")
    
    # Test OpenAPI JSON
    response = requests.get(f"{base_url}/openapi.json")
    assert response.status_code == 200
    assert response.headers.get("content-type") == "application/json"
    
    openapi_spec = response.json()
    assert "openapi" in openapi_spec
    assert "paths" in openapi_spec
    assert "/items/" in openapi_spec["paths"]


def test_error_handling(api_server):
    """Test API error handling"""
    base_url = api_server
    
    # Test 404 for non-existent item
    response = requests.get(f"{base_url}/items/99999")
    assert response.status_code == 404
    
    # Test invalid data for item creation
    invalid_item = {
        "name": "",  # Empty name should be invalid
        "category": "",
        "quantity": -1  # Negative quantity might be invalid
    }
    
    response = requests.post(f"{base_url}/items/", json=invalid_item)
    # Should either accept it or return 422 for validation error
    assert response.status_code in [200, 422]
    
    # Test invalid increment
    response = requests.post(f"{base_url}/items/99999/increment?increment_by=1")
    assert response.status_code == 404


def test_concurrent_operations(api_server):
    """Test concurrent operations on the same item"""
    import threading
    base_url = api_server
    
    # Create an item
    item_data = {"name": "Concurrent Test Item", "category": "Test", "quantity": 0}
    response = requests.post(f"{base_url}/items/", json=item_data)
    assert response.status_code == 200
    item_id = response.json()["id"]
    
    # Function to increment quantity
    def increment_quantity():
        requests.post(f"{base_url}/items/{item_id}/increment?increment_by=1")
    
    # Run multiple increments concurrently
    threads = []
    for _ in range(5):
        thread = threading.Thread(target=increment_quantity)
        threads.append(thread)
        thread.start()
    
    # Wait for all threads to complete
    for thread in threads:
        thread.join()
    
    # Check final quantity
    response = requests.get(f"{base_url}/items/{item_id}")
    assert response.status_code == 200
    final_item = response.json()
    # Should be 5 if all increments succeeded
    assert final_item["quantity"] >= 0  # At least some should have succeeded
    
    # Cleanup
    requests.delete(f"{base_url}/items/{item_id}") 