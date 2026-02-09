# MongoDB Data Storage - Fix & Troubleshooting Guide

## ✅ Issues Fixed

### 1. **Connection String Encoding**
- ❌ **Problem**: Special character `@` in password wasn't URL encoded
- ✅ **Solution**: Updated to `dhina%403949` (@ = %40)
- **Location**: `backend/.env`

### 2. **Missing Database Name**
- ❌ **Problem**: Connection string didn't specify database name
- ✅ **Solution**: Added `/restaurant_db?` to explicitly specify database

### 3. **Missing Write Confirmation Parameter**
- ❌ **Problem**: Missing `w=majority` for write acknowledgment
- ✅ **Solution**: Added `w=majority` and `retryWrites=true` parameters

### 4. **Improved Error Handling**
- ✅ **Solution**: Enhanced database initialization with better logging
- Added health check endpoints: `/health` and `/health/db`
- Better error messages in startup

### 5. **Authentication Source**
- ✅ **Solution**: Added `authSource=admin` for proper authentication

---

## 🔧 Updated Connection String

**Old (Broken):**
```
mongodb+srv://dhinaka001_db_user:dhina@3949@cluster0.atausrr.mongodb.net/?appName=Cluster0
```

**New (Fixed):**
```
mongodb+srv://dhinaka001_db_user:dhina%403949@cluster0.atausrr.mongodb.net/restaurant_db?retryWrites=true&w=majority&authSource=admin
```

---

## 📋 Verification Steps

### 1. **Test Backend Connection**
```bash
# Start the backend
start-backend.bat
```

You should see:
```
==================================================
🚀 Starting Restaurant Management System Backend
==================================================

🔄 Connecting to MongoDB...
✅ MongoDB connected successfully!
📊 Database: restaurant_db
==================================================
```

### 2. **Check Database Health Endpoint**
Open your browser and go to:
```
http://localhost:8000/health/db
```

Expected response:
```json
{
  "status": "healthy",
  "database": "MongoDB Atlas",
  "connected": true
}
```

### 3. **Check API Documentation**
```
http://localhost:8000/docs
```

### 4. **Test Data Insertion**
Use the Swagger UI at `http://localhost:8000/docs` to:
1. Create a new order via `POST /api/orders`
2. Create staff member via `POST /api/staff`
3. Create menu item via `POST /api/menu`

---

## 🛠️ Common Issues & Solutions

### Issue: Connection Timeout
```
pymongo.errors.ServerSelectionTimeoutError
```

**Solution:**
1. Check your MongoDB Atlas cluster is running
2. Verify IP address is whitelisted in MongoDB Atlas:
   - Go to Network Access
   - Add your IP address (or 0.0.0.0 for development)

### Issue: Authentication Failed
```
pymongo.errors.OperationFailure: authentication failed
```

**Solutions:**
1. Verify credentials in `.env` are correct
2. Check that `@` character is encoded as `%40`
3. Verify user exists in MongoDB Atlas
4. Check `authSource=admin` is in connection string

### Issue: Data Not Appearing in MongoDB
```
Insert operation appears successful but data doesn't appear
```

**Solutions:**
1. Check `w=majority` is in connection string (ensures write confirmation)
2. Check `retryWrites=true` is set
3. Verify database name is correct: `restaurant_db`
4. Run: `http://localhost:8000/health/db` to verify connection

### Issue: Wrong Database Selected
```
Data going to default database instead of restaurant_db
```

**Solution:**
- Ensure connection string includes `/restaurant_db?` before query parameters

---

## 📊 Checking Data in MongoDB Atlas

1. Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Go to **Clusters** → **Cluster0**
3. Click **Browse Collections**
4. Navigate to **restaurant_db** database
5. You should see collections: `orders`, `staff`, `menu`, etc.
6. Click on any collection to view documents

---

## 🔍 Debug Mode

### Enable Verbose Logging
Edit `backend/app/main.py` and add before `app = FastAPI()`:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
logging.getLogger("motor").setLevel(logging.DEBUG)
logging.getLogger("pymongo").setLevel(logging.DEBUG)
```

### Test Query from Python
Create a test script `backend/test_db.py`:

```python
import asyncio
from app.db import init_db, get_db
import os
from dotenv import load_dotenv
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / '.env')

async def test():
    db = init_db()
    
    # Test insert
    result = await db.test_collection.insert_one({
        "name": "Test Order",
        "status": "completed"
    })
    print(f"✅ Inserted: {result.inserted_id}")
    
    # Test read
    doc = await db.test_collection.find_one({"_id": result.inserted_id})
    print(f"✅ Retrieved: {doc}")
    
    # List all
    count = await db.test_collection.count_documents({})
    print(f"✅ Total documents: {count}")

asyncio.run(test())
```

Run it:
```bash
cd backend
python test_db.py
```

---

## ✨ Next Steps

1. **Restart backend with new configuration:**
   ```bash
   start-backend.bat
   ```

2. **Verify health endpoint:**
   ```
   http://localhost:8000/health/db
   ```

3. **Test creating data via API:**
   - Go to `http://localhost:8000/docs`
   - Try POST endpoints
   - Check MongoDB Atlas for new records

4. **Monitor in MongoDB Atlas:**
   - Watch collections populate in real-time
   - Verify indexes are created automatically

---

## 📝 Key Files Modified

- `backend/.env` - Updated connection string with proper encoding
- `backend/app/db.py` - Enhanced initialization and health checks
- `backend/app/main.py` - Added startup/shutdown handlers and endpoints

---

## 🚀 Full Data Flow

```
Frontend (React)
    ↓ (API Call)
FastAPI Backend (Port 8000)
    ↓ (Motor - Async MongoDB driver)
MongoDB Atlas (Cloud Database)
    ↓ (Stored as JSON documents)
Collections: orders, staff, menu, etc.
```

---

**Status:** ✅ Ready for data persistence!

Test it now and let me know if you encounter any issues.
