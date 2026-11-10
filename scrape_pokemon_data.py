import urllib.request
import re
from bs4 import BeautifulSoup
import json
import time
import pandas as pd
import sys

def parse_levels(level_text):
    level_text = level_text.replace('Level', '').replace('Lv.', '').strip()
    if not level_text: return None, None
    if '-' in level_text:
        parts = level_text.split('-')
        try: return int(parts[0].strip()), int(parts[1].strip())
        except: return None, None
    try: return int(level_text), int(level_text)
    except: return None, None

def parse_rate(rate_text):
    if not rate_text: return 0.0
    rate_text = rate_text.replace('%', '').strip()
    try: return float(rate_text) / 100.0
    except: return 0.0

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

dex_map = get_dex_map()

def scrape_table(table, topic, region):
    results = []

    if region == 'paldea':
        for td in table.find_all('td'):
            a = td.find('a')
            # Look for img direct in td or wrapped in 'a'
            if a:
                img = a.find('img')
            else:
                img = td.find('img')

            if img:
                src = img.get('src', '')
                if 'pokedex-sv' in src or 'pokedex-swsh' in src or 'pokedex-sm' in src or '/pokemon' in src or '/icon/' in src:
                    name = ""
                    alt = img.get('alt', '')

                    if td.text.strip():
                        name = td.text.strip()
                    elif alt and not alt.isdigit():
                        name = alt

                    href = a.get('href', '') if a else ''
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

    trs = table.find_all('tr')

    if region == 'alola':
        for tr in trs:
            tds = tr.find_all('td')
            if len(tds) >= 3:
                name = ""
                rate_text = ""
                level_text = ""

                has_pokemon = False
                for td in tds:
                    img = td.find('img')
                    if img and ('/pokedex' in img.get('src', '') or '/pokemon' in img.get('src', '')):
                        alt = img.get('alt', '')
                        if alt and not alt.isdigit():
                            name = alt
                        has_pokemon = True

                    text = td.text.strip().replace('\n', ' ')

                    if '%' in text and ('Lv.' in text or 'Level' in text):
                        m = re.search(r'(?:Lv\.|Level)\s*(\d+(?:\s*-\s*\d+)?)', text)
                        if m:
                            lv_text_raw = m.group(1)
                            if '-' in lv_text_raw:
                                parts = lv_text_raw.split('-')
                                if len(parts[1]) > 2:
                                    rate_text = parts[1][-2:] + '%'
                                    level_text = parts[0] + '-' + parts[1][:-2]
                                elif len(parts[1]) > 1:
                                    rate_text = parts[1][-1:] + '%'
                                    level_text = parts[0] + '-' + parts[1][:-1]
                            else:
                                if len(lv_text_raw) > 2:
                                    rate_text = lv_text_raw[-2:] + '%'
                                    level_text = lv_text_raw[:-2]
                                elif len(lv_text_raw) > 1:
                                    rate_text = lv_text_raw[-1:] + '%'
                                    level_text = lv_text_raw[:-1]

                    elif 'Lv.' in text or 'Level' in text:
                        m = re.search(r'(?:Lv\.|Level)\s*(\d+(?:\s*-\s*\d+)?)', text)
                        if m:
                            level_text = m.group(1)

                    elif '%' in text:
                        m = re.findall(r'(\d+(?:\.\d+)?)\s*%', text)
                        if m:
                            rate_text = m[-1] + '%'

                    if not name and text and len(text) > 2 and text not in ['Day', 'Night', 'Initial', 'Slot'] and not text.isdigit() and '%' not in text:
                        name = text

                if has_pokemon and rate_text:
                    min_lv, max_lv = parse_levels(level_text)
                    if min_lv is None:
                        min_lv = 1
                        max_lv = 100
                    rate = parse_rate(rate_text)
                    results.append({
                        'topic': topic,
                        'name': name,
                        'min_level': min_lv,
                        'max_level': max_lv,
                        'probability': rate
                    })
        if len(results) > 0:
            return results

    # Horizontal parsing (Galar, Kalos)
    for i, tr in enumerate(trs):
        text = tr.text
        if '%' in text and ('Level' not in text or 'Lv.' not in text):
            rates_tds = tr.find_all('td')

            names_tr = None
            for j in range(i-1, -1, -1):
                tds = trs[j].find_all('td')
                if len(tds) == len(rates_tds):
                    for td in tds:
                        n = td.text.strip()
                        if not n:
                            img = td.find('img')
                            if img: n = img.get('alt', '')
                        if n and not n.isdigit() and n != 'Pokémon':
                            names_tr = trs[j]
                            break
                    if names_tr: break

            if not names_tr:
                is_mixed = False
                for td in rates_tds:
                    if '%' in td.text and any(c.isalpha() for c in td.text.replace('%','')):
                        is_mixed = True
                        break
                if is_mixed:
                    levels_tr = None
                    for j in range(i-1, max(-1, i-3), -1):
                        if 'Lv.' in trs[j].text or 'Level' in trs[j].text:
                            levels_tr = trs[j]
                            break
                    if not levels_tr:
                        for j in range(i+1, min(len(trs), i+3)):
                            if 'Lv.' in trs[j].text or 'Level' in trs[j].text:
                                levels_tr = trs[j]
                                break

                    lv_text = ""
                    if levels_tr:
                        lv_text = levels_tr.text.replace('\n', ' ')
                        m = re.search(r'(?:Level|Lv\.)\s*(\d+(?:\s*-\s*\d+)?)', lv_text)
                        if m:
                            lv_text = m.group(1)
                    min_lv, max_lv = parse_levels(lv_text)
                    if min_lv is None:
                        min_lv = 1
                        max_lv = 100

                    for td in rates_tds:
                        td_text = td.text.strip()
                        if '%' in td_text:
                            m = re.search(r'([A-Za-z\s]+)\s*(\d+\.?\d*%)', td_text)
                            if m:
                                name = m.group(1).strip()
                                rate = parse_rate(m.group(2))
                                if name and name.lower() not in ['initial', 'slot', 'day', 'night', 's.o.s.', 'details']:
                                    results.append({
                                        'topic': topic,
                                        'name': name,
                                        'min_level': min_lv,
                                        'max_level': max_lv,
                                        'probability': rate
                                    })
                    continue

            levels_tr = None
            for j in range(i+1, min(i+3, len(trs))):
                tds = trs[j].find_all('td')
                if len(tds) == len(rates_tds):
                    if any(re.search(r'\d+', td.text) for td in tds):
                        levels_tr = trs[j]
                        break

            if names_tr and levels_tr:
                names_tds = names_tr.find_all('td')
                levels_tds = levels_tr.find_all('td')

                for k in range(len(rates_tds)):
                    if k >= len(names_tds) or k >= len(levels_tds): continue

                    name = names_tds[k].text.strip()
                    if not name:
                        img = names_tds[k].find('img')
                        if img and not img.get('alt', '').isdigit():
                            name = img.get('alt', '')
                    name = re.sub(r'^\d+$', '', name).strip()
                    if not name: continue

                    rate = parse_rate(rates_tds[k].text.strip())
                    min_lv, max_lv = parse_levels(levels_tds[k].text.strip())

                    if min_lv is not None:
                        results.append({
                            'topic': topic,
                            'name': name,
                            'min_level': min_lv,
                            'max_level': max_lv,
                            'probability': rate
                        })
    return results

