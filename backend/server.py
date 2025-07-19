from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from datetime import datetime, timedelta
from typing import List, Optional
import httpx
import uuid
import os

# Local imports
from models import *
from database import *
from auth import *

# Third-party integrations
from twilio.rest import Client

app = FastAPI(title="Raksha+ Safety App API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Twilio client
twilio_client = None
if settings.twilio_account_sid and settings.twilio_auth_token:
    twilio_client = Client(settings.twilio_account_sid, settings.twilio_auth_token)

@app.on_event("startup")
async def startup_event():
    await create_indexes()

# ===============================
# Authentication Endpoints
# ===============================

@app.post("/api/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    """Register a new user"""
    # Check if user already exists
    existing_user = await users_collection.find_one({
        "$or": [{"email": user_data.email}, {"phone_number": user_data.phone_number}]
    })
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email or phone number already exists"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    user = User(
        email=user_data.email,
        phone_number=user_data.phone_number,
        full_name=user_data.full_name
    )
    
    user_dict = user.dict()
    user_dict["hashed_password"] = hashed_password
    
    await users_collection.insert_one(user_dict)
    
    # Create default user settings
    default_settings = UserSettings(user_id=user.id)
    await user_settings_collection.insert_one(default_settings.dict())
    
    # Create access token
    access_token = create_access_token(data={"sub": user.id})
    return TokenResponse(access_token=access_token, token_type="bearer")

@app.post("/api/auth/login", response_model=TokenResponse)
async def login(user_credentials: UserLogin):
    """Login user"""
    user = await users_collection.find_one({"email": user_credentials.email})
    if not user or not verify_password(user_credentials.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    access_token = create_access_token(data={"sub": user["id"]})
    return TokenResponse(access_token=access_token, token_type="bearer")

@app.get("/api/auth/me", response_model=User)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return current_user

# ===============================
# Contact Management Endpoints
# ===============================

@app.post("/api/contacts", response_model=Contact)
async def create_contact(contact_data: ContactCreate, current_user: User = Depends(get_current_user)):
    """Add a new emergency contact"""
    contact = Contact(**contact_data.dict(), user_id=current_user.id)
    await contacts_collection.insert_one(contact.dict())
    return contact

@app.get("/api/contacts", response_model=List[Contact])
async def get_contacts(current_user: User = Depends(get_current_user)):
    """Get all user's emergency contacts"""
    contacts = await contacts_collection.find({"user_id": current_user.id}).to_list(100)
    return [Contact(**contact) for contact in contacts]

@app.delete("/api/contacts/{contact_id}")
async def delete_contact(contact_id: str, current_user: User = Depends(get_current_user)):
    """Delete an emergency contact"""
    result = await contacts_collection.delete_one({
        "id": contact_id,
        "user_id": current_user.id
    })
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Contact not found")
    return MessageResponse(message="Contact deleted successfully")

# ===============================
# Alert/SOS Endpoints
# ===============================

@app.post("/api/alerts", response_model=Alert)
async def create_alert(alert_data: AlertCreate, current_user: User = Depends(get_current_user)):
    """Create an emergency alert"""
    alert = Alert(**alert_data.dict(), user_id=current_user.id)
    
    # Save alert to database
    await alerts_collection.insert_one(alert.dict())
    
    # Get user's emergency contacts
    contacts = await contacts_collection.find({"user_id": current_user.id}).to_list(100)
    
    # Send SMS alerts to contacts
    notified_contacts = []
    if twilio_client and contacts:
        for contact in contacts:
            try:
                message_body = f"🚨 EMERGENCY ALERT 🚨\n\nFrom: {current_user.full_name}\nMessage: {alert.message}\nLocation: {alert.location.address or f'Lat: {alert.location.latitude}, Lng: {alert.location.longitude}'}\nTime: {alert.created_at.strftime('%Y-%m-%d %H:%M:%S')}\n\nThis is an automated safety alert from Raksha+ app."
                
                message = twilio_client.messages.create(
                    body=message_body,
                    from_=settings.twilio_phone_number,
                    to=contact["phone_number"]
                )
                notified_contacts.append(contact["id"])
            except Exception as e:
                print(f"Failed to send SMS to {contact['phone_number']}: {str(e)}")
    
    # Update alert with notified contacts
    await alerts_collection.update_one(
        {"id": alert.id},
        {"$set": {"contacts_notified": notified_contacts}}
    )
    
    # Log to safety history
    history_entry = SafetyHistory(
        user_id=current_user.id,
        event_type="alert",
        description=f"{alert.type.replace('_', ' ').title()} alert activated",
        location=alert.location,
        metadata={"alert_id": alert.id, "contacts_notified": len(notified_contacts)}
    )
    await safety_history_collection.insert_one(history_entry.dict())
    
    return alert

@app.get("/api/alerts", response_model=List[Alert])
async def get_alerts(current_user: User = Depends(get_current_user)):
    """Get user's alert history"""
    alerts = await alerts_collection.find({"user_id": current_user.id}).sort("created_at", -1).to_list(100)
    return [Alert(**alert) for alert in alerts]

# ===============================
# Location and Safety Zone Endpoints
# ===============================

@app.post("/api/location/check-safety")
async def check_location_safety(location: LocationData, current_user: User = Depends(get_current_user)):
    """Check if location is in a safe zone"""
    # This is a simplified implementation - in production, you'd use proper geospatial queries
    safety_zones = await safety_zones_collection.find().to_list(100)
    
    current_zone = None
    risk_level = 1  # Default safe
    
    # Basic zone checking logic (simplified)
    for zone in safety_zones:
        # In production, implement proper polygon containment checking
        if zone["zone_type"] == "danger":
            risk_level = max(risk_level, 8)
            current_zone = zone
        elif zone["zone_type"] == "caution":
            risk_level = max(risk_level, 5)
            if not current_zone:
                current_zone = zone
    
    # Determine safety status
    if risk_level <= 3:
        safety_status = "safe"
    elif risk_level <= 6:
        safety_status = "caution"
    else:
        safety_status = "danger"
    
    # Log location check
    history_entry = SafetyHistory(
        user_id=current_user.id,
        event_type="location_check",
        description=f"Location checked - {safety_status} zone",
        location=location,
        metadata={"risk_level": risk_level, "zone": current_zone["name"] if current_zone else None}
    )
    await safety_history_collection.insert_one(history_entry.dict())
    
    return {
        "safety_status": safety_status,
        "risk_level": risk_level,
        "current_zone": current_zone,
        "recommendations": _get_safety_recommendations(safety_status, risk_level)
    }

def _get_safety_recommendations(safety_status: str, risk_level: int) -> List[str]:
    """Get safety recommendations based on current status"""
    if safety_status == "safe":
        return ["You're in a safe area. Continue to stay aware of your surroundings."]
    elif safety_status == "caution":
        return [
            "Exercise extra caution in this area.",
            "Consider sharing your location with trusted contacts.",
            "Stay in well-lit, populated areas."
        ]
    else:
        return [
            "You're in a high-risk area. Consider leaving immediately.",
            "Share your location with emergency contacts.",
            "Stay alert and avoid isolated areas.",
            "Consider calling local emergency services if you feel unsafe."
        ]

# ===============================
# User Settings Endpoints
# ===============================

@app.get("/api/settings", response_model=UserSettings)
async def get_user_settings(current_user: User = Depends(get_current_user)):
    """Get user settings"""
    settings = await user_settings_collection.find_one({"user_id": current_user.id})
    if not settings:
        # Create default settings
        default_settings = UserSettings(user_id=current_user.id)
        await user_settings_collection.insert_one(default_settings.dict())
        return default_settings
    return UserSettings(**settings)

@app.put("/api/settings", response_model=UserSettings)
async def update_user_settings(settings_data: UserSettings, current_user: User = Depends(get_current_user)):
    """Update user settings"""
    settings_data.user_id = current_user.id
    await user_settings_collection.update_one(
        {"user_id": current_user.id},
        {"$set": settings_data.dict()},
        upsert=True
    )
    return settings_data

# ===============================
# AI Safety Assistant Endpoints
# ===============================

@app.post("/api/ai/chat", response_model=ChatResponse)
async def chat_with_ai(chat_data: ChatMessage, current_user: User = Depends(get_current_user)):
    """Chat with AI safety assistant"""
    try:
        # Import emergentintegrations here to handle optional dependency
        from emergentintegrations import EmergentIntegrations
        
        # Create AI instance (simplified for now - would need proper session management)
        ai = EmergentIntegrations()
        
        # Get current location context from user's last known location
        recent_history = await safety_history_collection.find(
            {"user_id": current_user.id, "location": {"$exists": True}}
        ).sort("created_at", -1).limit(1).to_list(1)
        
        location_context = ""
        if recent_history:
            loc = recent_history[0]["location"]
            location_context = f" User's current location: {loc.get('address', 'Unknown')}"
        
        # Enhanced prompt for safety context
        enhanced_prompt = f"""You are Raksha AI, a safety assistant for women and children in India. 
        User: {current_user.full_name}
        Context: This is a safety app that helps with emergency situations, location tracking, and safety advice.{location_context}
        
        User question: {chat_data.message}
        
        Provide helpful, safety-focused advice. If it's an emergency situation, guide them to use the panic button or voice SOS features."""
        
        # This would be implemented with proper emergentintegrations once we have the API setup
        response = f"I'm Raksha AI, your safety assistant. I understand you said: '{chat_data.message}'. How can I help keep you safe today?"
        
        return ChatResponse(response=response, session_id=str(uuid.uuid4()))
        
    except Exception as e:
        # Fallback response if AI service is not available
        return ChatResponse(
            response="I'm here to help with your safety needs. Please let me know what specific assistance you need, or use the emergency buttons if you're in immediate danger.",
            session_id=str(uuid.uuid4())
        )

# ===============================
# Safety History Endpoints
# ===============================

@app.get("/api/history", response_model=List[SafetyHistory])
async def get_safety_history(current_user: User = Depends(get_current_user)):
    """Get user's safety history"""
    history = await safety_history_collection.find({"user_id": current_user.id}).sort("created_at", -1).limit(50).to_list(50)
    return [SafetyHistory(**entry) for entry in history]

# ===============================
# Utility Endpoints
# ===============================

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.utcnow()}

@app.get("/api/emergency-numbers")
async def get_emergency_numbers():
    """Get local emergency numbers"""
    return {
        "india": {
            "police": "100",
            "fire": "101",
            "ambulance": "102",
            "women_helpline": "1091",
            "child_helpline": "1098",
            "disaster_management": "108"
        }
    }

# Error handlers
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "message": str(exc)}
    )