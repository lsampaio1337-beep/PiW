import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()
        page = await context.new_page()

        await page.goto("http://localhost:3000")

        # New profile setup
        try:
            await page.wait_for_selector("#btn-wipe-save", timeout=3000)
            await page.click("#btn-wipe-save")
        except:
            pass

        await page.wait_for_selector("#btn-new-profile")
        await page.click("#btn-new-profile")

        await page.wait_for_selector("#choose-charmander")
        await page.click("#choose-charmander")

        await page.wait_for_timeout(1000)

        # Now click Pallet Town on the map to start a battle
        # The ID for pallet town in the map might be #map-route-1 or we can click by text
        # Let's try to evaluate to start a battle directly via game logic if possible,
        # or we click the route.
        try:
            await page.click(".map-node")
        except:
            pass

        # Give it a few seconds to load the battle view
        await page.wait_for_timeout(3000)

        # Take a screenshot
        await page.screenshot(path="verification3.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
