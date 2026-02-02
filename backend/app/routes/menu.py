"""
Menu Management Routes
- CRUD for menu items
- Categories management
- Combo meals
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from datetime import datetime
from bson import ObjectId
from ..db import get_db
from ..audit import log_audit

router = APIRouter(tags=["Menu"])


def serialize_doc(doc):
    """Convert MongoDB document to JSON-serializable dict"""
    if doc is None:
        return None
    doc["_id"] = str(doc["_id"])
    return doc


# ============ MENU ITEMS ============

@router.get("")
async def list_menu_items(
    category: Optional[str] = None,
    available: Optional[bool] = None,
    dietType: Optional[str] = None,
    search: Optional[str] = None,
):
    """Get all menu items with optional filters"""
    db = get_db()
    query = {}
    
    if category and category != "all":
        query["category"] = category
    if available is not None:
        query["available"] = available
    if dietType and dietType != "all":
        query["dietType"] = dietType
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
        ]
    
    items = await db.menu_items.find(query).sort("name", 1).to_list(1000)
    return [serialize_doc(item) for item in items]


@router.get("/stats")
async def get_menu_stats():
    """Get menu statistics"""
    db = get_db()
    
    total = await db.menu_items.count_documents({})
    available = await db.menu_items.count_documents({"available": True})
    veg = await db.menu_items.count_documents({"dietType": "veg"})
    nonveg = await db.menu_items.count_documents({"dietType": "non-veg"})
    
    # Get category counts
    categories = await db.menu_items.aggregate([
        {"$group": {"_id": "$category", "count": {"$sum": 1}}}
    ]).to_list(100)
    
    return {
        "total": total,
        "available": available,
        "unavailable": total - available,
        "veg": veg,
        "nonVeg": nonveg,
        "categories": {cat["_id"]: cat["count"] for cat in categories if cat["_id"]},
    }


@router.get("/categories")
async def get_categories():
    """Get all unique categories"""
    db = get_db()
    categories = await db.menu_items.distinct("category")
    return categories


@router.get("/{item_id}")
async def get_menu_item(item_id: str):
    """Get single menu item"""
    db = get_db()
    item = await db.menu_items.find_one({"_id": ObjectId(item_id)})
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    return serialize_doc(item)


@router.post("")
async def create_menu_item(data: dict):
    """Create new menu item"""
    db = get_db()
    
    data["createdAt"] = datetime.utcnow()
    data["updatedAt"] = datetime.utcnow()
    data["available"] = data.get("available", True)
    
    result = await db.menu_items.insert_one(data)
    created = await db.menu_items.find_one({"_id": result.inserted_id})
    
    await log_audit("create", "menu", str(result.inserted_id), {"name": data.get("name")})
    
    return serialize_doc(created)


@router.put("/{item_id}")
async def update_menu_item(item_id: str, data: dict):
    """Update menu item"""
    db = get_db()
    
    data["updatedAt"] = datetime.utcnow()
    data.pop("_id", None)
    
    result = await db.menu_items.update_one(
        {"_id": ObjectId(item_id)},
        {"$set": data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Menu item not found")
    
    updated = await db.menu_items.find_one({"_id": ObjectId(item_id)})
    await log_audit("update", "menu", item_id, {"name": data.get("name")})
    
    return serialize_doc(updated)


@router.delete("/{item_id}")
async def delete_menu_item(item_id: str):
    """Delete menu item"""
    db = get_db()
    
    item = await db.menu_items.find_one({"_id": ObjectId(item_id)})
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    
    await db.menu_items.delete_one({"_id": ObjectId(item_id)})
    await log_audit("delete", "menu", item_id, {"name": item.get("name")})
    
    return {"success": True}


@router.patch("/{item_id}/availability")
async def toggle_availability(item_id: str, available: bool):
    """Toggle menu item availability"""
    db = get_db()
    
    result = await db.menu_items.update_one(
        {"_id": ObjectId(item_id)},
        {"$set": {"available": available, "updatedAt": datetime.utcnow()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Menu item not found")
    
    return {"success": True, "available": available}


# ============ COMBO MEALS ============

@router.get("/combos/all")
async def list_combos():
    """Get all combo meals"""
    db = get_db()
    combos = await db.combo_meals.find().sort("name", 1).to_list(100)
    return [serialize_doc(combo) for combo in combos]


@router.post("/combos")
async def create_combo(data: dict):
    """Create combo meal"""
    db = get_db()
    
    data["createdAt"] = datetime.utcnow()
    data["available"] = data.get("available", True)
    
    result = await db.combo_meals.insert_one(data)
    created = await db.combo_meals.find_one({"_id": result.inserted_id})
    
    await log_audit("create", "combo", str(result.inserted_id), {"name": data.get("name")})
    
    return serialize_doc(created)


@router.put("/combos/{combo_id}")
async def update_combo(combo_id: str, data: dict):
    """Update combo meal"""
    db = get_db()
    
    data["updatedAt"] = datetime.utcnow()
    data.pop("_id", None)
    
    result = await db.combo_meals.update_one(
        {"_id": ObjectId(combo_id)},
        {"$set": data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Combo not found")
    
    updated = await db.combo_meals.find_one({"_id": ObjectId(combo_id)})
    return serialize_doc(updated)


@router.delete("/combos/{combo_id}")
async def delete_combo(combo_id: str):
    """Delete combo meal"""
    db = get_db()
    
    result = await db.combo_meals.delete_one({"_id": ObjectId(combo_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Combo not found")
    
    return {"success": True}
