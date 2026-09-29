import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(args=["--disable-web-security"])
        page = await browser.new_page(viewport={"width": 1280, "height": 720})
        await page.goto("file:///app/index.html")

        # Wait for load
        await page.wait_for_selector("#btn-new-profile")

        # Check if we need to wipe save
        wipe_btn = await page.query_selector("#btn-wipe-save")
        if wipe_btn and await wipe_btn.is_visible():
            await wipe_btn.click()
            await page.wait_for_timeout(500)

        await page.click("#btn-new-profile")
        await page.wait_for_selector("#choose-charmander")
        await page.click("#choose-charmander")
        await page.wait_for_timeout(2000)

        await page.evaluate("""
            document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
            document.querySelectorAll('.overlay').forEach(m => m.style.display = 'none');

            // Navigate to Route 1 which contains low level pokemon (Pidgey - flying, Rattata - not flying)
            window.globals.navigateToLocation('Route 1', window.globals.state, window.globals);
        """)

        await page.wait_for_timeout(2000)
        await page.screenshot(path="verification17.png")
        await browser.close()

asyncio.run(main())
