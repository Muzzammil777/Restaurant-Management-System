"""
Database Seeder Script
Creates collections and seeds initial data for Inventory and Delivery modules
Run with: python -m backend.seed_data
"""

import os
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / '.env')

from datetime import datetime, timedelta
from bson import ObjectId
from pymongo import MongoClient
import sys

# MongoDB connection - use environment variable or fallback
MONGO_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017')
DB_NAME = os.getenv('MONGODB_DB', 'restaurant_db')

def get_db():
    """Get MongoDB database instance"""
    client = MongoClient(MONGO_URI)
    return client[DB_NAME]

def generate_sample_data():
    """Generate sample data for all collections"""
    
    # ============ INGREDIENTS ============
    ingredients = [
        # Grains & Flours
        {"name": "Rice", "category": "Grains", "stockLevel": 60, "unit": "kg", "minThreshold": 50, "costPerUnit": 80, "supplierId": "s1", "status": "Healthy", "usageRate": "High"},
        {"name": "Wheat Flour", "category": "Grains", "stockLevel": 35, "unit": "kg", "minThreshold": 30, "costPerUnit": 35, "supplierId": "s1", "status": "Healthy", "usageRate": "High"},
        {"name": "Maida", "category": "Grains", "stockLevel": 25, "unit": "kg", "minThreshold": 20, "costPerUnit": 45, "supplierId": "s1", "status": "Healthy", "usageRate": "Medium"},
        
        # Basic Ingredients
        {"name": "Sugar", "category": "Pantry", "stockLevel": 18, "unit": "kg", "minThreshold": 15, "costPerUnit": 50, "supplierId": "s1", "status": "Healthy", "usageRate": "Medium"},
        {"name": "Salt", "category": "Pantry", "stockLevel": 12, "unit": "kg", "minThreshold": 10, "costPerUnit": 20, "supplierId": "s1", "status": "Healthy", "usageRate": "High"},
        
        # Oils & Fats
        {"name": "Cooking Oil", "category": "Oils", "stockLevel": 30, "unit": "L", "minThreshold": 25, "costPerUnit": 120, "supplierId": "s3", "status": "Healthy", "usageRate": "High"},
        {"name": "Ghee", "category": "Oils", "stockLevel": 12, "unit": "L", "minThreshold": 10, "costPerUnit": 450, "supplierId": "s3", "status": "Healthy", "usageRate": "High"},
        {"name": "Butter", "category": "Dairy", "stockLevel": 6, "unit": "kg", "minThreshold": 5, "costPerUnit": 350, "supplierId": "s4", "status": "Healthy", "usageRate": "Medium"},
        
        # Dairy
        {"name": "Milk", "category": "Dairy", "stockLevel": 35, "unit": "L", "minThreshold": 30, "costPerUnit": 60, "supplierId": "s4", "status": "Healthy", "usageRate": "High"},
        {"name": "Curd", "category": "Dairy", "stockLevel": 12, "unit": "kg", "minThreshold": 10, "costPerUnit": 80, "supplierId": "s4", "status": "Healthy", "usageRate": "Medium"},
        {"name": "Paneer", "category": "Dairy", "stockLevel": 10, "unit": "kg", "minThreshold": 8, "costPerUnit": 350, "supplierId": "s4", "status": "Healthy", "usageRate": "High"},
        {"name": "Cheese", "category": "Dairy", "stockLevel": 6, "unit": "kg", "minThreshold": 5, "costPerUnit": 400, "supplierId": "s4", "status": "Healthy", "usageRate": "Medium"},
        
        # Proteins
        {"name": "Eggs", "category": "Proteins", "stockLevel": 60, "unit": "units", "minThreshold": 50, "costPerUnit": 6, "supplierId": "s5", "status": "Healthy", "usageRate": "High"},
        {"name": "Chicken", "category": "Proteins", "stockLevel": 35, "unit": "kg", "minThreshold": 30, "costPerUnit": 250, "supplierId": "s5", "status": "Healthy", "usageRate": "High"},
        {"name": "Mutton", "category": "Proteins", "stockLevel": 25, "unit": "kg", "minThreshold": 20, "costPerUnit": 350, "supplierId": "s5", "status": "Healthy", "usageRate": "Medium"},
        {"name": "Fish", "category": "Proteins", "stockLevel": 18, "unit": "kg", "minThreshold": 15, "costPerUnit": 300, "supplierId": "s5", "status": "Healthy", "usageRate": "Medium"},
        
        # Vegetables - Main
        {"name": "Onions", "category": "Vegetables", "stockLevel": 45, "unit": "kg", "minThreshold": 40, "costPerUnit": 30, "supplierId": "s2", "status": "Healthy", "usageRate": "High"},
        {"name": "Tomatoes", "category": "Vegetables", "stockLevel": 35, "unit": "kg", "minThreshold": 30, "costPerUnit": 40, "supplierId": "s2", "status": "Healthy", "usageRate": "High"},
        {"name": "Potatoes", "category": "Vegetables", "stockLevel": 55, "unit": "kg", "minThreshold": 50, "costPerUnit": 25, "supplierId": "s2", "status": "Healthy", "usageRate": "High"},
        
        # Vegetables - Aromatics
        {"name": "Ginger", "category": "Vegetables", "stockLevel": 6, "unit": "kg", "minThreshold": 5, "costPerUnit": 60, "supplierId": "s2", "status": "Healthy", "usageRate": "High"},
        {"name": "Garlic", "category": "Vegetables", "stockLevel": 4, "unit": "kg", "minThreshold": 3, "costPerUnit": 80, "supplierId": "s2", "status": "Healthy", "usageRate": "High"},
        
        # Spices - Powders
        {"name": "Turmeric Powder", "category": "Spices", "stockLevel": 2.5, "unit": "kg", "minThreshold": 2, "costPerUnit": 150, "supplierId": "s7", "status": "Healthy", "usageRate": "High"},
        {"name": "Chilli Powder", "category": "Spices", "stockLevel": 2.5, "unit": "kg", "minThreshold": 2, "costPerUnit": 200, "supplierId": "s7", "status": "Healthy", "usageRate": "High"},
        {"name": "Coriander Powder", "category": "Spices", "stockLevel": 2.5, "unit": "kg", "minThreshold": 2, "costPerUnit": 180, "supplierId": "s7", "status": "Healthy", "usageRate": "High"},
        
        # Beverages
        {"name": "Tea Powder", "category": "Beverages", "stockLevel": 3.5, "unit": "kg", "minThreshold": 3, "costPerUnit": 400, "supplierId": "s8", "status": "Healthy", "usageRate": "High"},
        {"name": "Coffee Powder", "category": "Beverages", "stockLevel": 2.5, "unit": "kg", "minThreshold": 2, "costPerUnit": 500, "supplierId": "s8", "status": "Healthy", "usageRate": "Medium"},
        
        # Low stock items for testing alerts
        {"name": "Green Chilli", "category": "Vegetables", "stockLevel": 2, "unit": "kg", "minThreshold": 3, "costPerUnit": 100, "supplierId": "s2", "status": "Low", "usageRate": "High"},
        {"name": "Cashew", "category": "Dry Fruits", "stockLevel": 1, "unit": "kg", "minThreshold": 2, "costPerUnit": 600, "supplierId": "s6", "status": "Critical", "usageRate": "Low"},
    ]
    
    # ============ SUPPLIERS ============
    suppliers = [
        {"_id": "s1", "name": "General Supplies", "contact": "+91 98765 43210", "email": "orders@generalsupplies.com", "status": "Active", "suppliedItems": ["Rice", "Flour", "Maida", "Sugar", "Salt"]},
        {"_id": "s2", "name": "Fresh Produce", "contact": "+91 98765 12345", "email": "sales@freshproduce.com", "status": "Active", "suppliedItems": ["Vegetables", "Tomatoes", "Onions"]},
        {"_id": "s3", "name": "Oils & Fats Supplier", "contact": "+91 99887 76655", "email": "supplies@oilsfats.com", "status": "Active", "suppliedItems": ["Cooking Oil", "Ghee"]},
        {"_id": "s4", "name": "Dairy Best", "contact": "+91 91234 56789", "email": "supply@dairybest.com", "status": "Active", "suppliedItems": ["Milk", "Curd", "Paneer", "Cheese", "Butter"]},
        {"_id": "s5", "name": "Poultry Plus", "contact": "+91 88990 01122", "email": "orders@poultryplus.com", "status": "Active", "suppliedItems": ["Eggs", "Chicken", "Mutton", "Fish"]},
        {"_id": "s6", "name": "Nuts & Dry Fruits", "contact": "+91 87654 32198", "email": "sales@nutsdryfruit.com", "status": "Active", "suppliedItems": ["Cashew", "Raisins", "Almonds"]},
        {"_id": "s7", "name": "Spice Merchants", "contact": "+91 77623 45123", "email": "orders@spicehouse.com", "status": "Active", "suppliedItems": ["Spices", "Turmeric", "Chilli"]},
        {"_id": "s8", "name": "Beverages India", "contact": "+91 86543 21987", "email": "supply@beveragesindia.com", "status": "Active", "suppliedItems": ["Tea Powder", "Coffee Powder"]},
    ]
    
    # ============ RIDERS ============
    riders = [
        {"name": "Rahul Kumar", "phone": "+91 98765 43210", "status": "Available", "vehicleNumber": "KA-01-AB-1234", "rating": 4.8, "totalDeliveries": 1200, "currentOrderId": None},
        {"name": "Amit Singh", "phone": "+91 98765 12345", "status": "On Delivery", "vehicleNumber": "KA-05-XY-9876", "rating": 4.5, "totalDeliveries": 850, "currentOrderId": "order3"},
        {"name": "Vikram Malhotra", "phone": "+91 91234 56789", "status": "Available", "vehicleNumber": "KA-53-ZZ-4567", "rating": 4.9, "totalDeliveries": 2100, "currentOrderId": None},
        {"name": "Sneha Gupta", "phone": "+91 88888 77777", "status": "Offline", "vehicleNumber": "KA-03-MN-1122", "rating": 4.7, "totalDeliveries": 450, "currentOrderId": None},
        {"name": "Pradeep Kumar", "phone": "+91 99887 76655", "status": "Available", "vehicleNumber": "KA-08-PQ-3456", "rating": 4.6, "totalDeliveries": 980, "currentOrderId": None},
    ]
    
    # ============ DELIVERY ORDERS ============
    now = datetime.utcnow()
    orders = [
        {
            "orderNumber": "ORD-8821",
            "customerName": "Priya Sharma",
            "customerAddress": "Flat 402, Green Heights, MG Road",
            "customerPhone": "+91 98765 11111",
            "totalAmount": 650,
            "items": ["Butter Chicken", "Naan"],
            "type": "delivery",
            "status": "pending",
            "deliveryStatus": "cooking",
            "paymentStatus": "pending",
            "createdAt": now - timedelta(minutes=30),
            "estimatedDeliveryTime": now + timedelta(minutes=40),
        },
        {
            "orderNumber": "ORD-8822",
            "customerName": "Arjun Reddy",
            "customerAddress": "12, 100ft Road, HSR Layout",
            "customerPhone": "+91 98765 22222",
            "totalAmount": 340,
            "items": ["Veg Biryani"],
            "type": "delivery",
            "status": "pending",
            "deliveryStatus": "ready",
            "paymentStatus": "paid",
            "createdAt": now - timedelta(minutes=25),
            "estimatedDeliveryTime": now + timedelta(minutes=30),
        },
        {
            "orderNumber": "ORD-8820",
            "customerName": "Neha Kapoor",
            "customerAddress": "Sector 2, HSR Layout",
            "customerPhone": "+91 98765 33333",
            "totalAmount": 480,
            "items": ["Paneer Tikka"],
            "type": "delivery",
            "status": "pending",
            "deliveryStatus": "on_the_way",
            "riderName": "Amit Singh",
            "createdAt": now - timedelta(minutes=60),
            "estimatedDeliveryTime": now - timedelta(minutes=20),
        },
        {
            "orderNumber": "ORD-8825",
            "customerName": "David John",
            "customerAddress": "Whitefield, Bangalore",
            "customerPhone": "+91 98765 44444",
            "totalAmount": 1200,
            "items": ["Family Pack - Non Veg", "Garlic Naan", "Coke 1L"],
            "type": "delivery",
            "status": "pending",
            "deliveryStatus": "on_the_way",
            "riderName": "Vikram Malhotra",
            "createdAt": now - timedelta(minutes=45),
            "estimatedDeliveryTime": now + timedelta(minutes=15),
        },
        {
            "orderNumber": "ORD-8819",
            "customerName": "Sarah Williams",
            "customerAddress": "MG Road, Bangalore",
            "customerPhone": "+91 98765 55555",
            "totalAmount": 520,
            "items": ["Masala Dosa", "Coconut Water"],
            "type": "delivery",
            "status": "completed",
            "deliveryStatus": "delivered",
            "riderName": "Rahul Kumar",
            "createdAt": now - timedelta(hours=1),
            "deliveredAt": now - timedelta(minutes=15),
            "paymentStatus": "paid",
        },
    ]
    
    # ============ DELIVERY ZONES ============
    zones = [
        {"name": "Zone A - MG Road", "baseDeliveryTime": 20, "deliveryFee": 20, "minOrderAmount": 100, "status": "Active"},
        {"name": "Zone B - HSR Layout", "baseDeliveryTime": 25, "deliveryFee": 30, "minOrderAmount": 150, "status": "Active"},
        {"name": "Zone C - Whitefield", "baseDeliveryTime": 35, "deliveryFee": 50, "minOrderAmount": 200, "status": "Active"},
        {"name": "Zone D - Koramangala", "baseDeliveryTime": 30, "deliveryFee": 40, "minOrderAmount": 150, "status": "Active"},
        {"name": "Zone E - Extended Area", "baseDeliveryTime": 45, "deliveryFee": 70, "minOrderAmount": 300, "status": "Active"},
    ]
    
    # ============ SAMPLE PURCHASES ============
    purchases = [
        {"supplierId": "s1", "ingredientName": "Rice", "quantity": 100, "unit": "kg", "cost": 8000, "date": (now - timedelta(days=7)).isoformat(), "createdAt": now - timedelta(days=7)},
        {"supplierId": "s2", "ingredientName": "Onions", "quantity": 50, "unit": "kg", "cost": 1500, "date": (now - timedelta(days=5)).isoformat(), "createdAt": now - timedelta(days=5)},
        {"supplierId": "s4", "ingredientName": "Milk", "quantity": 100, "unit": "L", "cost": 6000, "date": (now - timedelta(days=2)).isoformat(), "createdAt": now - timedelta(days=2)},
        {"supplierId": "s5", "ingredientName": "Chicken", "quantity": 50, "unit": "kg", "cost": 12500, "date": (now - timedelta(days=1)).isoformat(), "createdAt": now - timedelta(days=1)},
    ]
    
    # ============ SAMPLE DEDUCTION LOGS ============
    deduction_logs = [
        {"orderId": "ORD-8815", "dishName": "Chicken Biryani", "ingredients": [{"name": "Rice", "amount": 0.5, "unit": "kg"}, {"name": "Chicken", "amount": 0.2, "unit": "kg"}], "timestamp": now - timedelta(hours=2)},
        {"orderId": "ORD-8816", "dishName": "Butter Chicken", "ingredients": [{"name": "Chicken", "amount": 0.3, "unit": "kg"}, {"name": "Cream", "amount": 0.1, "unit": "L"}], "timestamp": now - timedelta(hours=1.5)},
        {"orderId": "ORD-8817", "dishName": "Veg Biryani", "ingredients": [{"name": "Rice", "amount": 0.4, "unit": "kg"}, {"name": "Vegetables", "amount": 0.2, "unit": "kg"}], "timestamp": now - timedelta(hours=1)},
        {"orderId": "ORD-8818", "dishName": "Paneer Tikka", "ingredients": [{"name": "Paneer", "amount": 0.25, "unit": "kg"}], "timestamp": now - timedelta(minutes=30)},
    ]
    
    # ============ SAMPLE TABLES ============
    tables = [
        {"tableNumber": 1, "capacity": 4, "status": "available", "section": "A", "positionX": 100, "positionY": 100},
        {"tableNumber": 2, "capacity": 4, "status": "occupied", "section": "A", "positionX": 200, "positionY": 100},
        {"tableNumber": 3, "capacity": 6, "status": "available", "section": "A", "positionX": 300, "positionY": 100},
        {"tableNumber": 4, "capacity": 2, "status": "reserved", "section": "B", "positionX": 100, "positionY": 250},
        {"tableNumber": 5, "capacity": 8, "status": "available", "section": "B", "positionX": 200, "positionY": 250},
        {"tableNumber": 6, "capacity": 4, "status": "available", "section": "C", "positionX": 100, "positionY": 400},
        {"tableNumber": 7, "capacity": 6, "status": "occupied", "section": "C", "positionX": 200, "positionY": 400},
        {"tableNumber": 8, "capacity": 10, "status": "available", "section": "VIP", "positionX": 300, "positionY": 400},
    ]
    
    # ============ SAMPLE CUSTOMERS ============
    customers = [
        {"name": "Priya Sharma", "phone": "+91 98765 11111", "email": "priya@email.com", "totalOrders": 15, "loyaltyPoints": 450, "visitFrequency": "weekly"},
        {"name": "Arjun Reddy", "phone": "+91 98765 22222", "email": "arjun@email.com", "totalOrders": 8, "loyaltyPoints": 220, "visitFrequency": "bi-weekly"},
        {"name": "Neha Kapoor", "phone": "+91 98765 33333", "email": "neha@email.com", "totalOrders": 25, "loyaltyPoints": 780, "visitFrequency": "weekly"},
        {"name": "David John", "phone": "+91 98765 44444", "email": "david@email.com", "totalOrders": 5, "loyaltyPoints": 120, "visitFrequency": "monthly"},
        {"name": "Sarah Williams", "phone": "+91 98765 55555", "email": "sarah@email.com", "totalOrders": 12, "loyaltyPoints": 340, "visitFrequency": "weekly"},
    ]
    
    # ============ SAMPLE OFFERS ============
    offers = [
        {"name": "Summer Special 20% Off", "type": "percentage", "value": 20, "minOrderAmount": 500, "validFrom": now.isoformat(), "validUntil": (now + timedelta(days=30)).isoformat(), "isActive": True, "applicableCategories": ["Curries"]},
        {"name": "Free Delivery on Orders Above 300", "type": "free_delivery", "minOrderAmount": 300, "validFrom": now.isoformat(), "validUntil": (now + timedelta(days=60)).isoformat(), "isActive": True},
        {"name": "Buy 1 Get 1 Naan", "type": "bogo", "minOrderAmount": 200, "validFrom": now.isoformat(), "validUntil": (now + timedelta(days=14)).isoformat(), "isActive": True, "applicableItems": ["Naan"]},
        {"name": "Weekend Family Pack", "type": "combo", "value": 150, "minOrderAmount": 800, "validFrom": (now - timedelta(days=2)).isoformat(), "validUntil": (now + timedelta(days=5)).isoformat(), "isActive": True},
    ]
    
    # ============ SAMPLE NOTIFICATIONS ============
    notifications = [
        {"title": "Low Stock Alert", "message": "Green Chilli stock is below minimum threshold", "type": "inventory", "isRead": False, "createdAt": now - timedelta(hours=1)},
        {"title": "New Order Received", "message": "Order ORD-8823 has been placed", "type": "order", "isRead": True, "createdAt": now - timedelta(minutes=30)},
        {"title": "Delivery Completed", "message": "Order ORD-8819 has been delivered successfully", "type": "delivery", "isRead": True, "createdAt": now - timedelta(minutes=15)},
        {"title": "Daily Report Ready", "message": "Today's sales report is now available", "type": "report", "isRead": False, "createdAt": now - timedelta(hours=3)},
    ]
    
    # ============ SETTINGS ============
    settings = [
        {"key": "restaurant_name", "value": "Taste of India", "category": "general"},
        {"key": "gst_rate", "value": "5", "category": "billing"},
        {"key": "delivery_fee", "value": "30", "category": "delivery"},
        {"key": "min_order_amount", "value": "100", "category": "billing"},
        {"key": "currency", "value": "INR", "category": "general"},
        {"key": "timezone", "value": "Asia/Kolkata", "category": "general"},
    ]
    
    return {
        "ingredients": ingredients,
        "suppliers": suppliers,
        "riders": riders,
        "orders": orders,
        "delivery_zones": zones,
        "purchases": purchases,
        "deduction_logs": deduction_logs,
        "tables": tables,
        "customers": customers,
        "offers": offers,
        "notifications": notifications,
        "settings": settings,
    }

