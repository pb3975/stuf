from fastapi import FastAPI, HTTPException, Depends, Query, File, UploadFile, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from sqlalchemy import create_engine, Column, Integer, String, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import os
import shutil
import qrcode
import google.generativeai as genai
import json
import base64
from PIL import Image
import io
from dotenv import load_dotenv
import re
from datetime import datetime, timedelta

load_dotenv()

app = FastAPI(title="Stuf - Smart Inventory Management", description="API for managing household items like 3D printer filament, ammunition, IoT supplies, etc.")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development - more permissive for mobile access
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
app.mount("/qrcodes", StaticFiles(directory="qrcodes"), name="qrcodes")

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

if not SQLALCHEMY_DATABASE_URL:
    raise RuntimeError("DATABASE_URL environment variable is not set.")

if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
    )
else:
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Item(Base):
    __tablename__ = 'items'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    category = Column(String, index=True)
    quantity = Column(Integer)
    custom_attributes = Column(JSON, default={})
    image_url = Column(String, nullable=True)
    qr_code_url = Column(String, nullable=True)

Base.metadata.create_all(bind=engine)

class ItemCreate(BaseModel):
    name: str
    category: str
    quantity: int
    custom_attributes: Optional[Dict[str, Any]] = {}
    image_url: Optional[str] = None

class ItemBase(BaseModel):
    id: int
    name: str
    category: str
    quantity: int
    custom_attributes: Optional[Dict[str, Any]] = {}
    image_url: Optional[str] = None
    qr_code_url: Optional[str] = None

    class Config:
        from_attributes = True

async def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def generate_qr_code(item_id: int, host: str = "localhost:5174"):
    os.makedirs("qrcodes", exist_ok=True)
    qr_code_path = os.path.join("qrcodes", f"{item_id}.png")
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    # The QR code will contain the URL to the item's detail page
    # Use the provided host (which could be an IP address for mobile access)
    qr.add_data(f"http://{host}/item/{item_id}")
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")
    img.save(qr_code_path)
    return f"/qrcodes/{item_id}.png"

def generate_all_qr_codes_on_startup():
    db = SessionLocal()
    generate_all_qr_codes(db)
    db.close()

app.add_event_handler("startup", generate_all_qr_codes_on_startup)

@app.post("/upload/")
async def upload_image(file: UploadFile = File(...)):
    os.makedirs("uploads", exist_ok=True)
    file_path = os.path.join("uploads", file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"image_url": f"/uploads/{file.filename}"}

@app.get("/items/", response_model=List[ItemBase])
def get_items(category: str = Query(None), db: Session = Depends(get_db)):
    if category:
        items = db.query(Item).filter(Item.category == category).all()
    else:
        items = db.query(Item).all()
    return items

@app.post("/items/", response_model=ItemBase)
def create_item(item: ItemCreate, db: Session = Depends(get_db)):
    db_item = Item(**item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)

    # Generate QR code
    db_item.qr_code_url = generate_qr_code(db_item.id)
    db.commit()
    db.refresh(db_item)

    return db_item

@app.get("/items/{item_id}", response_model=ItemBase)
def read_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(Item).filter(Item.id == item_id).first()
    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    return item

@app.put("/items/{item_id}", response_model=ItemBase)
def update_item(item_id: int, updated_item: ItemCreate, db: Session = Depends(get_db)):
    item = db.query(Item).filter(Item.id == item_id).first()
    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    item.name = updated_item.name
    item.category = updated_item.category
    item.quantity = updated_item.quantity
    item.custom_attributes = updated_item.custom_attributes
    item.image_url = updated_item.image_url
    db.commit()
    db.refresh(item)
    return item

@app.delete("/items/{item_id}")
def delete_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(Item).filter(Item.id == item_id).first()
    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(item)
    db.commit()
    return {"detail": "Item deleted successfully"}

@app.get("/categories/", response_model=List[str])
def get_categories(db: Session = Depends(get_db)):
    categories = db.query(Item.category).distinct().all()
    return [cat[0] for cat in categories]

