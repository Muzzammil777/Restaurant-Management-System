import asyncio
import sys
import os
from pathlib import Path
from dotenv import load_dotenv
import json
from datetime import datetime

# Load environment variables from .env file
BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / '.env')

sys.path.append(os.path.abspath('.'))

from app.db import init_db

async def test_data_insertion():
    try:
        print("🧪 Testing data insertion to MongoDB...")
        db = init_db()
        print(f"📊 Connected to database: {db.name}")
        
        # Test 1: Insert data into billing collection
        billing_collection = db['billing']
        
        # Count documents before
        count_before = await billing_collection.count_documents({})
        print(f"📋 Billing documents BEFORE: {count_before}")
        
        # Insert test billing record
        test_billing = {
            "orderId": "TEST_001",
            "customerName": "Test Customer",
            "totalAmount": 150.50,
            "paymentMethod": "credit_card",
            "status": "paid",
            "items": [
                {"name": "Pizza", "price": 250, "quantity": 1},
                {"name": "Caesar Salad", "price": 120, "quantity": 1}
            ],
            "timestamp": datetime.utcnow(),
            "testRecord": True
        }
        
        result = await billing_collection.insert_one(test_billing)
        print(f"✅ Inserted billing record with ID: {result.inserted_id}")
        
        # Count documents after
        count_after = await billing_collection.count_documents({})
        print(f"📋 Billing documents AFTER: {count_after}")
        
        # Test 2: Insert data into orders collection  
        orders_collection = db['orders']
        count_orders_before = await orders_collection.count_documents({})
        print(f"📦 Orders documents BEFORE: {count_orders_before}")
        
        test_order = {
            "orderId": "ORD_TEST_001", 
            "customerName": "Test Customer",
            "items": ["Pizza", "Caesar Salad"],
            "status": "pending",
            "totalAmount": 370,
            "orderTime": datetime.utcnow(),
            "testRecord": True
        }
        
        result2 = await orders_collection.insert_one(test_order)
        print(f"✅ Inserted order record with ID: {result2.inserted_id}")
        
        count_orders_after = await orders_collection.count_documents({})
        print(f"📦 Orders documents AFTER: {count_orders_after}")
        
        # Test 3: Verify the data exists
        print("\n🔍 Verifying inserted data...")
        
        # Find the inserted billing record
        inserted_billing = await billing_collection.find_one({"orderId": "TEST_001"})
        if inserted_billing:
            print(f"✅ Found billing record: {inserted_billing['customerName']} - ${inserted_billing['totalAmount']}")
        
        # Find the inserted order record  
        inserted_order = await orders_collection.find_one({"orderId": "ORD_TEST_001"})
        if inserted_order:
            print(f"✅ Found order record: {inserted_order['customerName']} - Status: {inserted_order['status']}")
        
        print(f"\n🎉 SUCCESS! Data is being stored in MongoDB Atlas!")
        print(f"📍 Check your MongoDB Atlas now - you should see:")
        print(f"   - billing collection: {count_after} documents (was {count_before})")
        print(f"   - orders collection: {count_orders_after} documents (was {count_orders_before})")
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing data insertion: {e}")
        return False

if __name__ == "__main__":
    asyncio.run(test_data_insertion())