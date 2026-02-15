"""
Order Management Routes
- CRUD for orders
- Order status updates
- Order statistics
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from datetime import datetime, timedelta
from bson import ObjectId
from ..db import get_db
from ..audit import log_audit

router = APIRouter(tags=["Orders"])


def serialize_doc(doc):
    """Convert MongoDB document to JSON-serializable dict"""
    if doc is None:
        return None
    doc["_id"] = str(doc["_id"])
    return doc


# ============ ORDERS ============

@router.get("")
async def list_orders(
    status: Optional[str] = None,
    type: Optional[str] = None,
    table: Optional[int] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    limit: int = Query(100, le=500),
    skip: int = 0,
):
    """Get all orders with optional filters"""
    db = get_db()
    query = {}
    
    if status and status != "all":
        query["status"] = status
    if type and type != "all":
        query["type"] = type
    if table:
        query["tableNumber"] = table
    if date_from:
        query["createdAt"] = {"$gte": datetime.fromisoformat(date_from)}
    if date_to:
        if "createdAt" in query:
            query["createdAt"]["$lte"] = datetime.fromisoformat(date_to)
        else:
            query["createdAt"] = {"$lte": datetime.fromisoformat(date_to)}
    
    orders = await db.orders.find(query).sort("createdAt", -1).skip(skip).limit(limit).to_list(limit)
    total = await db.orders.count_documents(query)
    
    return {"data": [serialize_doc(order) for order in orders], "total": total}


@router.get("/stats")
async def get_order_stats():
    """Get order statistics"""
    db = get_db()
    
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    
    total_today = await db.orders.count_documents({"createdAt": {"$gte": today}})
    pending = await db.orders.count_documents({"status": {"$in": ["placed", "preparing"]}})
    ready = await db.orders.count_documents({"status": "ready"})
    completed_today = await db.orders.count_documents({
        "status": "completed",
        "createdAt": {"$gte": today}
    })
    
    # Revenue today
    revenue_pipeline = [
        {"$match": {"createdAt": {"$gte": today}, "status": {"$ne": "cancelled"}}},
        {"$group": {"_id": None, "total": {"$sum": "$total"}}}
    ]
    revenue_result = await db.orders.aggregate(revenue_pipeline).to_list(1)
    revenue_today = revenue_result[0]["total"] if revenue_result else 0
    
    # Orders by type
    type_pipeline = [
        {"$match": {"createdAt": {"$gte": today}}},
        {"$group": {"_id": "$type", "count": {"$sum": 1}}}
    ]
    type_result = await db.orders.aggregate(type_pipeline).to_list(10)
    by_type = {t["_id"]: t["count"] for t in type_result if t["_id"]}
    
    return {
        "totalToday": total_today,
        "pending": pending,
        "ready": ready,
        "completedToday": completed_today,
        "revenueToday": revenue_today,
        "byType": by_type,
    }


@router.get("/{order_id}")
async def get_order(order_id: str):
    """Get single order"""
    db = get_db()
    order = await db.orders.find_one({"_id": ObjectId(order_id)})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return serialize_doc(order)


@router.post("")
async def create_order(data: dict):
    """Create new order"""
    db = get_db()
    
    # Generate order number
    count = await db.orders.count_documents({})
    data["orderNumber"] = f"#ORD-{count + 1001}"
    data["createdAt"] = datetime.utcnow()
    data["status"] = data.get("status", "placed")
    data["statusUpdatedAt"] = datetime.utcnow()
    
    result = await db.orders.insert_one(data)
    created = await db.orders.find_one({"_id": result.inserted_id})
    
    await log_audit("create", "order", str(result.inserted_id), {
        "orderNumber": data["orderNumber"],
        "total": data.get("total")
    })
    
    return serialize_doc(created)


@router.put("/{order_id}")
async def update_order(order_id: str, data: dict):
    """Update order"""
    db = get_db()
    
    data["updatedAt"] = datetime.utcnow()
    data.pop("_id", None)
    
    result = await db.orders.update_one(
        {"_id": ObjectId(order_id)},
        {"$set": data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    
    updated = await db.orders.find_one({"_id": ObjectId(order_id)})
    await log_audit("update", "order", order_id)
    
    return serialize_doc(updated)


@router.patch("/{order_id}/status")
async def update_order_status(order_id: str, status: str):
    """Update order status"""
    db = get_db()
    
    valid_statuses = ["placed", "preparing", "ready", "served", "completed", "cancelled"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    
    result = await db.orders.update_one(
        {"_id": ObjectId(order_id)},
        {"$set": {"status": status, "statusUpdatedAt": datetime.utcnow()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    
    await log_audit("status_update", "order", order_id, {"newStatus": status})
    
    return {"success": True, "status": status}


@router.delete("/{order_id}")
async def delete_order(order_id: str):
    """Delete order (soft delete - mark as cancelled)"""
    db = get_db()
    
    # Get order details before cancelling
    order = await db.orders.find_one({"_id": ObjectId(order_id)})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    result = await db.orders.update_one(
        {"_id": ObjectId(order_id)},
        {"$set": {"status": "cancelled", "cancelledAt": datetime.utcnow()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Create notification for cancelled order
    order_number = order.get("orderNumber", "N/A")
    table_number = order.get("tableNumber", "N/A")
    total = order.get("total", 0)
    
    await db.notifications.insert_one({
        "type": "order-cancelled",
        "title": f"Order {order_number} Cancelled",
        "message": f"Table {table_number} - Order cancelled (₹{total:.2f})",
        "recipient": "Admin",
        "channel": "system",
        "status": "unread",
        "created_at": datetime.utcnow(),
    })
    
    await log_audit("cancel", "order", order_id)
    
    return {"success": True}


# ============ KITCHEN DISPLAY ============

@router.get("/kitchen/queue")
async def get_kitchen_queue():
    """Get orders for kitchen display"""
    db = get_db()
    
    orders = await db.orders.find({
        "status": {"$in": ["placed", "preparing", "ready"]}
    }).sort("createdAt", 1).to_list(50)
    
    return [serialize_doc(order) for order in orders]


@router.patch("/{order_id}/item-status")
async def update_item_status(order_id: str, item_index: int, status: str):
    """Update individual item status in order"""
    db = get_db()
    
    result = await db.orders.update_one(
        {"_id": ObjectId(order_id)},
        {"$set": {f"items.{item_index}.status": status}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return {"success": True}
