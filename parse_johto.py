import requests
from bs4 import BeautifulSoup
import pandas as pd
import time
import re

headers = {'User-Agent': 'Mozilla/5.0'}

rarity_map = {
    'Common': '30%',
    'Uncommon': '15%',
    'Rare': '5%',
    'Super Rare': '1%',
    'Limited': '1%',
    'Always': '100%',
    'Unknown': 'Unknown'
}

def parse_region(url):
    res = requests.get(url, headers=headers)
    soup = BeautifulSoup(res.text, 'html.parser')

    johto_tab = soup.find(id='loc-johto')
    if not johto_tab:
        print("Could not find Johto tab")
        return []

    links = johto_tab.find_all('a')
    all_data = []

    for link in links:
        location_name = link.text.strip()
        location_url = f"https://pokemondb.net{link['href']}"
        print(f"Parsing {location_name}...")

        try:
            r = requests.get(location_url, headers=headers)
            s = BeautifulSoup(r.text, 'html.parser')

            for table in s.find_all('table'):
                prev_h2 = table.find_previous('h2')
                # Strict check for generation 2
                if prev_h2 and prev_h2.get('id') == 'gen2':
                    prev_h3 = table.find_previous('h3')
                    # Sometimes the method is in an h4 if there's multiple methods
                    if prev_h3 and prev_h3.find_previous('h2') == prev_h2:
                        method = prev_h3.text.strip()
                    else:
                        method = "Unknown"

                    headers_row = table.find('tr')
                    ths = headers_row.find_all(['th', 'td']) if headers_row else []
                    header_names = [th.text.strip() for th in ths]

                    level_idx = header_names.index('Levels') if 'Levels' in header_names else -1
                    rarity_idx = header_names.index('Rarity') if 'Rarity' in header_names else -1

                    for row in table.find_all('tr')[1:]:
                        cells = row.find_all('td')
                        if not cells:
                            continue

                        pokemon = cells[0].text.strip()

                        level = ""
                        if level_idx != -1 and level_idx < len(cells):
                            level = cells[level_idx].text.strip()

                        rarity = "Unknown"
                        if rarity_idx != -1 and rarity_idx < len(cells):
                            img = cells[rarity_idx].find('img')
                            if img and 'title' in img.attrs:
                                rarity = img['title']

                        if method in ['Gift', 'Trade', 'Fossil']:
                            pct = "100%"
                        else:
                            pct = rarity_map.get(rarity, rarity)
                            if pct == "Unknown" and rarity_idx != -1 and rarity_idx < len(cells):
                                # Also check for text if it's there
                                pct_match = re.search(r'\d+%', cells[rarity_idx].get_text())
                                if pct_match:
                                    pct = pct_match.group(0)

                        all_data.append({
                            'Location': location_name,
                            'Pokemon': pokemon,
                            'Method': method,
                            'Level': level,
                            'Percentage': pct
                        })
        except Exception as e:
            print(f"Error parsing {location_name}: {e}")

        time.sleep(0.1)

    return all_data

if __name__ == "__main__":
    url = 'https://pokemondb.net/location'
    data = parse_region(url)

    # Merge duplicate pokemon on same location and method
    merged = {}
    for d in data:
        key = (d['Location'], d['Pokemon'], d['Method'])
        if key not in merged:
            merged[key] = {
                'Level': set(),
                'Percentage': set()
            }

        if d['Level']:
            merged[key]['Level'].add(d['Level'])
        if d['Percentage']:
            merged[key]['Percentage'].add(d['Percentage'])

    final_data = []
    for (loc, pkmn, method), vals in merged.items():
        levels = ", ".join(sorted(vals['Level']))

        pcts = list(vals['Percentage'])
        pcts.sort()
        pct_str = ", ".join(pcts)

        final_data.append({
            'Location': loc,
            'Pokemon Name': pkmn,
            'Method': method,
            'Level': levels,
            '% of appearance': pct_str
        })

    df = pd.DataFrame(final_data)
    df.to_excel('Johto.xlsx', index=False)
    print("Saved to Johto.xlsx")
