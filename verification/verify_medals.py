from playwright.sync_api import sync_playwright

def run_cuj(page):
    # Navigate to the local server
    page.goto("http://localhost:3000")
    page.wait_for_timeout(1000)

    # Use evaluate to mock the state completely to bypass the actual game UI flow
    page.evaluate('''() => {
        window.state = {
            pokedex: [
                { id: 1, caught: true },
                { id: 2, caught: true },
                { id: 3, caught: true },
                { id: 152, caught: true, caughtShiny: true }
            ],
            config: {
                pokemonData: [
                { id: 1, name: 'Bulbasaur', kanto_id: 1 },
                { id: 152, name: 'Chikorita', johto_id: 1 }
                ]
            },
            regions: {
                Kanto: { stats: {} },
                Johto: { stats: { caughtSpecies: {'Chikorita': true}, caughtShiniesSpecies: {'Chikorita': true} } },
                Hoenn: { stats: {} },
                Sinnoh: { stats: {} },
                Unova: { stats: {} },
                Kalos: { stats: {} },
                Alola: { stats: {} },
                Galar: { stats: {} },
                Hisui: { stats: {} },
                Paldea: { stats: {} }
            },
            currentRegionName: 'Kanto',
            stats: {
                totalPlayTime: 0,
                battlesWon: 0,
                battlesLost: 0,
                pokemonCaught: 0,
                shiniesCaught: 0,
                stepsTaken: 0,
                gymsDefeated: 0,
                eliteFourDefeated: 0,
                totalItemsFound: 0,
                totalMoneyEarned: 0,
                caughtSpecies: {'Bulbasaur': true},
                caughtShiniesSpecies: {}
            }
        };

        // Open trainer stats window
        if (window.showTrainerStats) {
            window.showTrainerStats('medals');
        }

        // Hide intro/overlays just in case they block
        document.querySelectorAll('#introOverlay, #gameOverlay').forEach(el => el.style.display = 'none');

        const container = document.getElementById('trainerStatsContainer');
        if (container) {
            container.style.zIndex = '999999';
            container.style.display = 'block';
        }
    }''')

    page.wait_for_timeout(1000)

    # Take screenshot at the key moment
    page.screenshot(path="/app/verification/screenshots/verification2.png")
    page.wait_for_timeout(1000)

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="/app/verification/videos"
        )
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()
            browser.close()
