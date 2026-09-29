import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(args=["--disable-web-security"])
        page = await browser.new_page()

        print("Navigating to file...")
        await page.goto("file:///app/index.html")

        # Wait for settings to load
        await page.wait_for_selector("#btn-new-profile", timeout=5000)

        print("Creating new profile...")
        await page.click("#btn-new-profile")

        print("Choosing starter...")
        await page.wait_for_selector("#choose-charmander")
        await page.click("#choose-charmander")

        # Give it a second to initialize game state
        await asyncio.sleep(2)

        print("Starting battle...")
        # Force a wild battle
        await page.evaluate('''() => {
            // Give 1st badge to unlock route 1 if needed
            window.globals.state.stats.completedChallengeIds.push('c-2-3');
            // Go to map
            document.getElementById('nav-map').click();
        }''')

        await asyncio.sleep(1)

        print("Clicking route 1...")
        # Now click route 1
        await page.evaluate('''() => {
            let nodes = document.querySelectorAll('.map-node');
            for(let node of nodes) {
                if (node.getAttribute('data-route-id') === '1') {
                    node.click();
                    break;
                }
            }
        }''')

        # Wait for battle to render
        await asyncio.sleep(2)

        print("Taking screenshot...")
        await page.screenshot(path="verification9.png")
        await browser.close()
        print("Done!")

asyncio.run(main())
