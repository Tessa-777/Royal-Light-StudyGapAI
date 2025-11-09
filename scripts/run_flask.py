#!/usr/bin/env python
"""
Run Flask development server with proper logging configuration.

This script ensures logs are visible in the terminal.
"""
import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Set Flask environment to development if not set
if not os.getenv("FLASK_ENV"):
    os.environ["FLASK_ENV"] = "development"

# Import Flask app
from backend.app import app

if __name__ == "__main__":
    # Get host and port from environment or use defaults
    host = os.getenv("FLASK_RUN_HOST", "127.0.0.1")
    port = int(os.getenv("FLASK_RUN_PORT", 5000))
    
    print("=" * 60)
    print("Starting Flask development server...")
    print(f"Host: {host}")
    print(f"Port: {port}")
    print(f"Debug mode: {app.config.get('DEBUG', False)}")
    print("=" * 60)
    print("Backend logs will appear below:")
    print("=" * 60)
    print()
    
    # Run Flask app
    app.run(host=host, port=port, debug=True, use_reloader=True)

