import asyncio
from playwright.async_api import async_playwright

async def verify():
    async with async_playwright() as p:
        browser = await p.chromium.launch(args=['--no-sandbox', '--disable-setuid-sandbox'])
        page = await browser.new_page()

        # Open index.html
        await page.goto('http://localhost:3000/index.html')

        # Start new game
        await page.wait_for_function('typeof window.startNewGame === "function"')
        await page.evaluate('''() => {
            window.startNewGame();
            window.selectStarter(1);
        }''')

        await page.wait_for_timeout(1000)

        # Give enough playtime for ZzZ mode to unlock (3600 seconds)
        await page.evaluate('''() => {
            window.state.stats.playtime = 3600;
            window.state.stats.hasSeenZzZIcon = true;
            window.state.stats.hasSeenZzZTutorial = false;
        }''')

        # Move to main view
        await page.evaluate('() => document.getElementById("view-daycare").style.display = "block"')

        # Click the sleep button instead of directly calling showZzZMode
        # This tests the actual user flow
        await page.evaluate('() => document.getElementById("btn-sleep").click()')

        # Wait a bit
        await page.wait_for_timeout(1000)

        # Take a screenshot of the overlay
        await page.screenshot(path='/home/jules/verification/screenshots/zzz_overlay_click.png')

        # Check visibility via JS
        overlay_display = await page.evaluate("() => document.getElementById('zzz-first-time-overlay').style.display")
        print(f"Overlay display after click: {overlay_display}")

        await browser.close()

asyncio.run(verify())
