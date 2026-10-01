from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.set_viewport_size({"width": 1200, "height": 800})
    page.goto('http://localhost:3000/index.html')
    # wait for startNewGame
    page.wait_for_function('typeof window.startNewGame === "function"')
    page.evaluate('window.startNewGame()')
    page.evaluate('window.selectStarter(1)')
    page.wait_for_timeout(2000)

    # Check width behavior when collapsed with original autoAdjustWidth implementation.
    # The title should remain centered due to `flex-grow: 1; text-align: center`, and when the container gets very small, the title text will truncate and the buttons will stay visible.

    page.evaluate("document.querySelectorAll('.floating-window').forEach(w => { if(w.id !== 'top-bar-window') w.style.display = 'none'; })")

    # Hide main container and test autoAdjustWidth behavior for very small widths
    page.evaluate("document.querySelector('#top-bar-window .window-content-container').style.display = 'none'")
    page.evaluate("document.getElementById('top-bar-window').style.minHeight = ''")
    page.evaluate("document.getElementById('top-bar-window').style.width = '100px'")
    page.evaluate("window.windowManager.autoAdjustWidth('top-bar-window')")

    page.locator('#top-bar-window').screenshot(path='topbar_fix_auto_adjust.png')

    browser.close()
