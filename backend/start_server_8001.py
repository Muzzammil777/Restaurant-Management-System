import os
import sys

# Set environment variable
os.environ['MONGODB_URI'] = 'mongodb+srv://priyadharshini:Ezhilithanya@cluster0.crvutrr.mongodb.net/restaurant_db?retryWrites=true&w=majority'

# Start uvicorn on port 8001
import subprocess
subprocess.run([sys.executable, '-m', 'uvicorn', 'app.main:app', '--reload', '--host', '127.0.0.1', '--port', '8001'])
