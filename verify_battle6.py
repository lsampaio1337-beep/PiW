import asyncio
from playwright.async_api import async_playwright
import os

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, args=['--disable-web-security'])
        context = await browser.new_context()
        page = await context.new_page()

        file_url = f"file://{os.path.abspath('index.html')}"
        print(f"Loading {file_url}")
        await page.goto(file_url)

        # Give some time for load
        await asyncio.sleep(2)

        # Wipe save
        try:
            await page.click('#btn-wipe-save', timeout=2000)
            print("Wiped existing save.")
            await asyncio.sleep(1)
        except Exception as e:
            print("Wipe save not found/needed.", e)

        # New profile
        try:
            await page.click('#btn-new-profile', timeout=2000)
            print("Clicked new profile.")
            await asyncio.sleep(1)
        except Exception as e:
            print("New profile not found/needed.", e)

        # Choose starter
        try:
            await page.click('#choose-charmander', timeout=2000)
            print("Chose Charmander.")
            await asyncio.sleep(2)
        except Exception as e:
            print("Choose charmander not found.", e)

        # Close any modals if open, or directly trigger startBattle
        try:
            print("Attempting to start battle...")
            await page.evaluate("window.startBattle(1)")
            await asyncio.sleep(3)
        except Exception as e:
            print("Error starting battle via window.startBattle:", e)

        await page.screenshot(path="verification6.png")
        print("Screenshot saved to verification6.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
