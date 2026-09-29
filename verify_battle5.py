import asyncio
import os
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, args=['--disable-web-security'])
        context = await browser.new_context()
        page = await context.new_page()

        filepath = f"file://{os.path.abspath('index.html')}"
        await page.goto(filepath)

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

        try:
            # Let's force a battle to start by evaluating game logic or clicking a route
            await page.evaluate("""
                if (window.startBattle) {
                    window.startBattle(1);
                } else if (window.gameMode !== 'battle') {
                    // Try to click Pallet Town in map
                    document.querySelector('.map-node').click();
                }
            """)
        except:
            pass

        # Give it a few seconds to load the battle view
        await page.wait_for_timeout(4000)

        # Take a screenshot
        await page.screenshot(path="verification5.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
