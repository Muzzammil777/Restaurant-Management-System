from motor.motor_asyncio import AsyncIOMotorClient
import os
from urllib.parse import quote_plus

_client = None
db = None

def init_db(uri: str = None):
    global _client, db
    if _client is not None:
        return db
    if uri is None:
        uri = os.getenv('MONGODB_URI')
    
    print(f"Attempting to connect to MongoDB with URI: {uri}")
    
    if not uri:
        print("WARNING: MONGODB_URI not set, using fallback mode")
        print("To connect to your real database, set MONGODB_URI environment variable")
        print("Example: mongodb+srv://username:password@cluster.mongodb.net/restaurant_db")
        # Don't raise error, just return None to trigger fallback mode
        return None
    
    try:
        _client = AsyncIOMotorClient(uri, serverSelectionTimeoutMS=5000)
        # Test the connection
        _client.admin.command('ping')
        print("Successfully connected to MongoDB!")
        
        # Try to get database from URI, fallback to 'rms'
        default_db = _client.get_default_database()
        if default_db is not None:
            db = default_db
            print(f"Using default database: {db.name}")
        else:
            db = _client['restaurant_db']
            print(f"Using fallback database: {db.name}")
            
        return db
    except Exception as e:
        print(f"ERROR: Failed to connect to MongoDB: {e}")
        print("Falling back to mock data mode")
        return None


def get_db():
    """Get the database instance"""
    global db
    if db is None:
        raise RuntimeError('Database not initialized. Call init_db() first.')
    return db
