import os
import asyncio
import time
from playwright.async_api import async_playwright
import subprocess

async def run():
    server = subprocess.Popen(["python3", "-m", "http.server", "8080", "--directory", "."])
    time.sleep(2)  # Wait for server to start

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            record_video_dir="/home/jules/verification/videos",
            record_video_size={"width": 1280, "height": 720}
        )
        page = await context.new_page()

        try:
            await page.goto("http://localhost:8080/index.html")

            # Wait for title screen and click new game
            await page.wait_for_selector("#new-game-button")
            await page.click("#new-game-button")

            # Wait for starter selection
            await page.wait_for_selector("#starter-selection-modal")

            # Click ready
            await page.click("button:has-text('Yes, I\\'m ready!')")

            # Select a starter
            await page.click("img[alt='Bulbasaur']")

            # Confirm selection
            await page.click("#confirm-starter-button")

            # Wait for map screen
            await page.wait_for_selector("#location-container")
            await page.wait_for_timeout(1000)

            # Evaluate script to open the Goldenrod Game Corner
            await page.evaluate("""
                () => {
                    window.currentMapRegion = 'Johto';
                    window.currentCasinoHub = 'Goldenrod Game Corner';

                    // Call the UI function directly
                    window.switchView('CASINO_HUB');
                    window.openLocation('Goldenrod Game Corner');
                }
            """)

            await page.wait_for_timeout(2000)

            os.makedirs("/home/jules/verification/screenshots", exist_ok=True)
            await page.screenshot(path="/home/jules/verification/screenshots/verification2.png")

            buttons_html = await page.evaluate("() => document.getElementById('location-buttons') ? document.getElementById('location-buttons').innerHTML : 'No location-buttons'")
            print("Buttons HTML:")
            print(buttons_html)

        finally:
            server.terminate()
            await context.close()
            await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
