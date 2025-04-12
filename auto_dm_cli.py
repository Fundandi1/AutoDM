#!/usr/bin/env python3
import os
import sys
import json
import argparse
import asyncio
from dotenv import load_dotenv
from typing import List, Dict, Any, Optional
import requests
from datetime import datetime

# Import AutoDM modules
from auto_dm import InstagramBot
from target_finder import TargetFinder

# Load environment variables
load_dotenv()

# Get OpenAI API key for template generation
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

def generate_message_template(target_audience: str, tone: str, purpose: str) -> str:
    """Generate a personalized message template using AI
    
    Args:
        target_audience: Description of target audience (e.g., "photographers in New York")
        tone: Desired tone (e.g., "friendly", "professional", "casual")
        purpose: Purpose of the message (e.g., "collaboration", "sales", "networking")
        
    Returns:
        Generated message template with variables
    """
    if not OPENAI_API_KEY:
        print("Error: OpenAI API key not found. Set OPENAI_API_KEY in your .env file.")
        return None
    
    print(f"Generating message template for {target_audience} with {tone} tone...")
    
    prompt = f"""
    Create a personalized Instagram DM template for reaching out to {target_audience}.
    The tone should be {tone} and the purpose is {purpose}.
    
    Use Jinja2 template variables like {{{{ variable_name }}}} for personalization.
    Available variables include:
    - username: Instagram username
    - first_name: First name (if available)
    - full_name: Full name from profile
    - followers_count: Number of followers
    - following_count: Number of people they follow
    - posts_count: Number of posts
    - bio: Their bio text
    - interests: List of their interests from AI analysis
    - suggested_opener: AI-suggested personalized opener
    - campaign_name: Name of the campaign
    - message_count: Number of messages sent so far
    - days_since_first_message: Days since first message
    
    You can also use functions:
    - random_emoji(category): Returns random emoji (categories: positive, business, greeting)
    - current_date: Current date formatted as "Month Day, Year"
    - format_number(num): Format number with K/M for thousands/millions
    
    And filters:
    - | capitalize_first: Capitalizes first letter
    - | remove_emojis: Removes emojis from text
    - | truncate(length): Truncates text to specified length
    - | default('text'): Uses default value if variable is empty
    
    Create a template that uses these variables effectively, particularly for
    - First message: Personalized introduction
    - Follow-ups: Reference to previous outreach
    - Conditional content based on their profile
    
    ONLY return the template text, nothing else.
    """
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {OPENAI_API_KEY}"
    }
    
    payload = {
        "model": "gpt-4",
        "messages": [
            {"role": "system", "content": "You are an expert at creating personalized message templates for Instagram DM outreach campaigns. Create templates that are conversational, authentic, and effective."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7
    }
    
    try:
        response = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers=headers,
            json=payload
        )
        
        if response.status_code == 200:
            result = response.json()
            template = result["choices"][0]["message"]["content"].strip()
            return template
        else:
            print(f"Error generating template: {response.status_code}")
            print(response.text)
            return None
    except Exception as e:
        print(f"Error generating template: {e}")
        return None

async def main():
    parser = argparse.ArgumentParser(description='Instagram DM Automation CLI')
    subparsers = parser.add_subparsers(dest='command', help='Command to execute')
    
    # Send DM command
    send_parser = subparsers.add_parser('send', help='Send DMs')
    send_parser.add_argument('--target', required=True, help='Target username or list file')
    send_parser.add_argument('--message', required=True, help='Message to send or template file path')
    send_parser.add_argument('--account', required=True, help='Instagram account to use')
    
    # Find targets command
    find_parser = subparsers.add_parser('find', help='Find target accounts')
    find_parser.add_argument('--type', choices=['hashtag', 'follower'], required=True, help='Target type')
    find_parser.add_argument('--source', required=True, help='Hashtag or account to find targets from')
    find_parser.add_argument('--limit', type=int, default=100, help='Maximum number of targets to find')
    find_parser.add_argument('--output', default='targets.json', help='Output file for targets')
    
    # Login command
    login_parser = subparsers.add_parser('login', help='Test Instagram login')
    login_parser.add_argument('--username', required=True, help='Instagram username')
    login_parser.add_argument('--password', required=True, help='Instagram password')
    
    # Create campaign command
    campaign_parser = subparsers.add_parser('campaign', help='Create and manage campaigns')
    campaign_parser.add_argument('--name', required=True, help='Campaign name')
    campaign_parser.add_argument('--account', required=True, help='Instagram account to use')
    campaign_parser.add_argument('--targets', required=True, help='Target list file')
    campaign_parser.add_argument('--message', required=True, help='Message template file')
    
    # Template generator command
    template_parser = subparsers.add_parser('template', help='Generate message templates')
    template_parser.add_argument('--audience', required=True, help='Target audience description')
    template_parser.add_argument('--tone', default='friendly', help='Message tone (friendly, professional, casual)')
    template_parser.add_argument('--purpose', required=True, help='Purpose of outreach')
    template_parser.add_argument('--output', default=None, help='Output file for template')
    
    args = parser.parse_args()
    
    if args.command == 'send':
        # Handle sending DMs
        print(f"Sending DMs to {args.target} using account {args.account}")
        # Implementation here
        
    elif args.command == 'find':
        # Handle finding targets
        print(f"Finding targets from {args.source} ({args.type})")
        finder = TargetFinder()
        await finder.initialize()
        
        try:
            if args.type == 'hashtag':
                targets = await finder.find_hashtag_targets(args.source, args.limit)
            else:  # follower
                targets = await finder.find_follower_targets(args.source, args.limit)
                
            print(f"Found {len(targets)} targets")
            
            # Save to file
            with open(args.output, 'w') as f:
                json.dump(targets, f, indent=2, default=str)
                
            print(f"Targets saved to {args.output}")
        finally:
            await finder.close()
    
    elif args.command == 'login':
        # Handle login test
        print(f"Testing login for account {args.username}")
        bot = InstagramBot(username=args.username, password=args.password)
        success = await bot.login()
        if success:
            print("Login successful!")
        else:
            print("Login failed.")
        await bot.close()
    
    elif args.command == 'campaign':
        # Handle campaign creation
        print(f"Creating campaign {args.name} using account {args.account}")
        # Implementation here
    
    elif args.command == 'template':
        # Handle template generation
        template = generate_message_template(args.audience, args.tone, args.purpose)
        
        if template:
            print("\nGenerated Template:")
            print("=" * 50)
            print(template)
            print("=" * 50)
            
            if args.output:
                with open(args.output, 'w') as f:
                    f.write(template)
                print(f"\nTemplate saved to {args.output}")
                
                # Print example usage
                print("\nExample usage:")
                print(f"python auto_dm_cli.py send --target username --message {args.output} --account your_account")
        
    else:
        parser.print_help()
    
if __name__ == "__main__":
    asyncio.run(main()) 