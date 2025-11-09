"""
Alternative method to create a test user and get token
Uses Supabase Admin API (requires SERVICE_ROLE_KEY)
"""

import os
import sys
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    print("[ERROR] SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")
    sys.exit(1)

try:
    from supabase import create_client, Client
    import uuid
    import jwt
    import time
    
    print("Creating Test User via Admin API")
    print("=" * 60)
    
    # Create Supabase client with service role key
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    
    # Generate test user data
    test_email = f"test_{int(time.time())}@example.com"
    test_password = "TestPassword123!"
    test_user_id = str(uuid.uuid4())
    
    print(f"\nEmail: {test_email}")
    print(f"Password: {test_password}")
    print(f"User ID: {test_user_id}")
    
    # Method 1: Try using admin API to create user directly
    print("\n1. Attempting to create user via Admin API...")
    try:
        # Note: Supabase Python client doesn't have direct admin API methods
        # We'll need to use the REST API directly
        import requests
        
        admin_url = f"{SUPABASE_URL}/auth/v1/admin/users"
        headers = {
            "apikey": SUPABASE_SERVICE_KEY,
            "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
            "Content-Type": "application/json"
        }
        
        user_data = {
            "email": test_email,
            "password": test_password,
            "email_confirm": True,  # Auto-confirm email
            "user_metadata": {
                "name": "Test User"
            }
        }
        
        response = requests.post(admin_url, json=user_data, headers=headers)
        
        if response.status_code == 200 or response.status_code == 201:
            user_info = response.json()
            print("   [SUCCESS] User created successfully!")
            print(f"   User ID: {user_info.get('id')}")
            
            # Now try to sign in to get token
            print("\n2. Signing in to get JWT token...")
            auth_response = supabase.auth.sign_in_with_password({
                "email": test_email,
                "password": test_password
            })
            
            if auth_response.session:
                token = auth_response.session.access_token
                print("   [SUCCESS] Got JWT token!")
                print(f"\nJWT Token:")
                print(token)
                print("\n[INFO] Copy this token and set it in test_manual_api.py:")
                print(f'   JWT_TOKEN = "{token}"')
                print(f"\nTest Credentials:")
                print(f"   Email: {test_email}")
                print(f"   Password: {test_password}")
                sys.exit(0)
            else:
                print("   [WARNING] Could not get session token")
                sys.exit(1)
        else:
            print(f"   [WARNING] Failed to create user: {response.status_code}")
            print(f"   Error: {response.text}")
            sys.exit(1)
            
    except Exception as e:
        print(f"   [ERROR] Error: {str(e)}")
        sys.exit(1)
        
except ImportError as e:
    print(f"[ERROR] Missing package: {str(e)}")
    print("[INFO] Install required packages: pip install supabase requests PyJWT")
    sys.exit(1)
except Exception as e:
    print(f"[ERROR] Error: {str(e)}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

