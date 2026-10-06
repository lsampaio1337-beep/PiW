import pandas as pd
import requests
from bs4 import BeautifulSoup
import time

def extract_numbers():
    df = pd.read_excel('Johto.xlsx')
    unique_pokemon = df['Pokemon Name'].unique()
    print(f"Found {len(unique_pokemon)} unique Pokemon.")

    headers = {'User-Agent': 'Mozilla/5.0'}
    res = requests.get('https://pokemondb.net/pokedex/all', headers=headers)
    soup = BeautifulSoup(res.text, 'html.parser')

    pokedex_map = {}
    table = soup.find(id='pokedex')
    for row in table.find('tbody').find_all('tr'):
        cells = row.find_all('td')
        if not cells:
            continue

        num = cells[0].text.strip()
        name = cells[1].find('a').text.strip()

        # In pokemondb, forms might be on the same row or separate, but we mainly care about base forms.
        if name not in pokedex_map:
            pokedex_map[name] = num

    # Some names might differ slightly, let's map them
    # E.g., Nidoran F -> Nidoran♀
    # Mr. Mime, Farfetch'd

    results = []
    for pkmn in sorted(unique_pokemon):
        # basic normalizations
        search_name = pkmn
        if search_name == 'Nidoran F': search_name = 'Nidoran♀'
        if search_name == 'Nidoran M': search_name = 'Nidoran♂'

        num = pokedex_map.get(search_name)
        if not num:
            # Try fallback loop
            for map_name, map_num in pokedex_map.items():
                if search_name.lower() in map_name.lower() or map_name.lower() in search_name.lower():
                    num = map_num
                    break

        results.append({
            'Pokemon Name': pkmn,
            'Pokedex Number': num
        })

    df_out = pd.DataFrame(results)
    df_out.to_excel('Johto_Pokemon_Numbers.xlsx', index=False)
    print("Saved to Johto_Pokemon_Numbers.xlsx")

if __name__ == '__main__':
    extract_numbers()
