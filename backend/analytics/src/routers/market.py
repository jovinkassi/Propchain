from fastapi import APIRouter
import psycopg2
import os
import pandas as pd

router = APIRouter()


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


@router.get("/overview")
def market_overview():
    conn = get_conn()
    props = pd.read_sql("SELECT total_value, rental_yield_bps FROM properties WHERE active = true", conn)
    conn.close()

    if props.empty:
        return {"total_market_value_aed": 0, "total_properties": 0}

    return {
        "total_properties": len(props),
        "total_market_value_aed": int(props["total_value"].sum()),
        "avg_rental_yield_bps": float(props["rental_yield_bps"].mean()),
        "avg_rental_yield_pct": round(float(props["rental_yield_bps"].mean()) / 100, 2),
    }
