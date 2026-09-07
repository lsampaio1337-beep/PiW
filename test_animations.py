from playwright.sync_api import sync_playwright
import time

def run_cuj(page):
    page.goto("http://localhost:8000/index.html")
    page.wait_for_timeout(1000)
    page.evaluate("""() => {
        const splash = document.getElementById('splash-screen');
        if (splash) splash.style.display = 'none';
        const mg = document.getElementById('new-game-modal');
        if (mg) mg.style.display = 'block';
    }""")
    page.wait_for_timeout(1000)
    page.evaluate("""() => {
        const btn = document.getElementById('new-game-btn');
        if (btn) btn.click();
    }""")
    page.wait_for_timeout(1000)

    # We must invoke it correctly since it isn't strictly on window, or it is but it might be locked behind an import?
    # Let's just click the button in DOM
    page.evaluate("""() => {
        document.querySelectorAll('.starter-choices button')[0].click();
    }""")
    page.wait_for_timeout(1500)

    # Then navigate
    page.evaluate("if(typeof window.navigateToLocation === 'function') window.navigateToLocation('Route 1');")
    page.wait_for_timeout(5000)

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        page.on("console", lambda msg: print(f"Browser console: {msg.text}"))
        page.on("pageerror", lambda err: print(f"Browser error: {err}"))

        run_cuj(page)
        browser.close()
