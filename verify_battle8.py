import asyncio
from playwright.async_api import async_playwright
import os

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, args=['--disable-web-security'])
        context = await browser.new_context()
        page = await context.new_page()

        file_url = f"file://{os.path.abspath('index.html')}"
        print(f"Loading {file_url}")
        await page.goto(file_url)

        await asyncio.sleep(2)

        # Wipe save
        try:
            await page.click('#btn-wipe-save', timeout=2000)
            print("Wiped existing save.")
            await asyncio.sleep(1)
        except Exception as e:
            pass

        # New profile
        try:
            await page.click('#btn-new-profile', timeout=2000)
            print("Clicked new profile.")
            await asyncio.sleep(1)
        except Exception as e:
            pass

        # Choose starter
        try:
            await page.click('#choose-charmander', timeout=2000)
            print("Chose Charmander.")
            await asyncio.sleep(2)
        except Exception as e:
            pass

        # Click route 1
        try:
            print("Attempting to start battle via Route 1 map-node...")
            await page.evaluate("""() => {
                const route1 = document.querySelector('.map-node[data-route-id="1"]');
                if (route1) { route1.click(); }
                else { console.log('Route 1 not found'); }
            }""")
            await asyncio.sleep(4)
        except Exception as e:
            print("Error starting battle via Route 1:", e)

        await page.screenshot(path="verification8.png")
        print("Screenshot saved to verification8.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
