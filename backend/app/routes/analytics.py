"""
Analytics Routes
- Dashboard analytics
- Reports data
"""

from fastapi import APIRouter
from datetime import datetime, timedelta
from ..db import get_db

router = APIRouter(tags=["Analytics"])


@router.get("")
async def get_analytics():
    """Get dashboard analytics"""
    db = get_db()

    # Total orders
    total_orders = await db.orders.count_documents({})

    # Completed orders
    completed_orders = await db.orders.count_documents({"status": "completed"})

    # Active orders (in progress)
    active_orders = await db.orders.count_documents({
        "status": {"$in": ["pending", "confirmed", "preparing", "ready"]}
    })

    # Total revenue from completed orders
    revenue_pipeline = [
        {"$match": {"status": "completed"}},
        {"$group": {"_id": None, "total": {"$sum": "$total"}}}
    ]
    revenue_result = await db.orders.aggregate(revenue_pipeline).to_list(1)
    total_revenue = revenue_result[0]["total"] if revenue_result else 0

    # Average order value
    avg_order_value = total_revenue / completed_orders if completed_orders > 0 else 0

    # Popular items with revenue
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
    popular_items = await db.orders.aggregate(popular_pipeline).to_list(10)

    # Table occupancy
    total_tables = await db.tables.count_documents({})
    occupied_tables = await db.tables.count_documents({"status": "occupied"})
    table_occupancy = (occupied_tables / total_tables * 100) if total_tables > 0 else 0

    # Order type breakdown (dine-in vs takeaway vs delivery)
    order_type_pipeline = [
        {"$group": {"_id": "$orderType", "count": {"$sum": 1}}}
    ]
    order_type_result = await db.orders.aggregate(order_type_pipeline).to_list(10)
    order_types = {r["_id"]: r["count"] for r in order_type_result if r["_id"]}

    # Category distribution from menu items
    category_pipeline = [
        {"$unwind": "$items"},
        {"$lookup": {
            "from": "menu_items",
            "localField": "items.menuItemId",
            "foreignField": "_id",
            "as": "menuItem"
        }},
        {"$unwind": {"path": "$menuItem", "preserveNullAndEmptyArrays": True}},
        {"$group": {
            "_id": {"$ifNull": ["$menuItem.category", "Other"]},
            "count": {"$sum": {"$ifNull": ["$items.quantity", 1]}}
        }},
        {"$sort": {"count": -1}}
    ]
    category_result = await db.orders.aggregate(category_pipeline).to_list(20)
    categories = [{"name": r["_id"], "value": r["count"]} for r in category_result if r["_id"]]

    # Total customers
    total_customers = await db.customers.count_documents({})

    return {
        "success": True,
        "data": {
            "totalOrders": total_orders,
            "completedOrders": completed_orders,
            "totalRevenue": total_revenue,
            "avgOrderValue": round(avg_order_value, 2),
            "popularItems": popular_items,
            "tableOccupancy": round(table_occupancy, 1),
            "activeOrders": active_orders,
            "totalCustomers": total_customers,
            "orderTypes": order_types,
            "categoryDistribution": categories,
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
    
    # Orders for the day
    orders_pipeline = [
        {"$match": {"createdAt": {"$gte": target_date, "$lt": next_day}}},
        {"$group": {
            "_id": None,
            "total": {"$sum": 1},
            "revenue": {"$sum": "$total"},
            "completed": {"$sum": {"$cond": [{"$eq": ["$status", "completed"]}, 1, 0]}}
        }}
    ]
    orders_result = await db.orders.aggregate(orders_pipeline).to_list(1)
    
    # Hourly breakdown
    hourly_pipeline = [
        {"$match": {"createdAt": {"$gte": target_date, "$lt": next_day}}},
        {"$group": {
            "_id": {"$hour": "$createdAt"},
            "orders": {"$sum": 1},
            "revenue": {"$sum": "$total"}
        }},
        {"$sort": {"_id": 1}}
    ]
    hourly_result = await db.orders.aggregate(hourly_pipeline).to_list(24)
    
    return {
        "date": target_date.isoformat()[:10],
        "orders": orders_result[0]["total"] if orders_result else 0,
        "revenue": orders_result[0]["revenue"] if orders_result else 0,
        "completed": orders_result[0]["completed"] if orders_result else 0,
        "hourly": [{"hour": h["_id"], "orders": h["orders"], "revenue": h["revenue"]} for h in hourly_result]
    }


@router.get("/weekly")
async def get_weekly_analytics():
    """Get analytics for the past week"""
    db = get_db()

    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    week_ago = today - timedelta(days=7)

    # Daily breakdown for the week
    daily_pipeline = [
        {"$match": {"createdAt": {"$gte": week_ago}}},
        {"$group": {
            "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$createdAt"}},
            "orders": {"$sum": 1},
            "revenue": {"$sum": "$total"}
        }},
        {"$sort": {"_id": 1}}
    ]
    daily_result = await db.orders.aggregate(daily_pipeline).to_list(7)

    # Top items for the week with revenue
    top_items_pipeline = [
        {"$match": {"createdAt": {"$gte": week_ago}}},
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
        {"$limit": 10}
    ]
    top_items = await db.orders.aggregate(top_items_pipeline).to_list(10)

    # Previous week for trend calculation
    prev_week_start = week_ago - timedelta(days=7)
    prev_items_pipeline = [
        {"$match": {"createdAt": {"$gte": prev_week_start, "$lt": week_ago}}},
        {"$unwind": "$items"},
        {"$group": {
            "_id": "$items.name",
            "count": {"$sum": "$items.quantity"}
        }}
    ]
    prev_items = await db.orders.aggregate(prev_items_pipeline).to_list(100)
    prev_counts = {i["_id"]: i["count"] for i in prev_items}

    def trend(item_name, curr_count):
        prev = prev_counts.get(item_name, 0)
        if prev == 0:
            return 0
        return round(((curr_count - prev) / prev) * 100)

    return {
        "startDate": week_ago.isoformat()[:10],
        "endDate": today.isoformat()[:10],
        "daily": [{"date": d["_id"], "orders": d["orders"], "revenue": d["revenue"]} for d in daily_result],
        "topItems": [{
            "name": i["_id"],
            "count": i["count"],
            "revenue": round(i["revenue"], 2),
            "trend": trend(i["_id"], i["count"])
        } for i in top_items]
    }


