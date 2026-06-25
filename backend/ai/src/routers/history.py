from fastapi import APIRouter, Query
from src.db.mongo import get_chat_collection
from datetime import datetime, timezone

router = APIRouter()

@router.get("/history")
async def get_history(wallet: str = Query(...)):
    collection = get_chat_collection()
    sessions = await collection.find(
        {"wallet": wallet},
        {"_id": 0}
    ).sort("created_at", -1).limit(20).to_list(20)
    return sessions

@router.delete("/history")
async def clear_history(wallet: str = Query(...)):
    collection = get_chat_collection()
    await collection.delete_many({"wallet": wallet})
    return {"message": "Chat history cleared"}
