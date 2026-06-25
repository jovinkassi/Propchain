from fastapi import APIRouter

router = APIRouter()


@router.get("/estimate")
def estimate_yield(property_value: float, yield_bps: int, token_amount: int, total_supply: int):
    """Estimate annual yield for a token holder."""
    annual_yield_rate = yield_bps / 10000
    holder_share = token_amount / total_supply
    annual_yield_aed = property_value * annual_yield_rate * holder_share

    return {
        "token_amount": token_amount,
        "holder_share_pct": round(holder_share * 100, 4),
        "annual_yield_aed": round(annual_yield_aed, 2),
        "monthly_yield_aed": round(annual_yield_aed / 12, 2),
    }