async def seed_database():
    """Seed the database with sample data"""
    db = get_db()
    data = generate_sample_data()
    
    print("=" * 50)
    print("Restaurant Management System - Database Seeder")
    print("=" * 50)
    
    # Clear existing data
    print("\nClearing existing data...")
    collections_to_clear = ["ingredients", "suppliers", "riders", "orders", "delivery_zones", "purchases", "deduction_logs", "tables", "customers", "offers", "notifications", "settings"]
    for coll in collections_to_clear:
        db[coll].delete_many({})
        print(f"  - Cleared {coll}")
    
    # Insert sample data
    print("\nInserting sample data...")
    
    # Insert suppliers first (they have _id)
    if data["suppliers"]:
        db.suppliers.insert_many(data["suppliers"])
        print(f"  - Inserted {len(data['suppliers'])} suppliers")
    
    # Insert ingredients
    if data["ingredients"]:
        db.ingredients.insert_many(data["ingredients"])
        print(f"  - Inserted {len(data['ingredients'])} ingredients")
    
    # Insert riders
    if data["riders"]:
        # Generate ObjectIds for riders
        rider_ids = []
        rider_name_to_id = {}
        for i, rider in enumerate(data["riders"]):
            rider_id = ObjectId()
            rider_ids.append(rider_id)
            rider["_id"] = rider_id
            rider_name_to_id[rider["name"]] = rider_id
        db.riders.insert_many(data["riders"])
        print(f"  - Inserted {len(data['riders'])} riders")
    
    # Insert orders and map riderName to riderId
    if data["orders"]:
        order_ids = []
        for order in data["orders"]:
            order_id = ObjectId()
            order_ids.append(order_id)
            order["_id"] = order_id
            # Map riderName to actual rider _id
            if order.get("riderName"):
                rider_oid = rider_name_to_id.get(order["riderName"])
                if rider_oid:
                    order["riderId"] = str(rider_oid)
                del order["riderName"]
        db.orders.insert_many(data["orders"])
        print(f"  - Inserted {len(data['orders'])} delivery orders")
    
    # Insert delivery zones
    if data["delivery_zones"]:
        db.delivery_zones.insert_many(data["delivery_zones"])
        print(f"  - Inserted {len(data['delivery_zones'])} delivery zones")
    
    # Insert purchases
    if data["purchases"]:
        db.purchases.insert_many(data["purchases"])
        print(f"  - Inserted {len(data['purchases'])} purchase records")
    
    # Insert deduction logs
    if data["deduction_logs"]:
        db.deduction_logs.insert_many(data["deduction_logs"])
        print(f"  - Inserted {len(data['deduction_logs'])} deduction logs")
    
    # Insert tables
    if data["tables"]:
        db.tables.insert_many(data["tables"])
        print(f"  - Inserted {len(data['tables'])} tables")
    
    # Insert customers
    if data["customers"]:
        db.customers.insert_many(data["customers"])
        print(f"  - Inserted {len(data['customers'])} customers")
    
    # Insert offers
    if data["offers"]:
        db.offers.insert_many(data["offers"])
        print(f"  - Inserted {len(data['offers'])} offers")
    
    # Insert notifications
    if data["notifications"]:
        db.notifications.insert_many(data["notifications"])
        print(f"  - Inserted {len(data['notifications'])} notifications")
    
    # Insert settings
    if data["settings"]:
        db.settings.insert_many(data["settings"])
        print(f"  - Inserted {len(data['settings'])} settings")
    
    print("\n" + "=" * 50)
    print("Database seeded successfully!")
    print("=" * 50)
    print("\nCollections created:")
    for coll in collections_to_clear:
        count = db[coll].count_documents({})
        print(f"  - {coll}: {count} documents")

