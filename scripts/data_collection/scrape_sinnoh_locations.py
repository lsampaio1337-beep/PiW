import requests
from bs4 import BeautifulSoup
import json
from collections import defaultdict
import time
import pandas as pd
import os

HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
POKEMONDB_BASE_URL = "https://pokemondb.net"

def fetch_sinnoh_routes():
    """Fetch all Sinnoh locations from pokemondb.net/location and order them by progression."""
    res = requests.get(f"{POKEMONDB_BASE_URL}/location", headers=HEADERS)
    soup = BeautifulSoup(res.text, 'html.parser')

    routes = []
    tabs = soup.find_all('a', class_='sv-tabs-tab')
    for tab in tabs:
        if 'Sinnoh' in tab.text:
            panel_id = tab.get('href').lstrip('#')
            panel = soup.find(id=panel_id)
            if panel:
                for link in panel.find_all('a'):
                    routes.append({
                        'name': link.text.strip(),
                        'url': POKEMONDB_BASE_URL + link.get('href')
                    })

    # Define standard progression order for Sinnoh
    order_list = [
        "Twinleaf Town", "Route 201", "Lake Verity", "Route 202", "Jubilife City",
        "Route 204", "Ravaged Path", "Route 203", "Oreburgh Gate", "Oreburgh City",
        "Oreburgh Mine", "Route 207", "Route 205", "Floaroma Meadow", "Valley Windworks",
        "Eterna Forest", "Old Chateau", "Eterna City", "Route 211", "Mt. Coronet",
        "Route 206", "Wayward Cave", "Route 208", "Hearthome City", "Route 209",
        "Lost Tower", "Solaceon Town", "Solaceon Ruins", "Route 210", "Veilstone City",
        "Route 214", "Maniac Tunnel", "Ruin Maniac Tunnel", "Ruin Maniac Cave", "Valor Lakefront",
        "Route 213", "Pastoria City", "Great Marsh", "Route 212", "Pokémon Mansion",
        "Trophy Garden", "Celestic Town", "Fuego Ironworks", "Route 218", "Canalave City",
        "Iron Island", "Route 215", "Lake Valor", "Lake Acuity", "Route 216",
        "Route 217", "Acuity Lakefront", "Snowpoint City", "Snowpoint Temple", "Spear Pillar",
        "Distortion World", "Sendoff Spring", "Turnback Cave", "Route 222", "Sunyshore City",
        "Route 223", "Pokémon League", "Victory Road", "Route 224", "Route 219",
        "Route 220", "Route 221", "Pal Park", "Route 225", "Survival Area",
        "Route 226", "Route 227", "Stark Mountain", "Route 228", "Route 229",
        "Resort Area", "Route 230", "Fullmoon Island", "Newmoon Island", "Flower Paradise",
        "Hall of Origin", "Roaming Sinnoh"
    ]

    underground_caves = [
        "Spacious Cave", "Grassland Cave", "Waterweed Cave", "Rocky Cave",
        "Volcanic Cave", "Swampy Cave", "Dazzling Cave", "Whiteout Cave",
        "Icy Cave", "Riverbank Cave", "Sandsear Cave", "Still-Water Cavern",
        "Sunlit Cavern", "Big Bluff Cavern", "Stargleam Cavern", "Glacial Cavern",
        "Bogsunk Cavern", "Typhlo Cavern", "Fountainspring Cave"
    ]

    ordered_routes = []
    underground_routes = []
    remaining_routes = []

    for r in routes:
        if r['name'] in order_list:
            ordered_routes.append(r)
        elif r['name'] in underground_caves:
            underground_routes.append(r)
        else:
            remaining_routes.append(r)

    ordered_routes.sort(key=lambda x: order_list.index(x['name']))
    final_routes = ordered_routes + remaining_routes + underground_routes

    for i, r in enumerate(final_routes):
        r['progress_order'] = i + 1

    return final_routes


def fetch_platinum_dex():
    """Fetch the expanded Platinum regional Pokedex to map Pokemon to Regional IDs (1-210)"""
    res = requests.get(f"{POKEMONDB_BASE_URL}/pokedex/game/platinum", headers=HEADERS)
    soup = BeautifulSoup(res.text, 'html.parser')
    dex = {}

    cards = soup.select('.infocard')
    for card in cards:
        small = card.find('small')
        if small:
            text = small.text
            if text.startswith('#'):
                pid = text.strip().replace('#', '')
                name_a = card.find('a', class_='ent-name')
                if name_a:
                    dex[name_a.text.strip()] = int(pid)
    return dex


