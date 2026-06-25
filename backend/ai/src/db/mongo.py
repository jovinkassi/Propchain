import os
from motor.motor_asyncio import AsyncIOMotorClient

_client = None

def get_mongo_client():
    global _client
    if _client is None:
        url = os.environ.get("MONGODB_URL", "mongodb://localhost:27017")
        _client = AsyncIOMotorClient(url)
    return _client

def get_db():
    return get_mongo_client()["propchain"]

def get_chat_collection():
    return get_db()["chat_history"]
