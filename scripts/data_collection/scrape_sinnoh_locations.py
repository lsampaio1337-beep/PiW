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
        # Check all tbodies (some methods are separated by tbodies in the same table)
        tbodies = table.find_all('tbody')
        if not tbodies: continue

        # Pokemon DB usually defines columns in thead. Let's find columns.
        ths = table.find('thead').find_all('th') if table.find('thead') else table.find_all('th')
        col_names = [th.text.strip() for th in ths]

        poke_idx = col_names.index('Pokémon') if 'Pokémon' in col_names else -1
        games_idx = col_names.index('Games') if 'Games' in col_names else -1
        rarity_idx = col_names.index('Rarity') if 'Rarity' in col_names else -1
        levels_idx = col_names.index('Levels') if 'Levels' in col_names else -1

        if poke_idx == -1: continue

        method_from_heading = "Walking" # Default

        # Check if table is inside a resp-scroll div
        target = table
        if table.parent and table.parent.name == 'div' and 'resp-scroll' in table.parent.get('class', []):
            target = table.parent

        prev = target.find_previous_sibling(['h2', 'h3', 'h4'])
        if prev:
            text = prev.text.strip()
            if 'Generation' not in text:
                method_from_heading = text

        for tbody in tbodies:
            sub_method = method_from_heading
            # Check for sub-header inside tbody (e.g. Swarm, GBA slot)
            for tr in tbody.find_all('tr'):
                th = tr.find('th')
                if th and th.get('colspan'):
                    sub_method_text = th.text.strip()
                    if sub_method_text:
                        if 'GBA slot' in sub_method_text or 'Ruby' in sub_method_text or 'Sapphire' in sub_method_text or 'Emerald' in sub_method_text or 'FireRed' in sub_method_text or 'LeafGreen' in sub_method_text:
                           sub_method = "Dual-slot"
                        else:
                           sub_method = sub_method_text

            for tr in tbody.find_all('tr'):
                tds = tr.find_all('td')
                if not tds: continue
                # We expect enough columns
                if len(tds) <= max(poke_idx, games_idx, rarity_idx if rarity_idx > -1 else 0): continue

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

                row_method = sub_method
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
                rate_found = False
                for td in tds:
                    # Rarity text might be like 10%
                    if '%' in td.text:
                        rate_text = td.text.strip()
                        rates = [float(r.replace('%', '').strip()) for r in rate_text.split('/') if r.replace('%', '').strip().replace('.','',1).isdigit()]
                        if rates:
                            rate = sum(rates) / len(rates)
                            rate_found = True
                            break

                if not rate_found:
                    # Look for rarity icons
                    for td in tds:
                        imgs = td.find_all('img')
                        for img in imgs:
                            alt = img.get('alt', '').lower()
                            if alt in ['common', 'uncommon', 'rare', 'very rare']:
                                if alt == 'common': rate = 50.0
                                elif alt == 'uncommon': rate = 20.0
                                elif alt == 'rare': rate = 5.0
                                elif alt == 'very rare': rate = 1.0
                                rate_found = True
                                break
                        if rate_found:
                            break

                # Extract level
                level = ""
                for td in tds:
                    if td.get('class') and 'cell-num' in td.get('class'):
                        level = td.text.strip()
                        break


                # Exclude specific special methods requested by user.
                # We only want standard "Pokémon" tables (Walking, Surfing, Rods, etc.)
                # If row_method indicates it's GBA slot, Swarm, Radar, Gift, etc. we skip it.
                skip_methods = ['Swarm', 'Dual-slot', 'Poké Radar', 'PokeRadar', 'Radar', 'Gift', 'Event', 'Fossil']
                if any(sm in row_method for sm in skip_methods):
                    continue

                raw_encounters.append({
                    'pokemon': poke_name,
                    'method': row_method,
                    'rate': rate,
                    'games': list(row_gen4),
                    'level': level
                })

    grouped = defaultdict(list)
    for enc in raw_encounters:
        grouped[(enc['method'], enc['pokemon'])].append(enc)

    merged_encounters = []
    for (method, poke), items in grouped.items():
        total_rate = sum(item['rate'] for item in items)
        avg_rate = total_rate / len(items)

        # Merge levels (e.g., if DP is "2-3" and Pt is "3-4", combine them)
        levels_set = set()
        for i in items:
            if i['level']:
                for p in i['level'].split(','):
                    levels_set.add(p.strip())

        # Extract all numbers to find min and max if there are ranges
        all_nums = []
        for l in levels_set:
            parts = l.split('-')
            for p in parts:
                if p.isdigit():
                    all_nums.append(int(p))

        if len(all_nums) > 0:
            min_l = min(all_nums)
            max_l = max(all_nums)
            if min_l == max_l:
                merged_level = str(min_l)
            else:
                merged_level = f"{min_l}-{max_l}"
        else:
            merged_level = ", ".join(sorted(list(levels_set)))


        regional_id = plat_dex.get(poke, "")

        merged_encounters.append({
            'Progress Order': progress_order,
            'Route / Place': route_name,
            'Pokemon ID Regional': regional_id,
            'Pokemon Name': poke,
            'Method': method,
            'Rate': avg_rate,
            'Level': merged_level
        })


    # User requested: If a pokemon appears more than 1 time at the same route, keep only 1 register
    # We will track seen pokemon in this route and keep the first one we process.
    seen_pokemon = set()
    deduped_encounters = []
    for enc in merged_encounters:
        if enc['Pokemon Name'] not in seen_pokemon:
            deduped_encounters.append(enc)
            seen_pokemon.add(enc['Pokemon Name'])

    method_groups = defaultdict(list)
    for enc in deduped_encounters:
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
    cols = ['Progress Order', 'Route / Place', 'Pokemon ID Regional', 'Pokemon Name', 'Method', 'Level', '% of appearance']
    df = df[cols]

    output_file = 'Sinnoh_Location_Data.xlsx'
    df.to_excel(output_file, index=False)
    print(f"Data successfully saved to {output_file}!")

if __name__ == "__main__":
    main()
