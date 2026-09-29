import asyncio
from playwright.async_api import async_playwright

async def verify():
    async with async_playwright() as p:
        browser = await p.chromium.launch(args=['--disable-web-security'])
        context = await browser.new_context()
        page = await context.new_page()

        await page.goto("file:///app/index.html")

        # Check if the wipe save button exists
        wipe_btn = await page.query_selector("#btn-wipe-save")
        if wipe_btn:
            await page.click("#btn-wipe-save")
            await page.wait_for_timeout(500)

        await page.wait_for_selector("#btn-new-profile")
        await page.click("#btn-new-profile")
        await page.wait_for_selector("#choose-bulbasaur")
        await page.click("#choose-bulbasaur")

        # Give game time to load
        await page.wait_for_timeout(2000)

        await page.evaluate("document.getElementById('btn-calendar').click()")
        await page.wait_for_timeout(1000)

        await page.evaluate("window.showCalendar('shop')")
        await page.wait_for_timeout(1000)

        # Click the Token button to ensure we have money to buy masterball and test selection
        await page.evaluate("window.giveFreeTokens()")
        await page.wait_for_timeout(1000)

        await page.evaluate("window.buyTokenItem('masterball')")
        await page.wait_for_timeout(1000)

        # Try opening Vitamin select to ensure uniform sizes
        await page.evaluate("window.showTokenItemSelect('vitamin')")
        await page.wait_for_timeout(1000)
        await page.screenshot(path="/home/jules/verification/screenshots/vitamin_select_uniform.png")

        await browser.close()

asyncio.run(verify())
