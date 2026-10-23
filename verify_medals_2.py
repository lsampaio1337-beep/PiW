import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        await page.goto("http://localhost:3000")

        # Hide overlays
        await page.evaluate('''() => {
            const el1 = document.getElementById('introOverlay');
            if(el1) el1.style.display = 'none';
            const el2 = document.getElementById('gameOverlay');
            if(el2) el2.style.display = 'none';
            const el3 = document.getElementById('starterModal');
            if(el3) el3.style.display = 'none';
        }''')

        await page.wait_for_timeout(1000)

        # Mock the state for medals
        await page.evaluate('''() => {
            window.state = {
                stats: { medalsFirst: 2, medalsSecond: 1, medalsThird: 0 },
                regions: {
                    "Johto": { stats: { medalsFirst: 1, medalsSecond: 0, medalsThird: 0 } },
                    "Hoenn": { stats: { medalsFirst: 0, medalsSecond: 1, medalsThird: 1 } },
                    "Sinnoh": { stats: { medalsFirst: 0, medalsSecond: 0, medalsThird: 0 } },
                    "Unova": { stats: { medalsFirst: 3, medalsSecond: 2, medalsThird: 0 } },
                    "Kalos": { stats: { medalsFirst: 1, medalsSecond: 1, medalsThird: 1 } },
                    "Alola": { stats: { medalsFirst: 5, medalsSecond: 5, medalsThird: 5 } },
                    "Galar": { stats: { medalsFirst: 0, medalsSecond: 0, medalsThird: 0 } },
                    "Hisui": { stats: { medalsFirst: 1, medalsSecond: 0, medalsThird: 0 } },
                    "Paldea": { stats: { medalsFirst: 0, medalsSecond: 0, medalsThird: 0 } }
                }
            };

            // Render the medals
            window.showTrainerStats('medals');
        }''')

        await page.wait_for_timeout(2000)

        await page.screenshot(path="/home/jules/verification/screenshots/verification4.png")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
