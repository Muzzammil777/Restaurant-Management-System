@echo off
REM Purchase Record System Test Script
REM Tests if the purchase records are being properly stored in MongoDB

echo.
echo ==========================================
echo Purchase Records - Database Connection Test
echo ==========================================
echo.

REM Check if backend is running by trying to fetch inventory
echo [1/3] Testing Backend Connection...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:8000/api/inventory' -Method GET -TimeoutSec 5 -ErrorAction Stop; Write-Host '[✓] Backend is running on port 8000' -ForegroundColor Green } catch { Write-Host '[✗] Backend is NOT running. Start it first with: python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000' -ForegroundColor Red; exit 1 }"

if %ERRORLEVEL% neq 0 goto backend_error

REM Test purchase endpoint
echo.
echo [2/3] Testing Purchase API Endpoint...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:8000/api/inventory/purchases/all' -Method GET -TimeoutSec 5 -ErrorAction Stop; $data = $response.Content | ConvertFrom-Json; Write-Host '[✓] Purchase endpoint is accessible' -ForegroundColor Green; Write-Host ('   Found ' + $data.Count + ' existing purchase records') -ForegroundColor Cyan } catch { Write-Host '[✗] Purchase endpoint not responding' -ForegroundColor Red; exit 1 }"

if %ERRORLEVEL% neq 0 goto purchase_error

REM Test MongoDB connection by checking ingredients (which are stored in MongoDB)
echo.
echo [3/3] Testing MongoDB Connection...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:8000/api/inventory/stats' -Method GET -TimeoutSec 5 -ErrorAction Stop; $data = $response.Content | ConvertFrom-Json; Write-Host '[✓] MongoDB connection is working' -ForegroundColor Green; Write-Host ('   Total ingredients: ' + $data.total) -ForegroundColor Cyan; Write-Host ('   Total value: ₹' + $data.totalValue) -ForegroundColor Cyan } catch { Write-Host '[✗] MongoDB connection failed' -ForegroundColor Red; exit 1 }"

if %ERRORLEVEL% neq 0 goto mongo_error

echo.
echo ==========================================
echo All Tests Passed! ✓
echo ==========================================
echo.
echo The system is ready to record purchases to the database.
echo.
echo Next Steps:
echo 1. Open the frontend application
echo 2. Go to Inventory Management
echo 3. Click "Add Purchase"
echo 4. Fill in the purchase details and save
echo 5. Verify the purchase appears in the Purchase Records tab
echo 6. Check MongoDB Atlas to confirm data storage
echo.
echo Visit: https://cloud.mongodb.com/
echo Database: restaurant_db
echo Collection: purchases
echo.

goto end

:backend_error
echo.
echo Backend Connection Failed!
echo Make sure to start the backend first:
echo   cd backend
echo   python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
echo.
goto end

:purchase_error
echo.
echo Purchase Endpoint Failed!
echo The backend might not have the inventory module loaded.
echo.
goto end

:mongo_error
echo.
echo MongoDB Connection Failed!
echo Check:
echo 1. MongoDB Atlas cluster is running
echo 2. Connection string in backend\.env is correct
echo 3. Network connectivity to MongoDB Atlas
echo.
goto end

:end
pause
