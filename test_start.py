from playwright.sync_api import sync_playwright
import time
import json

def test_startup():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Add electron mock script from memory
        page.add_init_script("""
            window.require = function(mod) {
                if (mod === 'electron') {
                    return { ipcRenderer: { send: () => {}, on: () => {} } };
                }
                return {};
            };
        """)

        # Inject profile into localStorage before loading the page
        page.goto('http://localhost:8080')
        page.evaluate("""() => {
            localStorage.setItem('idle_pokemon_world_profiles', JSON.stringify(['TestUser']));
            localStorage.setItem('TestUser', JSON.stringify({
                profileName: 'TestUser',
                party: [],
                storage: [],
                stats: { activeChallenges: [], completedChallengeIds: [] },
                settings: {},
                trainer: { badges: 0 }
            }));
        }""")

        # Reload to let game see it
        page.reload()
        time.sleep(1)

        # Click to load the profile (button with text TestUser)
        page.click('button:has-text("TestUser")')

        time.sleep(2)

        # Take a screenshot
        page.screenshot(path="startup_topbar.png")

        browser.close()

if __name__ == "__main__":
    test_startup()
