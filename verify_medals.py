from playwright.sync_api import sync_playwright
import time

def verify_frontend():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.set_viewport_size({"width": 1280, "height": 720})
        page.goto("http://localhost:3000")

        # Click new game
        try:
            page.wait_for_selector("#btn-new-profile", timeout=5000)
            page.click("#btn-new-profile")
        except Exception as e:
            print("Could not click new profile:", e)

        time.sleep(1)

        # Click skip tutorial if it exists
        try:
            page.wait_for_selector("#btn-prof-tutorial-skip", timeout=5000)
            page.click("#btn-prof-tutorial-skip")
        except Exception as e:
            print("Could not skip tutorial:", e)

        time.sleep(1)

        # Hide any overlays
        page.evaluate("""
            const intro = document.getElementById('introOverlay');
            if (intro) intro.style.display = 'none';
            const game = document.getElementById('gameOverlay');
            if (game) game.style.display = 'none';
        """)

        # Mock game state
        page.evaluate("""
            window.state = {
                regions: {
                    Johto: { stats: { totalCaught: 1, totalShiniesCaught: 0 } },
                    Hoenn: { stats: { totalCaught: 2, totalShiniesCaught: 0 } },
                    Sinnoh: { stats: { totalCaught: 3, totalShiniesCaught: 0 } },
                    Unova: { stats: { totalCaught: 5, totalShiniesCaught: 0 } },
                    Kalos: { stats: { totalCaught: 0, totalShiniesCaught: 0 } },
                    Alola: { stats: { totalCaught: 10, totalShiniesCaught: 0 } },
                    Galar: { stats: { totalCaught: 15, totalShiniesCaught: 0 } },
                    Hisui: { stats: { totalCaught: 0, totalShiniesCaught: 0 } },
                    Paldea: { stats: { totalCaught: 0, totalShiniesCaught: 0 } },
                },
                stats: { totalCaught: 2, totalShiniesCaught: 1 },
                currentRegionName: 'Kanto'
            };
        """)

        # Open Medals tab
        page.evaluate("window.showTrainerStats('medals')")

        # Give it a bit of time to render
        time.sleep(2)

        # Take a screenshot
        page.screenshot(path="/home/jules/verification/screenshots/verification3.png")
        print("Screenshot saved to /home/jules/verification/screenshots/verification3.png")
        browser.close()

if __name__ == "__main__":
    verify_frontend()
