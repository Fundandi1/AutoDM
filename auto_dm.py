#!/usr/bin/env python3
import os
import sys
import time
import asyncio
from typing import List
from dotenv import load_dotenv
from playwright.async_api import async_playwright, Page, Browser, BrowserContext

# Load environment variables
load_dotenv()

class InstagramDM:
    def __init__(self):
        self.username = os.getenv("INSTAGRAM_USERNAME")
        self.password = os.getenv("INSTAGRAM_PASSWORD")
        
        if not self.username or not self.password:
            print("Error: Instagram credentials not found in environment variables.")
            print("Please create a .env file with INSTAGRAM_USERNAME and INSTAGRAM_PASSWORD")
            sys.exit(1)
            
        self.browser = None
        self.context = None
        self.page = None
        
    async def init(self):
        """Initialize the browser and navigate to Instagram"""
        print("Initializing browser...")
        playwright = await async_playwright().start()
        self.browser = await playwright.chromium.launch(headless=False)
        self.context = await self.browser.new_context(viewport={"width": 1280, "height": 800})
        self.page = await self.context.new_page()
        
    async def login(self):
        """Login to Instagram"""
        print("Logging in to Instagram...")
        await self.page.goto("https://www.instagram.com/")
        
        # Wait for and handle cookie consent if present
        try:
            await self.page.wait_for_selector('button[tabindex="0"]', timeout=5000)
            cookie_buttons = await self.page.query_selector_all('button[tabindex="0"]')
            if len(cookie_buttons) > 0:
                await cookie_buttons[1].click()  # Usually the second button is "Accept"
        except:
            print("No cookie consent dialog found or already accepted")
        
        # Login
        try:
            await self.page.wait_for_selector('input[name="username"]', timeout=5000)
            await self.page.fill('input[name="username"]', self.username)
            await self.page.fill('input[name="password"]', self.password)
            await self.page.click('button[type="submit"]')
            
            # Wait for login to complete
            await self.page.wait_for_url("https://www.instagram.com/", timeout=10000)
            
            # Handle "Save Login Info" dialog if it appears
            try:
                await self.page.wait_for_selector('button:has-text("Save information")', timeout=5000)
                await self.page.click('button:has-text("Save information")')
            except:
                pass
                
            # Handle notifications dialog if it appears
            try:
                await self.page.wait_for_selector('button:has-text("Not Now")', timeout=5000)
                await self.page.click('button:has-text("Not Now")')
            except:
                pass
                
            print("Login successful")
            
        except Exception as e:
            print(f"Login failed: {e}")
            await self.close()
            sys.exit(1)
            
    async def send_dm(self, profile_username: str, message: str):
        """Send a DM to a specific Instagram profile"""
        print(f"Navigating to {profile_username}'s profile...")
        await self.page.goto(f"https://www.instagram.com/{profile_username}/")
        
        # Check if profile exists
        try:
            await self.page.wait_for_selector('header h2', timeout=5000)
            header_text = await self.page.inner_text('header h2')
            if "Sorry, this page isn't available." in header_text:
                print(f"Profile {profile_username} not found.")
                return False
        except:
            pass
        
        # Click on Message button
        try:
            print("Finding message button...")
            
            # Try finding the message button (might have different text or location)
            message_button = await self.page.wait_for_selector('header button:has-text("Message")', timeout=5000)
            await message_button.click()
            
            # Wait for DM dialog to open and focus
            await self.page.wait_for_selector('div[role="dialog"] form textarea', timeout=5000)
            
            # Enter and send message
            await self.page.fill('div[role="dialog"] form textarea', message)
            time.sleep(1)  # Small delay to ensure message is fully entered
            await self.page.press('div[role="dialog"] form textarea', 'Enter')
            
            print(f"DM sent to {profile_username}")
            return True
            
        except Exception as e:
            print(f"Error sending DM to {profile_username}: {e}")
            return False
    
    async def send_dms_to_profiles(self, profiles: List[str], message: str):
        """Send the same DM to multiple profiles"""
        results = {}
        
        for profile in profiles:
            success = await self.send_dm(profile, message)
            results[profile] = success
            # Wait between DMs to avoid rate limiting
            time.sleep(3)
            
        return results
    
    async def close(self):
        """Close the browser"""
        if self.browser:
            await self.browser.close()
            
async def main():
    instagram = InstagramDM()
    await instagram.init()
    
    try:
        await instagram.login()
        
        # Example usage
        profiles = ["example_profile1", "example_profile2"]  # Replace with actual profiles
        message = "Hello! This is an automated message."  # Replace with your message
        
        results = await instagram.send_dms_to_profiles(profiles, message)
        
        print("\nDM Results:")
        for profile, success in results.items():
            print(f"{profile}: {'Success' if success else 'Failed'}")
            
    finally:
        await instagram.close()

if __name__ == "__main__":
    asyncio.run(main()) 