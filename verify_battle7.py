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

        await asyncio.sleep(2)

        # Click route 1
        try:
            print("Attempting to start battle via Route 1...")
            await page.click('[data-route-id="1"]')
            await asyncio.sleep(3)
        except Exception as e:
            print("Error starting battle via Route 1:", e)

        await page.screenshot(path="verification7.png")
        print("Screenshot saved to verification7.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
