from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import uuid

# User Models
class UserBase(BaseModel):
    email: str
    phone_number: str
    full_name: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class User(UserBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True

# Contact Models
class ContactBase(BaseModel):
    name: str
    phone_number: str
    relationship: str = "family"  # family, friend, colleague, neighbor
    is_primary: bool = False

class ContactCreate(ContactBase):
    pass

class Contact(ContactBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Location Models
class LocationData(BaseModel):
    latitude: float
    longitude: float
    address: Optional[str] = None
    accuracy: Optional[float] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

# Alert Models
class AlertType(BaseModel):
    PANIC_BUTTON = "panic_button"
    VOICE_SOS = "voice_sos"
    PREDICTIVE = "predictive"
    ZONE_ALERT = "zone_alert"

class AlertCreate(BaseModel):
    type: str
    message: str
    location: LocationData
    audio_data: Optional[str] = None  # base64 encoded audio
    video_data: Optional[str] = None  # base64 encoded video

class Alert(AlertCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    contacts_notified: List[str] = []
    status: str = "active"  # active, resolved, false_alarm

# Safety Zone Models
class SafetyZone(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    zone_type: str  # safe, caution, danger
    coordinates: List[List[float]]  # polygon coordinates
    risk_level: int = 1  # 1-10 scale
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

# User Settings Models
class UserSettings(BaseModel):
    user_id: str
    voice_activation_phrase: str = "help me"
    emergency_message: str = "I need help! My current location is: [LOCATION]. Please check on me immediately."
    auto_alert_zones: bool = True
    voice_monitoring_enabled: bool = True
    predictive_alerts_enabled: bool = True
    dark_mode: bool = False

# AI Chat Models
class ChatMessage(BaseModel):
    message: str
    user_id: str

class ChatResponse(BaseModel):
    response: str
    session_id: str

# History Models
class SafetyHistory(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    event_type: str  # alert, zone_entry, ai_check, route_taken
    description: str
    location: Optional[LocationData] = None
    metadata: Optional[dict] = {}
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Response Models
class TokenResponse(BaseModel):
    access_token: str
    token_type: str

class MessageResponse(BaseModel):
    message: str
    success: bool = True