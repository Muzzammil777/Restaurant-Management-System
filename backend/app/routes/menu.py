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

@router.get("/debug")
async def debug_database():
    """Debug endpoint to check database contents"""
    try:
        db = get_db()
        collections = await db.list_collection_names()
        print(f"Available collections: {collections}")
        
        result = {"collections": collections}
        
        # Check menu collection
        if "menu" in collections:
            count = await db.menu.count_documents({})
            result["menu_count"] = count
            if count > 0:
                sample = await db.menu.find_one()
                result["menu_sample"] = serialize_doc(sample)
        
        # Check combo_meals collection  
        if "combo_meals" in collections:
            count = await db.combo_meals.count_documents({})
            result["combo_meals_count"] = count
            if count > 0:
                sample = await db.combo_meals.find_one()
                result["combo_meals_sample"] = serialize_doc(sample)
                
        return result
    except Exception as e:
        return {"error": str(e)}


@router.get("")
async def list_menu_items(
    category: Optional[str] = None,
    available: Optional[bool] = None,
    dietType: Optional[str] = None,
    search: Optional[str] = None,
):
    """Get all menu items with optional filters"""
    try:
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
        
        print(f"Querying menu with query: {query}")
        items = await db.menu.find(query).sort("name", 1).to_list(1000)
        print(f"Found {len(items)} items in menu collection")
        
        if len(items) == 0:
            print("No items found in menu collection, checking available collections...")
            collections = await db.list_collection_names()
            print(f"Available collections: {collections}")
        
        return [serialize_doc(item) for item in items]
    except RuntimeError as e:
        if "Database not initialized" in str(e):
            print("Database not available, using fallback mock data")
            return get_fallback_menu_items()
        else:
            raise
    except Exception as e:
        # Fallback mock data when database is not available
        print(f"Database error, using fallback data: {e}")
        return get_fallback_menu_items()


def get_fallback_menu_items():
    """Return fallback mock menu items"""
    return [
            {
                "id": "item1",
                "name": "Butter Chicken",
                "category": "main",
                "price": 320,
                "description": "Tender chicken in rich butter gravy with aromatic spices",
                "available": True,
                "preparationTime": 20,
                "image": "https://images.unsplash.com/photo-1603894589968-4a7213b5c4f9?w=300",
                "dietType": "non-veg"
            },
            {
                "id": "item2",
                "name": "Naan",
                "category": "bread", 
                "price": 40,
                "description": "Freshly baked Indian bread, soft and fluffy",
                "available": True,
                "preparationTime": 5,
                "image": "https://images.unsplash.com/photo-1586201375761-838650a760fd?w=300",
                "dietType": "veg"
            },
            {
                "id": "item3",
                "name": "Mango Lassi",
                "category": "beverage",
                "price": 100,
                "description": "Sweet yogurt drink with fresh mango pulp",
                "available": True,
                "preparationTime": 5,
                "image": "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=300",
                "dietType": "veg"
            },
            {
                "id": "item4",
                "name": "Paneer Tikka",
                "category": "main",
                "price": 280,
                "description": "Grilled cottage cheese marinated in spices",
                "available": True,
                "preparationTime": 15,
                "image": "https://images.unsplash.com/photo-1546548970-71785318a17b?w=300",
                "dietType": "veg"
            },
            {
                "id": "item5",
                "name": "Dal Makhani",
                "category": "main",
                "price": 220,
                "description": "Creamy black lentils simmered with butter and spices",
                "available": True,
                "preparationTime": 25,
                "image": "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=300",
                "dietType": "veg"
            },
            {
                "id": "item6",
                "name": "Chicken Biryani",
                "category": "main",
                "price": 350,
                "description": "Fragrant basmati rice with spiced chicken",
                "available": True,
                "preparationTime": 30,
                "image": "https://images.unsplash.com/photo-1563379252889-834d8a2a705a?w=300",
                "dietType": "non-veg"
            }
        ]


@router.get("/stats")
async def get_menu_stats():
    """Get menu statistics"""
    db = get_db()
    
    total = await db.menu.count_documents({})
    available = await db.menu.count_documents({"available": True})
    veg = await db.menu.count_documents({"dietType": "veg"})
    nonveg = await db.menu.count_documents({"dietType": "non-veg"})
    
    # Get category counts
    categories = await db.menu.aggregate([
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
    categories = await db.menu.distinct("category")
    return categories


@router.get("/{item_id}")
async def get_menu_item(item_id: str):
    """Get single menu item"""
    db = get_db()
    item = await db.menu.find_one({"_id": ObjectId(item_id)})
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
    
    result = await db.menu.insert_one(data)
    created = await db.menu.find_one({"_id": result.inserted_id})
    
    await log_audit("create", "menu", str(result.inserted_id), {"name": data.get("name")})
    
    return serialize_doc(created)


@router.put("/{item_id}")
async def update_menu_item(item_id: str, data: dict):
    """Update menu item"""
    db = get_db()
    
    data["updatedAt"] = datetime.utcnow()
    data.pop("_id", None)
    
    result = await db.menu.update_one(
        {"_id": ObjectId(item_id)},
        {"$set": data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Menu item not found")
    
    updated = await db.menu.find_one({"_id": ObjectId(item_id)})
    await log_audit("update", "menu", item_id, {"name": data.get("name")})
    
    return serialize_doc(updated)


@router.delete("/{item_id}")
async def delete_menu_item(item_id: str):
    """Delete menu item"""
    db = get_db()
    
    item = await db.menu.find_one({"_id": ObjectId(item_id)})
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    
    await db.menu.delete_one({"_id": ObjectId(item_id)})
    await log_audit("delete", "menu", item_id, {"name": item.get("name")})
    
    return {"success": True}


@router.patch("/{item_id}/availability")
async def toggle_availability(item_id: str, available: bool):
    """Toggle menu item availability"""
    db = get_db()
    
    result = await db.menu.update_one(
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
    try:
        db = get_db()
        combos = await db.combo_meals.find().sort("name", 1).to_list(100)
        return [serialize_doc(combo) for combo in combos]
    except Exception as e:
        # Fallback mock data when database is not available
        print(f"Database error, using fallback data: {e}")
        return [
            {
                "id": "combo1",
                "name": "Family Feast",
                "description": "Complete meal for 4 people with butter chicken, naan, and lassi",
                "items": ["item1", "item2"],
                "originalPrice": 800,
                "discountedPrice": 699,
                "available": True,
                "image": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300",
                "createdAt": "2026-02-17T00:00:00Z"
            },
            {
                "id": "combo2", 
                "name": "Quick Lunch",
                "description": "Perfect lunch combo with butter chicken and mango lassi",
                "items": ["item1", "item3"],
                "originalPrice": 450,
                "discountedPrice": 399,
                "available": True,
                "image": "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=300",
                "createdAt": "2026-02-17T00:00:00Z"
            },
            {
                "id": "combo3",
                "name": "Vegetarian Delight",
                "description": "Pure vegetarian combo with paneer and naan",
                "items": ["item4", "item2"],
                "originalPrice": 550,
                "discountedPrice": 449,
                "available": True,
                "image": "https://images.unsplash.com/photo-1546548970-71785318a17b?w=300",
                "createdAt": "2026-02-17T00:00:00Z"
            }
        ]


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
