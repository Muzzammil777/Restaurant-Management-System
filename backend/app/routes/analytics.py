"""
Analytics Routes
- Dashboard analytics
- Reports data
"""

from fastapi import APIRouter
from datetime import datetime, timedelta, timezone
import re
from ..db import get_db

router = APIRouter(tags=["Analytics"])


<<<<<<< HEAD
def _safe_float(value, default: float = 0.0) -> float:
    """Convert any numeric BSON type (Decimal128, Int64, etc.) to a plain Python float."""
    if value is None:
        return default
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def _safe_int(value, default: int = 0) -> int:
    """Convert any numeric BSON type to a plain Python int."""
    if value is None:
        return default
    try:
        return int(value)
    except (TypeError, ValueError):
        return default
=======
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
        if value.tzinfo is not None:
            return value.astimezone(timezone.utc).replace(tzinfo=None)
        return value
    if isinstance(value, str):
        text = value.strip()
        if not text:
            return None
        if text.endswith("Z"):
            text = text[:-1] + "+00:00"
        try:
            parsed = datetime.fromisoformat(text)
            if parsed.tzinfo is not None:
                return parsed.astimezone(timezone.utc).replace(tzinfo=None)
            return parsed
        except ValueError:
            return None
    return None


def get_order_datetime(order: dict):
    return (
        parse_datetime(order.get("createdAt"))
        or parse_datetime(order.get("created_at"))
        or parse_datetime(order.get("orderDate"))
        or parse_datetime(order.get("date"))
    )


def get_order_total(order: dict) -> float:
    for key in ("total", "totalAmount", "grandTotal", "amount", "billTotal"):
        value = to_number(order.get(key), None)
        if value is not None:
            return value
    return 0.0


def normalize_status(value) -> str:
    return str(value or "").strip().lower()


def normalize_order_type(order: dict) -> str:
    raw = str(order.get("type") or order.get("orderType") or order.get("order_type") or "unknown").strip().lower()
    if raw in {"dinein", "dine-in", "dine_in"}:
        return "dine-in"
    if raw in {"pickup", "take away", "take-away"}:
        return "takeaway"
    return raw or "unknown"


def extract_items(order: dict):
    items = []
    raw_items = order.get("items") or []
    if not isinstance(raw_items, list):
        return items

    for raw in raw_items:
        if isinstance(raw, dict):
            quantity = int(to_number(raw.get("quantity") or raw.get("qty") or 1, 1))
            quantity = max(quantity, 1)
            name = str(raw.get("name") or raw.get("itemName") or raw.get("title") or "Item").strip() or "Item"
            price = to_number(raw.get("price") or raw.get("unitPrice") or raw.get("amount"), 0)
            category = str(raw.get("category") or raw.get("type") or "Other").strip() or "Other"
            items.append({"name": name, "quantity": quantity, "price": price, "category": category})
            continue

        if isinstance(raw, str):
            text = raw.strip()
            if not text:
                continue
            match = re.match(r"^(.*?)(?:\((\d+)\))?$", text)
            if match:
                name = (match.group(1) or "Item").strip() or "Item"
                quantity = int(match.group(2) or "1")
            else:
                name = text
                quantity = 1
            items.append({"name": name, "quantity": max(quantity, 1), "price": 0.0, "category": "Other"})

    return items
>>>>>>> 35fcda2 (report)


@router.get("")
async def get_analytics():
    """Get dashboard analytics"""
    db = get_db()

    all_orders = await db.orders.find({}).to_list(50000)

    # Total orders
