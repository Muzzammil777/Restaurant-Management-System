from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
import os
from typing import Optional

_client: Optional[AsyncIOMotorClient] = None
_db: Optional[AsyncIOMotorDatabase] = None

def init_db(uri: str = None) -> AsyncIOMotorDatabase:
    """Initialize the database connection"""
    global _client, _db
    
    if _client is not None:
        return _db
    
    if uri is None:
        uri = os.getenv('MONGODB_URI')
    
    if not uri:
        raise RuntimeError('MONGODB_URI must be set in .env file')
    
    print(f"Connecting to MongoDB...")
    _client = AsyncIOMotorClient(uri, serverSelectionTimeoutMS=5000)
    
    # Test the connection
    _client.admin.command('ping')
    print("✅ MongoDB connected successfully")
    
    # Get database name from environment or extract from URI
    db_name = os.getenv('MONGODB_DB')
    if not db_name:
        # Try to extract from URI path
        if '/' in uri:
            parts = uri.split('/')
            # Find the database name in the URI (after the last / before ? or end)
            for i, part in enumerate(parts):
                if part == 'restaurant_db' or part == 'rms':
                    db_name = part
                    break
                elif i > 2 and part and not part.startswith('?'):
                    # This might be the database name
                    if not part.startswith('mongodb') and not part.startswith('+srv'):
                        db_name = part
                        break
    
    if not db_name:
        db_name = 'restaurant_db'
    
    _db = _client[db_name]
    print(f"✅ Using database: {db_name}")
    
    return _db


def get_db() -> AsyncIOMotorDatabase:
    """Get the database instance"""
    global _db
    if _db is None:
        raise RuntimeError('Database not initialized. Call init_db() first.')
    return _db


def close_db():
    """Close the database connection"""
    global _client, _db
    if _client is not None:
        _client.close()
        _client = None
        _db = None
        print("MongoDB connection closed")
