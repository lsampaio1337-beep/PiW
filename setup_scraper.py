import requests
from bs4 import BeautifulSoup
import time
import re
import pandas as pd
import sys

def get_galar_locations():
    url = "https://pokemondb.net/location"
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
    response = requests.get(url, headers=headers)
    response.raise_for_status()

    soup = BeautifulSoup(response.content, 'html.parser')
    galar_section = soup.find(id="loc-galar")
    if not galar_section:
        return []

    locations = []
    for link in galar_section.find_all('a'):
        href = link.get('href')
        if href and href.startswith('/location/'):
            name = link.text.strip()
            locations.append({
                'name': name,
                'url': 'https://pokemondb.net' + href
            })
    return locations

def parse_route_page(url, route_name):
    print(f"Scraping {route_name}...")
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}

    max_retries = 5
    for attempt in range(max_retries):
        try:
            response = requests.get(url, headers=headers, timeout=15)
            response.raise_for_status()
            break
        except requests.RequestException as e:
            if attempt == max_retries - 1:
                print(f"Failed to scrape {url} after {max_retries} attempts. Error: {e}")
                return []
            print(f"Attempt {attempt+1} failed. Retrying in 5 seconds...")
            time.sleep(5)

    soup = BeautifulSoup(response.content, 'html.parser')

    gen8_heading = soup.find(['h2', 'h3'], string=re.compile(r'Generation 8', re.I))
    if not gen8_heading:
        return []

    data = []

    current_element = gen8_heading.find_next_sibling()
    current_method = "Unknown"
    current_weather = "All Weather"

    while current_element:
        if current_element.name in ['h2', 'h3'] and 'Generation' in current_element.text:
            break

        if current_element.name == 'h3':
            current_method = current_element.text.strip()

        elif current_element.name == 'div' and 'resp-scroll' in current_element.get('class', []):
            table = current_element.find('table', class_='data-table')
            if not table:
                current_element = current_element.find_next_sibling()
                continue

            tbody = table.find('tbody')
            if not tbody:
                current_element = current_element.find_next_sibling()
                continue

            for row in tbody.find_all('tr'):
                status_cell = row.find('th', class_='cell-loc-status')
                if status_cell:
                    current_weather = status_cell.text.strip()
                    continue

                if row.find('th', class_='cell-loc-spacer'):
                    continue

                cols = row.find_all('td')
                if len(cols) < 5:
                    continue

                pokemon_cell = cols[0]
                pokemon_link = pokemon_cell.find('a', class_='ent-name')
                if not pokemon_link:
                    continue

                pokemon_name = pokemon_link.text.strip()

                # Try getting national dex ID from title attribute
                pokemon_id = ""
                if pokemon_link.get('title'):
                    title_match = re.search(r'#(\d+)', pokemon_link.get('title'))
                    if title_match:
                        pokemon_id = title_match.group(1)

                games = []
                for g_idx in [1, 2]:
                    game_cell = cols[g_idx]
                    span = game_cell.find('span')
                    if span:
                        games.append(span.text.strip())
                    elif game_cell.text.strip():
                        games.append(game_cell.text.strip())
                games_str = "/".join(filter(bool, games))

                rarity_cell = cols[3]
                rarity_span = rarity_cell.find('span', class_='icon-rarity')
                rate_val = 0.0
                if rarity_span:
                    rate_text = rarity_span.text.strip()
                    rate_match = re.search(r'([\d\.]+)\s*%', rate_text)
                    if rate_match:
                        rate_val = float(rate_match.group(1))
                    elif rate_text.lower() == 'gift' or rate_text.lower() == 'one' or rate_text.lower() == 'choice':
                        rate_val = 100.0

                if rate_val > 0:
                    data.append({
                        'route': route_name,
                        'pokemon_id': pokemon_id,
                        'pokemon_name': pokemon_name,
                        'method': current_method,
                        'weather': current_weather,
                        'rate': rate_val,
                        'games': games_str
                    })

        current_element = current_element.find_next_sibling()

    return data

if __name__ == "__main__":
    import os

    # Load previously scraped data if exists to resume
    all_data = []
    scraped_routes = set()
    if os.path.exists("all_galar_scraped.csv"):
        try:
            df_existing = pd.read_csv("all_galar_scraped.csv")
            all_data = df_existing.to_dict('records')
            scraped_routes = set(df_existing['route'].unique())
            print(f"Loaded {len(scraped_routes)} previously scraped routes.")
        except Exception as e:
            print(f"Could not load existing data: {e}")

    locations = get_galar_locations()
    print(f"Found {len(locations)} Galar locations total.")

    for i, loc in enumerate(locations):
        if loc['name'] in scraped_routes:
            continue

        loc_data = parse_route_page(loc['url'], loc['name'])
        all_data.extend(loc_data)

        # Save incrementally
        df = pd.DataFrame(all_data)
        df.to_csv("all_galar_scraped.csv", index=False)

        time.sleep(1)

    print("Done scraping.")