<<<<<<< HEAD
    total_orders = _safe_int(await db.orders.count_documents({}))

    # Completed orders
    completed_orders = _safe_int(await db.orders.count_documents({"status": "completed"}))

    # Active orders (in progress)
    active_orders = _safe_int(await db.orders.count_documents({
        "status": {"$in": ["pending", "confirmed", "preparing", "ready", "placed"]}
    }))

    # Total revenue from completed orders
    revenue_pipeline = [
        {"$match": {"status": "completed"}},
        {"$group": {"_id": None, "total": {"$sum": "$total"}}}
    ]
    revenue_result = await db.orders.aggregate(revenue_pipeline).to_list(1)
    total_revenue = _safe_float(revenue_result[0]["total"] if revenue_result else 0)
=======
    total_orders = len(all_orders)

    completed_statuses = {"completed"}
    active_statuses = {"placed", "pending", "confirmed", "preparing", "ready", "in_progress"}

    # Completed orders
    completed_orders = sum(1 for order in all_orders if normalize_status(order.get("status")) in completed_statuses)

    # Active orders (in progress)
    active_orders = sum(1 for order in all_orders if normalize_status(order.get("status")) in active_statuses)

    # Total revenue from completed orders
    total_revenue = sum(get_order_total(order) for order in all_orders if normalize_status(order.get("status")) in completed_statuses)
>>>>>>> 35fcda2 (report)

    # Average order value
    avg_order_value = round(total_revenue / completed_orders, 2) if completed_orders > 0 else 0.0

<<<<<<< HEAD
    # Popular items with revenue (avgPrepTime defaulted to 0 — not tracked per-item)
    popular_pipeline = [
        {"$unwind": "$items"},
        {"$group": {
            "_id": "$items.name",
            "count": {"$sum": "$items.quantity"},
            "revenue": {"$sum": {"$multiply": [
                {"$ifNull": ["$items.price", 0]},
                {"$ifNull": ["$items.quantity", 1]}
            ]}}
        }},
        {"$sort": {"count": -1}},
        {"$limit": 10},
        {"$project": {"name": "$_id", "count": 1, "revenue": 1, "_id": 0}}
    ]
    raw_popular = await db.orders.aggregate(popular_pipeline).to_list(10)
    popular_items = [
        {
            "name": str(item.get("name", "")),
            "count": _safe_int(item.get("count", 0)),
            "revenue": round(_safe_float(item.get("revenue", 0)), 2),
            "avgPrepTime": 0,
        }
        for item in raw_popular
        if item.get("name")
    ]
=======
    # Popular items with revenue
    popular_map = {}
    for order in all_orders:
        for item in extract_items(order):
            key = item["name"]
            if key not in popular_map:
                popular_map[key] = {"name": key, "count": 0, "revenue": 0.0}
            popular_map[key]["count"] += item["quantity"]
            popular_map[key]["revenue"] += item["price"] * item["quantity"]

    popular_items = sorted(popular_map.values(), key=lambda item: item["count"], reverse=True)[:10]
>>>>>>> 35fcda2 (report)

    # Table occupancy
    total_tables = _safe_int(await db.tables.count_documents({}))
    occupied_tables = _safe_int(await db.tables.count_documents({"status": "occupied"}))
    table_occupancy = round((occupied_tables / total_tables * 100), 1) if total_tables > 0 else 0.0

    # Order type breakdown — field is "type" on orders
<<<<<<< HEAD
    order_type_pipeline = [
        {"$group": {"_id": "$type", "count": {"$sum": 1}}}
    ]
    order_type_result = await db.orders.aggregate(order_type_pipeline).to_list(10)
    order_types = {str(r["_id"]): _safe_int(r["count"]) for r in order_type_result if r["_id"]}

    # Category distribution — category is stored directly on order items
    category_pipeline = [
        {"$unwind": "$items"},
        {"$group": {
            "_id": {"$ifNull": ["$items.category", "Other"]},
            "count": {"$sum": {"$ifNull": ["$items.quantity", 1]}}
        }},
        {"$sort": {"count": -1}}
    ]
    category_result = await db.orders.aggregate(category_pipeline).to_list(20)
    categories = [
        {"name": str(r["_id"]), "value": _safe_int(r["count"])}
        for r in category_result if r["_id"]
    ]

    # Total customers
    total_customers = _safe_int(await db.customers.count_documents({}))

    # Staff counts
    total_staff = _safe_int(await db.staff.count_documents({"active": True}))
    on_duty_staff = _safe_int(await db.staff.count_documents({"active": True, "status": "on-duty"}))
    on_leave_staff = _safe_int(await db.staff.count_documents({"active": True, "status": "on-leave"}))
