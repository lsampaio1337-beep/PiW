import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        print("Navigating to http://localhost:8080...")
        await page.goto("http://localhost:8080")

        # Click new profile
        print("Clicking new profile...")
        await page.wait_for_selector("#btn-new-profile", state="visible")
        await page.click("#btn-new-profile")

        # Wait a bit
        await asyncio.sleep(1)

        # Click skip tutorial
        print("Clicking skip tutorial...")
        await page.wait_for_selector("#btn-prof-tutorial-skip", state="visible", timeout=5000)
        await page.click("#btn-prof-tutorial-skip")

        # Wait for starters to load
        print("Waiting for starters to load...")
        await asyncio.sleep(2)

        # Click Bulbasaur button
        print("Selecting starter...")
        # Bulbasaur has ID 1
        await page.click("button:has-text('Bulbasaur')")

        await asyncio.sleep(2)

        # Now simulate giving ourselves Kanto badges so we can see them in the UI
        print("Granting badges...")
        await page.evaluate("""() => {
            if (!window.state) return;
            if (!window.state.trainer) {
                window.state.trainer = {};
            }
            // Give Kanto badges
            window.state.trainer.badges = 8;
        }""")

        # Open trainer stats modal
        print("Opening trainer stats...")
        await page.evaluate("window.showTrainerStats('badges')")
        await asyncio.sleep(1)

        await page.screenshot(path="trainer_stats_badges_fix.png")
        print("Screenshots saved")

        await browser.close()

asyncio.run(run())
