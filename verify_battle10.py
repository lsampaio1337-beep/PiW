import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(args=["--disable-web-security"])
        page = await browser.new_page()

        print("Navigating to file...")
        await page.goto("file:///app/index.html")

        await page.wait_for_selector("#btn-new-profile", timeout=5000)
        await page.click("#btn-new-profile")

        await page.wait_for_selector("#choose-charmander")
        await page.click("#choose-charmander")

        await asyncio.sleep(2)

        print("Clicking map button...")
        # Try to click the map button in the navigation
        await page.evaluate('''() => {
            const mapBtn = document.getElementById('nav-btn-map') || document.querySelector('[data-view="map"]') || document.getElementById('nav-map');
            if(mapBtn) mapBtn.click();

            // Close modals if any are open
            const modals = document.querySelectorAll('.modal-overlay');
            for(let m of modals) { m.style.display = 'none'; }
        }''')

        await asyncio.sleep(1)

        print("Clicking route 1...")
        await page.evaluate('''() => {
            // Also try to start battle programmatically if globals.battleSystem exists
            if (window.globals && window.globals.battleSystem && window.globals.battleSystem.start) {
                window.globals.battleSystem.start(1);
            }

            let nodes = document.querySelectorAll('.map-node');
            for(let node of nodes) {
                if (node.getAttribute('data-route-id') === '1') {
                    node.click();
                    break;
                }
            }
        }''')

        await asyncio.sleep(2)

        print("Taking screenshot...")
        await page.screenshot(path="verification10.png")
        await browser.close()
        print("Done!")

asyncio.run(main())
