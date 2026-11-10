import urllib.request
import re
from bs4 import BeautifulSoup
import json
import time

def scrape_table_paldea(table, topic, dex_map):
    results = []

    # 1. SV / Paldea
    for td in table.find_all('td'):
        a = td.find('a')
        if a:
            img = a.find('img')
            if img:
                src = img.get('src', '')
                if 'pokedex-sv' in src or 'pokedex-swsh' in src or 'pokedex-sm' in src or '/pokemon' in src or '/icon/' in src:
                    name = ""
                    alt = img.get('alt', '')

                    if td.text.strip():
                        name = td.text.strip()
                    elif alt and not alt.isdigit():
                        name = alt

                    href = a.get('href', '')
                    if not name and href and href.startswith('#id='):
                        raw_id = href.split('=')[1]
                        if raw_id.endswith('0') and len(raw_id) > 1:
                            raw_id = raw_id[:-1]
                        elif len(raw_id) > 3:
                            raw_id = raw_id[:3]
                        name = dex_map.get(raw_id, raw_id)

                    if not name:
                        if href and href.startswith('/pokedex-sv/'):
                            n = href.split('/pokedex-sv/')[1].replace('/', '').title()
                            if n and not n.isdigit() and n.lower() != 'icon' and n.lower() != 'new':
                                name = n

                    if not name:
                        m = re.search(r'/(\d+)[^/]*\.png', src)
                        if m:
                            name = dex_map.get(str(int(m.group(1))), m.group(1))

                    if name and not name.isdigit() and len(name) > 2:
                        results.append({
                            'topic': topic,
                            'name': name,
                            'min_level': 1,
                            'max_level': 100,
                            'probability': 1.0 # Default for SV missing data
                        })
    return results

def get_dex_map():
    dex_map = {}
    try:
        with open('data/pokemon_base.json', 'r') as f:
            pkmn_base = json.load(f)
        for p in pkmn_base:
            num = p.get('num', '').lstrip('0')
            if num:
                dex_map[num] = p.get('name', 'Unknown')
    except:
        pass
    return dex_map

def test():
    dex_map = get_dex_map()
    url = 'https://www.serebii.net/pokearth/paldea/southprovinceareatwo.shtml'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    html = urllib.request.urlopen(req, timeout=10).read().decode('latin-1')
    soup = BeautifulSoup(html, 'html.parser')

    tables = soup.find_all('table', class_='extradextable')
    for t in tables[1:3]:
        res = scrape_table_paldea(t, 'Test Topic', dex_map)
        print(f"Found {len(res)} results in table")
        for r in res[:5]: print(r)

test()