def create_indexes():
    """Create indexes for better query performance"""
    db = get_db()
    
    print("\nCreating indexes...")
    
    # Ingredients indexes
    db.ingredients.create_index("category")
    db.ingredients.create_index("status")
    db.ingredients.create_index("name")
    print("  - Created indexes for ingredients")
    
    # Suppliers indexes
    db.suppliers.create_index("status")
    print("  - Created indexes for suppliers")
    
    # Riders indexes
    db.riders.create_index("status")
    db.riders.create_index("phone")
    print("  - Created indexes for riders")
    
    # Orders indexes
    db.orders.create_index("orderNumber", unique=True)
    db.orders.create_index("deliveryStatus")
    db.orders.create_index("riderId")
    db.orders.create_index("createdAt")
    print("  - Created indexes for orders")
    
    # Delivery zones indexes
    db.delivery_zones.create_index("name")
    print("  - Created indexes for delivery zones")
    
    # Purchases indexes
    db.purchases.create_index("supplierId")
    db.purchases.create_index("date")
    print("  - Created indexes for purchases")
    
    # Deduction logs indexes
    db.deduction_logs.create_index("orderId")
    db.deduction_logs.create_index("timestamp")
    print("  - Created indexes for deduction_logs")
    
    # Tables indexes
    db.tables.create_index("tableNumber", unique=True)
    db.tables.create_index("status")
    db.tables.create_index("section")
    print("  - Created indexes for tables")
    
    # Customers indexes
    db.customers.create_index("phone", unique=True)
    db.customers.create_index("email")
    print("  - Created indexes for customers")
    
    # Offers indexes
    db.offers.create_index("isActive")
    db.offers.create_index("type")
    print("  - Created indexes for offers")
    
    # Notifications indexes
    db.notifications.create_index("type")
    db.notifications.create_index("isRead")
    db.notifications.create_index("createdAt")
    print("  - Created indexes for notifications")
    
    # Settings indexes
    db.settings.create_index("key", unique=True)
    db.settings.create_index("category")
    print("  - Created indexes for settings")
    
    print("\nIndexes created successfully!")

if __name__ == "__main__":
    try:
        seed_database()
        create_indexes()
        print("\nDone! You can now start the backend server.")
    except Exception as e:
        print(f"\nError: {e}")
        print("\nMake sure MongoDB is running and the connection string is correct.")
        print(f"Current MONGO_URI: {MONGO_URI}")
        sys.exit(1)