@app.post("/generate-all-qr-codes/")
def generate_all_qr_codes(db: Session = Depends(get_db)):
    items = db.query(Item).all()
    for item in items:
        if not item.qr_code_url:
            item.qr_code_url = generate_qr_code(item.id)
            db.commit()
    return {"detail": "QR codes generated for all existing items."}

class SmartAddRequest(BaseModel):
    photos: List[str]  # Base64 encoded images

class SmartAddResponse(BaseModel):
    success: bool
    confidence: float
    suggestions: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None

@app.post("/smart-add/", response_model=SmartAddResponse)
async def smart_add_analyze(request: SmartAddRequest, db: Session = Depends(get_db)):
    """
    Analyze photos using Google Gemini to suggest item attributes
    """
    try:
        # Configure Gemini API
        api_key = os.getenv("GOOGLE_AI_API_KEY")
        if not api_key:
            return SmartAddResponse(
                success=False,
                confidence=0.0,
                error_message="Gemini API key not configured"
            )
        
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-2.0-flash-exp')
        
        # Get existing categories for context
        existing_categories = db.query(Item.category).distinct().all()
        categories_list = [cat[0] for cat in existing_categories]
        
        # Prepare images for Gemini
        images = []
        for photo_b64 in request.photos[:3]:  # Max 3 photos
            try:
                # Decode base64 image
                image_data = base64.b64decode(photo_b64.split(',')[1] if ',' in photo_b64 else photo_b64)
                image = Image.open(io.BytesIO(image_data))
                images.append(image)
            except Exception as e:
                return SmartAddResponse(
                    success=False,
                    confidence=0.0,
                    error_message=f"Failed to process image: {str(e)}"
                )
        
        # Create prompt for Gemini with more confident language
        prompt = f"""
        Analyze these images and identify the household inventory item. Provide your most confident assessment without hedging language.
        
        Existing categories in the system: {', '.join(categories_list) if categories_list else 'None'}
        
        Provide a JSON response with this exact structure:
        {{
            "name": "specific item name (be precise and confident)",
            "category": "best matching category (use existing categories when possible)",
            "quantity": estimated_quantity_visible_or_1,
            "confidence": confidence_score_0_to_1,
            "custom_attributes": {{
                "color": "primary color",
                "material": "material type", 
                "brand": "brand name",
                "condition": "condition state",
                "size": "size specification",
                "model": "model number or type"
            }}
        }}
        
        Rules:
        - Be direct and confident in your assessments
        - Do not use phrases like "seems like", "appears to be", "likely", "probably", "sort of"
        - State what you observe definitively
        - Only include custom_attributes you can clearly identify
        - For quantity, count visible items or default to 1
        - Set confidence based on image clarity and your certainty of identification
        """
        
        # Send request to Gemini
        response = model.generate_content([prompt] + images)
        
        # Parse response
        response_text = response.text.strip()
        
        # Extract JSON from response (handle potential markdown formatting)
        if "```json" in response_text:
            json_start = response_text.find("```json") + 7
            json_end = response_text.find("```", json_start)
            json_text = response_text[json_start:json_end].strip()
        elif "{" in response_text:
            json_start = response_text.find("{")
            json_end = response_text.rfind("}") + 1
            json_text = response_text[json_start:json_end]
        else:
            raise ValueError("No JSON found in response")
        
        suggestions = json.loads(json_text)
        
        # Validate and clean suggestions
        confidence = float(suggestions.get('confidence', 0.5))
        
        # Clean custom attributes (remove empty values)
        custom_attrs = suggestions.get('custom_attributes', {})
        cleaned_attrs = {k: v for k, v in custom_attrs.items() if v and v.strip()}
        
        final_suggestions = {
            'name': suggestions.get('name', 'Unknown Item'),
            'category': suggestions.get('category', 'Miscellaneous'),
            'quantity': max(1, int(suggestions.get('quantity', 1))),
            'custom_attributes': cleaned_attrs
        }
        
        # Check for existing similar items in the same category
        similar_items = []
        suggested_category = final_suggestions['category']
        suggested_name = final_suggestions['name'].lower()
        
        if suggested_category:
            # Get all items in the suggested category
            category_items = db.query(Item).filter(Item.category == suggested_category).all()
            
            # Check for similar names using simple string matching
            for item in category_items:
                item_name_lower = item.name.lower()
                # Check if names are similar (contains, or high overlap)
                if (suggested_name in item_name_lower or 
                    item_name_lower in suggested_name or
                    len(set(suggested_name.split()) & set(item_name_lower.split())) >= 2):
                    similar_items.append({
                        'id': item.id,
                        'name': item.name,
                        'quantity': item.quantity,
                        'category': item.category
                    })
        
        # Add similar items to response if found
        if similar_items:
            final_suggestions['similar_items'] = similar_items
        
        return SmartAddResponse(
            success=True,
            confidence=confidence,
            suggestions=final_suggestions
        )
        
    except Exception as e:
        return SmartAddResponse(
            success=False,
            confidence=0.0,
            error_message=f"SmartAdd analysis failed: {str(e)}"
        )

