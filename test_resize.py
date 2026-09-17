from playwright.sync_api import sync_playwright
import time

def test():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, args=['--no-sandbox'])
        context = browser.new_context()
        page = context.new_page()

        page.route("**/*", lambda route: route.continue_())
        page.add_init_script("""
            window.require = function(moduleName) {
                if (moduleName === 'electron') {
                    return { ipcRenderer: { send: () => {}, on: () => {} } };
                }
                return null;
            };
        """)

        # Inject mock profile
        page.add_init_script("""
            window.localStorage.setItem('idle_pokemon_world_profiles', JSON.stringify(['profile_test1']));
            window.localStorage.setItem('profile_test1', JSON.stringify({
                profileName: 'TestUser',
                state: {},
                lastSaved: Date.now()
            }));
        """)

        page.goto('http://localhost:8080')

        # Start game from menu
        page.wait_for_selector('.save-profile-card', state='visible', timeout=5000)
        time.sleep(1)
        # Click the profile card
        page.evaluate("""() => {
            document.querySelector('.save-profile-card').click();
        }""")

        page.wait_for_selector('#top-bar-window', state='visible', timeout=5000)
        time.sleep(2)

        page.screenshot(path='before_resize.png')

        # Find the handle using JS since selector might be tricky
        handle_box = page.evaluate("""() => {
            const el = document.querySelector('#top-bar-window .window-resize-handle');
            if (!el) return null;
            const rect = el.getBoundingClientRect();
            return {x: rect.x, y: rect.y, width: rect.width, height: rect.height};
        }""")

        print("Handle box from JS:", handle_box)

        if handle_box and handle_box['width'] > 0:
            page.mouse.move(handle_box['x'] + 5, handle_box['y'] + 5)
            page.mouse.down()
            page.mouse.move(handle_box['x'] + 100, handle_box['y'] + 100, steps=10)
            page.mouse.up()
            time.sleep(1)

            page.screenshot(path='after_resize.png')

            width = page.evaluate("document.getElementById('top-bar-window').style.width")
            scaler = page.evaluate("document.querySelector('#top-bar-window .window-content-scaler').style.transform")
            print("After resize - Width:", width, "Transform:", scaler)
        else:
            print("Handle is hidden or size 0.")

        browser.close()

if __name__ == '__main__':
    test()
