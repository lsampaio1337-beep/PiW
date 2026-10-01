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

    # Hide other windows to clearly see top-bar-window
    page.evaluate("document.querySelectorAll('.floating-window').forEach(w => { if(w.id !== 'top-bar-window') w.style.display = 'none'; })")

    # Enable and test normal size
    page.locator('#top-bar-window').screenshot(path='topbar_fix_normal_zoom.png')

    # Simulate unlocking an icon
    page.evaluate("document.getElementById('multiplayer-container').style.display = 'inline-block'")
    page.evaluate("window.windowManager.autoAdjustWidth('top-bar-window')")
    page.wait_for_timeout(500)
    page.locator('#top-bar-window').screenshot(path='topbar_fix_expanded_zoom.png')

    # Test hiding an icon
    page.evaluate("document.getElementById('multiplayer-container').style.display = 'none'")
    page.evaluate("window.windowManager.autoAdjustWidth('top-bar-window')")
    page.wait_for_timeout(500)
    page.locator('#top-bar-window').screenshot(path='topbar_fix_shrunk_zoom.png')

    browser.close()
