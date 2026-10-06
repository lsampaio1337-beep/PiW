from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 720})
        # Clear storage
        context.clear_cookies()
        page = context.new_page()

        print("Navigating to index.html...")
        page.goto("http://localhost:3000/index.html")
        page.evaluate("localStorage.clear(); sessionStorage.clear();")
        page.reload()
        page.wait_for_timeout(2000)

        print("Checking if game selection modal is visible...")
        if page.locator("#save-selection-modal").is_visible():
            print("Selecting New Game...")
            page.click("button:has-text('New Game')")

        page.wait_for_timeout(2000)

        print("Checking if intro tutorial modal is visible...")
        if page.locator("#intro-tutorial-modal").is_visible():
            print("Skipping tutorial...")
            page.click("#skip-tutorial-btn")
        else:
            print("Intro tutorial modal not visible, maybe already skipped.")

        page.wait_for_timeout(2000)
        print("Checking if starter selection modal is visible...")
        if page.locator("#starter-selection-modal").is_visible():
            print("Selecting Starter...")
            page.click("#starter-bulbasaur")
        else:
            print("Starter selection modal not visible, maybe already selected.")

        print("Wait for Main Control...")
        page.wait_for_selector("#main-control", state="attached")

        page.evaluate("""() => {
            const unlocks = [
                'hasSeenDex', 'hasSeenMarket', 'hasSeenMap', 'hasSeenTokens',
                'hasSeenStorage', 'hasSeenDaycare', 'hasSeenFarm', 'hasSeenGifts',
                'hasSeenMultiplayerIcon', 'hasSeenMissionsIcon', 'hasSeenAchievementsIcon'
            ];
            if (typeof state !== 'undefined' && state.globalStats) {
                unlocks.forEach(u => state.globalStats[u] = true);
            }

            // force show the window if it's hidden
            const mcw = document.getElementById('main-control-window');
            if (mcw) {
                mcw.style.display = 'flex';
                mcw.style.width = '600px';
                mcw.style.height = '100px';
            }

            const mc = document.getElementById('main-control');
            if (mc) {
                mc.style.display = 'flex';
            }

            // Show all icons
            document.querySelectorAll('.nav-icon').forEach(icon => {
                icon.style.display = 'inline-block';
            });
        }""")

        page.wait_for_timeout(1000)

        print("Taking screenshot...")
        page.screenshot(path="/home/jules/verification/screenshots/verification4.png", full_page=True)

        browser.close()

if __name__ == "__main__":
    run()
