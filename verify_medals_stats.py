import time
from playwright.sync_api import sync_playwright

def verify():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        print("Navigating to local server...")
        page.goto("http://localhost:3000")
        page.wait_for_load_state("networkidle")

        print("Waiting for window.pokemonData to load...")
        page.wait_for_function("window.pokemonData && window.pokemonData.length > 0", timeout=10000)

        print("Bypassing game intro overlays...")
        page.evaluate("""
            document.querySelectorAll('.modal-backdrop, #introOverlay, #gameOverlay').forEach(el => el.style.display = 'none');

            // Setup mock state
            window.state = window.state || {};
            window.state.stats = window.state.stats || {};
            window.state.regions = window.state.regions || {};

            const pData = window.pokemonData;

            // Kanto - All caught, all shiny
            window.state.stats.caughtSpecies = pData.filter(p => p.generation === 1).length;
            window.state.stats.caughtShiniesSpecies = pData.filter(p => p.generation === 1).length;

            // Johto - All caught, NOT all shiny
            window.state.regions.Johto = { stats: {} };
            window.state.regions.Johto.stats.caughtSpecies = pData.filter(p => p.generation === 2).length;
            window.state.regions.Johto.stats.caughtShiniesSpecies = 0;

            // Hoenn - Not all caught
            window.state.regions.Hoenn = { stats: {} };
            window.state.regions.Hoenn.stats.caughtSpecies = 10;
            window.state.regions.Hoenn.stats.caughtShiniesSpecies = 0;

            // Clear existing windows
            document.querySelectorAll('.window-container').forEach(el => el.remove());

            // Show stats and switch to medals tab
            window.showTrainerStats('medals');

            // Force it to be visible and positioned absolutely so we can see it
            setTimeout(() => {
                const win = document.getElementById('trainerStatsWindow');
                if (win) {
                    win.style.position = 'absolute';
                    win.style.top = '50px';
                    win.style.left = '50px';
                    win.style.zIndex = '9999';
                }
            }, 500);
        """)

        page.wait_for_timeout(1000)

        print("Taking screenshot...")
        page.screenshot(path="verification_medals_stats5.png", full_page=True)

        browser.close()
        print("Verification script completed.")

if __name__ == "__main__":
    verify()