=======
    order_types = {}
    for order in all_orders:
        order_type = normalize_order_type(order)
        order_types[order_type] = order_types.get(order_type, 0) + 1

    # Category distribution — category is stored directly on order items
    category_map = {}
    for order in all_orders:
        for item in extract_items(order):
            category = item["category"] or "Other"
            category_map[category] = category_map.get(category, 0) + item["quantity"]
    categories = [{"name": name, "value": count} for name, count in sorted(category_map.items(), key=lambda row: row[1], reverse=True)]

    # Total customers
    total_customers = await db.customers.count_documents({})
    if total_customers == 0:
        customer_keys = set()
        for order in all_orders:
            key = (
                str(order.get("customerId") or "").strip()
                or str(order.get("customerPhone") or "").strip()
                or str(order.get("customerName") or "").strip().lower()
            )
            if key:
                customer_keys.add(key)
        total_customers = len(customer_keys)
>>>>>>> 35fcda2 (report)

    return {
        "success": True,
        "data": {
            "totalOrders": total_orders,
            "completedOrders": completed_orders,
            "totalRevenue": total_revenue,
            "avgOrderValue": avg_order_value,
            "popularItems": popular_items,
            "tableOccupancy": table_occupancy,
            "activeOrders": active_orders,
            "totalCustomers": total_customers,
            "orderTypes": order_types,
            "categoryDistribution": categories,
            "totalStaff": total_staff,
            "onDutyStaff": on_duty_staff,
            "onLeaveStaff": on_leave_staff,
        }
    }


@router.get("/daily")
async def get_daily_analytics(date: str = None):
    """Get analytics for a specific date"""
    db = get_db()
    
    if date:
        target_date = datetime.fromisoformat(date)
    else:
        target_date = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    
    next_day = target_date + timedelta(days=1)
    
    all_orders = await db.orders.find({}).to_list(50000)
    day_orders = []
    for order in all_orders:
        order_dt = get_order_datetime(order)
        if order_dt and target_date <= order_dt < next_day:
            day_orders.append(order)

    total_orders = len(day_orders)
    total_revenue = sum(get_order_total(order) for order in day_orders)
    completed_count = sum(1 for order in day_orders if normalize_status(order.get("status")) == "completed")

    hourly_buckets = {}
    for order in day_orders:
        order_dt = get_order_datetime(order)
        if not order_dt:
            continue
        hour_key = order_dt.hour
        if hour_key not in hourly_buckets:
            hourly_buckets[hour_key] = {"hour": hour_key, "orders": 0, "revenue": 0.0}
        hourly_buckets[hour_key]["orders"] += 1
        hourly_buckets[hour_key]["revenue"] += get_order_total(order)

    hourly_result = [hourly_buckets[hour] for hour in sorted(hourly_buckets.keys())]
    
    return {
        "date": target_date.isoformat()[:10],
<<<<<<< HEAD
        "orders": _safe_int(orders_result[0]["total"] if orders_result else 0),
        "revenue": _safe_float(orders_result[0]["revenue"] if orders_result else 0),
        "completed": _safe_int(orders_result[0]["completed"] if orders_result else 0),
        "hourly": [{"hour": _safe_int(h["_id"]), "orders": _safe_int(h["orders"]), "revenue": round(_safe_float(h["revenue"]), 2)} for h in hourly_result]
=======
        "orders": total_orders,
        "revenue": round(total_revenue, 2),
        "completed": completed_count,
        "hourly": [{"hour": h["hour"], "orders": h["orders"], "revenue": round(h["revenue"], 2)} for h in hourly_result]
>>>>>>> 35fcda2 (report)
    }


