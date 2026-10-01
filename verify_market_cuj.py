from playwright.sync_api import sync_playwright
import os

def run_cuj(page):
    # Set display
    os.environ['DISPLAY'] = ':99'

    # Let electron handle file:// directly via IPC, wait for initialization
    page.goto('http://localhost:3000/index.html')

    page.wait_for_timeout(2000)

    # Initialize game
    page.evaluate('''
        window.startNewGame();
        window.selectStarter(1); // Bulbasaur
    ''')
    page.wait_for_timeout(1000)

    # Show Market Inner Modal
    page.evaluate('''
        if (window.openPokeMarketBuy) {
            window.openPokeMarketBuy('pokemon');
        }
    ''')
    page.wait_for_timeout(1000)

    # Switch to Sell Mode Pokemon tab explicitly
    page.evaluate("if (window.openPokeMarketSell) { window.openPokeMarketSell('pokemon'); }")
    page.wait_for_timeout(1000)

    # Toggle filter on
    page.evaluate('''
        const toggle = document.querySelector('#market-pokemon-sell-controls span[onclick]');
        if (toggle) toggle.click();
    ''')
    page.wait_for_timeout(1000)

    # Type into filter
    page.evaluate('''
        const input = document.getElementById('market-filter-name');
        if (input) {
            input.focus();
            input.value = "Bulba";
            input.dispatchEvent(new Event('input', { bubbles: true }));
        }
    ''')
    page.wait_for_timeout(1000)

    # Select pokemon
    page.evaluate('''
        const cards = document.querySelectorAll('.market-pokemon-card-sell');
        if(cards.length > 0) cards[0].click();
    ''')
    page.wait_for_timeout(1000)

    page.screenshot(path="/home/jules/verification/screenshots/verification_cuj.png")
    page.wait_for_timeout(1000)

    # Sell pokemon
    page.evaluate('''
        if (window.marketSellSelectedPokemon) window.marketSellSelectedPokemon();
    ''')
    page.wait_for_timeout(1000)

if __name__ == "__main__":

    # create directories
    os.system("mkdir -p /home/jules/verification/videos /home/jules/verification/screenshots")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="/home/jules/verification/videos",
            viewport={'width': 1200, 'height': 800}
        )
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()
            browser.close()
