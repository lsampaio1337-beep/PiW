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
        await page.wait_for_timeout(1000)

        # We need to wait for the next screen
        await page.evaluate("""
            window.showMain();

            // hide daily challenges
            if(document.getElementById('daily-challenges-overlay')) {
                document.getElementById('daily-challenges-overlay').style.display = 'none';
            }
            if(document.getElementById('prof-oak-overlay')) {
                document.getElementById('prof-oak-overlay').style.display = 'none';
            }
            if(document.getElementById('overlay')) {
                document.getElementById('overlay').style.display = 'none';
            }

            // start battle with Bulbasaur
            if(window.game && window.game.battleSystem) {
                window.game.battleSystem.start(1);
            } else if (window.battleSystem) {
                window.battleSystem.start(1);
            } else {
                document.querySelector('#nav-route-1')?.click();
            }

            // Force display battle container
            document.getElementById('battle-container').style.display = 'block';
            document.getElementById('bg-container').style.display = 'none'; // hide oak
        """)

        await page.wait_for_timeout(2000)
        await page.screenshot(path="verification14.png")
        await browser.close()

asyncio.run(main())
