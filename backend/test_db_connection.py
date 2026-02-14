"""Test MongoDB Connection Script"""
import os
from pathlib import Path

def load_env_file(env_path):
    """Load environment variables from a file"""
    if os.path.exists(env_path):
        with open(env_path, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    os.environ[key.strip()] = value.strip()

def test_connection():
    print("=" * 50)
    print("MongoDB Connection Test")
    print("=" * 50)
    
    # Load .env file manually
    env_path = Path(__file__).resolve().parent / '.env'
    load_env_file(env_path)
    print(f"[i] Loaded .env from: {env_path}")
    
    # Get MongoDB URI from environment
    mongo_uri = os.getenv('MONGODB_URI')
    db_name = os.getenv('MONGODB_DB', 'restaurant_db')
    
    if not mongo_uri:
        print("[X] MONGODB_URI not found in .env file")
        return False
    
    print(f"[i] MongoDB URI: {mongo_uri[:50]}...")
    print(f"[i] Database: {db_name}")
    print()
    
    try:
        # Connect to MongoDB
        from pymongo import MongoClient
        client = MongoClient(mongo_uri, serverSelectionTimeoutMS=10000)
        
        # Test connection with ping
        client.admin.command('ping')
        print("[OK] MongoDB connection successful!")
        
        # Get database
        db = client[db_name]
        
        # List collections
        collections = db.list_collection_names()
        print(f"[i] Existing collections: {len(collections)}")
        if collections:
            for coll in collections:
                count = db[coll].count_documents({})
                print(f"   - {coll}: {count} documents")
        else:
            print("   No collections found (database is empty)")
        
        # Test insert (will be removed)
        test_doc = {"test": "connection", "timestamp": "test"}
        result = db['test_connection'].insert_one(test_doc)
        print(f"[OK] Test insert successful (id: {result.inserted_id})")
        
        # Clean up test document
        db['test_connection'].delete_one({"_id": result.inserted_id})
        print("[OK] Test document cleaned up")
        
        print()
        print("[SUCCESS] All tests passed! MongoDB is working correctly.")
        return True
        
    except Exception as e:
        print(f"[X] MongoDB connection failed: {e}")
        return False

if __name__ == "__main__":
    success = test_connection()
    exit(0 if success else 1)