def get_topics_and_pokemon(region, url, location_name):
    all_data = []
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        html = urllib.request.urlopen(req, timeout=10).read().decode('latin-1')
        soup = BeautifulSoup(html, 'html.parser')

        tables = soup.find_all('table', class_='extradextable')

        current_topic = 'Standard Spawns'
        for t in tables:
            first_tr = t.find('tr')
            if first_tr:
                tds = first_tr.find_all('td')
                if len(tds) == 1:
                    tp = tds[0].text.strip()
                    if "Pokémon" not in tp and "Trainer" not in tp and "Item" not in tp:
                        current_topic = tp
                else:
                    th = first_tr.find('th')
                    if th:
                        tp = th.text.strip()
                        if "Pokémon" not in tp and "Trainer" not in tp and "Item" not in tp:
                            current_topic = tp

            interacts = t.find_all('td', class_='interact')
            if interacts:
                for inter in interacts:
                    if inter.text.strip():
                        current_topic = inter.text.strip()

            tds = t.find_all('td')
            if len(tds) > 3:
                text = tds[3].text.strip()
                if text in ["Standard Spawns", "Cave Spawns", "Water Spawns", "Sky Spawns"]:
                    current_topic = text

            res = scrape_table(t, current_topic, region)
            for r in res:
                all_data.append({
                    'Region': region.capitalize(),
                    'Location': location_name,
                    'Topic': r['topic'],
                    'Pokemon': r['name'],
                    'Min Level': r['min_level'],
                    'Max Level': r['max_level'],
                    'Probability': r['probability']
                })

    except urllib.error.HTTPError as e:
        if e.code == 404:
            if '-' in url:
                new_url = url.replace('-', '')
                if new_url != url:
                    return get_topics_and_pokemon(region, new_url, location_name)
    except Exception as e:
        print(f"Error parsing {url}: {e}", file=sys.stderr)

    return all_data

