from motor.motor_asyncio import AsyncIOMotorClient
import os
from urllib.parse import quote_plus

_client = None
db = None

async def initialize_master_ingredients():
    """Initialize master list of ingredients if not exists"""
    global db
    if db is None:
        return
    
    # Complete master list of all hotel ingredients
    MASTER_INGREDIENTS = [
        # Grains & Flours
        {"name": "Rice", "category": "Grains", "stockLevel": 0, "unit": "kg", "minThreshold": 50, "costPerUnit": 80},
        {"name": "Wheat Flour", "category": "Grains", "stockLevel": 0, "unit": "kg", "minThreshold": 30, "costPerUnit": 35},
        {"name": "Maida", "category": "Grains", "stockLevel": 0, "unit": "kg", "minThreshold": 20, "costPerUnit": 45},
        
        # Basic Ingredients
        {"name": "Sugar", "category": "Pantry", "stockLevel": 0, "unit": "kg", "minThreshold": 15, "costPerUnit": 50},
        {"name": "Salt", "category": "Pantry", "stockLevel": 0, "unit": "kg", "minThreshold": 10, "costPerUnit": 20},
        
        # Oils & Fats
        {"name": "Cooking Oil", "category": "Oils", "stockLevel": 0, "unit": "L", "minThreshold": 25, "costPerUnit": 120},
        {"name": "Ghee", "category": "Oils", "stockLevel": 0, "unit": "L", "minThreshold": 10, "costPerUnit": 450},
        {"name": "Butter", "category": "Dairy", "stockLevel": 0, "unit": "kg", "minThreshold": 5, "costPerUnit": 350},
        {"name": "Coconut Oil", "category": "Oils", "stockLevel": 0, "unit": "L", "minThreshold": 8, "costPerUnit": 180},
        
        # Dairy
        {"name": "Milk", "category": "Dairy", "stockLevel": 0, "unit": "L", "minThreshold": 30, "costPerUnit": 60},
        {"name": "Curd", "category": "Dairy", "stockLevel": 0, "unit": "kg", "minThreshold": 10, "costPerUnit": 80},
        {"name": "Paneer", "category": "Dairy", "stockLevel": 0, "unit": "kg", "minThreshold": 8, "costPerUnit": 350},
        {"name": "Cheese", "category": "Dairy", "stockLevel": 0, "unit": "kg", "minThreshold": 5, "costPerUnit": 400},
        
        # Proteins
        {"name": "Eggs", "category": "Proteins", "stockLevel": 0, "unit": "units", "minThreshold": 50, "costPerUnit": 6},
        {"name": "Chicken", "category": "Proteins", "stockLevel": 0, "unit": "kg", "minThreshold": 30, "costPerUnit": 250},
        {"name": "Mutton", "category": "Proteins", "stockLevel": 0, "unit": "kg", "minThreshold": 20, "costPerUnit": 350},
        {"name": "Fish", "category": "Proteins", "stockLevel": 0, "unit": "kg", "minThreshold": 15, "costPerUnit": 300},
        {"name": "Prawns", "category": "Proteins", "stockLevel": 0, "unit": "kg", "minThreshold": 12, "costPerUnit": 400},
        
        # Vegetables - Main
        {"name": "Onions", "category": "Vegetables", "stockLevel": 0, "unit": "kg", "minThreshold": 40, "costPerUnit": 30},
        {"name": "Tomatoes", "category": "Vegetables", "stockLevel": 0, "unit": "kg", "minThreshold": 30, "costPerUnit": 40},
        {"name": "Potatoes", "category": "Vegetables", "stockLevel": 0, "unit": "kg", "minThreshold": 50, "costPerUnit": 25},
        
        # Vegetables - Aromatics
        {"name": "Ginger", "category": "Vegetables", "stockLevel": 0, "unit": "kg", "minThreshold": 5, "costPerUnit": 60},
        {"name": "Garlic", "category": "Vegetables", "stockLevel": 0, "unit": "kg", "minThreshold": 3, "costPerUnit": 80},
        {"name": "Green Chilli", "category": "Vegetables", "stockLevel": 0, "unit": "kg", "minThreshold": 2, "costPerUnit": 100},
        
        # Vegetables - Greens
        {"name": "Curry Leaves", "category": "Vegetables", "stockLevel": 0, "unit": "kg", "minThreshold": 1, "costPerUnit": 150},
        {"name": "Coriander Leaves", "category": "Vegetables", "stockLevel": 0, "unit": "kg", "minThreshold": 1, "costPerUnit": 120},
        {"name": "Mint Leaves", "category": "Vegetables", "stockLevel": 0, "unit": "kg", "minThreshold": 0.5, "costPerUnit": 130},
        {"name": "Spinach", "category": "Vegetables", "stockLevel": 0, "unit": "kg", "minThreshold": 5, "costPerUnit": 50},
        
        # Vegetables - Others
        {"name": "Capsicum", "category": "Vegetables", "stockLevel": 0, "unit": "kg", "minThreshold": 5, "costPerUnit": 70},
        {"name": "Carrot", "category": "Vegetables", "stockLevel": 0, "unit": "kg", "minThreshold": 10, "costPerUnit": 35},
        {"name": "Beans", "category": "Vegetables", "stockLevel": 0, "unit": "kg", "minThreshold": 5, "costPerUnit": 60},
        {"name": "Cabbage", "category": "Vegetables", "stockLevel": 0, "unit": "kg", "minThreshold": 8, "costPerUnit": 30},
        {"name": "Cauliflower", "category": "Vegetables", "stockLevel": 0, "unit": "kg", "minThreshold": 5, "costPerUnit": 50},
        {"name": "Brinjal", "category": "Vegetables", "stockLevel": 0, "unit": "kg", "minThreshold": 5, "costPerUnit": 45},
        {"name": "Mushroom", "category": "Vegetables", "stockLevel": 0, "unit": "kg", "minThreshold": 3, "costPerUnit": 120},
        
        # Citrus & Extras
        {"name": "Lemon", "category": "Vegetables", "stockLevel": 0, "unit": "kg", "minThreshold": 5, "costPerUnit": 80},
        {"name": "Tamarind", "category": "Pantry", "stockLevel": 0, "unit": "kg", "minThreshold": 2, "costPerUnit": 200},
        {"name": "Coconut", "category": "Pantry", "stockLevel": 0, "unit": "units", "minThreshold": 5, "costPerUnit": 40},
        
        # Nuts & Dry Fruits
        {"name": "Cashew", "category": "Dry Fruits", "stockLevel": 0, "unit": "kg", "minThreshold": 2, "costPerUnit": 600},
        {"name": "Raisins", "category": "Dry Fruits", "stockLevel": 0, "unit": "kg", "minThreshold": 1, "costPerUnit": 350},
        {"name": "Almonds", "category": "Dry Fruits", "stockLevel": 0, "unit": "kg", "minThreshold": 1, "costPerUnit": 800},
        
        # Spices - Whole
        {"name": "Pepper", "category": "Spices", "stockLevel": 0, "unit": "kg", "minThreshold": 0.5, "costPerUnit": 400},
        {"name": "Cumin", "category": "Spices", "stockLevel": 0, "unit": "kg", "minThreshold": 0.5, "costPerUnit": 350},
        {"name": "Fennel", "category": "Spices", "stockLevel": 0, "unit": "kg", "minThreshold": 0.5, "costPerUnit": 300},
        {"name": "Mustard Seeds", "category": "Spices", "stockLevel": 0, "unit": "kg", "minThreshold": 0.5, "costPerUnit": 250},
        {"name": "Cinnamon", "category": "Spices", "stockLevel": 0, "unit": "kg", "minThreshold": 0.3, "costPerUnit": 500},
        {"name": "Cloves", "category": "Spices", "stockLevel": 0, "unit": "kg", "minThreshold": 0.2, "costPerUnit": 800},
        {"name": "Cardamom", "category": "Spices", "stockLevel": 0, "unit": "kg", "minThreshold": 0.3, "costPerUnit": 1200},
        {"name": "Bay Leaf", "category": "Spices", "stockLevel": 0, "unit": "kg", "minThreshold": 0.2, "costPerUnit": 600},
        
        # Spices - Powders
        {"name": "Turmeric Powder", "category": "Spices", "stockLevel": 0, "unit": "kg", "minThreshold": 2, "costPerUnit": 150},
        {"name": "Chilli Powder", "category": "Spices", "stockLevel": 0, "unit": "kg", "minThreshold": 2, "costPerUnit": 200},
        {"name": "Coriander Powder", "category": "Spices", "stockLevel": 0, "unit": "kg", "minThreshold": 2, "costPerUnit": 180},
        {"name": "Garam Masala", "category": "Spices", "stockLevel": 0, "unit": "kg", "minThreshold": 1, "costPerUnit": 300},
        {"name": "Sambar Powder", "category": "Spices", "stockLevel": 0, "unit": "kg", "minThreshold": 1, "costPerUnit": 250},
        {"name": "Rasam Powder", "category": "Spices", "stockLevel": 0, "unit": "kg", "minThreshold": 1, "costPerUnit": 220},
        
        # Beverages
        {"name": "Tea Powder", "category": "Beverages", "stockLevel": 0, "unit": "kg", "minThreshold": 3, "costPerUnit": 400},
        {"name": "Coffee Powder", "category": "Beverages", "stockLevel": 0, "unit": "kg", "minThreshold": 2, "costPerUnit": 500},
        
        # Bakery Items
        {"name": "Bread", "category": "Bakery", "stockLevel": 0, "unit": "units", "minThreshold": 10, "costPerUnit": 40},
        {"name": "Yeast", "category": "Bakery", "stockLevel": 0, "unit": "kg", "minThreshold": 0.5, "costPerUnit": 1200},
        {"name": "Baking Powder", "category": "Bakery", "stockLevel": 0, "unit": "kg", "minThreshold": 1, "costPerUnit": 150},
        {"name": "Baking Soda", "category": "Bakery", "stockLevel": 0, "unit": "kg", "minThreshold": 1, "costPerUnit": 120},
        
        # Condiments & Sauces
        {"name": "Chocolate Syrup", "category": "Condiments", "stockLevel": 0, "unit": "L", "minThreshold": 2, "costPerUnit": 200},
        {"name": "Ice Cream", "category": "Condiments", "stockLevel": 0, "unit": "L", "minThreshold": 5, "costPerUnit": 250},
        {"name": "Mayonnaise", "category": "Condiments", "stockLevel": 0, "unit": "kg", "minThreshold": 2, "costPerUnit": 180},
        {"name": "Ketchup", "category": "Condiments", "stockLevel": 0, "unit": "L", "minThreshold": 2, "costPerUnit": 120},
        {"name": "Soy Sauce", "category": "Condiments", "stockLevel": 0, "unit": "L", "minThreshold": 2, "costPerUnit": 200},
        {"name": "Vinegar", "category": "Condiments", "stockLevel": 0, "unit": "L", "minThreshold": 2, "costPerUnit": 80},
    ]
    
    # Insert only if ingredient doesn't exist (by name)
    for ingredient in MASTER_INGREDIENTS:
        existing = await db.ingredients.find_one({"name": ingredient["name"]})
        if not existing:
            from datetime import datetime
            ingredient["createdAt"] = datetime.utcnow()
            ingredient["status"] = "Healthy"  # Default status for 0 stock
            await db.ingredients.insert_one(ingredient)

def init_db(uri: str = None):
    global _client, db
    if _client is not None:
        return db
    if uri is None:
        uri = os.getenv('MONGODB_URI')
    if not uri:
        raise RuntimeError('MONGODB_URI must be set')
    _client = AsyncIOMotorClient(uri)
    # Try to get database from URI, fallback to 'rms'
    default_db = _client.get_default_database()
    if default_db is not None:
        db = default_db
    else:
        db = _client['rms']
    return db


def get_db():
    """Get the database instance"""
    global db
    if db is None:
        raise RuntimeError('Database not initialized. Call init_db() first.')
    return db
