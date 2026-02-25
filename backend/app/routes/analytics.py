"""
Analytics Routes
"""

from fastapi import APIRouter
from datetime import datetime, timedelta, timezone
import re
from ..db import get_db

router = APIRouter(tags=["Analytics"])


# -------------------------
# Helper Functions
# -------------------------

def to_number(value, default: float = 0.0) -> float:
    if value is None:
        return default
    if isinstance(value, (int, float)):
        return float(value)
    if isinstance(value, str):
        cleaned = value.replace(",", "").strip()
        if cleaned == "":
            return default
        try:
            return float(cleaned)
        except ValueError:
            return default
    return default


def parse_datetime(value):
    if value is None:
        return None
    if isinstance(value, datetime):
        if value.tzinfo:
            return value.astimezone(timezone.utc).replace(tzinfo=None)
        return value
    if isinstance(value, str):
        text = value.strip()
        if text.endswith("Z"):
            text = text[:-1] + "+00:00"
        try:
            parsed = datetime.fromisoformat(text)
            if parsed.tzinfo:
                return parsed.astimezone(timezone.utc).replace(tzinfo=None)
            return parsed
        except ValueError:
            return None
    return None


def normalize_status(value) -> str:
    return str(value or "").strip().lower()


def extract_items(order: dict):
    items = []
    raw_items = order.get("items") or []

    for raw in raw_items:
        if isinstance(raw, dict):
            quantity = int(to_number(raw.get("quantity") or 1, 1))
            name = raw.get("name") or "Item"
            price = to_number(raw.get("price"), 0)
            items.append({
                "name": name,
                "quantity": quantity,
                "price": price
            })
    return items


# -------------------------
# Main Analytics
# -------------------------

@router.get("")
async def get_analytics():
    db = get_db()
    all_orders = await db.orders.find({}).to_list(50000)

    total_orders = len(all_orders)
    completed_orders = sum(1 for o in all_orders if normalize_status(o.get("status")) == "completed")
    active_orders = sum(1 for o in all_orders if normalize_status(o.get("status")) in ["pending", "confirmed", "preparing", "ready"])

    total_revenue = sum(
        sum(item["price"] * item["quantity"] for item in extract_items(order))
        for order in all_orders
        if normalize_status(order.get("status")) == "completed"
    )

    avg_order_value = round(total_revenue / completed_orders, 2) if completed_orders else 0

    return {
        "success": True,
        "data": {
            "totalOrders": total_orders,
            "completedOrders": completed_orders,
            "activeOrders": active_orders,
            "totalRevenue": round(total_revenue, 2),
            "avgOrderValue": avg_order_value,
        }
    }