import requests
from bs4 import BeautifulSoup
import pandas as pd
import time
import re

progression_list = [
    "Vaniville Town", "Aquacorde Town", "Route 2", "Santalune Forest", "Route 3",
    "Santalune City", "Route 22", "Route 4", "Lumiose City", "Route 5",
    "Camphrier Town", "Parfum Palace", "Route 6", "Route 7", "Connecting Cave",
    "Route 8", "Ambrette Town", "Route 9", "Glittering Cave", "Cyllage City",
    "Route 10", "Geosenge Town", "Route 11", "Reflection Cave", "Shalour City",
    "Tower of Mastery", "Route 12", "Azure Bay", "Coumarine City", "Route 13",
    "Route 14", "Laverre City", "Route 15", "Lost Hotel", "Route 16",
    "Frost Cavern", "Route 17", "Team Flare HQ", "Route 18", "Couriway Town",
    "Route 19", "Snowbelle City", "Route 20", "Pokémon Village", "Route 21",
    "Victory Road", "Terminus Cave", "Sea Spirit's Den", "Unknown Dungeon",
    "Roaming Kalos"
]

base_url = "https://pokemondb.net"

rarity_weights = {
    'very common': 30,
    'common': 20,
    'uncommon': 10,
    'rare': 5,
    'very rare': 1,
    'often': 20,
    'average': 10,
    'seldom': 5,
    'choice': 100,
    'one': 100,
    'gift': 100,
    'static': 100,
    'interact': 100
}

def fetch_kalos_regional_dex():
    url = "https://pokemondb.net/pokedex/game/x-y"
    response = requests.get(url)
    soup = BeautifulSoup(response.content, 'html.parser')

    mapping = {}

    headings = soup.find_all('h2')
    for h2 in headings:
        prefix = ""
        if 'Central' in h2.text: prefix = "Central"
        elif 'Coastal' in h2.text: prefix = "Coastal"
        elif 'Mountain' in h2.text: prefix = "Mountain"

        if prefix:
            container = h2.find_next_sibling('div', class_='infocard-list')
            if container:
                for card in container.find_all('div', class_='infocard'):
                    small_tags = card.find_all('small')
                    regional_id = ""
                    if len(small_tags) >= 1:
                        regional_id = small_tags[0].text.strip()

                    a_tag = card.find('a', class_='ent-name')
                    if a_tag:
                        name = a_tag.text.strip()
                        # If a Pokemon is in multiple dexes somehow, keep the first one found or overwrite, X/Y has unique assignments mostly
                        mapping[name] = f"{prefix} {regional_id}".strip()

    return mapping

kalos_regional_dex = fetch_kalos_regional_dex()

def fetch_kalos_locations():
    url = f"{base_url}/location"
    response = requests.get(url)
    soup = BeautifulSoup(response.content, 'html.parser')
    locations = {}
    kalos_tab = soup.find('div', id='loc-kalos')
    if kalos_tab:
        for link in kalos_tab.find_all('a'):
            locations[link.text] = link['href']
    return locations

def standardize_method(raw_method):
    raw_method = raw_method.lower()
    if any(x in raw_method for x in ['rod', 'surfing', 'water', 'fishing']):
        return 'water'
    elif any(x in raw_method for x in ['static', 'gift', 'trade', 'fossil', 'interact', 'only one']):
        return 'static'
    else:
        return 'walk'

def parse_encounter_table(table, method_name):
    encounters = []
    tbody = table.find('tbody')
    if not tbody:
        return []

    for tr in tbody.find_all('tr'):
        th = tr.find('th')
        if th and not tr.find('td'):
            method_name = th.text.strip()
            continue

        tds = tr.find_all('td')
        if len(tds) >= 4:
            pokemon_col = tds[0]

            a_tag = pokemon_col.find('a', class_='ent-name')
            pokemon_name = a_tag.text.strip() if a_tag else ""

            if not pokemon_name:
                continue

            x_col = tds[1]
            y_col = tds[2]

            x_active = 'cell-loc-game-blank' not in x_col.get('class', [])
            y_active = 'cell-loc-game-blank' not in y_col.get('class', [])

            rate_col = tds[3]
            img_tag = rate_col.find('img')

            weight = 0
            if img_tag and img_tag.get('title'):
                title = img_tag.get('title').lower()
                weight = rarity_weights.get(title, 10)
            elif rate_col.text.strip():
                text = rate_col.text.strip().lower()
                weight = rarity_weights.get(text, 10)
                if 'one' in text or 'choice' in text or 'interact' in text:
                    method_name = 'static'
            else:
                weight = 10

            x_pct = weight if x_active else 0
            y_pct = weight if y_active else 0

            if x_pct == 0 and y_pct == 0:
                text = rate_col.text.strip().lower()
                if 'one' in text or 'choice' in text or 'interact' in text:
                    x_pct = 100
                    y_pct = 100
                    method_name = 'static'
                elif pokemon_name == 'Snorlax':
                    x_pct = 100
                    y_pct = 100
                    method_name = 'static'

            regional_id = kalos_regional_dex.get(pokemon_name, "")

            if x_pct > 0 or y_pct > 0:
                encounters.append({
                    'pokemon_id': regional_id,
                    'pokemon_name': pokemon_name,
                    'method_raw': method_name,
                    'x_pct': x_pct,
                    'y_pct': y_pct
                })
    return encounters

