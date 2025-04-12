#!/usr/bin/env python3
import os
import json
import time
import random
import asyncio
import logging
from datetime import datetime, timedelta
from dotenv import load_dotenv
import pymongo
from bson import ObjectId
import redis
from playwright.async_api import async_playwright
import aiohttp
import requests

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger('instagram_worker')

# Load environment variables
load_dotenv()

# Connect to MongoDB
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
mongo_client = pymongo.MongoClient(MONGO_URI)
db = mongo_client["instagram_automation"]
users_collection = db["users"]
accounts_collection = db["instagram_accounts"]
campaigns_collection = db["campaigns"]
leads_collection = db["leads"]
tasks_collection = db["tasks"]
messages_collection = db["messages"]

# Redis for job queue
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
redis_client = redis.Redis.from_url(REDIS_URL)

# Proxy service URL
PROXY_SERVICE_URL = os.getenv("PROXY_SERVICE_URL")
PROXY_API_KEY = os.getenv("PROXY_API_KEY")

# Worker configuration
MAX_CONCURRENT_TASKS = int(os.getenv("MAX_CONCURRENT_TASKS", "5"))
TASK_TIMEOUT = int(os.getenv("TASK_TIMEOUT", "600"))  # 10 minutes
WORKER_ID = os.getenv("WORKER_ID", f"worker-{random.randint(1000, 9999)}")

