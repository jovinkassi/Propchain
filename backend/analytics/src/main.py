from fastapi import FastAPI
from dotenv import load_dotenv
import os

from src.routers import properties, market, yield_calc

load_dotenv()

app = FastAPI(title="Propchain Analytics", version="1.0.0")

app.include_router(properties.router, prefix="/analytics/properties")
app.include_router(market.router, prefix="/analytics/market")
app.include_router(yield_calc.router, prefix="/analytics/yield")


@app.get("/health")
def health():
    return {"status": "ok", "service": "propchain-analytics"}
