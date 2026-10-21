import requests
from bs4 import BeautifulSoup
import pandas as pd
import json

def fetch_hisui_pokedex():
    print("Getting Hisui pokedex to map Names to Regional IDs...")
    pokedex_url = "https://pokemondb.net/pokedex/game/legends-arceus"
    response = requests.get(pokedex_url)
    soup = BeautifulSoup(response.content, 'html.parser')
    cards = soup.find_all('div', class_='infocard')
    hisui_pokedex = {}
    for card in cards:
        id_tag = card.find('small')
        if id_tag:
            pid = id_tag.text.strip().replace('#', '')
            name_tag = card.find('a', class_='ent-name')
            if name_tag:
                name = name_tag.text.strip()
                hisui_pokedex[name] = pid
    return hisui_pokedex

def scrape_encounters(hisui_pokedex):
    print("Fetching Hisui locations...")
    locations_url = "https://pokemondb.net/location"
    response = requests.get(locations_url)
    soup = BeautifulSoup(response.content, 'html.parser')

    hisui_tab = soup.find('div', id='loc-hisui')
    links = hisui_tab.find_all('a')
    routes = [{"name": link.text.strip(), "url": "https://pokemondb.net" + link['href']} for link in links]

    print(f"Found {len(routes)} Hisui locations.")

    all_encounters = []
    for route in routes:
        print(f"Scraping {route['name']}...")
        resp = requests.get(route['url'])
        route_soup = BeautifulSoup(resp.content, 'html.parser')

        tables = route_soup.find_all('table')
        pokemon_in_route = set()

        for table in tables:
            rows = table.find('tbody').find_all('tr') if table.find('tbody') else []
            for row in rows:
                cols = row.find_all('td')
                if len(cols) > 0:
                    pokemon_name = cols[0].text.strip()
                    if pokemon_name in hisui_pokedex:
                        pokemon_in_route.add(pokemon_name)

        if len(pokemon_in_route) > 0:
            percent = round(100.0 / len(pokemon_in_route), 2)
            for p in pokemon_in_route:
                all_encounters.append({
                    "Route / Place": route['name'],
                    "Pokemon ID Regional": hisui_pokedex[p],
                    "Pokemon Name": p,
                    "Method": "Walk",
                    "% of appearance": percent
                })
        else:
            print(f"No valid Pokemon found for {route['name']}.")

    return all_encounters

def process_and_save_data(encounters):
    df = pd.DataFrame(encounters)

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

    unique_routes = df['Route / Place'].unique()
    for route in unique_routes:
        if route not in hisui_progression_order:
            hisui_progression_order.append(route)

    order_mapping = {route: i + 1 for i, route in enumerate(hisui_progression_order)}
    df['Progression Order'] = df['Route / Place'].map(order_mapping)

    def adjust_percentages(group):
        total = group['% of appearance'].sum()
        diff = 100.0 - total
        if abs(diff) > 0.001:
            group.loc[group.index[0], '% of appearance'] += diff
        return group

    for (route, method), group in df.groupby(['Route / Place', 'Method']):
        total = group['% of appearance'].sum()
        diff = 100.0 - total
        if abs(diff) > 0.001:
            first_idx = group.index[0]
            df.at[first_idx, '% of appearance'] += diff

    df['% of appearance'] = df['% of appearance'].round(2)
    df = df.sort_values(by=['Progression Order', 'Route / Place', 'Pokemon ID Regional'])

    columns_order = [
        'Progression Order',
        'Route / Place',
        'Pokemon ID Regional',
        'Pokemon Name',
        'Method',
        '% of appearance'
    ]
    df = df[columns_order]

    output_filename = 'hisui_routes.xlsx'
    df.to_excel(output_filename, index=False)
    print(f"Data processed and saved to {output_filename}")

if __name__ == "__main__":
    pokedex = fetch_hisui_pokedex()
    raw_data = scrape_encounters(pokedex)
    process_and_save_data(raw_data)
