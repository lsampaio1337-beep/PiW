import requests
from bs4 import BeautifulSoup
import pandas as pd
import time
import re

headers = {'User-Agent': 'Mozilla/5.0'}

# Map rarity to an integer weight
rarity_map_int = {
    'Common': 30,
    'Uncommon': 15,
    'Rare': 5,
    'Super Rare': 1,
    'Limited': 1,
    'Always': 100
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

                        pct_weight = 0
                        if method in ['Gift', 'Trade', 'Fossil']:
                            pct_weight = 100
                        else:
                            if rarity in rarity_map_int:
                                pct_weight = rarity_map_int[rarity]
                            else:
                                if rarity_col != -1 and rarity_col < len(actual_row) and actual_row[rarity_col]:
                                    pct_match = re.search(r'(\d+)%', actual_row[rarity_col].get_text())
                                    if pct_match:
                                        pct_weight = int(pct_match.group(1))

                        all_data.append({
                            'Location': location_name,
                            'Pokemon': pokemon,
                            'Method': method,
                            'Level': level,
                            'Weight': pct_weight
                        })
        except Exception as e:
            print(f"Error parsing {location_name}: {e}")

        time.sleep(0.1)

    return all_data

if __name__ == "__main__":
    url = 'https://pokemondb.net/location'
    data = parse_region(url)

    # 1. Merge duplicates per Location, Pokemon, Method
    merged = {}
    for d in data:
        key = (d['Location'], d['Pokemon'], d['Method'])
        if key not in merged:
            merged[key] = {
                'Level': set(),
                'Weight': 0
            }

        if d['Level']:
            merged[key]['Level'].add(d['Level'])

        # The user's request: "I want the % of appearance to sum 100% for each route in each method."
        # If the same pokemon appears in the morning and night, it takes up a proportional amount of the encounter table for that method.
        # So we should sum the weights for a pokemon within that route/method, THEN normalize the whole route/method.
        merged[key]['Weight'] += d['Weight']

    # 2. Sum total weights per Location and Method to normalize to 100%
    totals = {}
    for (loc, pkmn, method), vals in merged.items():
        totals_key = (loc, method)
        if totals_key not in totals:
            totals[totals_key] = 0
        totals[totals_key] += vals['Weight']

    final_data = []

    for (loc, pkmn, method), vals in merged.items():
        levels = ", ".join(sorted(vals['Level']))

        total_weight = totals[(loc, method)]
        if total_weight > 0:
            normalized_pct = (vals['Weight'] / total_weight) * 100

            # Format to drop decimal if it's .0, else keep decimal.
            # Or just store as float and let Excel handle formatting, which allows exact summing to 100.
            pct_val = round(normalized_pct, 2)
            pct_str = f"{pct_val}%"
        else:
            pct_str = "Unknown"

        final_data.append({
            'Location': loc,
            'Pokemon Name': pkmn,
            'Method': method,
            'Level': levels,
            '% of appearance': pct_str,
            '_raw_pct': normalized_pct
        })

    # We can perform a safety check and adjust the largest value by the floating point error to ensure exactly 100%
    df = pd.DataFrame(final_data)

    # Round robin adjustment per group to make it EXACTLY 100%
    for (loc, method), group in df.groupby(['Location', 'Method']):
        if group['_raw_pct'].sum() > 0:
            # We want exact 100% formatted strings.
            # Convert raw_pct to integer percentages or rounded floats that perfectly sum to 100.
            # Using standard Largest Remainder Method for exactly 100% rounding

            raw_pcts = group['_raw_pct'].values

            # For 2 decimal places precision: multiply by 100, use LRM, divide by 100
            scaled = raw_pcts * 100
            floored = [int(v) for v in scaled]
            remainders = [v - int(v) for v in scaled]

            diff = 10000 - sum(floored) # 100.00% * 100

            # sort by remainders
            indices = list(range(len(raw_pcts)))
            indices.sort(key=lambda i: remainders[i], reverse=True)

            for i in range(diff):
                floored[indices[i]] += 1

            final_pcts = [v / 100.0 for v in floored]

            # Assign back formatted strings
            for i, idx in enumerate(group.index):
                df.at[idx, '% of appearance'] = f"{final_pcts[i]:.2f}%"

    df = df.drop(columns=['_raw_pct'])
    df.to_excel('Johto.xlsx', index=False)
    print("Saved to Johto.xlsx")
