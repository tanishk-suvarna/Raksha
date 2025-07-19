import os
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    mongo_url: str = os.getenv("MONGO_URL", "mongodb://localhost:27017/raksha_safety_app")
    jwt_secret_key: str = os.getenv("JWT_SECRET_KEY", "your-secret-key-here")
    jwt_algorithm: str = os.getenv("JWT_ALGORITHM", "HS256")
    jwt_access_token_expire_minutes: int = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    
    # API Keys
    google_maps_api_key: str = os.getenv("GOOGLE_MAPS_API_KEY", "")
    twilio_account_sid: str = os.getenv("TWILIO_ACCOUNT_SID", "")
    twilio_auth_token: str = os.getenv("TWILIO_AUTH_TOKEN", "")
    twilio_verify_service: str = os.getenv("TWILIO_VERIFY_SERVICE", "")
    twilio_phone_number: str = os.getenv("TWILIO_PHONE_NUMBER", "")

settings = Settings()

# MongoDB connection
client = AsyncIOMotorClient(settings.mongo_url)
database = client.get_database()

# Collections
users_collection = database.get_collection("users")
contacts_collection = database.get_collection("contacts")
alerts_collection = database.get_collection("alerts")
safety_zones_collection = database.get_collection("safety_zones")
user_settings_collection = database.get_collection("user_settings")
safety_history_collection = database.get_collection("safety_history")

# Indexes
async def create_indexes():
    """Create database indexes for better performance"""
    await users_collection.create_index("email", unique=True)
    await users_collection.create_index("phone_number", unique=True)
    await contacts_collection.create_index("user_id")
    await alerts_collection.create_index("user_id")
    await alerts_collection.create_index("created_at")
    await safety_history_collection.create_index("user_id")
    await safety_history_collection.create_index("created_at")
    await user_settings_collection.create_index("user_id", unique=True)