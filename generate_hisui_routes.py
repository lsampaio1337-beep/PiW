import requests
from bs4 import BeautifulSoup
import pandas as pd
import numpy as np
import re

def fetch_pokemon_bst():
    print("Getting Pokemon BST data...")
    url = "https://pokemondb.net/pokedex/all"
    response = requests.get(url)
    soup = BeautifulSoup(response.content, 'html.parser')
    table = soup.find('table', id='pokedex')

    bst_dict = {}
    if table:
        rows = table.find('tbody').find_all('tr')
        for row in rows:
            cols = row.find_all('td')
            if len(cols) >= 4:
                name_tag = cols[1].find('a')
                if name_tag:
                    name = name_tag.text.strip()
                    form_tag = cols[1].find('small')
                    full_name = name
                    if form_tag:
                        full_name = name + " " + form_tag.text.strip()

                    bst = cols[3].text.strip()
                    if name not in bst_dict:
                        bst_dict[name] = bst

                    if "Hisuian" in full_name:
                        bst_dict[full_name] = bst
                        bst_dict[name + " (Hisuian)"] = bst
                        bst_dict[name + " (Hisuian Form)"] = bst

                    bst_dict[full_name] = bst
    return bst_dict

def scrape_encounters(bst_dict):
    print("Fetching Hisui locations...")
    locations_url = "https://pokemondb.net/location"
    response = requests.get(locations_url)
    soup = BeautifulSoup(response.content, 'html.parser')

    hisui_tab = soup.find('div', id='loc-hisui')
    links = hisui_tab.find_all('a')
    routes = [{"name": link.text.strip(), "url": "https://pokemondb.net" + link['href']} for link in links]

    print(f"Found {len(routes)} Hisui locations.")

    all_encounters = []

    hisui_progression_order = [
        "Jubilife Village", "Aspiration Hill", "Horseshoe Plains", "Floaro Gardens",
        "Deertrack Path", "Deertrack Heights", "Nature’s Pantry", "Worn Bridge",
        "Tidewater Dam", "The Heartwood", "Grandtree Arena", "Grueling Grove",
        "Lake Verity", "Sandgem Flats", "Ramanas Island", "Obsidian Falls",
        "Oreburrow Tunnel", "Golden Lowlands", "Gapejaw Bog", "Sludge Mound",
        "Bolderoll Slope", "Scarlet Bog", "Holm of Trials", "Ursa's Ring",
        "Droning Meadow", "Cloudpool Ridge", "Cottonsedge Prairie", "Bathers' Lagoon",
        "Shrouded Ruins", "Diamond Heath", "Lake Valor", "Crossing Slope",
        "Aipom Hill", "Bolderoll Ravine", "Ginkgo Landing", "Castaway Shore",
        "Tranquility Cove", "Veilstone Cape", "Sand's Reach", "Deadwood Haunt",
        "Seagrass Haven", "Lunker's Lair", "Hideaway Bay", "Tombolo Walk",
        "Windbreak Stand", "Spring Path", "Turnback Cave", "Coastlands Camp",
        "Firespit Island", "Islespy Shore", "Seaside Hollow", "Wayward Wood",
        "Heavenward Lookout", "Wayward Cave", "Sonorous Path", "Lonely Spring",
        "Fabled Spring", "Clamberclaw Cliffs", "Celestica Ruins", "Celestica Trail",
        "Stonetooth Rows", "Sacred Plaza", "Moonview Arena", "Primeval Grotto",
        "Temple of Sinnoh", "Whiteout Valley", "Bonechill Wastes", "Avalanche Slopes",
        "Icebound Falls", "Arena's Approach", "Glacier Terrace", "Snowfall Hot Spring",
        "Heart's Crag", "Avalugg's Legacy", "Ice Column Chamber", "Lake Acuity",
        "Snowpoint Temple", "Pearl Settlement", "Windswept Run", "Ancient Quarry",
        "Cloudcap Pass", "Space-Time Distortion"
    ]

    routes_pokemon = {}

    for route in routes:
        route_name = route['name']
        print(f"Scraping {route_name}...")
        resp = requests.get(route['url'])
        route_soup = BeautifulSoup(resp.content, 'html.parser')

        tables = route_soup.find_all('table')
        pokemon_in_route = {}

        for table in tables:
            headers = [th.text.strip() for th in table.find('thead').find_all('th')] if table.find('thead') else []
            level_idx = headers.index('Levels') if 'Levels' in headers else -1

            rows = table.find('tbody').find_all('tr') if table.find('tbody') else []
            for row in rows:
                cols = row.find_all('td')
                if len(cols) > 0:
                    pokemon_name = cols[0].text.strip()
                    level = ""
                    if level_idx != -1 and len(cols) > level_idx:
                        lvl_text = cols[level_idx].text.strip()
                        if lvl_text != "—":
                            level = lvl_text

                    if pokemon_name not in pokemon_in_route:
                        pokemon_in_route[pokemon_name] = level

        if len(pokemon_in_route) > 0:
            routes_pokemon[route_name] = pokemon_in_route

    filtered_routes_pokemon = {}
    accepted_route_names = []

    for r_name in hisui_progression_order:
        if r_name in routes_pokemon:
            pokemon_dict = routes_pokemon[r_name]
            p_set = set(pokemon_dict.keys())

            is_similar = False
            for accepted_r in accepted_route_names:
                prev_dict = filtered_routes_pokemon[accepted_r]
                prev_set = set(prev_dict.keys())

                diff_a_b = len(p_set - prev_set)
                diff_b_a = len(prev_set - p_set)

                if diff_a_b == 0 and diff_b_a == 0:
                    print(f"Skipping '{r_name}' because it is IDENTICAL to '{accepted_r}'")
                    is_similar = True
                    break

                if diff_a_b <= 1 and diff_b_a <= 1:
                    print(f"Skipping '{r_name}' because it has only 1 different pokemon from '{accepted_r}'")
                    is_similar = True
                    break

            if not is_similar:
                filtered_routes_pokemon[r_name] = pokemon_dict
                accepted_route_names.append(r_name)

    print(f"Total routes remaining after filtering: {len(accepted_route_names)} out of {len(routes)}")

    seen_pokemon = set()

    for r_name in accepted_route_names:
        pokemon_dict = filtered_routes_pokemon[r_name]
        percent = round(100.0 / len(pokemon_dict), 2)
        order_index = hisui_progression_order.index(r_name)

        for p, lvl in pokemon_dict.items():
            p_clean = re.sub(r' (Plant|Sandy|Trash) Cloak', '', p)
            bst = bst_dict.get(p + " Hisuian", bst_dict.get(p + " Hisuian Form", bst_dict.get(p_clean, bst_dict.get(p, "—"))))

            is_first = "Yes" if p not in seen_pokemon else "No"
            seen_pokemon.add(p)

            all_encounters.append({
                "ProgressionSort": order_index,
                "Route / Place": r_name,
                "Pokemon Name": p,
                "Level": lvl,
                "BST": bst,
                "Method": "Walk",
                "% of appearance": percent,
                "1st?": is_first
            })

    return all_encounters

def process_and_save_data(encounters):
    df = pd.DataFrame(encounters)

    for (route, method), group in df.groupby(['Route / Place', 'Method']):
        total = group['% of appearance'].sum()
        diff = 100.0 - total
        if abs(diff) > 0.001:
            first_idx = group.index[0]
            df.at[first_idx, '% of appearance'] += diff

    df['% of appearance'] = df['% of appearance'].round(2)
    df = df.sort_values(by=['ProgressionSort', 'Pokemon Name'])

    columns_order = [
        'Route / Place',
        'Pokemon Name',
        'Level',
        'BST',
        'Method',
        '% of appearance',
        '1st?'
    ]
    df = df[columns_order]

    df['Level'] = df['Level'].replace('', np.nan)

    output_filename = 'hisui_routes.xlsx'
    df.to_excel(output_filename, index=False, na_rep='')
    print(f"Data processed and saved to {output_filename}")

if __name__ == "__main__":
    bst_data = fetch_pokemon_bst()
    raw_data = scrape_encounters(bst_data)
    process_and_save_data(raw_data)
