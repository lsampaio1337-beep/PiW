from playwright.sync_api import sync_playwright

def run_cuj(page):
    page.goto("file:///app/index.html")
    page.wait_for_timeout(2000)

    page.add_init_script("""
        window.require = function(moduleName) {
            if (moduleName === 'electron') {
                return {
                    ipcRenderer: {
                        on: () => {},
                        send: () => {},
                        removeAllListeners: () => {},
                        invoke: async () => {}
                    }
                };
            }
            if (moduleName === 'fs') {
                return {
                    existsSync: () => false,
                    readFileSync: () => '',
                    writeFileSync: () => {}
                };
            }
            if (moduleName === 'path') {
                return {
                    join: (...args) => args.join('/')
                };
            }
            return {};
        };
    """)

    page.reload()
    page.wait_for_timeout(2000)

    page.evaluate("""
        localStorage.setItem('profile_Profile 1', '{"stats": {"hasSeenDaycare": true}}');
    """)
    page.reload()
    page.wait_for_timeout(2000)

    # Click the dynamically loaded profile button
    page.evaluate("""
        const btns = document.querySelectorAll('#profiles-container button');
        if (btns.length > 0) btns[0].click();
    """)
    page.wait_for_timeout(2000)

    # At this point, the game is started.
    page.evaluate("document.getElementById('btn-map').click()")
    page.wait_for_timeout(2000)

    page.screenshot(path="/home/jules/verification/screenshots/verification1.png")

    # Click it multiple times to see if the window grows.
    for i in range(5):
        page.evaluate("document.getElementById('btn-backpack').click()")
        page.wait_for_timeout(500)
        page.evaluate("document.getElementById('btn-backpack').click()")
        page.wait_for_timeout(500)

    page.screenshot(path="/home/jules/verification/screenshots/verification2.png")
    page.wait_for_timeout(1000)

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="/home/jules/verification/videos",
            viewport={"width": 1280, "height": 720}
        )
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()  # MUST close context to save the video
            browser.close()
