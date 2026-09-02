from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto('http://localhost:3000/index.html')

    # Wait for the splash screen to fade and click to dismiss it
    page.wait_for_timeout(2000)
    page.mouse.click(10, 10)

    # Need to load state through the main module scope. Since state is imported into UI...
    page.evaluate("""
        import('./src/state.js').then(({state}) => {
            state.party = [{
                id: 1, name: 'Bulbasaur', level: 5, xp: 500, quality: 1.4, qualityName: 'Rare',
                types: ['Grass', 'Poison'],
                ivs: {hp: 50, atk: 50, def: 50, spa: 50, spd: 50, spe: 50},
                currentHp: 100, maxHp: 100, currentStats: {atk: 10, def: 10, spa: 10, spd: 10, spe: 10}
            }];
            state.inventory = {'Grass Stone': 100, 'Poison Stone': 100};
        });
    """)
    page.wait_for_timeout(500)

    page.evaluate("""
        import('./src/ui/pokemonStats.js').then(({showPokemonStats}) => {
            showPokemonStats('party', 0);
        });
    """)
    page.wait_for_timeout(1000)

    page.screenshot(path='stats_refactor_1.png', full_page=True)
    browser.close()
