import psycopg2
import psycopg2.extras
import os
import json


def get_db():
    return psycopg2.connect(os.environ["DATABASE_URL"], cursor_factory=psycopg2.extras.RealDictCursor)


def get_property_details(property_name: str) -> dict:
    """Fetch property details from the database by name."""
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "SELECT * FROM properties WHERE LOWER(name) LIKE LOWER(%s) AND active = true LIMIT 1",
        (f"%{property_name}%",)
    )
    row = cur.fetchone()
    conn.close()
    if not row:
        return {"error": f"Property '{property_name}' not found"}
    return dict(row)


def list_all_properties() -> list:
    """List all active properties with key stats."""
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "SELECT id, name, location, total_value, rental_yield_bps, image_url FROM properties WHERE active = true ORDER BY rental_yield_bps DESC"
    )
    rows = cur.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def calculate_investment_return(property_id: str, investment_aed: float) -> dict:
    """Calculate expected returns for a given investment amount."""
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT * FROM properties WHERE id = %s OR on_chain_id = %s", (property_id, property_id))
    row = cur.fetchone()
    conn.close()

    if not row:
        return {"error": "Property not found"}

    prop = dict(row)
    total_value = prop["total_value"]
    yield_bps = prop["rental_yield_bps"]

    ownership_pct = (investment_aed / total_value) * 100
    annual_yield_rate = yield_bps / 10000
    annual_return_aed = investment_aed * annual_yield_rate
    monthly_return_aed = annual_return_aed / 12

    return {
        "property_name": prop["name"],
        "investment_aed": investment_aed,
        "ownership_percentage": round(ownership_pct, 4),
        "annual_yield_pct": round(annual_yield_rate * 100, 2),
        "annual_return_aed": round(annual_return_aed, 2),
        "monthly_return_aed": round(monthly_return_aed, 2),
        "payback_years": round(investment_aed / annual_return_aed, 1) if annual_return_aed > 0 else None,
    }


def get_market_overview() -> dict:
    """Get overall UAE real estate market stats from the platform."""
    conn = get_db()
    cur = conn.cursor()
    cur.execute("""
        SELECT
            COUNT(*) AS total_properties,
            SUM(total_value) AS total_market_value,
            AVG(rental_yield_bps) AS avg_yield_bps,
            MAX(rental_yield_bps) AS max_yield_bps,
            MIN(rental_yield_bps) AS min_yield_bps
        FROM properties WHERE active = true
    """)
    row = dict(cur.fetchone())
    conn.close()

    return {
        "total_properties": int(row["total_properties"]),
        "total_market_value_aed": int(row["total_market_value"] or 0),
        "avg_yield_pct": round((row["avg_yield_bps"] or 0) / 100, 2),
        "max_yield_pct": round((row["max_yield_bps"] or 0) / 100, 2),
        "min_yield_pct": round((row["min_yield_bps"] or 0) / 100, 2),
    }


def compare_properties(property_names: list) -> list:
    """Compare multiple properties side by side."""
    results = []
    for name in property_names:
        prop = get_property_details(name)
        if "error" not in prop:
            results.append({
                "name": prop["name"],
                "location": prop["location"],
                "total_value_aed": prop["total_value"],
                "yield_pct": round(prop["rental_yield_bps"] / 100, 2),
            })
    return results


# Tool definitions for OpenAI function calling
TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "get_property_details",
            "description": "Get detailed information about a specific UAE property listed on Propchain",
            "parameters": {
                "type": "object",
                "properties": {
                    "property_name": {"type": "string", "description": "Name or partial name of the property"}
                },
                "required": ["property_name"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "list_all_properties",
            "description": "List all available investment properties on Propchain sorted by yield",
            "parameters": {"type": "object", "properties": {}}
        }
    },
    {
        "type": "function",
        "function": {
            "name": "calculate_investment_return",
            "description": "Calculate expected annual and monthly returns for a given investment amount in a property",
            "parameters": {
                "type": "object",
                "properties": {
                    "property_id": {"type": "string", "description": "Property ID or on-chain ID"},
                    "investment_aed": {"type": "number", "description": "Investment amount in AED"}
                },
                "required": ["property_id", "investment_aed"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_market_overview",
            "description": "Get overall UAE real estate market statistics from the Propchain platform",
            "parameters": {"type": "object", "properties": {}}
        }
    },
    {
        "type": "function",
        "function": {
            "name": "compare_properties",
            "description": "Compare multiple properties side by side",
            "parameters": {
                "type": "object",
                "properties": {
                    "property_names": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "List of property names to compare"
                    }
                },
                "required": ["property_names"]
            }
        }
    }
]

TOOL_MAP = {
    "get_property_details": get_property_details,
    "list_all_properties": list_all_properties,
    "calculate_investment_return": calculate_investment_return,
    "get_market_overview": get_market_overview,
    "compare_properties": compare_properties,
}
