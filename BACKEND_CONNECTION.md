# FastAPI Backend Connection Guide

## Overview
Your Restaurant Management System is now configured to connect the React frontend with the FastAPI backend.

## Configuration Files Created

### 1. **Frontend Environment Variables**
- `.env` - Development environment
- `.env.development` - Development-specific settings
- `.env.production` - Production settings (update with your domain)

**Key Variable:**
```
VITE_API_URL=http://localhost:8000/api
```

### 2. **Backend Configuration**
- Located in: `backend/app/main.py`
- FastAPI server runs on: `http://localhost:8000`
- CORS is enabled for all origins (CORS middleware configured)
- Port configured in `.env.example`: `FASTAPI_PORT=8000`

### 3. **API Routes**
All routes are prefixed with `/api/` and organized by feature:
- `/api/settings` - System settings
- `/api/staff` - Staff management
- `/api/audit` - Audit logs
- `/api/menu` - Menu management
- `/api/orders` - Order management
- `/api/tables` - Table management
- `/api/inventory` - Inventory management
- `/api/customers` - Customer management
- `/api/delivery` - Delivery management
- `/api/offers` - Offers & loyalty
- `/api/notifications` - Notifications
- `/api/billing` - Billing & payments
- `/api/analytics` - Analytics & reports

## How to Run

### Option 1: Start Everything at Once
```bash
start-all.bat
```
This will:
1. Install backend and frontend dependencies
2. Start FastAPI backend on `http://localhost:8000`
3. Start React frontend on `http://localhost:5173`
4. Open both in separate terminal windows

### Option 2: Start Individually

**Backend:**
```bash
start-backend.bat
```
- Starts FastAPI on `http://localhost:8000`
- API documentation: `http://localhost:8000/docs`

**Frontend:**
```bash
cd frontend
npm run dev
```
- Starts React on `http://localhost:5173`

## Frontend API Integration

The frontend uses `src/utils/api.ts` for all API calls:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
```

**Example API call:**
```typescript
const getOrders = async () => {
  return await fetchApi('/orders');
};
```

## Verification

1. **Backend is running:**
   - Navigate to `http://localhost:8000/docs`
   - You should see Swagger UI with all API endpoints

2. **Frontend is running:**
   - Navigate to `http://localhost:5173`
   - You should see the RMS dashboard

3. **Connection is working:**
   - Open browser DevTools (F12)
   - Go to Network tab
   - Perform an action in the app
   - You should see API calls to `http://localhost:8000/api/...`

## Key Features

- ✅ CORS enabled for frontend-backend communication
- ✅ Environment-based API URL configuration
- ✅ User tracking via headers (`x-user-id`, `x-user-name`)
- ✅ Error handling and logging on both sides
- ✅ MongoDB integration ready (connection string in `.env`)
- ✅ Hot reload for both frontend and backend

## Troubleshooting

### Port 8000 already in use
```bash
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### Port 5173 already in use
```bash
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

### Dependencies not installing
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
```

### CORS errors
Check that `VITE_API_URL` in `.env` matches the backend's actual running address.

## Environment Setup

### Development
Update `frontend/.env.development`:
```
VITE_API_URL=http://localhost:8000/api
```

### Production
Update `frontend/.env.production`:
```
VITE_API_URL=https://your-api-domain.com/api
```

Then rebuild:
```bash
npm run build
```

## Next Steps

1. Run `start-all.bat` to start both servers
2. Open `http://localhost:5173` in your browser
3. Check browser DevTools to verify API calls are reaching the backend
4. Monitor `http://localhost:8000/docs` for any API errors
