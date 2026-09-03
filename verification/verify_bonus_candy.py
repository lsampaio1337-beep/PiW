import os
import time
from playwright.sync_api import sync_playwright

def run_cuj(page):
    page.goto(f"file://{os.path.abspath('index.html')}")
    page.wait_for_timeout(500)

    page.evaluate("""
        const splash = document.getElementById('splash-screen');
        if (splash) splash.remove();

        window.state = window.state || {};
        window.state.stats = window.state.stats || {};
        window.state.stats.defeatedPokemons = 9500;
        window.state.stats.whiteCandies = 5;
        window.state.stats.candyPurchaseHistory = ['Green Candy', 'Purple Candy', 'Black Yellow Candy', 'Rainbow Candy'];
        window.state.stats.greenCandies = 1;
        window.state.stats.purpleCandies = 1;
        window.state.stats.blackYellowCandies = 1;
        window.state.stats.rainbowCandies = 1;
        window.state.stats.bonusCandyDefeats = 500;

        if (typeof window.showBonusCandyModal === 'function') {
            window.showBonusCandyModal();
        }
    """)
    page.wait_for_timeout(1000)

    page.screenshot(path="verification/screenshots/verification3.png")
    page.wait_for_timeout(1000)

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="verification/videos"
        )
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()
            browser.close()
