import asyncio
import sys
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / '.env')

sys.path.append(os.path.abspath('.'))

from app.db import init_db

async def test_connection():
    try:
        print("Testing MongoDB connection...")
        db = init_db()
        print(f"Connected to database: {db.name}")
        
        # Test a simple operation
        collections = await db.list_collection_names()
        print(f"Available collections: {collections}")
        print("✅ MongoDB connection successful!")
        
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_connection())