def scan_region(region):
    data = []
    max_retries = 3
    try:
        url = f'https://www.serebii.net/pokearth/{region}/index.shtml'
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        html = None
        for i in range(max_retries):
            try:
                html = urllib.request.urlopen(req, timeout=10).read().decode('latin-1')
                break
            except Exception as e:
                time.sleep(1)
        if not html: return []

        soup = BeautifulSoup(html, 'html.parser')

        links = {}
        for a in soup.find_all('area'):
            href = a.get('href')
            title = a.get('title', '')
            if href and f'/pokearth/{region}/' in href and title:
                links[f"https://www.serebii.net{href}"] = title

        for option in soup.find_all('option'):
            val = option.get('value')
            title = option.text.strip()
            if val and f'/pokearth/{region}/' in val and title:
                links[f"https://www.serebii.net{val}"] = title

        if region == 'paldea':
            new_links = {}
            for k, v in links.items():
                if '-' in k and 'serebii.net' in k:
                    k = k.replace('-', '')
                new_links[k] = v
            links = new_links

        print(f"Scanning {len(links)} locations in {region}...")
        for link, name in links.items():
            for i in range(max_retries):
                try:
                    res = get_topics_and_pokemon(region, link, name)
                    data.extend(res)
                    time.sleep(0.05)
                    break
                except Exception as e:
                    time.sleep(1)

    except Exception as e:
        print(f"Error scanning {region}: {e}", file=sys.stderr)

    return data

def main():
    regions = ['kalos', 'alola', 'galar', 'paldea']
    all_data = []
    for region in regions:
        data = scan_region(region)
        all_data.extend(data)

    for d in all_data:
        d['Topic'] = d['Topic'].replace(' - Toggle Condensed Details', '')
        d['Topic'] = d['Topic'].replace(' - Toggle S.O.S. Details', '')
        d['Topic'] = ' '.join(d['Topic'].split())

    df = pd.DataFrame(all_data)

    merged_data = []

    if not df.empty:
        grouped = df.groupby(['Region', 'Location', 'Topic', 'Pokemon'])

        for name, group in grouped:
            group = group.sort_values(by=['Min Level', 'Max Level'])

            merged_rows = []
            current_row = None

            for _, row in group.iterrows():
                if current_row is None:
                    current_row = row.to_dict()
                else:
                    gap = row['Min Level'] - current_row['Max Level']
                    if gap < 4:
                        current_row['Min Level'] = min(current_row['Min Level'], row['Min Level'])
                        current_row['Max Level'] = max(current_row['Max Level'], row['Max Level'])
                        current_row['Probability'] += row['Probability']
                    else:
                        merged_rows.append(current_row)
                        current_row = row.to_dict()

            if current_row is not None:
                merged_rows.append(current_row)

            merged_data.extend(merged_rows)

    final_df = pd.DataFrame(merged_data)

    junk_topics = ["Filters", "Shop", "Shops - Sword & Shield", "Sword / Shield", "Scarlet / Violet", "Area Anchors", "Game Anchors", "Trainer Battles", "Wild Pokémon", "Pokémon", "Name", "Items", "Ogre Oustin'"]
    if not final_df.empty:
        final_df = final_df[~final_df['Topic'].isin(junk_topics)]

    final_df.to_excel('encounters.xlsx', index=False)
    print("Generated encounters.xlsx")
    print(final_df['Region'].value_counts())

if __name__ == '__main__':
    main()
