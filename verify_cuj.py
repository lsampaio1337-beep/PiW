import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()
        page = await context.new_page()

        # Load the index page
        await page.goto("file:///app/index.html")

        # Wait for initial game load
        await page.wait_for_timeout(2000)

        # Click the "Skip" button if it exists
        skip_button = page.locator('button:has-text("Skip")')
        if await skip_button.count() > 0:
            await skip_button.first.click(force=True)

        # Wait a bit for the UI to update
        await page.wait_for_timeout(1000)

        # Open the Trainer Stats window directly
        await page.evaluate('window.showTrainerStats()')

        await page.wait_for_timeout(1000)

        # Take a screenshot
        await page.screenshot(path='/home/jules/verification/screenshots/verification8.png')

        await browser.close()

if __name__ == '__main__':
    asyncio.run(main())