@app.post("/items/{item_id}/increment")
def increment_item_quantity(item_id: int, increment_by: int = 1, db: Session = Depends(get_db)):
    """
    Increment the quantity of an existing item
    """
    item = db.query(Item).filter(Item.id == item_id).first()
    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    
    item.quantity = item.quantity + increment_by
    db.commit()
    db.refresh(item)
    return {"detail": f"Item quantity incremented by {increment_by}", "new_quantity": item.quantity}

# Simplified helper functions (no OpenCV required)
def extract_price_from_text(text: str) -> Optional[str]:
    """Extract price information from text"""
    price_patterns = [
        r'\$\d+\.?\d*',  # $10.99, $10
        r'\d+\.?\d*\s*(?:USD|usd|\$)',  # 10.99 USD, 10$
        r'(?:Price|price|PRICE)[\s:]*\$?\d+\.?\d*',  # Price: $10.99
        r'\d+\.?\d*\s*(?:dollars?|cents?)',  # 10.99 dollars
    ]
    
    for pattern in price_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group()
    return None

def extract_expiry_from_text(text: str) -> Optional[str]:
    """Extract expiration date from text"""
    date_patterns = [
        r'(?:exp|expire[sd]?|expiry|best\s+by|use\s+by)[\s:]*(\d{1,2}[/\-]\d{1,2}[/\-]\d{2,4})',
        r'(\d{1,2}[/\-]\d{1,2}[/\-]\d{2,4})(?:\s*(?:exp|expire[sd]?))?',
        r'(?:exp|expire[sd]?|expiry)[\s:]*(\d{1,2}\s+\w+\s+\d{2,4})',  # 15 Jan 2024
    ]
    
    for pattern in date_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            try:
                date_str = match.group(1)
                # Try to parse and validate the date
                if '/' in date_str or '-' in date_str:
                    separator = '/' if '/' in date_str else '-'
                    parts = date_str.split(separator)
                    if len(parts) == 3:
                        month, day, year = parts
                        if len(year) == 2:
                            year = '20' + year
                        return f"{month}/{day}/{year}"
                return date_str
            except:
                continue
    return None

# Enhanced SmartAdd models
class EnhancedSmartAddRequest(BaseModel):
    photos: List[str]  # Base64 encoded images
    batch_mode: bool = False  # Process multiple items in one request
    detect_price: bool = False  # Enable price detection
    detect_expiry: bool = False  # Enable expiration date detection

class EnhancedSmartAddResponse(BaseModel):
    success: bool
    confidence: float
    batch_results: Optional[List[Dict[str, Any]]] = None  # For batch processing
    suggestions: Optional[Dict[str, Any]] = None  # Single item suggestions
    price_estimate: Optional[str] = None
    expiry_date: Optional[str] = None
    error_message: Optional[str] = None

