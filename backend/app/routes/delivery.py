"""
Delivery Management Routes
- Riders CRUD
- Delivery orders
- Assignment
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from datetime import datetime
from bson import ObjectId
from pydantic import BaseModel, Field
from ..db import get_db
from ..audit import log_audit

router = APIRouter(tags=["Delivery"])


def serialize_doc(doc):
    """Convert MongoDB document to JSON-serializable dict"""
    if doc is None:
        return None
    doc["_id"] = str(doc["_id"])
    return doc


# ---- Pydantic models ----
class RiderBase(BaseModel):
    name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    vehicle: Optional[str] = None
    status: Optional[str] = "Available"
    rating: Optional[float] = 5.0


class RiderCreate(RiderBase):
    pass


class RiderUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    vehicle: Optional[str] = None
    status: Optional[str] = None
    rating: Optional[float] = None
    totalDeliveries: Optional[int] = None


class DeliveryItem(BaseModel):
    name: str
    quantity: int = 1
    price: Optional[float] = 0.0
    notes: Optional[str] = None


class DeliveryOrderCreate(BaseModel):
    customerName: Optional[str] = None
    customerAddress: Optional[str] = None
    customerPhone: Optional[str] = None
    items: List[DeliveryItem] = Field(default_factory=list)
    total: Optional[float] = None
    tip: Optional[float] = 0.0
    riderId: Optional[str] = None
    deliveryZoneId: Optional[str] = None
    paymentMethod: Optional[str] = "cash"
    notes: Optional[str] = None
    deliveryStatus: Optional[str] = "cooking"



# ============ RIDERS ============

@router.get("/riders")
async def list_riders(status: Optional[str] = None):
    """Get all delivery riders"""
    db = get_db()
    query = {}
    
    if status and status != "all":
        query["status"] = status
    
    riders = await db.riders.find(query).sort("name", 1).to_list(100)
    return [serialize_doc(rider) for rider in riders]


@router.get("/riders/stats")
async def get_rider_stats():
    """Get rider statistics"""
    db = get_db()
    
    total = await db.riders.count_documents({})
    available = await db.riders.count_documents({"status": "Available"})
    on_delivery = await db.riders.count_documents({"status": "On Delivery"})
    offline = await db.riders.count_documents({"status": "Offline"})
    
    return {
        "total": total,
        "available": available,
        "onDelivery": on_delivery,
        "offline": offline,
    }


@router.get("/riders/{rider_id}")
async def get_rider(rider_id: str):
    """Get single rider"""
    db = get_db()
    rider = await db.riders.find_one({"_id": ObjectId(rider_id)})
    if not rider:
        raise HTTPException(status_code=404, detail="Rider not found")
    return serialize_doc(rider)


@router.post("/riders")
async def create_rider(data: RiderCreate):
    """Create new rider"""
    db = get_db()
    data_dict = data.dict(exclude_none=True)

    data_dict["createdAt"] = datetime.utcnow()
    data_dict["status"] = data_dict.get("status", "Available")
    data_dict["rating"] = data_dict.get("rating", 5.0)
    data_dict["totalDeliveries"] = data_dict.get("totalDeliveries", 0)

    result = await db.riders.insert_one(data_dict)
    created = await db.riders.find_one({"_id": result.inserted_id})

    await log_audit("create", "rider", str(result.inserted_id), {"name": data_dict.get("name")})

    return serialize_doc(created)


@router.put("/riders/{rider_id}")
async def update_rider(rider_id: str, data: RiderUpdate):
    """Update rider"""
    db = get_db()

    data_dict = data.dict(exclude_none=True)
    data_dict["updatedAt"] = datetime.utcnow()
    data_dict.pop("_id", None)

    result = await db.riders.update_one(
        {"_id": ObjectId(rider_id)},
        {"$set": data_dict}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Rider not found")

    updated = await db.riders.find_one({"_id": ObjectId(rider_id)})
    return serialize_doc(updated)


@router.patch("/riders/{rider_id}/status")
async def update_rider_status(rider_id: str, status: str):
    """Update rider status"""
    db = get_db()
    
    valid_statuses = ["Available", "On Delivery", "Offline"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status")
    
    result = await db.riders.update_one(
        {"_id": ObjectId(rider_id)},
        {"$set": {"status": status, "updatedAt": datetime.utcnow()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Rider not found")
    
    return {"success": True, "status": status}


@router.delete("/riders/{rider_id}")
async def delete_rider(rider_id: str):
    """Delete rider"""
    db = get_db()
    
    result = await db.riders.delete_one({"_id": ObjectId(rider_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Rider not found")
    
    return {"success": True}


# ============ DELIVERY ORDERS ============

@router.get("/orders")
async def list_delivery_orders(
    status: Optional[str] = None,
    rider_id: Optional[str] = None,
):
    """Get delivery orders"""
    db = get_db()
    query = {"type": "delivery"}
    
    if status and status != "all":
        query["deliveryStatus"] = status
    if rider_id:
        query["riderId"] = rider_id
    
    orders = await db.orders.find(query).sort("createdAt", -1).to_list(100)
    
    # Populate rider info
    for order in orders:
        if order.get("riderId"):
            rider = await db.riders.find_one({"_id": ObjectId(order["riderId"])})
            if rider:
                order["rider"] = serialize_doc(rider)
    
    return [serialize_doc(order) for order in orders]


@router.get("/orders/{order_id}")
async def get_delivery_order(order_id: str):
    """Get single delivery order"""
    db = get_db()
    order = await db.orders.find_one({"_id": ObjectId(order_id), "type": "delivery"})
    if not order:
        raise HTTPException(status_code=404, detail="Delivery order not found")
    # Populate rider info if present
    if order.get("riderId"):
        try:
            rider = await db.riders.find_one({"_id": ObjectId(order["riderId"])})
            if rider:
                order["rider"] = serialize_doc(rider)
        except Exception:
            pass
    return serialize_doc(order)


@router.post("/orders")
async def create_delivery_order(data: DeliveryOrderCreate):
    """Create a delivery order (wrapper around orders collection)

    Ensures `type` is set to 'delivery' and sets defaults for delivery-specific fields.
    """
    db = get_db()
    data_dict = data.dict(exclude_none=True)

    # Basic order defaults
    data_dict["type"] = "delivery"
    data_dict["createdAt"] = datetime.utcnow()
    data_dict["status"] = data_dict.get("status", "pending")
    data_dict["deliveryStatus"] = data_dict.get("deliveryStatus", "cooking")

    # Compute total if not provided
    if data_dict.get("total") is None and data_dict.get("items"):
        try:
            data_dict["total"] = sum([(it.get("price", 0) or 0) * (it.get("quantity", 1) or 1) for it in data_dict.get("items", [])])
        except Exception:
            pass

    # Generate a simple order number
    try:
        count = await db.orders.count_documents({})
        data_dict["orderNumber"] = f"#ORD-{count + 1001}"
    except Exception:
        data_dict["orderNumber"] = data_dict.get("orderNumber") or "#ORD-UNKNOWN"

    result = await db.orders.insert_one(data_dict)
    created = await db.orders.find_one({"_id": result.inserted_id})

    await log_audit("create", "delivery_order", str(result.inserted_id), {"orderNumber": data_dict.get("orderNumber")})

    return serialize_doc(created)


@router.get("/orders/stats")
async def get_delivery_stats():
    """Get delivery statistics"""
    db = get_db()
    
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    
    cooking = await db.orders.count_documents({"type": "delivery", "deliveryStatus": "cooking"})
    ready = await db.orders.count_documents({"type": "delivery", "deliveryStatus": "ready"})
    on_way = await db.orders.count_documents({"type": "delivery", "deliveryStatus": "on_the_way"})
    delivered_today = await db.orders.count_documents({
        "type": "delivery",
        "deliveryStatus": "delivered",
        "deliveredAt": {"$gte": today}
    })
    
    # Average delivery time
    avg_pipeline = [
        {"$match": {"type": "delivery", "deliveryStatus": "delivered", "deliveryTime": {"$exists": True}}},
        {"$group": {"_id": None, "avg": {"$avg": "$deliveryTime"}}}
    ]
    avg_result = await db.orders.aggregate(avg_pipeline).to_list(1)
    avg_time = round(avg_result[0]["avg"], 1) if avg_result else 0
    
    return {
        "cooking": cooking,
        "ready": ready,
        "onTheWay": on_way,
        "deliveredToday": delivered_today,
        "avgDeliveryTime": avg_time,
    }


@router.patch("/orders/{order_id}/assign")
async def assign_rider(order_id: str, rider_id: str):
    """Assign rider to order"""
    db = get_db()
    
    # Check rider exists and is available
    rider = await db.riders.find_one({"_id": ObjectId(rider_id)})
    if not rider:
        raise HTTPException(status_code=404, detail="Rider not found")
    
    if rider.get("status") != "Available":
        raise HTTPException(status_code=400, detail="Rider is not available")
    
    # Update order
    result = await db.orders.update_one(
        {"_id": ObjectId(order_id)},
        {"$set": {
            "riderId": rider_id,
            "deliveryStatus": "on_the_way",
            "assignedAt": datetime.utcnow()
        }}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Update rider status
    await db.riders.update_one(
        {"_id": ObjectId(rider_id)},
        {"$set": {"status": "On Delivery", "currentOrderId": order_id}}
    )
    
    await log_audit("assign", "delivery", order_id, {"riderId": rider_id})
    
    return {"success": True}


@router.patch("/orders/{order_id}/status")
async def update_delivery_status(order_id: str, status: str):
    """Update delivery order status"""
    db = get_db()
    
    valid_statuses = ["cooking", "ready", "on_the_way", "delivered"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status")
    
    update_data = {"deliveryStatus": status, "updatedAt": datetime.utcnow()}
    
    if status == "delivered":
        update_data["deliveredAt"] = datetime.utcnow()
        update_data["status"] = "completed"
        
        # Free up the rider
        order = await db.orders.find_one({"_id": ObjectId(order_id)})
        if order and order.get("riderId"):
            await db.riders.update_one(
                {"_id": ObjectId(order["riderId"])},
                {"$set": {"status": "Available", "currentOrderId": None},
                 "$inc": {"totalDeliveries": 1}}
            )
    
    result = await db.orders.update_one(
        {"_id": ObjectId(order_id)},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    
    await log_audit("delivery_status", "order", order_id, {"status": status})
    
    return {"success": True, "status": status}


# ============ DELIVERY ZONES ============

@router.get("/zones")
async def list_delivery_zones():
    """Get delivery zones"""
    db = get_db()
    zones = await db.delivery_zones.find().to_list(50)
    return [serialize_doc(zone) for zone in zones]


@router.post("/zones")
async def create_delivery_zone(data: dict):
    """Create delivery zone"""
    db = get_db()
    
    data["createdAt"] = datetime.utcnow()
    
    result = await db.delivery_zones.insert_one(data)
    created = await db.delivery_zones.find_one({"_id": result.inserted_id})
    
    return serialize_doc(created)


@router.put("/zones/{zone_id}")
async def update_delivery_zone(zone_id: str, data: dict):
    """Update delivery zone"""
    db = get_db()
    
    data["updatedAt"] = datetime.utcnow()
    data.pop("_id", None)
    
    result = await db.delivery_zones.update_one(
        {"_id": ObjectId(zone_id)},
        {"$set": data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Zone not found")
    
    updated = await db.delivery_zones.find_one({"_id": ObjectId(zone_id)})
    return serialize_doc(updated)


@router.delete("/zones/{zone_id}")
async def delete_delivery_zone(zone_id: str):
    """Delete delivery zone"""
    db = get_db()
    
    result = await db.delivery_zones.delete_one({"_id": ObjectId(zone_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Zone not found")
    
    return {"success": True}