def scrape_location(url, location_name):
    full_url = f"{base_url}{url}"
    response = requests.get(full_url)
    soup = BeautifulSoup(response.content, 'html.parser')

    all_encounters = []
    gen6_h2 = soup.find(lambda tag: tag.name == 'h2' and ('Generation 6' in tag.text or 'Pokémon X' in tag.text))

    if gen6_h2:
        curr = gen6_h2.find_next_sibling()
        current_method = "walk"

        while curr and curr.name != 'h2':
            if curr.name in ['h3', 'h4']:
                current_method = curr.text.strip()
            elif curr.name == 'table' and 'data-table' in curr.get('class', []):
                encounters = parse_encounter_table(curr, current_method)
                all_encounters.extend(encounters)
            elif curr.name == 'div':
                tables = curr.find_all('table', class_='data-table')
                for table in tables:
                    encounters = parse_encounter_table(table, current_method)
                    all_encounters.extend(encounters)
            curr = curr.find_next_sibling()
    else:
        tables = soup.find_all('table', class_='data-table')
        for table in tables:
            prev = table.find_previous_sibling(['h3', 'h4'])
            if prev:
                current_method = prev.text.strip()
            else:
                parent = table.find_parent('div', class_='grid-col')
                if parent and parent.find(['h3', 'h4']):
                    current_method = parent.find(['h3', 'h4']).text.strip()
                else:
                    current_method = "walk"
            encounters = parse_encounter_table(table, current_method)
            all_encounters.extend(encounters)

    return all_encounters

def process_data(locations):
    all_data = []

    for i, loc_name in enumerate(progression_list):
        print(f"Processing {loc_name}...")
        if loc_name not in locations:
            print(f"Warning: {loc_name} not found in scraped locations.")
            all_data.append({
                'Progress Order': i + 1,
                'Route / Place': loc_name,
                'Pokemon ID Regional': '',
                'Pokemon Name': '',
                'Method': '',
                '% of appearance': ''
            })
            continue

        encounters = scrape_location(locations[loc_name], loc_name)

        if not encounters:
            all_data.append({
                'Progress Order': i + 1,
                'Route / Place': loc_name,
                'Pokemon ID Regional': '',
                'Pokemon Name': '',
                'Method': '',
                '% of appearance': ''
            })
            continue

        processed_encounters = []
        for e in encounters:
            method = standardize_method(e['method_raw'])
            combined_weight = (e['x_pct'] + e['y_pct']) / 2.0

            processed_encounters.append({
                'pokemon_id': e['pokemon_id'],
                'pokemon_name': e['pokemon_name'],
                'method': method,
                'weight': combined_weight
            })

        from collections import defaultdict
        grouped = defaultdict(lambda: defaultdict(float))

        for e in processed_encounters:
            grouped[e['method']][(e['pokemon_id'], e['pokemon_name'])] += e['weight']

        for method, pokes in grouped.items():
            total_weight = sum(pokes.values())
            if total_weight > 0:
                for (pid, pname), weight in pokes.items():
                    normalized_pct = (weight / total_weight) * 100.0
                    all_data.append({
                        'Progress Order': i + 1,
                        'Route / Place': loc_name,
                        'Pokemon ID Regional': pid,
                        'Pokemon Name': pname,
                        'Method': method,
                        '% of appearance': round(normalized_pct, 2)
                    })

        time.sleep(0.5)

    return all_data

locations_map = fetch_kalos_locations()
final_data = process_data(locations_map)
df = pd.DataFrame(final_data)
df.to_excel("kalos_routes.xlsx", index=False)
print("Data saved to kalos_routes.xlsx")
