#!/usr/bin/env python3
import os
import json
import uuid
import jwt
from datetime import datetime, timedelta
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import pymongo
from bson import json_util, ObjectId
import redis
from apscheduler.schedulers.background import BackgroundScheduler
import bcrypt

# Load environment variables
load_dotenv()

# Create Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# JWT Secret
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key-here")
JWT_EXPIRATION = int(os.getenv("JWT_EXPIRATION", "86400"))  # 24 hours in seconds

# Connect to MongoDB
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
mongo_client = pymongo.MongoClient(MONGO_URI)
db = mongo_client["instagram_automation"]
users_collection = db["users"]
accounts_collection = db["instagram_accounts"]
campaigns_collection = db["campaigns"]
leads_collection = db["leads"]
tasks_collection = db["tasks"]

# Redis for job queue
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
redis_client = redis.Redis.from_url(REDIS_URL)

# Initialize scheduler
scheduler = BackgroundScheduler()
scheduler.start()

# Helper functions
def parse_json(data):
    return json.loads(json_util.dumps(data))

def generate_token(user_id):
    """Generate a JWT token for authentication"""
    payload = {
        'user_id': str(user_id),
        'exp': datetime.utcnow() + timedelta(seconds=JWT_EXPIRATION)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm='HS256')

def hash_password(password):
    """Hash a password for storage"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(stored_password, provided_password):
    """Verify a password against its hash"""
    return bcrypt.checkpw(provided_password.encode('utf-8'), stored_password.encode('utf-8'))

def schedule_campaign(campaign_id):
    """Schedule a campaign for processing"""
    try:
        campaign = campaigns_collection.find_one({"_id": ObjectId(campaign_id)})
        if not campaign:
            app.logger.error(f"Campaign {campaign_id} not found when scheduling")
            return
        
        # Check if campaign has targets
        if not campaign.get('targets', []):
            app.logger.info(f"Campaign {campaign_id} has no targets, not scheduling tasks yet")
            return
        
        # Add a task to the queue for each account in the campaign
        for account_id in campaign.get('account_ids', []):
            task_id = str(uuid.uuid4())
            task = {
                "id": task_id,
                "type": "process_campaign",
                "campaign_id": str(campaign_id),
                "account_id": str(account_id),
                "status": "pending",
                "created_at": datetime.now(),
                "updated_at": datetime.now()
            }
            
            tasks_collection.insert_one(task)
            
            try:
                # Add task to Redis queue
                redis_client.lpush("tasks", json.dumps({"task_id": task_id}))
                app.logger.info(f"Task {task_id} added to Redis queue for campaign {campaign_id}, account {account_id}")
            except Exception as redis_err:
                app.logger.error(f"Redis error when scheduling task: {redis_err}")
                # Update task status to indicate Redis failure
                tasks_collection.update_one(
                    {"id": task_id},
                    {"$set": {"status": "redis_error", "error": str(redis_err)}}
                )
    except Exception as e:
        app.logger.error(f"Error scheduling campaign {campaign_id}: {e}")

@app.route('/', methods=['GET'])
def index():
    """Root endpoint that serves a basic HTML page"""
    return """
    <html>
      <head>
        <title>AutoDM API</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          h1 { color: #333; }
          .endpoint { background: #f5f5f5; padding: 10px; margin: 10px 0; border-radius: 5px; }
          code { background: #eee; padding: 2px 5px; border-radius: 3px; }
        </style>
      </head>
      <body>
        <h1>AutoDM API Server</h1>
        <p>Your Instagram DM automation API is running successfully!</p>
        
        <h2>Available Endpoints:</h2>
        <div class="endpoint">
          <p><code>GET /api/health</code> - Check API status</p>
        </div>
        <div class="endpoint">
          <p><code>GET /api/instagram_accounts</code> - List Instagram accounts</p>
        </div>
        <div class="endpoint">
          <p><code>GET /api/campaigns</code> - List campaigns</p>
        </div>
        
        <p><a href="/api/health">Check API status</a></p>
      </body>
    </html>
    """

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "ok", "timestamp": datetime.now().isoformat()})

@app.route('/api/users', methods=['POST'])
def create_user():
    """Create a new user account"""
    data = request.json
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({"error": "Email and password are required"}), 400
    
    # Check if user already exists
    if users_collection.find_one({"email": data['email']}):
        return jsonify({"error": "User already exists"}), 409
    
    # Create new user
    new_user = {
        "email": data['email'],
        "password": data['password'],  # In production, hash this password
        "name": data.get('name', ''),
        "created_at": datetime.now(),
        "updated_at": datetime.now(),
        "plan": "free",
        "seats": 1
    }
    
    result = users_collection.insert_one(new_user)
    return jsonify({"id": str(result.inserted_id), "message": "User created successfully"}), 201

@app.route('/api/instagram_accounts', methods=['GET'])
def list_instagram_accounts():
    """List all Instagram accounts for a user"""
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify([]), 200
    
    token = auth_header.split(' ')[1]
    
    try:
        # Decode and verify token
        payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        user_id = payload.get('user_id')
        
        accounts = list(accounts_collection.find({"user_id": user_id}))
        
        # Don't return passwords in the response
        for account in accounts:
            if 'password' in account:
                account['password'] = '********'
        
        return jsonify(parse_json(accounts)), 200
    
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return jsonify([]), 200

@app.route('/api/instagram_accounts', methods=['POST'])
def add_instagram_account():
    """Add a new Instagram account"""
    data = request.json
    if not data or not data.get('username') or not data.get('password') or not data.get('user_id'):
        return jsonify({"error": "Username, password and user_id are required"}), 400
    
    # Verify that the Instagram account is valid
    is_valid, validation_message = verify_instagram_account(data['username'], data['password'])
    if not is_valid:
        return jsonify({"error": f"Invalid Instagram account: {validation_message}"}), 400
    
    # Create new Instagram account
    new_account = {
        "user_id": data['user_id'],
        "username": data['username'],
        "password": data['password'],  # In production, encrypt this
        "created_at": datetime.now(),
        "updated_at": datetime.now(),
        "status": "active",
        "last_login": None,
        "proxy": None
    }
    
    result = accounts_collection.insert_one(new_account)
    return jsonify({"id": str(result.inserted_id), "message": "Instagram account added successfully"}), 201

def verify_instagram_account(username, password):
    """Verify if an Instagram account is valid
    
    In a full implementation, this would actually check the credentials with Instagram
    
    Returns:
        tuple: (is_valid: bool, message: str)
    """
    try:
        # For now, just do basic validation and return success
        # In production, this should actually verify credentials with Instagram
        
        # Basic validation
        if not username or len(username) < 3:
            return False, "Username is too short"
            
        if not password or len(password) < 6:
            return False, "Password is too short"
            
        # Return success for now
        # In production, replace this with actual verification logic
        return True, "Account accepted (verification disabled)"
        
    except Exception as e:
        app.logger.error(f"Error in Instagram account verification: {e}")
        return False, f"Error verifying account: {str(e)}"

@app.route('/api/instagram_accounts/<account_id>', methods=['DELETE'])
def delete_instagram_account(account_id):
    """Delete an Instagram account"""
    # Check for invalid account ID
    if not account_id or account_id == 'undefined' or account_id == '[object Object]':
        return jsonify({"error": "Invalid account ID provided"}), 400
    
    try:
        # Convert account_id to ObjectId
        account_object_id = ObjectId(account_id)
        
        # Verify account exists
        account = accounts_collection.find_one({"_id": account_object_id})
        if not account:
            return jsonify({"error": "Account not found"}), 404
        
        # Check for active campaigns using this account
        active_campaigns = campaigns_collection.find_one({
            "account_ids": account_id,
            "status": "active"
        })
        
        if active_campaigns:
            return jsonify({"error": "Cannot delete account with active campaigns"}), 400
        
        # Delete the account
        result = accounts_collection.delete_one({"_id": account_object_id})
        
        if result.deleted_count == 0:
            return jsonify({"error": "Failed to delete account"}), 500
            
        return jsonify({"message": "Instagram account deleted successfully"}), 200
        
    except Exception as e:
        app.logger.error(f"Error deleting account: {e}")
        return jsonify({"error": f"Error deleting account: {str(e)}"}), 500

@app.route('/api/instagram_accounts/<account_id>/status', methods=['PUT'])
def update_account_status(account_id):
    """Update Instagram account status (active/paused)"""
    data = request.json
    if not data or 'status' not in data:
        return jsonify({"error": "Status is required"}), 400
    
    valid_statuses = ["active", "paused"]
    if data['status'] not in valid_statuses:
        return jsonify({"error": f"Status must be one of: {', '.join(valid_statuses)}"}), 400
    
    # Update account status
    accounts_collection.update_one(
        {"_id": ObjectId(account_id)},
        {"$set": {"status": data['status'], "updated_at": datetime.now()}}
    )
    
    return jsonify({"message": f"Account status updated to {data['status']}"}), 200

@app.route('/api/campaigns', methods=['POST'])
def create_campaign():
    """Create a new outreach campaign"""
    try:
        data = request.json
        app.logger.info(f"Campaign creation request data: {data}")
        
        if not data or not data.get('name') or not data.get('user_id') or not data.get('message'):
            return jsonify({"error": "Name, user_id, and message are required"}), 400
        
        # Validate account IDs
        account_ids = data.get('account_ids', [])
        if not account_ids:
            return jsonify({"error": "At least one account_id is required"}), 400
        
        # Process account IDs to ensure they are valid strings
        validated_account_ids = []
        for account_id in account_ids:
            if isinstance(account_id, dict) and '_id' in account_id:
                # Handle case when full account object is passed
                account_id = account_id['_id']
            
            # Ensure it's a string
            account_id_str = str(account_id)
            app.logger.info(f"Processing account ID: {account_id_str}, original type: {type(account_id)}")
            
            try:
                # Verify the account exists and belongs to the user
                account = accounts_collection.find_one({
                    "_id": ObjectId(account_id_str),
                    "user_id": data['user_id']
                })
                
                if account:
                    validated_account_ids.append(account_id_str)
                else:
                    return jsonify({"error": f"Account {account_id_str} not found or doesn't belong to this user"}), 400
            except Exception as account_err:
                app.logger.error(f"Error validating account {account_id_str}: {account_err}")
                return jsonify({"error": f"Invalid account ID format: {account_id}"}), 400
        
        if not validated_account_ids:
            return jsonify({"error": "No valid accounts selected"}), 400
        
        # Create new campaign with validated account IDs
        new_campaign = {
            "user_id": data['user_id'],
            "name": data['name'],
            "account_ids": validated_account_ids,
            "message": data['message'],
            "created_at": datetime.now(),
            "updated_at": datetime.now(),
            "status": "active",
            "targeting": data.get('targeting', {}),
            "schedule": data.get('schedule', {"daily_limit": 50, "time_window": {"start": "09:00", "end": "18:00"}}),
            "stats": {
                "sent": 0,
                "pending": 0,
                "failed": 0
            },
            "targets": [],  # Initialize with empty targets
            "account_distribution": "round_robin"  # How to distribute targets across accounts
        }
        
        result = campaigns_collection.insert_one(new_campaign)
        campaign_id = str(result.inserted_id)
        
        # Schedule the campaign (will skip since targets are empty)
        try:
            schedule_campaign(campaign_id)
        except Exception as schedule_err:
            app.logger.error(f"Error scheduling campaign {campaign_id}: {schedule_err}")
            # Continue anyway as this is non-critical at creation time
        
        return jsonify({"id": campaign_id, "message": "Campaign created successfully"}), 201
    
    except Exception as e:
        app.logger.error(f"Error creating campaign: {e}")
        error_details = str(e)
        error_type = type(e).__name__
        return jsonify({
            "error": f"Error creating campaign: {error_details}",
            "error_type": error_type
        }), 500

@app.route('/api/campaigns/<campaign_id>/accounts', methods=['PUT'])
def update_campaign_accounts(campaign_id):
    """Update accounts assigned to a campaign"""
    data = request.json
    if not data or 'account_ids' not in data:
        return jsonify({"error": "account_ids is required"}), 400
    
    # Get campaign
    campaign = campaigns_collection.find_one({"_id": ObjectId(campaign_id)})
    if not campaign:
        return jsonify({"error": "Campaign not found"}), 404
    
    # Verify all accounts exist and belong to campaign owner
    user_id = campaign['user_id']
    for account_id in data['account_ids']:
        account = accounts_collection.find_one({
            "_id": ObjectId(account_id),
            "user_id": user_id
        })
        if not account:
            return jsonify({"error": f"Account {account_id} not found or doesn't belong to campaign owner"}), 400
    
    # Update the campaign with new accounts
    campaigns_collection.update_one(
        {"_id": ObjectId(campaign_id)},
        {
            "$set": {
                "account_ids": data['account_ids'],
                "updated_at": datetime.now()
            }
        }
    )
    
    return jsonify({"message": "Campaign accounts updated successfully"}), 200

@app.route('/api/campaigns/<campaign_id>/targets', methods=['POST'])
def add_campaign_targets(campaign_id):
    """Add target profiles to a campaign"""
    data = request.json
    if not data or not data.get('targets'):
        return jsonify({"error": "Target profiles are required"}), 400
    
    # Process each target profile
    targets = []
    for target in data['targets']:
        if isinstance(target, str):
            # If target is just a username string
            target_obj = {
                "username": target,
                "status": "pending",
                "created_at": datetime.now()
            }
        else:
            # If target is an object with more data
            target_obj = {
                "username": target['username'],
                "status": "pending",
                "created_at": datetime.now(),
                "data": target.get('data', {}),
                "assigned_account": None  # Will be assigned when processed
            }
        
        targets.append(target_obj)
    
    # Add targets to the campaign
    campaigns_collection.update_one(
        {"_id": ObjectId(campaign_id)},
        {
            "$push": {"targets": {"$each": targets}},
            "$inc": {"stats.pending": len(targets)},
            "$set": {"updated_at": datetime.now()}
        }
    )
    
    return jsonify({"message": f"Added {len(targets)} targets to campaign", "campaign_id": campaign_id}), 200

@app.route('/api/campaigns/<campaign_id>/status', methods=['PUT'])
def update_campaign_status(campaign_id):
    """Update campaign status (active/paused/stopped)"""
    data = request.json
    if not data or not data.get('status'):
        return jsonify({"error": "Status is required"}), 400
    
    # Validate status
    valid_statuses = ["active", "paused", "stopped"]
    if data['status'] not in valid_statuses:
        return jsonify({"error": f"Status must be one of: {', '.join(valid_statuses)}"}), 400
    
    # Update campaign status
    campaigns_collection.update_one(
        {"_id": ObjectId(campaign_id)},
        {
            "$set": {
                "status": data['status'],
                "updated_at": datetime.now()
            }
        }
    )
    
    return jsonify({"message": f"Campaign status updated to {data['status']}", "campaign_id": campaign_id}), 200

@app.route('/api/campaigns', methods=['GET'])
def list_campaigns():
    """List all campaigns for a user"""
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify([]), 200
    
    token = auth_header.split(' ')[1]
    
    try:
        # Decode and verify token
        payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        user_id = payload.get('user_id')
        
        campaigns = list(campaigns_collection.find({"user_id": user_id}))
        return jsonify(parse_json(campaigns)), 200
    
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return jsonify([]), 200

@app.route('/api/leads', methods=['GET'])
def list_leads():
    """List all leads for a user"""
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify([]), 200
    
    token = auth_header.split(' ')[1]
    
    try:
        # Decode and verify token
        payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        user_id = payload.get('user_id')
        
        leads = list(leads_collection.find({"user_id": user_id}))
        return jsonify(parse_json(leads)), 200
    
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return jsonify([]), 200

@app.route('/api/sequences', methods=['POST'])
def create_sequence():
    """Create a new message sequence"""
    data = request.json
    if not data or not data.get('user_id') or not data.get('name') or not data.get('steps'):
        return jsonify({"error": "user_id, name, and steps are required"}), 400
    
    # Import the MessageSequenceManager
    from sequence_manager import MessageSequenceManager
    
    # Create the sequence
    sequence_id = MessageSequenceManager.create_sequence(
        user_id=data['user_id'],
        name=data['name'],
        steps=data['steps']
    )
    
    return jsonify({"id": sequence_id, "message": "Message sequence created successfully"}), 201

@app.route('/api/sequences', methods=['GET'])
def list_sequences():
    """List all sequences for a user"""
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify([]), 200
    
    token = auth_header.split(' ')[1]
    
    try:
        # Decode and verify token
        payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        user_id = payload.get('user_id')
        
        # Import the MessageSequenceManager
        from sequence_manager import MessageSequenceManager
        
        # Get all sequences for the user
        sequences = MessageSequenceManager.list_sequences(user_id)
        return jsonify(parse_json(sequences)), 200
    
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return jsonify([]), 200

@app.route('/api/sequences/<sequence_id>', methods=['GET'])
def get_sequence(sequence_id):
    """Get a sequence by ID"""
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"error": "Unauthorized"}), 401
    
    token = auth_header.split(' ')[1]
    
    try:
        # Decode and verify token
        payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        user_id = payload.get('user_id')
        
        # Import the MessageSequenceManager
        from sequence_manager import MessageSequenceManager
        
        sequence = MessageSequenceManager.get_sequence(sequence_id)
        if not sequence:
            return jsonify({"error": "Sequence not found"}), 404
        
        return jsonify(parse_json(sequence)), 200
    
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return jsonify({"error": "Unauthorized"}), 401

@app.route('/api/sequences/<sequence_id>', methods=['PUT'])
def update_sequence(sequence_id):
    """Update a sequence"""
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"error": "Unauthorized"}), 401
    
    token = auth_header.split(' ')[1]
    
    try:
        # Decode and verify token
        payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        user_id = payload.get('user_id')
        
        # Import the MessageSequenceManager
        from sequence_manager import MessageSequenceManager
        
        data = request.json
        if not data:
            return jsonify({"error": "No update data provided"}), 400
        
        success = MessageSequenceManager.update_sequence(sequence_id, data)
        if not success:
            return jsonify({"error": "Failed to update sequence"}), 404
        
        return jsonify({"message": "Sequence updated successfully"}), 200
    
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return jsonify({"error": "Unauthorized"}), 401

@app.route('/api/sequences/<sequence_id>', methods=['DELETE'])
def delete_sequence(sequence_id):
    """Delete a sequence"""
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"error": "Unauthorized"}), 401
    
    token = auth_header.split(' ')[1]
    
    try:
        # Decode and verify token
        payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        user_id = payload.get('user_id')
        
        # Import the MessageSequenceManager
        from sequence_manager import MessageSequenceManager
        
        success = MessageSequenceManager.delete_sequence(sequence_id)
        if not success:
            return jsonify({"error": "Sequence not found"}), 404
        
        return jsonify({"message": "Sequence deleted successfully"}), 200
    
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return jsonify({"error": "Unauthorized"}), 401

@app.route('/api/campaigns/<campaign_id>/sequence', methods=['PUT'])
def assign_sequence_to_campaign(campaign_id):
    """Assign a sequence to a campaign"""
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"error": "Unauthorized"}), 401
    
    token = auth_header.split(' ')[1]
    
    try:
        # Decode and verify token
        payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        user_id = payload.get('user_id')
        
        data = request.json
        if not data or not data.get('sequence_id'):
            return jsonify({"error": "sequence_id is required"}), 400
        
        # Verify the campaign exists
        campaign = campaigns_collection.find_one({"_id": ObjectId(campaign_id)})
        if not campaign:
            return jsonify({"error": "Campaign not found"}), 404
        
        # Import the MessageSequenceManager
        from sequence_manager import MessageSequenceManager
        
        # Verify the sequence exists
        sequence = MessageSequenceManager.get_sequence(data['sequence_id'])
        if not sequence:
            return jsonify({"error": "Sequence not found"}), 404
        
        # Make sure the sequence belongs to the same user as the campaign
        if sequence['user_id'] != user_id:
            return jsonify({"error": "Sequence does not belong to campaign owner"}), 403
        
        # Assign the sequence to the campaign
        campaigns_collection.update_one(
            {"_id": ObjectId(campaign_id)},
            {
                "$set": {
                    "sequence_id": data['sequence_id'],
                    "updated_at": datetime.now()
                }
            }
        )
        
        return jsonify({"message": "Sequence assigned to campaign successfully"}), 200
    
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return jsonify({"error": "Unauthorized"}), 401

@app.route('/api/leads/<lead_id>/response', methods=['PUT'])
def update_lead_response(lead_id):
    """Update a lead's response status"""
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"error": "Unauthorized"}), 401
    
    token = auth_header.split(' ')[1]
    
    try:
        # Decode and verify token
        payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        user_id = payload.get('user_id')
        
        # Validate response status
        data = request.json
        if not data or 'response_status' not in data:
            return jsonify({"error": "response_status is required"}), 400
        
        valid_statuses = ["none", "seen", "responded", "not_interested"]
        if data['response_status'] not in valid_statuses:
            return jsonify({"error": f"response_status must be one of: {', '.join(valid_statuses)}"}), 400
        
        # Update the lead
        result = leads_collection.update_one(
            {"_id": ObjectId(lead_id)},
            {
                "$set": {
                    "response_status": data['response_status'],
                    "response_updated_at": datetime.now(),
                    "updated_at": datetime.now(),
                    "response_details": data.get('details', {})
                }
            }
        )
        
        if result.matched_count == 0:
            return jsonify({"error": "Lead not found"}), 404
        
        return jsonify({"message": "Lead response status updated successfully"}), 200
    
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return jsonify({"error": "Unauthorized"}), 401

# Authentication routes
@app.route('/api/auth/register', methods=['POST'])
def register():
    """Register a new user"""
    data = request.json
    if not data:
        return jsonify({"message": "No data provided"}), 400
    
    print("Registration request data:", data)  # Log the request data for debugging
    
    # Check required fields
    if not data.get('email'):
        return jsonify({"message": "Email is required"}), 400
    if not data.get('password'):
        return jsonify({"message": "Password is required"}), 400
    
    # Name is optional but we'll use it if provided
    name = data.get('name', '')
    
    # Check if user already exists
    if users_collection.find_one({"email": data['email']}):
        return jsonify({"message": "User already exists with this email"}), 409
    
    # Create new user with hashed password
    new_user = {
        "email": data['email'],
        "password": hash_password(data['password']),
        "name": name,
        "created_at": datetime.now(),
        "updated_at": datetime.now(),
        "plan": "free",
        "seats": 1
    }
    
    result = users_collection.insert_one(new_user)
    user_id = result.inserted_id
    
    # Generate token
    token = generate_token(user_id)
    
    # Return user info and token
    user_info = {
        "id": str(user_id),
        "email": new_user["email"],
        "name": new_user["name"],
        "plan": new_user["plan"]
    }
    
    return jsonify({"user": user_info, "token": token}), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    """Login a user"""
    data = request.json
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({"message": "Email and password are required"}), 400
    
    # Find user by email
    user = users_collection.find_one({"email": data['email']})
    if not user:
        return jsonify({"message": "Invalid email or password"}), 401
    
    # Verify password
    if not verify_password(user['password'], data['password']):
        return jsonify({"message": "Invalid email or password"}), 401
    
    # Generate token
    token = generate_token(user['_id'])
    
    # Return user info and token
    user_info = {
        "id": str(user['_id']),
        "email": user['email'],
        "name": user.get('name', ''),
        "plan": user.get('plan', 'free')
    }
    
    return jsonify({"user": user_info, "token": token}), 200

@app.route('/api/auth/me', methods=['GET'])
def get_current_user():
    """Get current user info from token"""
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"message": "Unauthorized"}), 401
    
    token = auth_header.split(' ')[1]
    
    try:
        # Decode and verify token
        payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        user_id = payload.get('user_id')
        
        # Get user from database
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            return jsonify({"message": "User not found"}), 404
        
        # Return user info
        user_info = {
            "id": str(user['_id']),
            "email": user['email'],
            "name": user.get('name', ''),
            "plan": user.get('plan', 'free')
        }
        
        return jsonify({"user": user_info}), 200
    
    except jwt.ExpiredSignatureError:
        return jsonify({"message": "Token expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"message": "Invalid token"}), 401

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    """Logout a user - client side handles token removal"""
    return jsonify({"message": "Successfully logged out"}), 200

# Engagement endpoints
@app.route('/api/engagement/posts', methods=['GET'])
def get_engagement_posts():
    """Get posts for engagement based on hashtags or user criteria"""
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"message": "Unauthorized"}), 401
    
    token = auth_header.split(' ')[1]
    
    try:
        # Decode and verify token
        payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        user_id = payload.get('user_id')
        
        # Get query parameters
        hashtags = request.args.get('hashtags', '')
        username = request.args.get('username', '')
        account_id = request.args.get('account_id')
        
        if not account_id:
            return jsonify({"message": "Account ID is required"}), 400
            
        # This would be implemented to fetch real posts from Instagram
        # For now, return mock data
        posts = [
            {
                "id": "1",
                "username": "photography_lover",
                "image_url": "https://images.unsplash.com/photo-1516410529446-2c777cb7366d",
                "caption": "Beautiful sunset view! 🌅 #photography #nature",
                "likes": 245,
                "has_liked": False,
                "comments": 12,
                "timestamp": "2025-04-08T15:00:00Z"
            },
            {
                "id": "2",
                "username": "travel_adventures",
                "image_url": "https://images.unsplash.com/photo-1498307833015-e7b400441eb8",
                "caption": "Exploring new places 🌎 #travel #adventure",
                "likes": 189,
                "has_liked": True,
                "comments": 8,
                "timestamp": "2025-04-09T12:30:00Z"
            },
            {
                "id": "3",
                "username": "food_enthusiast",
                "image_url": "https://images.unsplash.com/photo-1484723091739-30a097e8f929",
                "caption": "Homemade pasta! 🍝 #foodie #cooking",
                "likes": 312,
                "has_liked": False,
                "comments": 17,
                "timestamp": "2025-04-10T09:15:00Z"
            }
        ]
        
        return jsonify(posts), 200
        
    except jwt.ExpiredSignatureError:
        return jsonify({"message": "Token expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"message": "Invalid token"}), 401

@app.route('/api/engagement/like', methods=['POST'])
def like_post():
    """Like or unlike a post on Instagram"""
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"message": "Unauthorized"}), 401
    
    token = auth_header.split(' ')[1]
    
    try:
        # Decode and verify token
        payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        user_id = payload.get('user_id')
        
        data = request.json
        if not data or not data.get('post_id') or not data.get('account_id'):
            return jsonify({"message": "Post ID and account ID are required"}), 400
            
        post_id = data.get('post_id')
        account_id = data.get('account_id')
        is_unlike = data.get('unlike', False)
        
        # This would interact with Instagram to like/unlike the post
        # For now, we'll simulate success
        
        # Create a log entry
        engagement_log = {
            "user_id": user_id,
            "account_id": account_id,
            "post_id": post_id,
            "action": "unlike" if is_unlike else "like",
            "timestamp": datetime.now(),
            "success": True
        }
        
        # Store in database (would be implemented in production)
        # db.engagement_logs.insert_one(engagement_log)
        
        return jsonify({
            "success": True,
            "message": f"Post {post_id} successfully {'unliked' if is_unlike else 'liked'}"
        }), 200
        
    except jwt.ExpiredSignatureError:
        return jsonify({"message": "Token expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"message": "Invalid token"}), 401

@app.route('/api/engagement/comment', methods=['POST'])
def post_comment():
    """Post a comment on an Instagram post"""
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"message": "Unauthorized"}), 401
    
    token = auth_header.split(' ')[1]
    
    try:
        # Decode and verify token
        payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        user_id = payload.get('user_id')
        
        data = request.json
        if not data or not data.get('post_id') or not data.get('account_id') or not data.get('comment'):
            return jsonify({"message": "Post ID, account ID, and comment are required"}), 400
            
        post_id = data.get('post_id')
        account_id = data.get('account_id')
        comment_text = data.get('comment')
        schedule_time = data.get('schedule_time')
        
        # Create a comment task
        comment_task = {
            "user_id": user_id,
            "account_id": account_id,
            "post_id": post_id,
            "comment": comment_text,
            "created_at": datetime.now(),
            "scheduled_for": schedule_time,
            "status": "pending" if schedule_time else "queued"
        }
        
        # Store in database (would be implemented in production)
        # task_id = db.comment_tasks.insert_one(comment_task).inserted_id
        
        # If immediate posting (no schedule), add to task queue
        if not schedule_time:
            # In production, this would add to a task queue
            # redis_client.lpush("tasks", json.dumps({"task_id": str(task_id), "type": "post_comment"}))
            pass
        
        return jsonify({
            "success": True,
            "message": f"Comment {'scheduled' if schedule_time else 'queued'} successfully",
            "task_id": "mock_task_id"  # Would be real task ID in production
        }), 200
        
    except jwt.ExpiredSignatureError:
        return jsonify({"message": "Token expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"message": "Invalid token"}), 401

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.getenv('PORT', 5001)), debug=True) 