@router.get("/weekly")
async def get_weekly_analytics():
    """Get analytics for the past week"""
    db = get_db()

    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = today - timedelta(days=6)

    all_orders = await db.orders.find({}).to_list(50000)

    current_week_orders = []
    previous_week_orders = []
    prev_week_start = week_start - timedelta(days=7)
    for order in all_orders:
        order_dt = get_order_datetime(order)
        if not order_dt:
            continue
        if week_start <= order_dt < (today + timedelta(days=1)):
            current_week_orders.append(order)
        elif prev_week_start <= order_dt < week_start:
            previous_week_orders.append(order)

    daily_buckets = {}
    for offset in range(7):
        d = week_start + timedelta(days=offset)
        key = d.strftime("%Y-%m-%d")
        daily_buckets[key] = {"date": key, "orders": 0, "revenue": 0.0}

    for order in current_week_orders:
        order_dt = get_order_datetime(order)
        if not order_dt:
            continue
        key = order_dt.strftime("%Y-%m-%d")
        if key in daily_buckets:
            daily_buckets[key]["orders"] += 1
            daily_buckets[key]["revenue"] += get_order_total(order)

    daily_result = [
        {"date": row["date"], "orders": row["orders"], "revenue": round(row["revenue"], 2)}
        for row in [daily_buckets[k] for k in sorted(daily_buckets.keys())]
    ]
<<<<<<< HEAD
    prev_items = await db.orders.aggregate(prev_items_pipeline).to_list(100)
    prev_counts = {str(i["_id"]): _safe_int(i["count"]) for i in prev_items}
=======

    current_item_counts = {}
    current_item_revenue = {}
    for order in current_week_orders:
        for item in extract_items(order):
            name = item["name"]
            current_item_counts[name] = current_item_counts.get(name, 0) + item["quantity"]
            current_item_revenue[name] = current_item_revenue.get(name, 0.0) + (item["price"] * item["quantity"])

    prev_counts = {}
    for order in previous_week_orders:
        for item in extract_items(order):
            name = item["name"]
            prev_counts[name] = prev_counts.get(name, 0) + item["quantity"]

    top_items = sorted(current_item_counts.items(), key=lambda row: row[1], reverse=True)[:10]
>>>>>>> 35fcda2 (report)

    def trend(item_name, curr_count):
        prev = prev_counts.get(str(item_name), 0)
        if prev == 0:
            return 0
        return round(((curr_count - prev) / prev) * 100)

    return {
        "startDate": week_start.isoformat()[:10],
        "endDate": today.isoformat()[:10],
<<<<<<< HEAD
        "daily": [{"date": d["_id"], "orders": _safe_int(d["orders"]), "revenue": round(_safe_float(d["revenue"]), 2)} for d in daily_result],
        "topItems": [{
            "name": str(i["_id"]),
            "count": _safe_int(i["count"]),
            "revenue": round(_safe_float(i.get("revenue", 0)), 2),
            "trend": trend(i["_id"], _safe_int(i["count"]))
        } for i in top_items if i.get("_id")]
=======
        "daily": daily_result,
        "topItems": [{
            "name": name,
            "count": count,
            "revenue": round(current_item_revenue.get(name, 0.0), 2),
            "trend": trend(name, count)
        } for name, count in top_items]
>>>>>>> 35fcda2 (report)
    }


