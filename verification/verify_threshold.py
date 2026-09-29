from playwright.sync_api import sync_playwright

def run_cuj(page):
    page.goto("file:///app/index.html")
    page.wait_for_timeout(2000)

    # Check if we need to start a new game
    if page.locator("#btn-new-profile").is_visible():
        if page.locator("#btn-wipe-save").is_visible():
            page.locator("#btn-wipe-save").click()
            page.wait_for_timeout(500)

        page.locator("#btn-new-profile").click()
        page.wait_for_timeout(500)
        page.locator("#choose-bulbasaur").click()
        page.wait_for_timeout(5000)

    # Force show via javascript, safely
    page.evaluate("""() => {
        if (document.getElementById('view-main')) document.getElementById('view-main').style.display = 'block';
        if (document.getElementById('smartwatch')) document.getElementById('smartwatch').style.display = 'flex';
        if (document.getElementById('smartwatch-threshold-card')) document.getElementById('smartwatch-threshold-card').style.display = 'flex';
        if (window.showActiveItemSelection) window.showActiveItemSelection('threshold');
    }""")
    page.wait_for_timeout(1000)

    page.screenshot(path="verification/screenshots/verification1.png")
    page.wait_for_timeout(500)

    # Interact with the slider if visible
    slider = page.locator("#smartwatch-popup-threshold-slider")
    if slider.is_visible():
        slider.evaluate("(element) => { element.value = '75'; element.dispatchEvent(new Event('input')); }")
        page.wait_for_timeout(1000)
        page.screenshot(path="verification/screenshots/verification2.png")
    page.wait_for_timeout(1000)

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, args=["--disable-web-security", "--no-sandbox", "--disable-setuid-sandbox"])
        context = browser.new_context(
            record_video_dir="verification/videos",
            viewport={'width': 1280, 'height': 720}
        )
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()
            browser.close()
