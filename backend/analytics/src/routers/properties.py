from fastapi import APIRouter
import psycopg2
import os
import pandas as pd

router = APIRouter()


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


@router.get("/{property_id}/performance")
def property_performance(property_id: int):
    conn = get_conn()
    df = pd.read_sql(
        "SELECT * FROM yield_distributions WHERE property_on_chain_id = %s ORDER BY created_at",
        conn,
        params=(property_id,)
    )
    conn.close()

    if df.empty:
        return {"property_id": property_id, "total_yield": 0, "distributions": 0}

    return {
        "property_id": property_id,
        "total_yield": int(df["amount"].sum()),
        "distributions": len(df),
        "avg_yield_per_distribution": float(df["amount"].mean()),
    }


@router.get("/{property_id}/holders/distribution")
def holder_distribution(property_id: int):
    conn = get_conn()
    df = pd.read_sql(
        "SELECT wallet_address, token_amount FROM token_holdings WHERE property_on_chain_id = %s",
        conn,
        params=(property_id,)
    )
    conn.close()

    total = df["token_amount"].sum()
    df["percentage"] = (df["token_amount"] / total * 100).round(2)
    return df.to_dict(orient="records")