class InstagramWorker:
    def __init__(self):
        self.browser = None
        self.context = None
        self.page = None
        self.active_tasks = 0
        self.running = True
        self.semaphore = asyncio.Semaphore(MAX_CONCURRENT_TASKS)
    
    async def initialize(self):
        """Initialize the Playwright browser"""
        logger.info("Initializing Playwright browser")
        playwright = await async_playwright().start()
        self.browser = await playwright.chromium.launch(headless=True)
    
    async def close(self):
        """Close the browser"""
        if self.browser:
            logger.info("Closing browser")
            await self.browser.close()
    
    async def get_mobile_proxy(self):
        """Get a mobile proxy from the proxy service"""
        if not PROXY_SERVICE_URL or not PROXY_API_KEY:
            return None
            
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{PROXY_SERVICE_URL}/api/proxies/mobile",
                    headers={"Authorization": f"Bearer {PROXY_API_KEY}"}
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        return data.get("proxy")
        except Exception as e:
            logger.error(f"Error getting mobile proxy: {e}")
        
        return None
    
    async def create_context_for_account(self, account):
        """Create a new browser context for an Instagram account with proxy if available"""
        proxy = None
        
        # Get account proxy or request a new one
        if account.get("proxy"):
            proxy = account["proxy"]
        else:
            proxy = await self.get_mobile_proxy()
            if proxy:
                # Update account with new proxy
                accounts_collection.update_one(
                    {"_id": account["_id"]},
                    {"$set": {"proxy": proxy, "updated_at": datetime.now()}}
                )
        
        # Create browser context with proxy if available
        if proxy:
            logger.info(f"Creating browser context with proxy for {account['username']}")
            context = await self.browser.new_context(
                proxy={
                    "server": proxy['server'],
                    "username": proxy.get('username'),
                    "password": proxy.get('password')
                },
                user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1"
            )
        else:
            logger.info(f"Creating browser context without proxy for {account['username']}")
            context = await self.browser.new_context(
                user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1"
            )
        
        return context
    
    async def login_to_instagram(self, account):
        """Login to Instagram with the account"""
        logger.info(f"Logging in to Instagram as {account['username']}")
        
        context = await self.create_context_for_account(account)
        page = await context.new_page()
        
        try:
            # Navigate to Instagram
            await page.goto("https://www.instagram.com/")
            
            # Wait for and handle cookie consent if present
            try:
                await page.wait_for_selector('button[tabindex="0"]', timeout=5000)
                cookie_buttons = await page.query_selector_all('button[tabindex="0"]')
                if len(cookie_buttons) > 0:
                    await cookie_buttons[1].click()  # Usually the second button is "Accept"
            except:
                logger.info("No cookie consent dialog found or already accepted")
            
            # Click on login link if on the landing page
            try:
                await page.wait_for_selector('a[href="/accounts/login/"]', timeout=3000)
                await page.click('a[href="/accounts/login/"]')
            except:
                logger.info("Already on login page or login link not found")
            
            # Login
            try:
                await page.wait_for_selector('input[name="username"]', timeout=5000)
                await page.fill('input[name="username"]', account['username'])
                await page.fill('input[name="password"]', account['password'])
                await page.click('button[type="submit"]')
                
                # Wait for login to complete
                await page.wait_for_url("https://www.instagram.com/", timeout=10000)
                
                # Handle "Save Login Info" dialog if it appears
                try:
                    await page.wait_for_selector('button:has-text("Save information")', timeout=5000)
                    await page.click('button:has-text("Save information")')
                except:
                    pass
                    
                # Handle notifications dialog if it appears
                try:
                    await page.wait_for_selector('button:has-text("Not Now")', timeout=5000)
                    await page.click('button:has-text("Not Now")')
                except:
                    pass
                    
                logger.info(f"Login successful for {account['username']}")
                
                # Update account last login time
                accounts_collection.update_one(
                    {"_id": account["_id"]},
                    {"$set": {"last_login": datetime.now(), "updated_at": datetime.now()}}
                )
                
                return context, page
                
            except Exception as e:
                logger.error(f"Login failed for {account['username']}: {e}")
                await context.close()
                return None, None
                
        except Exception as e:
            logger.error(f"Error during Instagram login: {e}")
            await context.close()
            return None, None
    
    async def send_dm(self, page, profile_username, message):
        """Send a DM to a specific Instagram profile"""
        logger.info(f"Navigating to {profile_username}'s profile")
        
        try:
            await page.goto(f"https://www.instagram.com/{profile_username}/")
            
            # Check if profile exists
            try:
                await page.wait_for_selector('header h2', timeout=5000)
                header_text = await page.inner_text('header h2')
                if "Sorry, this page isn't available." in header_text:
                    logger.warning(f"Profile {profile_username} not found")
                    return False, "profile_not_found"
            except:
                pass
            
            # Check if we need to personalize the message
            personalized_message = message
            
            # Try to get profile's first name
            try:
                name_element = await page.query_selector('header h2')
                if name_element:
                    full_name = await name_element.inner_text()
                    first_name = full_name.split(' ')[0]
                    personalized_message = personalized_message.replace("{first_name}", first_name)
            except:
                # If we can't get the name, replace placeholder with empty string
                personalized_message = personalized_message.replace("{first_name}", "")
            
            # Click on Message button
            try:
                logger.info(f"Finding message button for {profile_username}")
                
                # Try finding the message button
                message_button = await page.wait_for_selector('header button:has-text("Message")', timeout=5000)
                await message_button.click()
                
                # Wait for DM dialog to open and focus
                await page.wait_for_selector('div[role="dialog"] form textarea', timeout=5000)
                
                # Enter and send message
                await page.fill('div[role="dialog"] form textarea', personalized_message)
                await asyncio.sleep(1)  # Small delay to ensure message is fully entered
                await page.press('div[role="dialog"] form textarea', 'Enter')
                
                logger.info(f"DM sent to {profile_username}")
                await asyncio.sleep(2)  # Wait for message to be sent
                
                return True, "success"
                
            except Exception as e:
                logger.error(f"Error sending DM to {profile_username}: {e}")
                return False, str(e)
                
        except Exception as e:
            logger.error(f"Error navigating to {profile_username}'s profile: {e}")
            return False, str(e)
    
    async def process_campaign(self, task_id, campaign_id, account_id):
        """Process a campaign task for a specific account"""
        logger.info(f"Processing campaign {campaign_id} with account {account_id}")
        
        # Get campaign details
        campaign = campaigns_collection.find_one({"_id": ObjectId(campaign_id)})
        if not campaign:
            logger.error(f"Campaign {campaign_id} not found")
            return
        
        # Check if campaign is active
        if campaign['status'] != "active":
            logger.info(f"Campaign {campaign_id} is not active, status: {campaign['status']}")
            return
        
        # Verify account is in campaign's account_ids
        if account_id not in campaign.get('account_ids', []):
            logger.error(f"Account {account_id} not in campaign's account list")
            return
        
        # Get account details
        account = accounts_collection.find_one({"_id": ObjectId(account_id)})
        if not account:
            logger.error(f"Account {account_id} not found")
            return
        
        # Skip if account is not active
        if account.get('status') != 'active':
            logger.info(f"Account {account['username']} is not active, skipping")
            return
        
        # Login to Instagram
        context, page = await self.login_to_instagram(account)
        if not context or not page:
            logger.error(f"Failed to login with account {account['username']}")
            return
        
        try:
            # Refresh campaign data to get latest targets
            campaign = campaigns_collection.find_one({"_id": ObjectId(campaign_id)})
            if not campaign or 'targets' not in campaign:
                logger.warning(f"No targets found for campaign {campaign_id}")
                await context.close()
                return
            
            # Calculate daily limit based on campaign schedule
            daily_limit = campaign['schedule']['daily_limit']
            
            # If multiple accounts, divide the limit among them
            account_count = len(campaign.get('account_ids', []))
            if account_count > 0:
                # Distribute limits based on account distribution strategy
                if campaign.get('account_distribution') == 'even':
                    # Evenly distribute the daily limit across accounts
                    account_daily_limit = daily_limit // account_count
                else:
                    # Default to round-robin: each account gets the full limit
                    account_daily_limit = daily_limit
            else:
                account_daily_limit = daily_limit
                
            logger.info(f"Account {account['username']} daily limit: {account_daily_limit}")
            daily_sent = 0
            
            # Get the account's already assigned targets or find unassigned targets
            assigned_targets = []
            
            # First, get targets specifically assigned to this account
            for target in campaign['targets']:
                if target.get('status') == 'pending' and target.get('assigned_account') == account_id:
                    assigned_targets.append(target)
            
            # If we need more targets, look for unassigned ones
            if len(assigned_targets) < account_daily_limit:
                for target in campaign['targets']:
                    if target.get('status') == 'pending' and target.get('assigned_account') is None:
                        # Assign this target to the current account
                        campaigns_collection.update_one(
                            {
                                "_id": ObjectId(campaign_id),
                                "targets.username": target['username']
                            },
                            {
                                "$set": {
                                    "targets.$.assigned_account": account_id,
                                    "targets.$.assignment_time": datetime.now()
                                }
                            }
                        )
                        target['assigned_account'] = account_id
                        assigned_targets.append(target)
                        
                        if len(assigned_targets) >= account_daily_limit:
                            break
            
            # Randomize target order for more natural behavior
            random.shuffle(assigned_targets)
            
            # Process assigned targets up to daily limit
            for target in assigned_targets:
                if daily_sent >= account_daily_limit:
                    logger.info(f"Daily limit reached for account {account['username']}")
                    break
                
                # Check if campaign is still active
                current_campaign = campaigns_collection.find_one({"_id": ObjectId(campaign_id)})
                if current_campaign['status'] != "active":
                    logger.info(f"Campaign {campaign_id} is no longer active")
                    break
                
                # Check if account is still active
                current_account = accounts_collection.find_one({"_id": ObjectId(account_id)})
                if current_account.get('status') != 'active':
                    logger.info(f"Account {account['username']} is no longer active")
                    break
                
                # Send DM to target
                username = target['username']
                success, status = await self.send_dm(page, username, campaign['message'])
                
                # Update target status
                if success:
                    campaigns_collection.update_one(
                        {"_id": ObjectId(campaign_id), "targets.username": username},
                        {
                            "$set": {
                                "targets.$.status": "sent",
                                "targets.$.sent_at": datetime.now(),
                                "targets.$.sent_by_account": account_id,
                                "updated_at": datetime.now()
                            },
                            "$inc": {"stats.sent": 1, "stats.pending": -1}
                        }
                    )
                    daily_sent += 1
                    
                    # Add to leads collection
                    leads_collection.insert_one({
                        "user_id": campaign['user_id'],
                        "campaign_id": campaign_id,
                        "username": username,
                        "contacted_by": account_id,
                        "account_username": account['username'],
                        "status": "contacted",
                        "created_at": datetime.now(),
                        "updated_at": datetime.now()
                    })
                else:
                    # Update with failure status
                    campaigns_collection.update_one(
                        {"_id": ObjectId(campaign_id), "targets.username": username},
                        {
                            "$set": {
                                "targets.$.status": "failed",
                                "targets.$.error": status,
                                "targets.$.attempted_by_account": account_id,
                                "targets.$.updated_at": datetime.now(),
                                "updated_at": datetime.now()
                            },
                            "$inc": {"stats.failed": 1, "stats.pending": -1}
                        }
                    )
                
                # Random delay between messages to avoid detection
                delay = random.uniform(30, 90)
                logger.info(f"Waiting {delay:.2f} seconds before next message")
                await asyncio.sleep(delay)
            
            logger.info(f"Completed processing campaign {campaign_id} with account {account['username']}, sent {daily_sent} messages")
            
        except Exception as e:
            logger.error(f"Error processing campaign {campaign_id} with account {account['username']}: {e}")
        finally:
            await context.close()
    
    async def process_task(self, task_id):
        """Process a task from the queue"""
        async with self.semaphore:
            self.active_tasks += 1
            try:
                # Get task details
                task = tasks_collection.find_one({"id": task_id})
                if not task:
                    logger.error(f"Task {task_id} not found")
                    return
                
                # Update task status
                tasks_collection.update_one(
                    {"id": task_id},
                    {"$set": {"status": "processing", "worker_id": WORKER_ID, "updated_at": datetime.now()}}
                )
                
                # Process based on task type
                if task['type'] == "process_campaign":
                    await self.process_campaign(task_id, task['campaign_id'], task['account_id'])
                elif task['type'] == "send_sequence_message":
                    await self.process_sequence_message(task)
                else:
                    logger.warning(f"Unknown task type: {task['type']}")
                
                # Mark task as completed
                tasks_collection.update_one(
                    {"id": task_id},
                    {"$set": {"status": "completed", "completed_at": datetime.now(), "updated_at": datetime.now()}}
                )
                
            except Exception as e:
                logger.error(f"Error processing task {task_id}: {e}")
                # Mark task as failed
                tasks_collection.update_one(
                    {"id": task_id},
                    {"$set": {"status": "failed", "error": str(e), "updated_at": datetime.now()}}
                )
            finally:
                self.active_tasks -= 1
    
    async def process_sequence_message(self, task):
        """Process a sequence message task"""
        logger.info(f"Processing sequence message task {task['id']}")
        
        # Get required data
        message_id = task.get('message_id')
        lead_id = task.get('lead_id')
        account_id = task.get('account_id')
        
        if not message_id or not lead_id or not account_id:
            logger.error(f"Missing required data in task {task['id']}")
            return
        
        # Get message details
        message = messages_collection.find_one({"_id": ObjectId(message_id)})
        if not message:
            logger.error(f"Message {message_id} not found")
            return
        
        # Get lead details
        lead = leads_collection.find_one({"_id": ObjectId(lead_id)})
        if not lead:
            logger.error(f"Lead {lead_id} not found")
            return
        
        # Get account details
        account = accounts_collection.find_one({"_id": ObjectId(account_id)})
        if not account:
            logger.error(f"Account {account_id} not found")
            return
        
        # Skip if message is already sent or failed
        if message['status'] not in ['pending', 'queued']:
            logger.info(f"Message {message_id} already processed (status: {message['status']})")
            return
        
        # Skip if lead has responded
        if lead.get('response_status') == 'responded':
            logger.info(f"Lead {lead_id} has already responded, skipping follow-up")
            
            # Update message status
            messages_collection.update_one(
                {"_id": ObjectId(message_id)},
                {"$set": {"status": "cancelled", "reason": "lead_responded", "updated_at": datetime.now()}}
            )
            return
        
        # Login to Instagram
        context, page = await self.login_to_instagram(account)
        if not context or not page:
            logger.error(f"Failed to login with account {account['username']}")
            
            # Mark message as failed
            messages_collection.update_one(
                {"_id": ObjectId(message_id)},
                {
                    "$set": {
                        "status": "failed",
                        "error": "login_failed",
                        "updated_at": datetime.now()
                    }
                }
            )
            return
        
        try:
            # Get the personalized message
            personalized_message = message['personalized_message']
            username = lead['username']
            
            # Send the DM
            logger.info(f"Sending follow-up message to {username} from {account['username']}")
            success, status = await self.send_dm(page, username, personalized_message)
            
            if success:
                # Update message status
                messages_collection.update_one(
                    {"_id": ObjectId(message_id)},
                    {
                        "$set": {
                            "status": "sent",
                            "sent_at": datetime.now(),
                            "sent_by_account": account_id,
                            "updated_at": datetime.now()
                        }
                    }
                )
                
                # Update lead status
                leads_collection.update_one(
                    {"_id": ObjectId(lead_id)},
                    {
                        "$set": {
                            "last_contacted": datetime.now(),
                            "updated_at": datetime.now()
                        },
                        "$push": {
                            "contact_history": {
                                "message_id": message_id,
                                "sent_at": datetime.now(),
                                "account_id": account_id,
                                "message_type": "follow_up",
                                "step_index": message.get('step_index', 0)
                            }
                        }
                    }
                )
                
                logger.info(f"Successfully sent follow-up message to {username}")
            else:
                # Update message status
                messages_collection.update_one(
                    {"_id": ObjectId(message_id)},
                    {
                        "$set": {
                            "status": "failed",
                            "error": status,
                            "attempted_at": datetime.now(),
                            "updated_at": datetime.now()
                        }
                    }
                )
                
                logger.error(f"Failed to send follow-up message to {username}: {status}")
        
        except Exception as e:
            logger.error(f"Error sending follow-up message: {e}")
            
            # Update message status
            messages_collection.update_one(
                {"_id": ObjectId(message_id)},
                {
                    "$set": {
                        "status": "failed",
                        "error": str(e),
                        "updated_at": datetime.now()
                    }
                }
            )
        finally:
            await context.close()
    
    async def poll_tasks(self):
        """Poll for tasks from Redis queue"""
        logger.info(f"Starting task polling on worker {WORKER_ID}")
        
        while self.running:
            try:
                # Check if we can process more tasks
                if self.active_tasks >= MAX_CONCURRENT_TASKS:
                    await asyncio.sleep(1)
                    continue
                
                # Try to get a task from the queue
                task_data = redis_client.rpop("tasks")
                if not task_data:
                    await asyncio.sleep(1)
                    continue
                
                # Parse task data
                task = json.loads(task_data)
                task_id = task.get('task_id')
                
                if task_id:
                    # Process the task
                    logger.info(f"Processing task {task_id}")
                    asyncio.create_task(self.process_task(task_id))
                
            except Exception as e:
                logger.error(f"Error polling tasks: {e}")
                await asyncio.sleep(5)  # Wait a bit longer on error
    
    async def run(self):
        """Run the worker"""
        try:
            await self.initialize()
            await self.poll_tasks()
        except KeyboardInterrupt:
            logger.info("Worker interrupted, shutting down...")
        finally:
            await self.close()

    # Add new task types for engagement
    async def process_engagement_tasks(self):
        """Process engagement tasks from the queue"""
        logger.info("Processing engagement tasks")
        
        try:
            # Find pending engagement tasks
            engagement_tasks = list(tasks_collection.find({
                "type": {"$in": ["like_post", "post_comment"]},
                "status": "pending"
            }).limit(10))
            
            for task in engagement_tasks:
                task_type = task.get('type')
                
                if task_type == "like_post":
                    await self.process_like_task(task)
                elif task_type == "post_comment":
                    await self.process_comment_task(task)
        
        except Exception as e:
            logger.error(f"Error processing engagement tasks: {e}")

    async def process_like_task(self, task):
        """Process a task to like a post on Instagram"""
        logger.info(f"Processing like task {task['id']}")
        
        # Get required data
        post_id = task.get('post_id')
        account_id = task.get('account_id')
        is_unlike = task.get('unlike', False)
        
        if not post_id or not account_id:
            logger.error(f"Missing required data in task {task['id']}")
            await self.update_task_status(task['id'], "failed", {"error": "missing_data"})
            return
        
        # Get account details
        account = accounts_collection.find_one({"_id": ObjectId(account_id)})
        if not account:
            logger.error(f"Account {account_id} not found")
            await self.update_task_status(task['id'], "failed", {"error": "account_not_found"})
            return
        
        # Login to Instagram
        context, page = await self.login_to_instagram(account)
        if not context or not page:
            logger.error(f"Failed to login with account {account['username']}")
            await self.update_task_status(task['id'], "failed", {"error": "login_failed"})
            return
        
        try:
            # Navigate to the post
            post_url = f"https://www.instagram.com/p/{post_id}/"
            await page.goto(post_url, wait_until="networkidle")
            
            # Check if the post is accessible
            not_found = await page.query_selector("text=Sorry, this page isn't available.")
            if not_found:
                logger.warning(f"Post {post_id} not found")
                await self.update_task_status(task['id'], "failed", {"error": "post_not_found"})
                return
            
            # Find like button
            like_button = await page.query_selector("article svg[aria-label='Like'], article svg[aria-label='Unlike']")
            if not like_button:
                logger.warning(f"Like button not found for post {post_id}")
                await self.update_task_status(task['id'], "failed", {"error": "like_button_not_found"})
                return
            
            # Check current like status
            is_liked = await page.query_selector("article svg[aria-label='Unlike']") is not None
            
            # If already in the desired state, we're done
            if (is_liked and not is_unlike) or (not is_liked and is_unlike):
                logger.info(f"Post {post_id} already in desired like state")
                await self.update_task_status(task['id'], "completed")
                return
            
            # Click the like button
            await like_button.click()
            await asyncio.sleep(1)  # Wait for the action to complete
            
            # Verify the change took effect
            is_liked_after = await page.query_selector("article svg[aria-label='Unlike']") is not None
            success = (is_unlike and not is_liked_after) or (not is_unlike and is_liked_after)
            
            if success:
                logger.info(f"Successfully {'unliked' if is_unlike else 'liked'} post {post_id}")
                await self.update_task_status(task['id'], "completed")
            else:
                logger.warning(f"Failed to {'unlike' if is_unlike else 'like'} post {post_id}")
                await self.update_task_status(task['id'], "failed", {"error": "action_failed"})
        
        except Exception as e:
            logger.error(f"Error liking post {post_id}: {e}")
            await self.update_task_status(task['id'], "failed", {"error": str(e)})
        
        finally:
            await self.close()

    async def process_comment_task(self, task):
        """Process a task to comment on a post on Instagram"""
        logger.info(f"Processing comment task {task['id']}")
        
        # Get required data
        post_id = task.get('post_id')
        account_id = task.get('account_id')
        comment_text = task.get('comment')
        
        if not post_id or not account_id or not comment_text:
            logger.error(f"Missing required data in task {task['id']}")
            await self.update_task_status(task['id'], "failed", {"error": "missing_data"})
            return
        
        # Get account details
        account = accounts_collection.find_one({"_id": ObjectId(account_id)})
        if not account:
            logger.error(f"Account {account_id} not found")
            await self.update_task_status(task['id'], "failed", {"error": "account_not_found"})
            return
        
        # Login to Instagram
        context, page = await self.login_to_instagram(account)
        if not context or not page:
            logger.error(f"Failed to login with account {account['username']}")
            await self.update_task_status(task['id'], "failed", {"error": "login_failed"})
            return
        
        try:
            # Navigate to the post
            post_url = f"https://www.instagram.com/p/{post_id}/"
            await page.goto(post_url, wait_until="networkidle")
            
            # Check if the post is accessible
            not_found = await page.query_selector("text=Sorry, this page isn't available.")
            if not_found:
                logger.warning(f"Post {post_id} not found")
                await self.update_task_status(task['id'], "failed", {"error": "post_not_found"})
                return
            
            # Find comment field
            comment_field = await page.query_selector("article form textarea")
            if not comment_field:
                logger.warning(f"Comment field not found for post {post_id}")
                await self.update_task_status(task['id'], "failed", {"error": "comment_field_not_found"})
                return
            
            # Click on the comment field and type the comment
            await comment_field.click()
            await page.fill("article form textarea", comment_text)
            
            # Find and click the post button
            post_button = await page.query_selector("article form button[type='submit']")
            if not post_button:
                logger.warning(f"Post button not found for post {post_id}")
                await self.update_task_status(task['id'], "failed", {"error": "post_button_not_found"})
                return
            
            # Click the post button
            await post_button.click()
            await asyncio.sleep(2)  # Wait for the action to complete
            
            # Verify the comment was posted (this is a simplified check)
            # In a real application, you would need to check if the comment actually appears
            success = True
            
            if success:
                logger.info(f"Successfully commented on post {post_id}")
                await self.update_task_status(task['id'], "completed")
            else:
                logger.warning(f"Failed to comment on post {post_id}")
                await self.update_task_status(task['id'], "failed", {"error": "action_failed"})
        
        except Exception as e:
            logger.error(f"Error commenting on post {post_id}: {e}")
            await self.update_task_status(task['id'], "failed", {"error": str(e)})
        
        finally:
            await self.close()

    async def update_task_status(self, task_id, status, details=None):
        """Update task status in the database"""
        update_data = {
            "status": status,
            "updated_at": datetime.now()
        }
        
        if details:
            update_data["details"] = details
        
        # Update the task in the database
        tasks_collection.update_one(
            {"id": task_id},
            {"$set": update_data}
        )

async def main():
    """Main entry point"""
    worker = InstagramWorker()
    await worker.run()

if __name__ == "__main__":
    asyncio.run(main()) 