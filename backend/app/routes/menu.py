"""
Menu Management Routes
- CRUD for menu items
- Categories management
- Combo meals
"""

from fastapi import APIRouter, HTTPException
from typing import Optional
from datetime import datetime
from bson import ObjectId
from bson.errors import InvalidId

from ..db import get_db
from ..audit import log_audit
from ..schemas import MenuItemIn, MenuItemUpdate

router = APIRouter(tags=["Menu"])


# ================= UTIL =================

def serialize_doc(doc):
    if not doc:
        return None
    doc["_id"] = str(doc["_id"])
    doc["id"] = doc["_id"]  # Add id field for frontend compatibility
    return doc


def validate_object_id(id: str):
    try:
        return ObjectId(id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid ID format")


# ================= MENU ITEMS =================

@router.get("/")
async def list_menu_items(
    category: Optional[str] = None,
    available: Optional[bool] = None,
    dietType: Optional[str] = None,
    search: Optional[str] = None,
):
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


@router.get("/combos")
async def list_combos():
    db = get_db()
    combos = await db.combo_meals.find().sort("name", 1).to_list(100)
    return [serialize_doc(combo) for combo in combos]


@router.post("/combos")
async def create_combo(data: dict):
    db = get_db()

    now = datetime.utcnow()
    data["createdAt"] = now
    data["updatedAt"] = now
    data["available"] = data.get("available", True)

    result = await db.combo_meals.insert_one(data)
    created = await db.combo_meals.find_one({"_id": result.inserted_id})

    await log_audit("create", "combo", str(result.inserted_id), {
        "name": data.get("name")
    })

    return serialize_doc(created)


@router.put("/combos/{combo_id}")
async def update_combo(combo_id: str, data: dict):
    db = get_db()
    obj_id = validate_object_id(combo_id)

    data["updatedAt"] = datetime.utcnow()
    data.pop("_id", None)

    result = await db.combo_meals.update_one(
        {"_id": obj_id},
        {"$set": data}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Combo not found")

    updated = await db.combo_meals.find_one({"_id": obj_id})
    return serialize_doc(updated)


@router.delete("/combos/{combo_id}")
async def delete_combo(combo_id: str):
    db = get_db()
    obj_id = validate_object_id(combo_id)

    result = await db.combo_meals.delete_one({"_id": obj_id})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Combo not found")

    return {"success": True}


@router.patch("/combos/{combo_id}/availability")
async def toggle_combo_availability(combo_id: str, available: bool):
    db = get_db()
    obj_id = validate_object_id(combo_id)

    result = await db.combo_meals.update_one(
        {"_id": obj_id},
        {"$set": {
            "available": available,
            "updatedAt": datetime.utcnow()
        }}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Combo not found")

    return {"success": True, "available": available}


@router.get("/{item_id}")
async def get_menu_item(item_id: str):
    db = get_db()
    obj_id = validate_object_id(item_id)

    item = await db.menu_items.find_one({"_id": obj_id})
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")

    return serialize_doc(item)


@router.post("/")
async def create_menu_item(data: MenuItemIn):
    db = get_db()

    menu_data = data.dict()
    now = datetime.utcnow()
    menu_data["createdAt"] = now
    menu_data["updatedAt"] = now

    result = await db.menu_items.insert_one(menu_data)
    created = await db.menu_items.find_one({"_id": result.inserted_id})

    await log_audit("create", "menu", str(result.inserted_id), {
        "name": menu_data.get("name")
    })

    return serialize_doc(created)


@router.put("/{item_id}")
async def update_menu_item(item_id: str, data: MenuItemUpdate):
    db = get_db()
    obj_id = validate_object_id(item_id)

    update_data = data.dict(exclude_unset=True)
    update_data["updatedAt"] = datetime.utcnow()

    result = await db.menu_items.update_one(
        {"_id": obj_id},
        {"$set": update_data}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Menu item not found")

    updated = await db.menu_items.find_one({"_id": obj_id})

    await log_audit("update", "menu", item_id, {
        "name": update_data.get("name")
    })

    return serialize_doc(updated)


@router.delete("/{item_id}")
async def delete_menu_item(item_id: str):
    db = get_db()
    obj_id = validate_object_id(item_id)

    item = await db.menu_items.find_one({"_id": obj_id})
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")

    await db.menu_items.delete_one({"_id": obj_id})

    await log_audit("delete", "menu", item_id, {
        "name": item.get("name")
    })

    return {"success": True}


@router.patch("/{item_id}/availability")
async def toggle_availability(item_id: str, available: bool):
    db = get_db()
    obj_id = validate_object_id(item_id)

    result = await db.menu_items.update_one(
        {"_id": obj_id},
        {"$set": {
            "available": available,
            "updatedAt": datetime.utcnow()
        }}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Menu item not found")

    return {"success": True, "available": available}