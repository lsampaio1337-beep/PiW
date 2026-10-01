from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, args=['--no-sandbox', '--disable-setuid-sandbox'])
        page = browser.new_page()
        page.goto('http://localhost:3000/index.html')

        page.wait_for_function('typeof window.startNewGame === "function"')
        page.evaluate('window.startNewGame()')
        page.evaluate('window.selectStarter(1)')

        # Give enough gifts to trigger scrolling
        page.evaluate('''
            window.state.stats.pendingGifts = [];
            for (let i = 0; i < 60; i++) {
                window.state.stats.pendingGifts.push({type: 'item', item: 'Masterball', count: 1});
            }
            window.state.stats.claimedGifts = [];
            for (let i = 0; i < 60; i++) {
                window.state.stats.claimedGifts.push({type: 'item', item: 'Potion', count: 1});
            }
        ''')

        page.evaluate('import("./src/ui/gift.js").then(m => m.showGiftModal())')
        time.sleep(1) # wait for render and adjustHeight

        win_height = page.evaluate('document.getElementById("window-gifts").offsetHeight')
        max_height = page.evaluate('document.getElementById("window-gifts").style.maxHeight')
        scroll_height = page.evaluate('document.getElementById("window-gifts").querySelector(".window-content-scaler").scrollHeight')
        overflow_y = page.evaluate('window.getComputedStyle(document.getElementById("window-gifts").querySelector(".window-content-container")).overflowY')

        print(f"Window Height: {win_height}px")
        print(f"Max Height: {max_height}")
        print(f"Scroll Height: {scroll_height}px")
        print(f"Overflow Y: {overflow_y}")

        page.screenshot(path="gifts_scroll_test.png")
        browser.close()

if __name__ == '__main__':
    run()
