import re

with open('scrape_pokemon_data.py', 'r') as f:
    code = f.read()

# Instead of re.sub which interprets escape sequences, we'll do manual replacement
start = code.find('def scrape_table_paldea(table, topic, dex_map):')
if start != -1:
    end = code.find('def scrape_region(', start)
    if end != -1:
        new_code = code[:start] + """def scrape_table_paldea(table, topic, dex_map):
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
                        m = re.search(r'/(\\d+)[^/]*\\.png', src)
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

""" + code[end:]
        with open('scrape_pokemon_data.py', 'w') as f:
            f.write(new_code)
