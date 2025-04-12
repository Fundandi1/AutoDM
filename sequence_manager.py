#!/usr/bin/env python3
import os
import json
import time
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import pymongo
from bson import ObjectId
from jinja2 import Template
from jinja2 import Environment
import random

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger('sequence_manager')

# Connect to MongoDB
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
mongo_client = pymongo.MongoClient(MONGO_URI)
db = mongo_client["instagram_automation"]
users_collection = db["users"]
accounts_collection = db["instagram_accounts"]
campaigns_collection = db["campaigns"]
leads_collection = db["leads"]
tasks_collection = db["tasks"]
sequences_collection = db["message_sequences"]
messages_collection = db["messages"]

class MessageSequenceManager:
    """Manages message sequences, templates, and follow-ups"""
    
    @staticmethod
    def create_sequence(user_id: str, name: str, steps: List[Dict[str, Any]]) -> str:
        """Create a new message sequence
        
        Args:
            user_id: User ID who owns this sequence
            name: Name of the sequence
            steps: List of sequence steps, each containing:
                - delay: Time in hours before sending this message
                - message: Template for the message
                - conditions: Optional conditions for sending this message
        
        Returns:
            Sequence ID
        """
        sequence = {
            "user_id": user_id,
            "name": name,
            "steps": steps,
            "created_at": datetime.now(),
            "updated_at": datetime.now(),
            "status": "active"
        }
        
        result = sequences_collection.insert_one(sequence)
        sequence_id = str(result.inserted_id)
        logger.info(f"Created sequence '{name}' with ID {sequence_id}")
        
        return sequence_id
    
    @staticmethod
    def get_sequence(sequence_id: str) -> Optional[Dict[str, Any]]:
        """Get a message sequence by ID"""
        sequence = sequences_collection.find_one({"_id": ObjectId(sequence_id)})
        return sequence
    
    @staticmethod
    def update_sequence(sequence_id: str, updates: Dict[str, Any]) -> bool:
        """Update a message sequence
        
        Args:
            sequence_id: ID of the sequence to update
            updates: Dictionary of updates to apply
            
        Returns:
            True if successful, False otherwise
        """
        # Ensure we don't try to update the _id field
        if '_id' in updates:
            del updates['_id']
            
        # Add updated_at timestamp
        updates['updated_at'] = datetime.now()
        
        result = sequences_collection.update_one(
            {"_id": ObjectId(sequence_id)},
            {"$set": updates}
        )
        
        return result.modified_count > 0
    
    @staticmethod
    def delete_sequence(sequence_id: str) -> bool:
        """Delete a message sequence
        
        Returns:
            True if deleted, False if not found
        """
        result = sequences_collection.delete_one({"_id": ObjectId(sequence_id)})
        return result.deleted_count > 0
    
    @staticmethod
    def list_sequences(user_id: str) -> List[Dict[str, Any]]:
        """List all sequences for a user"""
        sequences = list(sequences_collection.find({"user_id": user_id}))
        return sequences
    
    @staticmethod
    def get_next_message(lead_id: str) -> Optional[Dict[str, Any]]:
        """Get the next message to send for a lead based on sequence and timing
        
        Args:
            lead_id: ID of the lead
            
        Returns:
            Message details or None if no message is due
        """
        # Get lead information
        lead = leads_collection.find_one({"_id": ObjectId(lead_id)})
        if not lead:
            logger.error(f"Lead {lead_id} not found")
            return None
            
        # Get campaign information
        campaign = campaigns_collection.find_one({"_id": ObjectId(lead.get("campaign_id"))})
        if not campaign:
            logger.error(f"Campaign {lead.get('campaign_id')} not found")
            return None
            
        # Check if campaign has a sequence
        sequence_id = campaign.get("sequence_id")
        if not sequence_id:
            logger.info(f"Campaign {lead.get('campaign_id')} has no sequence")
            return None
            
        # Get the sequence
        sequence = MessageSequenceManager.get_sequence(sequence_id)
        if not sequence:
            logger.error(f"Sequence {sequence_id} not found")
            return None
            
        # Check lead's message history
        sent_messages = lead.get("messages", [])
        next_step_index = len(sent_messages)
        
        # If we've sent all messages in the sequence, stop
        if next_step_index >= len(sequence["steps"]):
            logger.info(f"Lead {lead_id} has completed sequence {sequence_id}")
            return None
            
        # Get the next step in the sequence
        next_step = sequence["steps"][next_step_index]
        
        # Check if we've waited long enough for the next message
        if sent_messages:
            last_message_time = sent_messages[-1]["sent_at"]
            delay_hours = next_step.get("delay", 24)  # Default 24-hour delay
            next_send_time = last_message_time + timedelta(hours=delay_hours)
            
            if datetime.now() < next_send_time:
                logger.info(f"Not time yet to send next message to lead {lead_id}")
                return None
                
        # Check if the lead meets the conditions for this message
        if not MessageSequenceManager._check_conditions(lead, next_step.get("conditions", {})):
            logger.info(f"Lead {lead_id} doesn't meet conditions for next message")
            return None
        
        # Get the message template
        message_template = next_step.get("message", "")
        
        # Prepare the message
        message = {
            "lead_id": lead_id,
            "step_index": next_step_index,
            "template": message_template,
            "personalized_message": MessageSequenceManager._personalize_message(message_template, lead),
            "sequence_id": sequence_id,
            "campaign_id": lead.get("campaign_id"),
            "user_id": lead.get("user_id"),
            "status": "pending",
            "created_at": datetime.now()
        }
        
        return message
    
    @staticmethod
    def _check_conditions(lead: Dict[str, Any], conditions: Dict[str, Any]) -> bool:
        """Check if a lead meets the conditions for sending a message
        
        Args:
            lead: Lead data
            conditions: Condition rules to check
            
        Returns:
            True if conditions are met, False otherwise
        """
        # If no conditions, always return True
        if not conditions:
            return True
            
        # Check for specific response status conditions
        if "response_status" in conditions:
            required_status = conditions["response_status"]
            actual_status = lead.get("response_status")
            
            if required_status != actual_status:
                return False
        
        # Check for minimum time since last message
        if "min_days_since_last" in conditions:
            min_days = conditions["min_days_since_last"]
            messages = lead.get("messages", [])
            
            if messages:
                last_message_time = messages[-1]["sent_at"]
                days_since_last = (datetime.now() - last_message_time).days
                
                if days_since_last < min_days:
                    return False
        
        # Check for profile attributes
        if "profile_conditions" in conditions:
            profile_conds = conditions["profile_conditions"]
            profile_data = lead.get("profile_data", {})
            
            # Check followers condition
            if "min_followers" in profile_conds:
                if profile_data.get("followers_count", 0) < profile_conds["min_followers"]:
                    return False
            
            # Check for bio keywords
            if "bio_contains" in profile_conds:
                keywords = profile_conds["bio_contains"]
                bio = profile_data.get("bio", "").lower()
                
                if not any(keyword.lower() in bio for keyword in keywords):
                    return False
        
        # All conditions passed
        return True
    
    @staticmethod
    def _personalize_message(template: str, lead: Dict[str, Any]) -> str:
        """Personalize a message template for a specific lead
        
        Args:
            template: Message template with variables
            lead: Lead data for personalization
            
        Returns:
            Personalized message
        """
        # Get profile data for advanced personalization
        profile_data = lead.get("profile_data", {})
        ai_analysis = profile_data.get("ai_analysis", {})
        
        # Create template context with lead data
        context = {
            # Basic variables
            "username": lead.get("username", ""),
            "first_name": lead.get("first_name", "") or profile_data.get("first_name", ""),
            
            # Profile information
            "followers_count": profile_data.get("followers_count", 0),
            "following_count": profile_data.get("following_count", 0),
            "posts_count": profile_data.get("posts_count", 0),
            "full_name": profile_data.get("name", ""),
            "bio": profile_data.get("bio", ""),
            "website": profile_data.get("website", ""),
            "is_private": profile_data.get("is_private", False),
            "is_verified": profile_data.get("is_verified", False),
            
            # AI-extracted information
            "interests": ai_analysis.get("interests", []),
            "suggested_opener": ai_analysis.get("suggested_first_message", ""),
            
            # Campaign information
            "campaign_name": lead.get("campaign_name", ""),
            
            # Message history
            "message_count": len(lead.get("messages", [])),
            "days_since_first_message": MessageSequenceManager._get_days_since_first_message(lead),
            
            # Helper functions
            "random_emoji": MessageSequenceManager._get_random_emoji,
            "current_date": datetime.now().strftime("%B %d, %Y"),
            "format_number": MessageSequenceManager._format_number,
        }
        
        # Use Jinja2 for template rendering
        try:
            jinja_env = Environment(autoescape=True)
            jinja_env.filters['default'] = lambda value, default: default if not value else value
            
            # Custom filters for text processing
            jinja_env.filters['capitalize_first'] = lambda s: s[:1].upper() + s[1:] if s else ""
            jinja_env.filters['remove_emojis'] = MessageSequenceManager._remove_emojis
            jinja_env.filters['truncate'] = lambda s, length: s[:length] + '...' if len(s) > length else s
            
            jinja_template = jinja_env.from_string(template)
            personalized = jinja_template.render(**context)
            
            # Clean up any awkward spacing
            personalized = personalized.replace("  ", " ").strip()
            
            return personalized
        except Exception as e:
            logger.error(f"Error personalizing message: {e}")
            # Fall back to basic replacement for critical variables
            message = template
            message = message.replace("{{username}}", context["username"])
            message = message.replace("{{first_name}}", context["first_name"])
            return message
    
    @staticmethod
    def _get_days_since_first_message(lead: Dict[str, Any]) -> int:
        """Calculate days since first message was sent"""
        messages = lead.get("messages", [])
        if not messages:
            return 0
        
        first_message = messages[0]
        first_sent_at = first_message.get("sent_at")
        if not first_sent_at:
            return 0
        
        days_since = (datetime.now() - first_sent_at).days
        return max(0, days_since)
    
    @staticmethod
    def _get_random_emoji(category: str = "positive") -> str:
        """Return a random emoji from the specified category"""
        emoji_sets = {
            "positive": ["👍", "👏", "🙌", "💯", "🔥", "✨", "⭐", "🌟", "😊", "🤩"],
            "business": ["💼", "📊", "📈", "🤝", "🚀", "💡", "📱", "💻", "📝", "📞"],
            "greeting": ["👋", "🙋‍♀️", "🙋‍♂️", "👏", "👍", "😊", "✌️"],
        }
        
        selected_set = emoji_sets.get(category, emoji_sets["positive"])
        return random.choice(selected_set)
    
    @staticmethod
    def _format_number(num: int) -> str:
        """Format a number with K/M for thousands/millions"""
        if num >= 1000000:
            return f"{num/1000000:.1f}M"
        elif num >= 1000:
            return f"{num/1000:.1f}K"
        else:
            return str(num)
    
    @staticmethod
    def _remove_emojis(text: str) -> str:
        """Remove emojis from text"""
        import re
        emoji_pattern = re.compile("["
            u"\U0001F600-\U0001F64F"  # emoticons
            u"\U0001F300-\U0001F5FF"  # symbols & pictographs
            u"\U0001F680-\U0001F6FF"  # transport & map symbols
            u"\U0001F700-\U0001F77F"  # alchemical symbols
            u"\U0001F780-\U0001F7FF"  # Geometric Shapes
            u"\U0001F800-\U0001F8FF"  # Supplemental Arrows-C
            u"\U0001F900-\U0001F9FF"  # Supplemental Symbols and Pictographs
            u"\U0001FA00-\U0001FA6F"  # Chess Symbols
            u"\U0001FA70-\U0001FAFF"  # Symbols and Pictographs Extended-A
            u"\U00002702-\U000027B0"  # Dingbats
            u"\U000024C2-\U0001F251" 
            "]+", flags=re.UNICODE)
        return emoji_pattern.sub(r'', text)
    
    @staticmethod
    def send_message(message: Dict[str, Any], account_id: str) -> bool:
        """Record a message as sent and queue it for delivery
        
        Args:
            message: Message data
            account_id: Instagram account ID to send from
            
        Returns:
            True if successful, False otherwise
        """
        # Add sent information
        message["status"] = "queued"
        message["account_id"] = account_id
        message["updated_at"] = datetime.now()
        
        # Save message to database
        result = messages_collection.insert_one(message)
        message_id = result.inserted_id
        
        # Update lead with message information
        lead_id = message["lead_id"]
        
        leads_collection.update_one(
            {"_id": ObjectId(lead_id)},
            {
                "$push": {
                    "messages": {
                        "message_id": str(message_id),
                        "step_index": message["step_index"],
                        "sequence_id": message["sequence_id"],
                        "status": "queued",
                        "created_at": message["created_at"],
                        "queued_at": datetime.now(),
                        "sent_at": None
                    }
                },
                "$set": {
                    "last_message_time": datetime.now(),
                    "updated_at": datetime.now()
                }
            }
        )
        
        # Create a task for sending the message
        task_id = MessageSequenceManager._create_message_task(
            message_id=str(message_id),
            lead_id=lead_id,
            account_id=account_id,
            campaign_id=message["campaign_id"]
        )
        
        logger.info(f"Queued message {message_id} for lead {lead_id} with task {task_id}")
        return True
    
    @staticmethod
    def _create_message_task(message_id: str, lead_id: str, account_id: str, campaign_id: str) -> str:
        """Create a task for sending a message
        
        Returns:
            Task ID
        """
        task = {
            "id": str(ObjectId()),
            "type": "send_sequence_message",
            "message_id": message_id,
            "lead_id": lead_id,
            "account_id": account_id,
            "campaign_id": campaign_id,
            "status": "pending",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }
        
        result = tasks_collection.insert_one(task)
        
        # Add to Redis queue (assuming Redis setup from prior code)
        from redis import Redis
        redis_client = Redis.from_url(os.getenv("REDIS_URL", "redis://localhost:6379"))
        redis_client.lpush("tasks", json.dumps({"task_id": task["id"]}))
        
        return task["id"]
    
    @staticmethod
    def update_message_status(message_id: str, status: str, details: Optional[Dict[str, Any]] = None) -> bool:
        """Update the status of a message
        
        Args:
            message_id: ID of the message
            status: New status (queued, sent, failed)
            details: Optional details about the status change
            
        Returns:
            True if successful, False otherwise
        """
        update_data = {
            "status": status,
            "updated_at": datetime.now()
        }
        
        if details:
            update_data.update(details)
        
        # Update the message
        result = messages_collection.update_one(
            {"_id": ObjectId(message_id)},
            {"$set": update_data}
        )
        
        # Also update the message reference in the lead document
        if status in ["sent", "failed"]:
            message = messages_collection.find_one({"_id": ObjectId(message_id)})
            if message:
                lead_id = message.get("lead_id")
                leads_collection.update_one(
                    {
                        "_id": ObjectId(lead_id),
                        "messages.message_id": message_id
                    },
                    {
                        "$set": {
                            "messages.$.status": status,
                            "messages.$.sent_at": datetime.now() if status == "sent" else None,
                            "updated_at": datetime.now()
                        }
                    }
                )
        
        return result.modified_count > 0
    
    @staticmethod
    def process_follow_ups():
        """Process all leads that need follow-up messages
        
        This should be run regularly by a scheduler
        """
        logger.info("Processing follow-ups for all active leads")
        
        # Find leads with pending sequences that haven't received all messages
        active_leads = leads_collection.find({
            "status": "active",
            "response_status": {"$ne": "responded"}  # Only follow up with non-responders
        })
        
        lead_count = 0
        processed_count = 0
        
        for lead in active_leads:
            lead_count += 1
            lead_id = str(lead["_id"])
            try:
                # Check if we should process this lead based on engagement scoring
                engagement_score = MessageSequenceManager._calculate_engagement_score(lead)
                if engagement_score < 30:  # Skip leads with low engagement
                    logger.info(f"Skipping lead {lead_id} due to low engagement score ({engagement_score})")
                    continue
                
                # Get the next message for this lead
                next_message = MessageSequenceManager.get_next_message(lead_id)
                
                if next_message:
                    processed_count += 1
                    # Determine which account to send from based on campaign strategy
                    campaign_id = lead.get("campaign_id")
                    campaign = campaigns_collection.find_one({"_id": ObjectId(campaign_id)})
                    
                    if not campaign:
                        logger.error(f"Campaign {campaign_id} not found")
                        continue
                    
                    # Choose an account based on campaign's distribution strategy
                    account_id = MessageSequenceManager._select_account_for_lead(lead, campaign)
                    if not account_id:
                        logger.error(f"No suitable account found for lead {lead_id}")
                        continue
                    
                    # Determine the best time to send the message
                    if not MessageSequenceManager._is_good_time_to_send():
                        logger.info(f"Skipping lead {lead_id} due to timing - will process later")
                        continue
                    
                    # Send the message
                    MessageSequenceManager.send_message(next_message, account_id)
                    logger.info(f"Processed follow-up for lead {lead_id}")
                    
            except Exception as e:
                logger.error(f"Error processing follow-up for lead {lead_id}: {e}")
        
        logger.info(f"Follow-up processing complete: {processed_count} messages queued out of {lead_count} active leads")
    
    @staticmethod
    def _calculate_engagement_score(lead: Dict[str, Any]) -> int:
        """Calculate an engagement score to prioritize follow-ups
        
        Higher scores mean the lead is more engaged and worth following up with
        """
        score = 50  # Base score
        
        # Check for any previous engagements
        messages = lead.get("messages", [])
        
        # If they've seen messages but not responded, that's semi-positive
        if lead.get("response_status") == "seen":
            score += 20
        
        # If previous messages were sent successfully
        successful_sends = sum(1 for m in messages if m.get("status") == "sent")
        score += min(20, successful_sends * 5)  # Up to 20 points for successful sends
        
        # If they have a higher follower count, they may be more valuable
        profile_data = lead.get("profile_data", {})
        followers = profile_data.get("followers_count", 0)
        if followers > 10000:
            score += 15
        elif followers > 1000:
            score += 10
        
        # If they're verified, they might be more valuable
        if profile_data.get("is_verified", False):
            score += 10
        
        # If they're a business account, they might be more valuable for B2B
        if profile_data.get("is_business", False):
            score += 10
        
        # If they have a website, they might be more serious
        if profile_data.get("website"):
            score += 5
        
        # AI score if available
        ai_analysis = profile_data.get("ai_analysis", {})
        match_score = ai_analysis.get("match_score", 0)
        score += int(match_score / 5)  # Add up to 20 points for a perfect match
        
        # Cap the score
        return min(100, max(0, score))
    
    @staticmethod
    def _select_account_for_lead(lead: Dict[str, Any], campaign: Dict[str, Any]) -> Optional[str]:
        """Select the best account to send from based on the campaign strategy"""
        account_ids = campaign.get("account_ids", [])
        if not account_ids:
            return None
        
        distribution_strategy = campaign.get("account_distribution", "round_robin")
        
        # If lead was contacted by a specific account before, use that one for consistency
        contacted_by = lead.get("contacted_by")
        if contacted_by and contacted_by in account_ids:
            return contacted_by
        
        # Check which accounts are active
        active_accounts = []
        for account_id in account_ids:
            account = accounts_collection.find_one({"_id": ObjectId(account_id)})
            if account and account.get("status") == "active":
                active_accounts.append(account_id)
        
        if not active_accounts:
            return None
        
        # Apply distribution strategy
        if distribution_strategy == "round_robin":
            # Simple round-robin - use least recently used account
            account_usage = {}
            for account_id in active_accounts:
                last_used = messages_collection.find_one(
                    {"account_id": account_id, "status": "sent"},
                    sort=[("sent_at", -1)]
                )
                account_usage[account_id] = last_used.get("sent_at") if last_used else datetime.min
            
            # Select least recently used account
            return min(account_usage.items(), key=lambda x: x[1])[0]
        
        elif distribution_strategy == "balanced_load":
            # Count messages sent today by each account
            today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
            account_counts = {}
            
            for account_id in active_accounts:
                count = messages_collection.count_documents({
                    "account_id": account_id, 
                    "status": "sent",
                    "sent_at": {"$gte": today_start}
                })
                account_counts[account_id] = count
            
            # Select account with lowest count
            return min(account_counts.items(), key=lambda x: x[1])[0]
        
        else:
            # Default to first active account
            return active_accounts[0]
    
    @staticmethod
    def _is_good_time_to_send() -> bool:
        """Determine if current time is good for sending messages
        
        Avoids sending during typical sleeping hours to appear more human
        """
        now = datetime.now()
        hour = now.hour
        
        # Don't send between 10 PM and 7 AM
        if hour < 7 or hour >= 22:
            return False
        
        # Preferred sending times (9-11 AM or 1-5 PM)
        if (9 <= hour < 11) or (13 <= hour < 17):
            return True
        
        # Other times are acceptable but not ideal - use a probability
        # Higher probability during daytime, lower in early morning and evening
        if 7 <= hour < 9:
            return random.random() < 0.6  # 60% chance of sending
        elif 11 <= hour < 13:
            return random.random() < 0.8  # 80% chance of sending
        elif 17 <= hour < 22:
            return random.random() < 0.7  # 70% chance of sending
        
        return True  # Default fallback


def main():
    """Main function for running the sequence manager as a standalone process"""
    logger.info("Starting message sequence follow-up processor")
    
    try:
        while True:
            # Process all pending follow-ups
            MessageSequenceManager.process_follow_ups()
            
            # Wait for next run (every 30 minutes)
            logger.info("Waiting for next run...")
            time.sleep(1800)
            
    except KeyboardInterrupt:
        logger.info("Sequence manager interrupted, shutting down...")
    
    
if __name__ == "__main__":
    main() 