@router.get("/staff-performance")
async def get_staff_performance():
    """Get staff performance analytics derived from staff and performance logs"""
    db = get_db()

    # Get all staff (default include active unless explicitly false)
    staff_docs = await db.staff.find({}).to_list(1000)
    staff_list = [s for s in staff_docs if s.get("active", True) is not False]

    # Performance logs can be legacy fields (rating/ordersHandled/serviceTimeMins)
    # or metric/value records from staff module.
    perf_logs = await db.performance_logs.find({}).to_list(10000)
    perf_map = {}
    for log in perf_logs:
        sid = str(log.get("staffId") or "").strip()
        if not sid:
            continue
        if sid not in perf_map:
            perf_map[sid] = {
                "orders_total": 0,
                "ratings": [],
                "service_times": [],
            }

        metric = str(log.get("metric") or "").strip().lower()
        value = to_number(log.get("value"), None)

        if value is not None:
            if metric in {"orders", "orders_handled", "ordershandled"}:
                perf_map[sid]["orders_total"] += int(value)
            elif metric in {"rating", "customer_rating", "performance_rating"}:
                perf_map[sid]["ratings"].append(value)
            elif metric in {"service_time", "service_time_mins", "avg_service_time", "servicetimemins"}:
                perf_map[sid]["service_times"].append(value)

        legacy_orders = to_number(log.get("ordersHandled"), None)
        if legacy_orders is not None:
            perf_map[sid]["orders_total"] += int(legacy_orders)

        legacy_rating = to_number(log.get("rating"), None)
        if legacy_rating is not None:
            perf_map[sid]["ratings"].append(legacy_rating)

        legacy_service = to_number(log.get("serviceTimeMins"), None)
        if legacy_service is not None:
            perf_map[sid]["service_times"].append(legacy_service)

    attendance_docs = await db.attendance.find({}).to_list(10000)
    att_map = {}
    for row in attendance_docs:
        sid = str(row.get("staffId") or "").strip()
        if not sid:
            continue
        if sid not in att_map:
            att_map[sid] = {"total": 0, "present": 0}
        att_map[sid]["total"] += 1
        if normalize_status(row.get("status")) == "present":
            att_map[sid]["present"] += 1

    results = []
    for s in staff_list:
        sid = str(s["_id"])
<<<<<<< HEAD
        perf = perf_map.get(sid, {})
        att = att_map.get(sid, {})
        total_att = _safe_int(att.get("total", 0))
        present_att = _safe_int(att.get("present", 0))
        attendance_pct = f"{round((present_att / total_att) * 100)}%" if total_att > 0 else "N/A"
        raw_rating = perf.get("avg_rating")
        avg_rating = round(_safe_float(raw_rating), 1) if raw_rating is not None else None
        performance_score = min(100, round(avg_rating * 20)) if avg_rating is not None else None
        avg_service_mins = perf.get("avg_service_mins")
=======
        perf = perf_map.get(sid, {"orders_total": 0, "ratings": [], "service_times": []})
        att = att_map.get(sid, {"total": 0, "present": 0})
        total_att = att.get("total", 0)
        present_att = att.get("present", 0)
        attendance_pct = f"{round((present_att / total_att) * 100)}%" if total_att > 0 else "—"
        avg_rating = round(sum(perf["ratings"]) / len(perf["ratings"]), 1) if perf["ratings"] else None
        avg_service = round(sum(perf["service_times"]) / len(perf["service_times"])) if perf["service_times"] else None
        performance_score = min(100, round(avg_rating * 20)) if avg_rating else None
>>>>>>> 35fcda2 (report)
        results.append({
            "id": sid,
            "name": s.get("name", ""),
            "role": s.get("role", ""),
<<<<<<< HEAD
            "orders_handled": _safe_int(perf.get("total_orders", 0)),
            "avg_service_time": f"{round(_safe_float(avg_service_mins))} mins" if avg_service_mins else "N/A",
=======
            "orders_handled": perf["orders_total"],
            "avg_service_time": f"{avg_service} mins" if avg_service is not None else "—",
>>>>>>> 35fcda2 (report)
            "rating": avg_rating,
            "attendance": attendance_pct,
            "performance_score": performance_score,
        })

    results.sort(key=lambda x: x["orders_handled"], reverse=True)
    return results