@router.get("/staff-performance")
async def get_staff_performance():
    """Get staff performance analytics derived from staff and performance logs"""
    db = get_db()

    # Get all active staff
    staff_list = await db.staff.find({"active": True}).to_list(100)

    # Aggregate performance logs per staff
    perf_pipeline = [
        {"$group": {
            "_id": "$staffId",
            "avg_rating": {"$avg": "$rating"},
            "total_orders": {"$sum": {"$ifNull": ["$ordersHandled", 0]}},
            "avg_service_mins": {"$avg": "$serviceTimeMins"},
        }}
    ]
    perf_result = await db.performance_logs.aggregate(perf_pipeline).to_list(200)
    perf_map = {str(p["_id"]): p for p in perf_result}

    # Aggregate attendance records per staff
    attendance_pipeline = [
        {"$group": {
            "_id": "$staffId",
            "total": {"$sum": 1},
            "present": {"$sum": {"$cond": [{"$eq": ["$status", "present"]}, 1, 0]}}
        }}
    ]
    attendance_result = await db.attendance.aggregate(attendance_pipeline).to_list(200)
    att_map = {str(a["_id"]): a for a in attendance_result}

    results = []
    for s in staff_list:
        sid = str(s["_id"])
        perf = perf_map.get(sid, {})
        att = att_map.get(sid, {})
        total_att = att.get("total", 0)
        present_att = att.get("present", 0)
        attendance_pct = f"{round((present_att / total_att) * 100)}%" if total_att > 0 else "—"
        avg_rating = round(perf.get("avg_rating", 0), 1) if perf.get("avg_rating") else None
        performance_score = min(100, round(avg_rating * 20)) if avg_rating else None
        results.append({
            "id": sid,
            "name": s.get("name", ""),
            "role": s.get("role", ""),
            "orders_handled": perf.get("total_orders", 0),
            "avg_service_time": f"{round(perf.get('avg_service_mins', 0))} mins" if perf.get("avg_service_mins") else "—",
            "rating": avg_rating,
            "attendance": attendance_pct,
            "performance_score": performance_score,
        })

    results.sort(key=lambda x: x["orders_handled"], reverse=True)
    return results
