import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
# Get the directory where this file is located
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / '.env')

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .db import init_db, get_db

# Import all route modules
from .routes import settings as settings_router
from .routes import staff as staff_router
from .routes import audit as audit_router
from .routes import menu as menu_router
from .routes import orders as orders_router
from .routes import tables as tables_router
from .routes import inventory as inventory_router
from .routes import customers as customers_router
from .routes import delivery as delivery_router
from .routes import offers as offers_router
from .routes import notifications as notifications_router
from .routes import billing as billing_router
from .routes import analytics as analytics_router
from .routes import recipes as recipes_router

app = FastAPI(title='RMS Backend (FastAPI)')

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event('startup')
async def startup():
    init_db()


# Settings & Security
app.include_router(settings_router.router, prefix='/api/settings')
app.include_router(staff_router.router, prefix='/api/staff')
app.include_router(audit_router.router, prefix='/api/audit')

# Core Operations
app.include_router(menu_router.router, prefix='/api/menu')
app.include_router(orders_router.router, prefix='/api/orders')
app.include_router(tables_router.router, prefix='/api/tables')
app.include_router(inventory_router.router, prefix='/api/inventory')
app.include_router(recipes_router.router, prefix='/api/recipes')

# Customer & Delivery
app.include_router(customers_router.router, prefix='/api/customers')
app.include_router(delivery_router.router, prefix='/api/delivery')

# Marketing & Communications
app.include_router(offers_router.router, prefix='/api/offers')
app.include_router(notifications_router.router, prefix='/api/notifications')

# Billing & Payments
app.include_router(billing_router.router, prefix='/api/billing')

# Analytics
app.include_router(analytics_router.router, prefix='/api/analytics')


# Database Seed Endpoint
@app.post('/api/seed')
async def seed_database(secret: str = ''):
    """Seed the database with sample data. Requires SEED_SECRET env var."""
    from fastapi import HTTPException
    from datetime import datetime
    from passlib.hash import bcrypt
    
    expected_secret = os.getenv('SEED_SECRET', 'seed123')
    if secret != expected_secret:
        raise HTTPException(status_code=403, detail='Invalid secret')
    
    try:
        db = get_db()
    except RuntimeError:
        init_db()
        db = get_db()
    
    results = {"staff": 0, "errors": []}
    
    # Sample Staff
    staff_data = [
        {"name": "Admin User", "email": "admin@restaurant.com", "phone": "+91 98765 00001", "role": "admin", "password": "admin123"},
        {"name": "Manager User", "email": "manager@restaurant.com", "phone": "+91 98765 00002", "role": "manager", "password": "manager123"},
        {"name": "Chef User", "email": "chef@restaurant.com", "phone": "+91 98765 00003", "role": "chef", "password": "chef123"},
        {"name": "Waiter User", "email": "waiter@restaurant.com", "phone": "+91 98765 00004", "role": "waiter", "password": "waiter123"},
        {"name": "Cashier User", "email": "cashier@restaurant.com", "phone": "+91 98765 00005", "role": "cashier", "password": "cashier123"},
        {"name": "Delivery User", "email": "delivery@restaurant.com", "phone": "+91 98765 00006", "role": "delivery", "password": "delivery123"},
    ]
    
    try:
        staff_coll = db.get_collection('staff')
        for staff in staff_data:
            try:
                existing = await staff_coll.find_one({"email": staff["email"].lower()})
                if not existing:
                    await staff_coll.insert_one({
                        "name": staff["name"],
                        "email": staff["email"].lower(),
                        "phone": staff["phone"],
                        "role": staff["role"],
                        "password_hash": bcrypt.hash(staff["password"]),
                        "active": True,
                        "createdAt": datetime.utcnow(),
                    })
                    results["staff"] += 1
            except Exception as e:
                results["errors"].append(f"{staff['email']}: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    
    return {"success": True, "message": "Database seeded", "created": results}


if __name__ == '__main__':
    import uvicorn
    host = os.getenv('FASTAPI_HOST', '0.0.0.0')
    port = int(os.getenv('FASTAPI_PORT', 8000))
    uvicorn.run('app.main:app', host=host, port=port, reload=True)
