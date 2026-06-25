from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from src.routers.chat import router as chat_router
from src.routers.history import router as history_router

load_dotenv()

app = FastAPI(title="Propchain AI Agent", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:8081"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router, prefix="/ai")
app.include_router(history_router, prefix="/ai")


@app.get("/health")
def health():
    return {"status": "ok", "service": "propchain-ai"}
