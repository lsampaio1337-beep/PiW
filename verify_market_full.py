import time
from playwright.sync_api import sync_playwright

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        page.goto('http://localhost:3000')
        page.wait_for_function('typeof window.startNewGame === "function"')

        # Start game and directly setup market view
        page.evaluate('''() => {
            window.startNewGame();
            window.selectStarter(1);
            window.state.trainer.money = 12345;

            // Switch view
            const views = document.querySelectorAll('.window-content-container[id^="view-"]');
            views.forEach(v => v.style.display = 'none');

            const vCenter = document.getElementById("view-center-market");
            if (vCenter) {
                vCenter.style.display = 'block';
            }

            if (window.openPokeMarketBuy) {
                window.openPokeMarketBuy();
            }
        }''')

        time.sleep(1)

        # Fill with items to trigger scrolling / full expansion
        page.evaluate('''() => {
             const list = document.getElementById('market-buy-item-list');
             if(list) {
                 list.innerHTML += list.innerHTML + list.innerHTML + list.innerHTML + list.innerHTML + list.innerHTML + list.innerHTML + list.innerHTML;
             }
        }''')

        # Take full screenshot
        page.screenshot(path='/home/jules/verification/screenshots/verification_padding_new2.png')
        print("Screenshot saved to /home/jules/verification/screenshots/verification_padding_new2.png")

        browser.close()

if __name__ == '__main__':
    main()
