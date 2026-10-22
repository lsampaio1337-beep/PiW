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

def fetch_pokemon_bst():
    url = f"{base_url}/pokedex/all"
    response = requests.get(url)
    soup = BeautifulSoup(response.content, 'html.parser')

    mapping = {}
    table = soup.find('table', id='pokedex')
    if table:
        tbody = table.find('tbody')
        for tr in tbody.find_all('tr'):
            tds = tr.find_all('td')
            if len(tds) >= 5:
                a_tag = tds[1].find('a', class_='ent-name')
                if a_tag:
                    name = a_tag.text.strip()
                    bst = tds[3].text.strip()
                    if name not in mapping:
                        mapping[name] = bst
    return mapping

bst_map = fetch_pokemon_bst()

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

            level_str = ""
            for idx in range(3, len(tds)):
                col = tds[idx]
                class_list = col.get('class', [])
                if isinstance(class_list, str):
                    class_list = [class_list]

                if 'cell-num' in class_list or re.match(r'^[\d\-]+$', col.text.strip()):
                    if idx == 4:
                        level_str = col.text.strip()
                        break

            if not level_str and len(tds) >= 5:
                 level_str = tds[4].text.strip()

            x_active = 'cell-loc-game-blank' not in x_col.get('class', [])
            y_active = 'cell-loc-game-blank' not in y_col.get('class', [])

            rate_col = tds[3]
            img_tag = rate_col.find('img')

            weight = 0
            if img_tag and img_tag.get('title'):
                title = img_tag.get('title').lower()
                weight = rarity_weights.get(title, 10)
            elif rate_col.text.strip() and not re.match(r'^[\d\-]+$', rate_col.text.strip()):
                text = rate_col.text.strip().lower()
                weight = rarity_weights.get(text, 10)
                if 'one' in text or 'choice' in text or 'interact' in text:
                    method_name = 'static'
            else:
                weight = 10

            x_pct = weight if x_active else 0
            y_pct = weight if y_active else 0

            if x_pct == 0 and y_pct == 0:
                text = rate_col.text.strip().lower() if rate_col.text.strip() else ""
                if 'one' in text or 'choice' in text or 'interact' in text:
                    x_pct = 100
                    y_pct = 100
                    method_name = 'static'
                elif pokemon_name == 'Snorlax':
                    x_pct = 100
                    y_pct = 100
                    method_name = 'static'

            if x_pct > 0 or y_pct > 0:
                encounters.append({
                    'pokemon_name': pokemon_name,
                    'level': level_str,
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

def merge_levels(level_list):
    nums = []
    for lvl in level_list:
        lvl = str(lvl).strip()
        if not lvl or lvl == 'nan':
            continue
        matches = re.findall(r'\d+', lvl)
        nums.extend([int(m) for m in matches])

    if not nums:
        return ""

    min_lvl = min(nums)
    max_lvl = max(nums)
    if min_lvl == max_lvl:
        return str(min_lvl)
    else:
        return f"{min_lvl}-{max_lvl}"

def is_almost_similar(route_a_set, route_b_set):
    """
    Returns True if the sets are identical, or if they differ by at most
    1 Pokemon (added, removed, or swapped).
    """
    # If route B has 1 new pokemon (B - A == 1) and missing 1 (A - B == 1) it's a swap (1 diff).
    # If B is identical (0, 0)
    # If B has 1 extra (1, 0) or 1 missing (0, 1)
    diff_a_b = len(route_a_set - route_b_set)
    diff_b_a = len(route_b_set - route_a_set)
    return diff_a_b <= 1 and diff_b_a <= 1

def process_data(locations):
    # Phase 1: Scrape all data and organize by route
    scraped_routes_data = []

    for i, loc_name in enumerate(progression_list):
        if loc_name not in locations:
            scraped_routes_data.append({'name': loc_name, 'raw_data': [], 'pokemon_set': set()})
            continue

        encounters = scrape_location(locations[loc_name], loc_name)

        if not encounters:
            scraped_routes_data.append({'name': loc_name, 'raw_data': [], 'pokemon_set': set()})
            continue

        processed_encounters = []
        pokemon_set = set()
        for e in encounters:
            method = standardize_method(e['method_raw'])
            combined_weight = (e['x_pct'] + e['y_pct']) / 2.0

            if e['pokemon_name']:
                pokemon_set.add(e['pokemon_name'])

            processed_encounters.append({
                'pokemon_name': e['pokemon_name'],
                'level': e['level'],
                'method': method,
                'weight': combined_weight
            })

        scraped_routes_data.append({
            'name': loc_name,
            'raw_data': processed_encounters,
            'pokemon_set': pokemon_set
        })
        time.sleep(0.5)

    # Phase 2: Filter routes based on similarity
    kept_routes = []
    for current_route in scraped_routes_data:
        if not current_route['pokemon_set']:
            # Keep empty routes (like cities with no wild encounters) ?
            # Or should empty routes be removed if they are similar to another empty route?
            # A symmetric diff of empty set vs empty set is 0. So second empty route is removed.
            # Let's see if the user wants cities kept. The previous plan included them.
            # However, technically empty set vs empty set has sym_diff=0. So all towns would be deleted except the first.
            # Let's bypass the check for entirely empty routes so we don't accidentally remove towns.
            kept_routes.append(current_route)
            continue

        is_similar = False
        for previous_route in kept_routes:
            if not previous_route['pokemon_set']:
                continue # don't compare against empty towns

            if is_almost_similar(current_route['pokemon_set'], previous_route['pokemon_set']):
                print(f"Dropping {current_route['name']} because it is almost similar to {previous_route['name']}")
                is_similar = True
                break

        if not is_similar:
            kept_routes.append(current_route)

    # Phase 3: Finalize formatting, calculating percentages, and tracking '1st?'
    all_data = []
    seen_pokemon = set()

    order = 1
    for route in kept_routes:
        loc_name = route['name']
        raw_data = route['raw_data']

        if not raw_data:
            all_data.append({
                'Progress Order': order,
                'Route / Place': loc_name,
                'Pokemon Name': '',
                'Level': '',
                'BST': '',
                'Method': '',
                '% of appearance': '',
                '1st?': ''
            })
            order += 1
            continue

        from collections import defaultdict
        grouped_weights = defaultdict(lambda: defaultdict(float))
        grouped_levels = defaultdict(lambda: defaultdict(list))

        for e in raw_data:
            p_name = e['pokemon_name']
            m = e['method']
            grouped_weights[m][p_name] += e['weight']
            if e['level']:
                grouped_levels[m][p_name].append(e['level'])

        for method, pokes in grouped_weights.items():
            total_weight = sum(pokes.values())
            if total_weight > 0:
                for pname, weight in pokes.items():
                    normalized_pct = (weight / total_weight) * 100.0
                    merged_level = merge_levels(grouped_levels[method][pname])
                    bst = bst_map.get(pname, "")

                    is_first = "No"
                    if pname not in seen_pokemon:
                        is_first = "Yes"
                        seen_pokemon.add(pname)

                    all_data.append({
                        'Progress Order': order,
                        'Route / Place': loc_name,
                        'Pokemon Name': pname,
                        'Level': merged_level,
                        'BST': bst,
                        'Method': method,
                        '% of appearance': round(normalized_pct, 2),
                        '1st?': is_first
                    })

        order += 1

    return all_data

locations_map = fetch_kalos_locations()
final_data = process_data(locations_map)
df = pd.DataFrame(final_data)

# Reorder columns to exactly match user request order with new columns
df = df[['Progress Order', 'Route / Place', 'Pokemon Name', 'Level', 'BST', 'Method', '% of appearance', '1st?']]

df.to_excel("kalos_routes.xlsx", index=False)
print("Data saved to kalos_routes.xlsx")
