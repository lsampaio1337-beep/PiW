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
                if prev_h2 and prev_h2.get('id') == 'gen2':
                    prev_h3 = table.find_previous('h3')
                    if prev_h3 and prev_h3.find_previous('h2') == prev_h2:
                        method = prev_h3.text.strip()
                    else:
                        method = "Unknown"

                    # Normalize methods to merge "Walking", "Headbutt", "Headbutt (Special)"
                    method_lower = method.lower()
                    if "walking" in method_lower or "headbutt" in method_lower:
                        method = "Walking/Headbutt"

                    headers_row = table.find('tr')
                    ths = headers_row.find_all(['th', 'td']) if headers_row else []

                    active_rowspans = {}

                    header_cols = []
                    for th in ths:
                        text = th.text.strip()
                        colspan = int(th.get('colspan', 1))
                        for _ in range(colspan):
                            header_cols.append(text)

                    level_col = -1
                    rarity_col = -1
                    for i, th in enumerate(header_cols):
                        if 'Levels' in th:
                            level_col = i
                        if 'Rarity' in th:
                            rarity_col = i

                    for row in table.find_all('tr')[1:]:
                        cells = row.find_all('td')
                        if not cells and not active_rowspans:
                            continue

                        actual_row = []
                        cell_idx = 0
                        col_idx = 0

                        while col_idx < len(header_cols):
                            if col_idx in active_rowspans:
                                actual_row.append(active_rowspans[col_idx]["element"])
                                active_rowspans[col_idx]["rowspan"] -= 1
                                if active_rowspans[col_idx]["rowspan"] == 0:
                                    del active_rowspans[col_idx]
                                col_idx += 1
                            else:
                                if cell_idx < len(cells):
                                    cell = cells[cell_idx]
                                    colspan = int(cell.get('colspan', 1))
                                    rowspan = int(cell.get('rowspan', 1))

                                    for _ in range(colspan):
                                        actual_row.append(cell)
                                        if rowspan > 1:
                                            active_rowspans[col_idx] = {"rowspan": rowspan - 1, "element": cell}
                                        col_idx += 1
                                    cell_idx += 1
                                else:
                                    actual_row.append(None)
                                    col_idx += 1

                        if not actual_row or actual_row[0] is None:
                            continue

                        pokemon = actual_row[0].text.strip()

                        level = ""
                        if level_col != -1 and level_col < len(actual_row) and actual_row[level_col]:
                            level = actual_row[level_col].text.strip()

                        rarity = "Unknown"
                        if rarity_col != -1 and rarity_col < len(actual_row) and actual_row[rarity_col]:
                            img = actual_row[rarity_col].find('img')
                            if img and 'title' in img.attrs:
                                rarity = img['title']

                        if method in ['Gift', 'Trade', 'Fossil']:
                            pct = "100%"
                        else:
                            pct = rarity_map.get(rarity, rarity)
                            if pct == "Unknown" and rarity_col != -1 and rarity_col < len(actual_row) and actual_row[rarity_col]:
                                pct_match = re.search(r'\d+%', actual_row[rarity_col].get_text())
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
        if d['Percentage'] and d['Percentage'] != 'Unknown':
            merged[key]['Percentage'].add(d['Percentage'])

    final_data = []
    for (loc, pkmn, method), vals in merged.items():
        levels = ", ".join(sorted(vals['Level']))

        pcts = list(vals['Percentage'])
        pcts.sort()
        pct_str = ", ".join(pcts) if pcts else "Unknown"

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
