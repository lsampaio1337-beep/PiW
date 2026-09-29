import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, args=['--no-sandbox', '--disable-web-security'])
        page = await browser.new_page()

        print("Loading game...")
        await page.goto("file:///app/index.html")

        # Wait for the wipe save button to be available and click it (to ensure clean slate)
        print("Wiping previous save if any...")
        try:
            await page.wait_for_selector('#btn-wipe-save', timeout=3000)
            await page.click('#btn-wipe-save')
            await page.wait_for_timeout(1000)
        except Exception:
            pass

        print("Starting new profile...")
        await page.wait_for_selector('#btn-new-profile', timeout=5000)
        await page.click('#btn-new-profile')
        await page.wait_for_timeout(1000)

        print("Choosing starter...")
        await page.wait_for_selector('#choose-charmander', timeout=5000)
        await page.click('#choose-charmander')
        await page.wait_for_timeout(2000)

        print("Triggering battle...")
        await page.evaluate("""() => {
            if (window.globals && window.globals.battleSystem) {
                // Change location to trigger battle rendering
                window.globals.battleSystem.start(1);
            }
        }""")
        await page.wait_for_timeout(1000)

        # Hide any overlays if possible
        await page.evaluate("""() => {
            const lab = document.getElementById('daily-challenges-window');
            if (lab) lab.style.display = 'none';
            const intro = document.getElementById('starter-selection');
            if (intro) intro.style.display = 'none';
        }""")

        print("Taking screenshot...")
        await page.screenshot(path="verification12.png")
        print("Screenshot saved to verification12.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
