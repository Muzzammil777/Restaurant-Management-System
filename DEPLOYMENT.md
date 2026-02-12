# Render Deployment Guide

## Prerequisites
1. A [Render](https://render.com) account
2. A [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (free tier works)

## Quick Deploy (Blueprint)

1. Push this repo to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Click **New** → **Blueprint**
4. Connect your GitHub repo
5. Render will detect `render.yaml` and create both services
6. Set the `MONGODB_URI` environment variable in the backend service settings

## Manual Deploy

### Backend (FastAPI)

1. Create a new **Web Service** on Render
2. Connect to your GitHub repo
3. Configure:
   - **Root Directory**: `backend`
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add environment variable:
   - `MONGODB_URI`: Your MongoDB connection string

### Frontend (React/Vite)

1. Create a new **Static Site** on Render
2. Connect to your GitHub repo
3. Configure:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Add environment variable:
   - `VITE_API_URL`: Your backend URL (e.g., `https://rms-backend.onrender.com/api`)

## MongoDB Atlas Setup

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a database user with read/write access
3. Whitelist all IPs (0.0.0.0/0) for Render access
4. Get your connection string and replace `<password>` with your user's password

Example connection string:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/rms?retryWrites=true&w=majority
```

## Initial Data Setup

After deployment, you can seed the database with sample data:

1. Navigate to the frontend app
2. Go to **Settings** → **Data Seeder**
3. Click to seed sample menu items, ingredients, and recipes

Or use the API directly:
```bash
# Create sample ingredients
curl -X POST https://your-backend.onrender.com/api/inventory \
  -H "Content-Type: application/json" \
  -d '{"name":"Basmati Rice","category":"Grains","stockLevel":50,"unit":"kg","minThreshold":20,"costPerUnit":90}'

# Create sample recipe
curl -X POST https://your-backend.onrender.com/api/recipes \
  -H "Content-Type: application/json" \
  -d '{"menuItemId":"your-menu-item-id","menuItemName":"Chicken Biryani","ingredients":[{"ingredientId":"rice-id","name":"Basmati Rice","amount":0.2,"unit":"kg"}]}'
```

## Troubleshooting

### CORS Issues
The backend is configured to allow all origins. If you still have issues, check that your `VITE_API_URL` is correctly set.

### Database Connection
- Ensure your MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Check that the connection string is correctly formatted
- Verify the database user has the correct permissions

### Build Failures
- Backend: Check Python version compatibility (3.11 recommended)
- Frontend: Ensure all npm dependencies are in `package.json`

## Environment Variables Summary

### Backend
| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `FASTAPI_HOST` | No | Server host (default: 0.0.0.0) |
| `FASTAPI_PORT` | No | Server port (default: 8000) |

### Frontend
| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes | Backend API URL |
