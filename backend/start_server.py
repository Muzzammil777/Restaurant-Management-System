import os
import sys

# Set environment variable
os.environ['MONGODB_URI'] = 'mongodb+srv://priyadharshini:Ezhilithanya@cluster0.crvutrr.mongodb.net/restaurant_db?retryWrites=true&w=majority'

# Start uvicorn
import subprocess
subprocess.run([sys.executable, '-m', 'uvicorn', 'app.main:app', '--reload', '--host', '0.0.0.0', '--port', '8000'])
