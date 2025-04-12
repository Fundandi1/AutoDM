#!/usr/bin/env python3
import os
import sys
import json
import asyncio
import logging
import argparse
from datetime import datetime
from dotenv import load_dotenv
import pymongo
from bson import ObjectId
from playwright.async_api import async_playwright
import aiohttp
import numpy as np
from typing import List, Dict, Any, Optional, Tuple

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger('target_finder')

# Load environment variables
load_dotenv()

# Connect to MongoDB
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
mongo_client = pymongo.MongoClient(MONGO_URI)
db = mongo_client["instagram_automation"]
campaigns_collection = db["campaigns"]
targets_collection = db["targets"]
users_collection = db["users"]
leads_collection = db["leads"]

# OpenAI API key for AI filtering
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

class ProfileAnalyzer:
    def __init__(self):
        self.browser = None
        self.context = None
        self.page = None
        
    async def initialize(self):
        """Initialize the Playwright browser"""
        logger.info("Initializing Playwright browser")
        playwright = await async_playwright().start()
        self.browser = await playwright.chromium.launch(headless=True)
        self.context = await self.browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        )
        self.page = await self.context.new_page()
        
    async def close(self):
        """Close the browser"""
        if self.browser:
            logger.info("Closing browser")
            await self.browser.close()
    
    async def get_profile_data(self, username: str) -> Dict[str, Any]:
        """Scrape profile data from Instagram"""
        logger.info(f"Analyzing profile: {username}")
        
        profile_data = {
            "username": username,
            "name": None,
            "bio": None,
            "followers_count": 0,
            "following_count": 0,
            "posts_count": 0,
            "is_private": False,
            "is_verified": False,
            "is_business": False,
            "website": None,
            "avatar_url": None,
            "last_posts": [],
            "extracted_at": datetime.now()
        }
        
        try:
            # Visit profile page
            await self.page.goto(f"https://www.instagram.com/{username}/", wait_until="networkidle")
            
            # Check if profile exists
            not_found = await self.page.query_selector("text=Sorry, this page isn't available.")
            if not_found:
                logger.warning(f"Profile {username} not found")
                return None
            
            # Check if profile is private
            is_private = await self.page.query_selector("text=This Account is Private")
            if is_private:
                profile_data["is_private"] = True
            
            # Get basic profile info
            try:
                # Name and verification status
                header_section = await self.page.query_selector("header section")
                if header_section:
                    # Get name
                    name_elem = await header_section.query_selector("h2")
                    if name_elem:
                        profile_data["name"] = await name_elem.inner_text()
                    
                    # Check verification status
                    verified_badge = await header_section.query_selector("span[title='Verified']")
                    profile_data["is_verified"] = verified_badge is not None
                    
                    # Check for business/professional account indicators
                    business_category = await header_section.query_selector("div[class*='Category']")
                    if business_category:
                        profile_data["is_business"] = True
                
                # Bio text
                bio_elem = await self.page.query_selector("header section div > span")
                if bio_elem:
                    profile_data["bio"] = await bio_elem.inner_text()
                
                # Website link
                website_elem = await self.page.query_selector("header section a[target='_blank']")
                if website_elem:
                    profile_data["website"] = await website_elem.get_attribute("href")
                
                # Follower and following counts
                count_elements = await self.page.query_selector_all("header section ul li")
                if len(count_elements) >= 3:
                    # Posts count
                    posts_text = await count_elements[0].inner_text()
                    profile_data["posts_count"] = self._extract_count(posts_text)
                    
                    # Followers count
                    followers_text = await count_elements[1].inner_text()
                    profile_data["followers_count"] = self._extract_count(followers_text)
                    
                    # Following count
                    following_text = await count_elements[2].inner_text()
                    profile_data["following_count"] = self._extract_count(following_text)
                
                # Avatar URL
                avatar_img = await self.page.query_selector("header img[alt*='profile picture']")
                if avatar_img:
                    profile_data["avatar_url"] = await avatar_img.get_attribute("src")
                
                # Recent posts if not private
                if not profile_data["is_private"]:
                    posts = await self.page.query_selector_all("article div[role='button'] a")
                    for i, post in enumerate(posts[:6]):  # Get up to 6 recent posts
                        post_url = await post.get_attribute("href")
                        if post_url:
                            # Get post link
                            full_url = f"https://www.instagram.com{post_url}"
                            
                            # Try to get the image
                            post_img = await post.query_selector("img")
                            img_alt = await post_img.get_attribute("alt") if post_img else None
                            img_src = await post_img.get_attribute("src") if post_img else None
                            
                            profile_data["last_posts"].append({
                                "url": full_url,
                                "alt_text": img_alt,
                                "image_url": img_src
                            })
                            
                            if i >= 5:  # Limit to 6 posts
                                break
            
            except Exception as e:
                logger.error(f"Error extracting profile data for {username}: {e}")
            
            return profile_data
            
        except Exception as e:
            logger.error(f"Error accessing profile {username}: {e}")
            return None
    
    def _extract_count(self, text: str) -> int:
        """Extract numeric count from text like '1,234 followers'"""
        try:
            # Remove commas and find the first numeric part
            numeric_part = ''.join(c for c in text if c.isdigit() or c == ',' or c == '.')
            numeric_part = numeric_part.replace(',', '')
            
            # Handle K (thousands) or M (millions) abbreviations
            if 'K' in text or 'k' in text:
                return int(float(numeric_part) * 1000)
            elif 'M' in text or 'm' in text:
                return int(float(numeric_part) * 1000000)
            else:
                return int(float(numeric_part))
        except:
            return 0