@app.post("/enhanced-smart-add/", response_model=EnhancedSmartAddResponse)
async def enhanced_smart_add_analyze(request: EnhancedSmartAddRequest, db: Session = Depends(get_db)):
    """
    Enhanced SmartAdd with batch processing, price detection, and expiry detection
    (Simplified version without barcode scanning)
    """
    try:
        # Configure Gemini API
        api_key = os.getenv("GOOGLE_AI_API_KEY")
        if not api_key:
            return EnhancedSmartAddResponse(
                success=False,
                confidence=0.0,
                error_message="Gemini API key not configured"
            )
        
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-2.0-flash-exp')
        
        # Get existing categories for context
        existing_categories = db.query(Item.category).distinct().all()
        categories_list = [cat[0] for cat in existing_categories]
        
        # Prepare images for analysis
        images = []
        
        for photo_b64 in request.photos[:5]:  # Max 5 photos for enhanced mode
            try:
                # Decode base64 image
                image_data = base64.b64decode(photo_b64.split(',')[1] if ',' in photo_b64 else photo_b64)
                image = Image.open(io.BytesIO(image_data))
                images.append(image)
                
            except Exception as e:
                return EnhancedSmartAddResponse(
                    success=False,
                    confidence=0.0,
                    error_message=f"Failed to process image: {str(e)}"
                )
        
        # Enhanced prompt for batch processing and additional features
        if request.batch_mode:
            prompt = f"""
            Analyze these images and identify ALL distinct household inventory items visible. Process each item separately.
            
            Existing categories: {', '.join(categories_list) if categories_list else 'None'}
            
            Additional analysis requested:
            - Price detection: {request.detect_price}
            - Expiration date detection: {request.detect_expiry}
            
            Look carefully for:
            {f"- Price tags, labels, stickers, or receipts showing prices" if request.detect_price else ""}
            {f"- Expiration dates, 'best by', 'use by', or 'exp' dates on packaging" if request.detect_expiry else ""}
            
            Provide a JSON response with this structure:
            {{
                "items": [
                    {{
                        "name": "specific item name",
                        "category": "best matching category",
                        "quantity": estimated_quantity,
                        "confidence": confidence_score_0_to_1,
                        "custom_attributes": {{
                            "color": "primary color",
                            "material": "material type",
                            "brand": "brand name",
                            "condition": "condition state",
                            "size": "size specification"
                        }}
                    }}
                ],
                "overall_confidence": average_confidence_across_all_items
            }}
            
            Rules:
            - Identify each distinct item separately
            - Be confident and direct in assessments
            - Only include attributes you can clearly identify
            - For prices, look for price tags, labels, or receipts
            - For expiry dates, look for "exp", "best by", "use by" dates
            """
        else:
            # Single item analysis (existing logic enhanced)
            prompt = f"""
            Analyze these images and identify the primary household inventory item.
            
            Existing categories: {', '.join(categories_list) if categories_list else 'None'}
            
            Additional analysis requested:
            - Price detection: {request.detect_price}
            - Expiration date detection: {request.detect_expiry}
            
            Provide a JSON response with this exact structure:
            {{
                "name": "specific item name",
                "category": "best matching category",
                "quantity": estimated_quantity_visible_or_1,
                "confidence": confidence_score_0_to_1,
                "custom_attributes": {{
                    "color": "primary color",
                    "material": "material type", 
                    "brand": "brand name",
                    "condition": "condition state",
                    "size": "size specification",
                    "model": "model number or type"
                    {', "price": "estimated price"' if request.detect_price else ''}
                    {', "expiry_date": "expiration date if visible"' if request.detect_expiry else ''}
                }}
            }}
            
            Rules:
            - Be direct and confident in your assessments
            - Only include custom_attributes you can clearly identify
            - For prices, look for price tags, stickers, or visible pricing
            - For expiry dates, look for "exp", "best by", "use by" dates
            - Set confidence based on image clarity and identification certainty
            """
        
        # Send request to Gemini
        response = model.generate_content([prompt] + images)
        response_text = response.text.strip()
        
        # Extract JSON from response
        if "```json" in response_text:
            json_start = response_text.find("```json") + 7
            json_end = response_text.find("```", json_start)
            json_text = response_text[json_start:json_end].strip()
        elif "{" in response_text:
            json_start = response_text.find("{")
            json_end = response_text.rfind("}") + 1
            json_text = response_text[json_start:json_end]
        else:
            raise ValueError("No JSON found in response")
        
        ai_response = json.loads(json_text)
        
        if request.batch_mode and "items" in ai_response:
            # Process batch results
            batch_results = []
            for item_data in ai_response["items"]:
                # Clean custom attributes
                custom_attrs = item_data.get('custom_attributes', {})
                cleaned_attrs = {k: v for k, v in custom_attrs.items() if v and str(v).strip()}
                
                processed_item = {
                    'name': item_data.get('name', 'Unknown Item'),
                    'category': item_data.get('category', 'Miscellaneous'),
                    'quantity': max(1, int(item_data.get('quantity', 1))),
                    'custom_attributes': cleaned_attrs,
                    'confidence': float(item_data.get('confidence', 0.5))
                }
                
                # Check for similar items
                similar_items = []
                suggested_category = processed_item['category']
                suggested_name = processed_item['name'].lower()
                
                if suggested_category:
                    category_items = db.query(Item).filter(Item.category == suggested_category).all()
                    for item in category_items:
                        item_name_lower = item.name.lower()
                        if (suggested_name in item_name_lower or 
                            item_name_lower in suggested_name or
                            len(set(suggested_name.split()) & set(item_name_lower.split())) >= 2):
                            similar_items.append({
                                'id': item.id,
                                'name': item.name,
                                'quantity': item.quantity,
                                'category': item.category
                            })
                
                if similar_items:
                    processed_item['similar_items'] = similar_items
                
                batch_results.append(processed_item)
            
            return EnhancedSmartAddResponse(
                success=True,
                confidence=float(ai_response.get('overall_confidence', 0.5)),
                batch_results=batch_results,
                price_estimate=ai_response.get('price_estimate', None),
                expiry_date=ai_response.get('expiry_date', None)
            )
        else:
            # Single item processing (enhanced existing logic)
            confidence = float(ai_response.get('confidence', 0.5))
            
            # Clean custom attributes
            custom_attrs = ai_response.get('custom_attributes', {})
            cleaned_attrs = {k: v for k, v in custom_attrs.items() if v and str(v).strip()}
            
            # Extract price and expiry if present
            if request.detect_price and 'price' in cleaned_attrs:
                price_estimate = cleaned_attrs['price']
            
            if request.detect_expiry and 'expiry_date' in cleaned_attrs:
                expiry_date = cleaned_attrs['expiry_date']
            
            final_suggestions = {
                'name': ai_response.get('name', 'Unknown Item'),
                'category': ai_response.get('category', 'Miscellaneous'),
                'quantity': max(1, int(ai_response.get('quantity', 1))),
                'custom_attributes': cleaned_attrs
            }
            
            # Check for existing similar items
            similar_items = []
            suggested_category = final_suggestions['category']
            suggested_name = final_suggestions['name'].lower()
            
            if suggested_category:
                category_items = db.query(Item).filter(Item.category == suggested_category).all()
                for item in category_items:
                    item_name_lower = item.name.lower()
                    if (suggested_name in item_name_lower or 
                        item_name_lower in suggested_name or
                        len(set(suggested_name.split()) & set(item_name_lower.split())) >= 2):
                        similar_items.append({
                            'id': item.id,
                            'name': item.name,
                            'quantity': item.quantity,
                            'category': item.category
                        })
            
            if similar_items:
                final_suggestions['similar_items'] = similar_items
            
            return EnhancedSmartAddResponse(
                success=True,
                confidence=confidence,
                suggestions=final_suggestions,
                price_estimate=price_estimate,
                expiry_date=expiry_date
            )
        
    except Exception as e:
        return EnhancedSmartAddResponse(
            success=False,
            confidence=0.0,
            error_message=f"Enhanced SmartAdd analysis failed: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    # Run the server on all interfaces (0.0.0.0) so it's accessible from mobile devices
    uvicorn.run(app, host="0.0.0.0", port=8000)
