import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
# Get the directory where this file is located
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / '.env')

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .db import init_db, close_db

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
    try:
        init_db()
        print("✅ MongoDB connected successfully")
    except Exception as e:
        print(f"⚠️  MongoDB connection error: {e}")
        print("📝 API will work in read-only mode or with mock data")


@app.on_event('shutdown')
async def shutdown():
    close_db()


# Settings & Security
app.include_router(settings_router.router, prefix='/api/settings')
app.include_router(staff_router.router, prefix='/api/staff')
app.include_router(audit_router.router, prefix='/api/audit')

# Core Operations
app.include_router(menu_router.router, prefix='/api/menu')
app.include_router(orders_router.router, prefix='/api/orders')
app.include_router(tables_router.router, prefix='/api/tables')
app.include_router(inventory_router.router, prefix='/api/inventory')

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


if __name__ == '__main__':
    import uvicorn
    host = os.getenv('FASTAPI_HOST', '0.0.0.0')
    port = int(os.getenv('FASTAPI_PORT', 8000))
    uvicorn.run('app.main:app', host=host, port=port, reload=True)