class TargetFinder:
    def __init__(self, campaign_id: str = None, user_id: str = None):
        self.campaign_id = campaign_id
        self.user_id = user_id
        self.profile_analyzer = None
        
    async def initialize(self):
        """Initialize target finder"""
        self.profile_analyzer = ProfileAnalyzer()
        await self.profile_analyzer.initialize()
    
    async def close(self):
        """Close resources"""
        if self.profile_analyzer:
            await self.profile_analyzer.close()
    
    async def find_hashtag_targets(self, hashtag: str, max_targets: int = 100) -> List[Dict[str, Any]]:
        """Find target profiles from a hashtag"""
        logger.info(f"Finding targets for hashtag: #{hashtag}")
        targets = []
        
        try:
            # Go to hashtag page
            await self.profile_analyzer.page.goto(f"https://www.instagram.com/explore/tags/{hashtag}/", wait_until="networkidle")
            
            # Scroll a few times to load more posts
            for _ in range(3):
                await self.profile_analyzer.page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                await asyncio.sleep(2)
            
            # Get all post links
            post_links = await self.profile_analyzer.page.query_selector_all("article a")
            post_urls = []
            
            for link in post_links:
                href = await link.get_attribute("href")
                if href and "/p/" in href:
                    post_urls.append(f"https://www.instagram.com{href}")
                    
                    if len(post_urls) >= max_targets:
                        break
            
            # Visit each post to get the poster's username
            usernames = set()
            for i, post_url in enumerate(post_urls):
                try:
                    logger.info(f"Visiting post {i+1}/{len(post_urls)}: {post_url}")
                    await self.profile_analyzer.page.goto(post_url, wait_until="networkidle")
                    
                    # Get username from the post
                    username_elem = await self.profile_analyzer.page.query_selector("article header a")
                    if username_elem:
                        username = await username_elem.inner_text()
                        if username and username not in usernames:
                            usernames.add(username)
                            
                            # Get detailed profile data
                            profile_data = await self.profile_analyzer.get_profile_data(username)
                            if profile_data:
                                targets.append(profile_data)
                                logger.info(f"Added target: {username}")
                            
                            if len(targets) >= max_targets:
                                break
                    
                    # Avoid Instagram rate limits
                    await asyncio.sleep(2)
                    
                except Exception as e:
                    logger.error(f"Error processing post {post_url}: {e}")
                    continue
            
            return targets
            
        except Exception as e:
            logger.error(f"Error finding hashtag targets for #{hashtag}: {e}")
            return []
    
    async def find_follower_targets(self, username: str, max_targets: int = 100) -> List[Dict[str, Any]]:
        """Find target profiles from followers of a user"""
        logger.info(f"Finding targets from followers of: {username}")
        targets = []
        
        try:
            # Go to profile page
            await self.profile_analyzer.page.goto(f"https://www.instagram.com/{username}/", wait_until="networkidle")
            
            # Click on followers link
            followers_link = await self.profile_analyzer.page.query_selector("a[href$='/followers/']")
            if followers_link:
                await followers_link.click()
                
                # Wait for followers dialog to appear
                await self.profile_analyzer.page.wait_for_selector("div[role='dialog']", timeout=5000)
                
                # Scroll the followers list several times to load more
                followers_list = await self.profile_analyzer.page.query_selector("div[role='dialog'] div[style*='overflow-y: auto']")
                if followers_list:
                    for _ in range(5):
                        await self.profile_analyzer.page.evaluate("""
                            (el) => {
                                el.scrollTop = el.scrollHeight;
                            }
                        """, followers_list)
                        await asyncio.sleep(2)
                
                # Get all follower usernames
                follower_items = await self.profile_analyzer.page.query_selector_all("div[role='dialog'] div[role='button'] a")
                usernames = set()
                
                for item in follower_items:
                    username = await item.inner_text()
                    if username and username not in usernames:
                        usernames.add(username)
                        
                        if len(usernames) >= max_targets:
                            break
                
                # Close the dialog
                close_btn = await self.profile_analyzer.page.query_selector("div[role='dialog'] button:has-text('×')")
                if close_btn:
                    await close_btn.click()
                
                # Now get detailed data for each username
                for username in usernames:
                    profile_data = await self.profile_analyzer.get_profile_data(username)
                    if profile_data:
                        targets.append(profile_data)
                        logger.info(f"Added target: {username}")
                    
                    # Avoid Instagram rate limits
                    await asyncio.sleep(2)
                    
                    if len(targets) >= max_targets:
                        break
            
            return targets
            
        except Exception as e:
            logger.error(f"Error finding follower targets for {username}: {e}")
            return []
    
    async def analyze_targets_with_ai(self, targets: List[Dict[str, Any]], criteria: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Analyze targets with AI to determine best matches"""
        if not OPENAI_API_KEY:
            logger.warning("OpenAI API key not set, skipping AI analysis")
            return targets
        
        logger.info(f"Analyzing {len(targets)} targets with AI")
        filtered_targets = []
        
        try:
            async with aiohttp.ClientSession() as session:
                for target in targets:
                    # Build prompt for AI
                    prompt = self._build_ai_analysis_prompt(target, criteria)
                    
                    # Call OpenAI API
                    payload = {
                        "model": "gpt-4",
                        "messages": [
                            {"role": "system", "content": "You are an expert at analyzing Instagram profiles to determine if they are good leads based on specific criteria. You will respond with a JSON object with your analysis."},
                            {"role": "user", "content": prompt}
                        ],
                        "temperature": 0.1,
                        "response_format": {"type": "json_object"}
                    }
                    
                    headers = {
                        "Content-Type": "application/json",
                        "Authorization": f"Bearer {OPENAI_API_KEY}"
                    }
                    
                    async with session.post(
                        "https://api.openai.com/v1/chat/completions",
                        headers=headers,
                        json=payload
                    ) as response:
                        if response.status == 200:
                            result = await response.json()
                            content = result["choices"][0]["message"]["content"]
                            analysis = json.loads(content)
                            
                            # Add AI analysis to the target data
                            target["ai_analysis"] = analysis
                            
                            # Extract first name if available
                            if "extracted_first_name" in analysis:
                                target["first_name"] = analysis["extracted_first_name"]
                            
                            # Add to filtered list if it's a good match
                            if analysis.get("is_good_target", False):
                                filtered_targets.append(target)
                                logger.info(f"Target {target['username']} is a good match: {analysis.get('reasoning')}")
                            else:
                                logger.info(f"Target {target['username']} is not a good match: {analysis.get('reasoning')}")
                        else:
                            logger.error(f"OpenAI API error: {response.status}")
                            # Include the target anyway if we can't analyze it
                            filtered_targets.append(target)
                    
                    # Avoid rate limits
                    await asyncio.sleep(1)
            
            return filtered_targets
            
        except Exception as e:
            logger.error(f"Error during AI analysis: {e}")
            return targets  # Return original targets if analysis fails
    
    def _build_ai_analysis_prompt(self, target: Dict[str, Any], criteria: Dict[str, Any]) -> str:
        """Build the prompt for AI analysis"""
        prompt = f"""
        Analyze this Instagram profile to determine if it's a good target based on the criteria.
        
        Profile data:
        - Username: {target['username']}
        - Name: {target['name']}
        - Bio: {target['bio']}
        - Followers: {target['followers_count']}
        - Following: {target['following_count']}
        - Posts: {target['posts_count']}
        - Is private: {target['is_private']}
        - Is verified: {target['is_verified']}
        
        Criteria:
        - Minimum followers: {criteria.get('min_followers', 0)}
        - Maximum followers: {criteria.get('max_followers', 1000000)}
        - Bio keywords (any of these should be present): {', '.join(criteria.get('bio_keywords', []))}
        - Name keywords (any of these should be present): {', '.join(criteria.get('name_keywords', []))}
        - Exclude private accounts: {criteria.get('exclude_private', False)}
        - Exclude verified accounts: {criteria.get('exclude_verified', False)}
        
        Respond with a JSON object with the following fields:
        - is_good_target: boolean indicating if this profile matches the criteria
        - match_score: a score from 0-100 indicating how good a match this is
        - reasoning: a brief explanation of why this profile does or doesn't match
        - extracted_first_name: the person's first name, extracted from their name or username if possible
        - name_confidence: a score from 0-100 indicating confidence in the extracted first name
        - suggested_first_message: a personalized message opener that would work well for this profile
        - interests: list of likely interests based on profile content, useful for personalization
        """
        
        return prompt
    
    async def filter_targets_by_criteria(self, targets: List[Dict[str, Any]], criteria: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Apply basic filtering to targets based on criteria"""
        logger.info(f"Filtering {len(targets)} targets by criteria")
        
        filtered = []
        for target in targets:
            # Skip if we want to exclude private accounts and this is private
            if criteria.get('exclude_private', False) and target.get('is_private', False):
                logger.info(f"Excluding private account: {target['username']}")
                continue
                
            # Skip if we want to exclude public accounts and this is public
            if criteria.get('exclude_public', False) and not target.get('is_private', False):
                logger.info(f"Excluding public account: {target['username']}")
                continue
            
            # Skip if we want to exclude business accounts and this is a business account
            if criteria.get('exclude_business', False) and target.get('is_business', False):
                logger.info(f"Excluding business account: {target['username']}")
                continue
            
            # Skip if we want to exclude non-business accounts and this is not a business account
            if criteria.get('exclude_non_business', False) and not target.get('is_business', False):
                logger.info(f"Excluding non-business account: {target['username']}")
                continue
                
            # Skip if we want to exclude verified accounts and this is verified
            if criteria.get('exclude_verified', False) and target.get('is_verified', False):
                logger.info(f"Excluding verified account: {target['username']}")
                continue
            
            # Check follower count range
            min_followers = criteria.get('min_followers', 0)
            max_followers = criteria.get('max_followers', float('inf'))
            if not (min_followers <= target.get('followers_count', 0) <= max_followers):
                logger.info(f"Excluding {target['username']} due to follower count: {target.get('followers_count', 0)}")
                continue
            
            # Check following count range
            min_following = criteria.get('min_following', 0)
            max_following = criteria.get('max_following', float('inf'))
            if not (min_following <= target.get('following_count', 0) <= max_following):
                logger.info(f"Excluding {target['username']} due to following count: {target.get('following_count', 0)}")
                continue
            
            # Check posts count range
            min_posts = criteria.get('min_posts', 0)
            max_posts = criteria.get('max_posts', float('inf'))
            if not (min_posts <= target.get('posts_count', 0) <= max_posts):
                logger.info(f"Excluding {target['username']} due to post count: {target.get('posts_count', 0)}")
                continue
            
            # Check bio keywords if specified
            bio_keywords = criteria.get('bio_keywords', [])
            if bio_keywords and target.get('bio'):
                bio_text = target['bio'].lower()
                if not any(keyword.lower() in bio_text for keyword in bio_keywords):
                    logger.info(f"Excluding {target['username']} due to missing bio keywords")
                    continue
            
            # Check bio blacklist keywords if specified
            bio_blacklist = criteria.get('bio_blacklist', [])
            if bio_blacklist and target.get('bio'):
                bio_text = target['bio'].lower()
                if any(keyword.lower() in bio_text for keyword in bio_blacklist):
                    logger.info(f"Excluding {target['username']} due to blacklisted bio keywords")
                    continue
            
            # Check name keywords if specified
            name_keywords = criteria.get('name_keywords', [])
            if name_keywords and target.get('name'):
                name_text = target['name'].lower()
                if not any(keyword.lower() in name_text for keyword in name_keywords):
                    logger.info(f"Excluding {target['username']} due to missing name keywords")
                    continue
            
            # Check website presence if required
            require_website = criteria.get('require_website', False)
            if require_website and not target.get('website'):
                logger.info(f"Excluding {target['username']} due to missing website")
                continue
            
            # Check profile pic presence if required
            require_profile_pic = criteria.get('require_profile_pic', False)
            if require_profile_pic and not target.get('avatar_url'):
                logger.info(f"Excluding {target['username']} due to missing profile picture")
                continue
            
            # Check for previous contact history
            if criteria.get('exclude_previously_contacted', False):
                # Check if we've contacted this user before in any campaign
                previously_contacted = self._check_contact_history(target['username'])
                if previously_contacted:
                    logger.info(f"Excluding {target['username']} due to previous contact")
                    continue
            
            # Target passed all filters
            filtered.append(target)
        
        logger.info(f"Filtered down to {len(filtered)} targets")
        return filtered
    
    def _check_contact_history(self, username: str) -> bool:
        """Check if we've previously contacted this username in any campaign"""
        # Look in the leads collection for this username
        existing_lead = leads_collection.find_one({"username": username})
        if existing_lead:
            return True
        
        # Also check in all campaigns for this username
        existing_target = campaigns_collection.find_one(
            {"targets.username": username, "targets.status": {"$in": ["sent", "failed"]}}
        )
        return existing_target is not None
    
    async def run_targeting(self, targeting_config: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Run the targeting process based on configuration"""
        logger.info(f"Running targeting with config: {targeting_config}")
        
        all_targets = []
        
        # Process hashtag targets
        if targeting_config.get('hashtags'):
            for hashtag in targeting_config['hashtags']:
                hashtag_targets = await self.find_hashtag_targets(
                    hashtag, 
                    max_targets=targeting_config.get('max_targets_per_source', 100)
                )
                all_targets.extend(hashtag_targets)
        
        # Process follower targets
        if targeting_config.get('follower_sources'):
            for source in targeting_config['follower_sources']:
                follower_targets = await self.find_follower_targets(
                    source,
                    max_targets=targeting_config.get('max_targets_per_source', 100)
                )
                all_targets.extend(follower_targets)
        
        # Apply basic filtering
        filtered_targets = await self.filter_targets_by_criteria(
            all_targets, 
            targeting_config.get('criteria', {})
        )
        
        # Apply AI analysis if enabled
        if targeting_config.get('use_ai_filtering', False):
            filtered_targets = await self.analyze_targets_with_ai(
                filtered_targets,
                targeting_config.get('criteria', {})
            )
        
        # Save targets to database if campaign_id is provided
        if self.campaign_id:
            await self.save_targets_to_campaign(filtered_targets)
        
        return filtered_targets
    
    async def save_targets_to_campaign(self, targets: List[Dict[str, Any]]) -> None:
        """Save found targets to the specified campaign"""
        if not self.campaign_id:
            return
            
        logger.info(f"Saving {len(targets)} targets to campaign {self.campaign_id}")
        
        # Prepare targets in the format expected by the campaign
        campaign_targets = []
        for target in targets:
            campaign_target = {
                "username": target['username'],
                "status": "pending",
                "created_at": datetime.now(),
                "data": {
                    "name": target.get('name'),
                    "bio": target.get('bio'),
                    "followers": target.get('followers_count'),
                    "following": target.get('following_count'),
                    "is_private": target.get('is_private'),
                    "is_verified": target.get('is_verified')
                }
            }
            
            # Add AI analysis if available
            if "ai_analysis" in target:
                campaign_target["data"]["ai_analysis"] = target["ai_analysis"]
            
            campaign_targets.append(campaign_target)
        
        # Add targets to the campaign
        campaigns_collection.update_one(
            {"_id": ObjectId(self.campaign_id)},
            {
                "$push": {"targets": {"$each": campaign_targets}},
                "$inc": {"stats.pending": len(campaign_targets)},
                "$set": {"updated_at": datetime.now()}
            }
        )
        
        logger.info(f"Saved {len(campaign_targets)} targets to campaign {self.campaign_id}")

async def main():
    """Main entry point for the target finder script"""
    parser = argparse.ArgumentParser(description="Instagram Target Finder")
    parser.add_argument("-c", "--campaign", help="Campaign ID to add targets to")
    parser.add_argument("-u", "--user", help="User ID for the campaign")
    parser.add_argument("-t", "--hashtags", nargs='+', help="Hashtags to find targets from")
    parser.add_argument("-f", "--followers", nargs='+', help="Find targets from followers of these accounts")
    parser.add_argument("-o", "--output", help="Output JSON file for targets")
    parser.add_argument("--min-followers", type=int, default=100, help="Minimum followers")
    parser.add_argument("--max-followers", type=int, default=10000, help="Maximum followers")
    parser.add_argument("--exclude-private", action="store_true", help="Exclude private accounts")
    parser.add_argument("--ai-filter", action="store_true", help="Use AI to filter targets")
    parser.add_argument("--max-targets", type=int, default=50, help="Maximum targets to find per source")
    
    args = parser.parse_args()
    
    # Validate arguments
    if not args.hashtags and not args.followers:
        print("Error: At least one hashtag or follower source is required")
        parser.print_help()
        sys.exit(1)
    
    # Set up targeting configuration
    targeting_config = {
        "hashtags": args.hashtags or [],
        "follower_sources": args.followers or [],
        "max_targets_per_source": args.max_targets,
        "use_ai_filtering": args.ai_filter,
        "criteria": {
            "min_followers": args.min_followers,
            "max_followers": args.max_followers,
            "exclude_private": args.exclude_private,
        }
    }
    
    # Initialize target finder
    finder = TargetFinder(campaign_id=args.campaign, user_id=args.user)
    
    try:
        await finder.initialize()
        targets = await finder.run_targeting(targeting_config)
        
        # Output results
        if args.output:
            with open(args.output, 'w') as f:
                json.dump(targets, f, default=str, indent=2)
            logger.info(f"Saved {len(targets)} targets to {args.output}")
        
        logger.info(f"Found {len(targets)} matching targets")
        
    finally:
        await finder.close()

if __name__ == "__main__":
    asyncio.run(main()) 