def parse_location(url, route_name, progress_order, plat_dex):
    print(f"Parsing {route_name}...")
    try:
        res = requests.get(url, headers=HEADERS, timeout=10)
    except Exception as e:
        print(f"Failed to fetch {url}: {e}")
        return []

    soup = BeautifulSoup(res.text, 'html.parser')

    container = soup.find(id='tab-locations-gen4')
    if not container:
        h2 = soup.find(lambda tag: tag.name == 'h2' and 'Generation 4' in tag.text)
        if h2:
            tables = []
            curr = h2.find_next_sibling()
            while curr and curr.name != 'h2':
                if curr.name == 'table' and 'data-table' in curr.get('class', []):
                    tables.append(curr)
                elif curr.find('table', class_='data-table'):
                    tables.extend(curr.find_all('table', class_='data-table'))
                curr = curr.find_next_sibling()
        else:
            tables = soup.find_all('table', class_='data-table')
    else:
        tables = container.find_all('table', class_='data-table')

    raw_encounters = []

    for table in tables:
        tbody = table.find('tbody')
        if not tbody: continue

        first_tr = tbody.find('tr')
        if not first_tr: continue
        first_tds = first_tr.find_all('td')
        if len(first_tds) < 2: continue

        games_col = first_tds[1]
        icons = games_col.find_all('span', class_='igame')
        first_games = [ic.text for ic in icons]
        if not first_games:
            first_games = games_col.text.split()

        if set(first_games).intersection({'BD', 'SP'}) and not set(first_games).intersection({'D', 'P', 'Pt'}):
            continue

        method = "Walking" # Default
        prev = table.find_previous_sibling(['h2', 'h3', 'h4'])
        if prev:
            text = prev.text.strip()
            if 'Generation' not in text:
                method = text

        ths = table.find('thead').find_all('th') if table.find('thead') else table.find_all('th')
        col_names = [th.text.strip() for th in ths]

        poke_idx = col_names.index('Pokémon') if 'Pokémon' in col_names else -1
        games_idx = col_names.index('Games') if 'Games' in col_names else -1
        rarity_idx = col_names.index('Rarity') if 'Rarity' in col_names else -1

        if poke_idx == -1: continue

        for tr in tbody.find_all('tr'):
            tds = tr.find_all('td')
            if len(tds) <= max(poke_idx, games_idx, rarity_idx) if rarity_idx > -1 else poke_idx: continue

            poke_node = tds[poke_idx].find('a', class_='ent-name')
            if not poke_node: continue
            poke_name = poke_node.text.strip()

            row_games = []
            if games_idx > -1:
                row_icons = tds[games_idx].find_all('span', class_='igame')
                if row_icons:
                    row_games = [ic.text for ic in row_icons]
                else:
                    row_games = tds[games_idx].text.split()

            row_gen4 = set(row_games).intersection({'D', 'P', 'Pt'})
            if not row_gen4: continue

            row_method = method
            for i, col in enumerate(col_names):
                if i >= len(tds): continue
                val = tds[i].text.strip()
                if val:
                    if col == 'Swarm': row_method = 'Swarm'
                    elif 'GBA' in col or 'slot' in col.lower(): row_method = 'Dual-slot'
                    elif 'Radar' in col: row_method = 'Poké Radar'

            small = tds[poke_idx].find('small')
            if small:
                extra = small.text.strip()
                if 'Swarm' in extra: row_method = 'Swarm'
                elif 'Radar' in extra or 'Poké Radar' in extra: row_method = 'Poké Radar'
                elif 'GBA' in extra or 'slot' in extra: row_method = 'Dual-slot'

            if 'Details' in col_names:
                det_idx = col_names.index('Details')
                if det_idx < len(tds):
                    det_text = tds[det_idx].text.strip()
                    if 'Starter' in det_text or 'Gift' in det_text or 'Fossil' in det_text:
                        row_method = 'Gift/Event/Fossil'

            rate = 100.0
            if rarity_idx > -1:
                rate_text = tds[rarity_idx].text.strip()
                rates = [float(r.replace('%', '').strip()) for r in rate_text.split('/') if r.replace('%', '').strip().replace('.','',1).isdigit()]
                if rates:
                    rate = sum(rates) / len(rates)

            raw_encounters.append({
                'pokemon': poke_name,
                'method': row_method,
                'rate': rate,
                'games': list(row_gen4)
            })

    grouped = defaultdict(list)
    for enc in raw_encounters:
        grouped[(enc['method'], enc['pokemon'])].append(enc)

    merged_encounters = []
    for (method, poke), items in grouped.items():
        total_rate = sum(item['rate'] for item in items)
        avg_rate = total_rate / len(items)

        regional_id = plat_dex.get(poke, "")

        merged_encounters.append({
            'Progress Order': progress_order,
            'Route / Place': route_name,
            'Pokemon ID Regional': regional_id,
            'Pokemon Name': poke,
            'Method': method,
            'Rate': avg_rate
        })

    method_groups = defaultdict(list)
    for enc in merged_encounters:
        method_groups[enc['Method']].append(enc)

    final_encounters = []
    for method, encs in method_groups.items():
        total_method_rate = sum(e['Rate'] for e in encs)
        for e in encs:
            if total_method_rate > 0:
                normalized = (e['Rate'] / total_method_rate) * 100.0
            else:
                normalized = 100.0
            e['% of appearance'] = round(normalized, 2)
            del e['Rate']
            final_encounters.append(e)

    return final_encounters

def main():
    print("Fetching Sinnoh Routes...")
    routes = fetch_sinnoh_routes()
    print("Fetching Platinum Pokedex...")
    plat_dex = fetch_platinum_dex()

    all_data = []
    for r in routes:
        data = parse_location(r['url'], r['name'], r['progress_order'], plat_dex)
        all_data.extend(data)
        time.sleep(0.1) # Be nice to the server

    df = pd.DataFrame(all_data)
    cols = ['Progress Order', 'Route / Place', 'Pokemon ID Regional', 'Pokemon Name', 'Method', '% of appearance']
    df = df[cols]

    output_file = 'Sinnoh_Location_Data.xlsx'
    df.to_excel(output_file, index=False)
    print(f"Data successfully saved to {output_file}!")

if __name__ == "__main__":
    main()
