import urllib.request
from bs4 import BeautifulSoup
import json
import time
import os
import sys

def get_pokemon_list():
    url = "https://pokemondb.net/pokedex/national"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    html = urllib.request.urlopen(req).read()
    soup = BeautifulSoup(html, 'html.parser')

    pokemon_list = []
    for infocard in soup.find_all('div', class_='infocard'):
        a_tag = infocard.find('a', class_='ent-name')
        num_small = infocard.find('small')
        if a_tag and num_small:
            name = a_tag.text.strip()
            num = num_small.text.strip().lstrip('#')
            slug = a_tag['href'].split('/')[-1]
            pokemon_list.append({'num': num, 'name': name, 'slug': slug})
    return pokemon_list

def is_base_link(href, slug):
    if 'back' in href:
        return False
    filename = href.split('/')[-1]
    if filename == f"{slug}.png":
        return True
    return False

def find_best_link(links, is_shiny, slug):
    filtered = [l for l in links if 'back' not in l]
    if is_shiny:
        filtered = [l for l in filtered if 'shiny' in l]
    else:
        filtered = [l for l in filtered if 'normal' in l]

    if not filtered:
        return None

    for l in filtered:
        if is_base_link(l, slug):
            return l

    exclude_keywords = ['mega', 'gigantamax', 'gmax', '-f.png', 'primal', 'ultra']

    for l in filtered:
        if not any(k in l for k in exclude_keywords):
            return l

    return filtered[0] if filtered else None

def get_links_for_pokemon(slug):
    url = f"https://pokemondb.net/sprites/{slug}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        html = urllib.request.urlopen(req).read()
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return {'Gen5': {}, 'Gen6': {}, 'Gen7': {}, 'Gen8': {}}

    soup = BeautifulSoup(html, 'html.parser')
    results = {'Gen5': {}, 'Gen6': {}, 'Gen7': {}, 'Gen8': {}}

    for row in soup.find_all('tr'):
        game_cell = row.find('td', class_='cell-sprite-games')
        if not game_cell:
            continue

        text = game_cell.text.strip().replace('\n', '').replace(' ', '')

        all_links = []
        for a in row.find_all('a'):
            href = a.get('href')
            if href and (href.endswith('.png') or 'img.pokemondb.net' in href):
                all_links.append(href)

        for img in row.find_all('img'):
            src = img.get('src')
            if src and src.endswith('.png'):
                all_links.append(src)

        all_links = list(set(all_links))
        absolute_links = []
        for l in all_links:
            if l.startswith('//'):
                absolute_links.append('https:' + l)
            elif l.startswith('/'):
                absolute_links.append('https://pokemondb.net' + l)
            else:
                absolute_links.append(l)

        if text.startswith("Black") and "White" in text and "2" not in text:
            if not results['Gen5'].get('normal'):
                results['Gen5']['normal'] = find_best_link(absolute_links, False, slug)
            if not results['Gen5'].get('shiny'):
                results['Gen5']['shiny'] = find_best_link(absolute_links, True, slug)

        if "OmegaRuby" in text and "AlphaSapphire" in text:
            if not results['Gen6'].get('normal'):
                results['Gen6']['normal'] = find_best_link(absolute_links, False, slug)
            if not results['Gen6'].get('shiny'):
                results['Gen6']['shiny'] = find_best_link(absolute_links, True, slug)

        if "UltraSun" in text or "UltraMoon" in text or "SunMoon" in text:
            if not results['Gen7'].get('normal'):
                results['Gen7']['normal'] = find_best_link(absolute_links, False, slug)
            if not results['Gen7'].get('shiny'):
                results['Gen7']['shiny'] = find_best_link(absolute_links, True, slug)

        if "Home" in text:
            if not results['Gen8'].get('normal'):
                results['Gen8']['normal'] = find_best_link(absolute_links, False, slug)
            if not results['Gen8'].get('shiny'):
                results['Gen8']['shiny'] = find_best_link(absolute_links, True, slug)

    return results

def download_image(url, filepath):
    if os.path.exists(filepath):
        return True # already downloaded
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response, open(filepath, 'wb') as out_file:
            out_file.write(response.read())
        return True
    except Exception as e:
        print(f"Error downloading {url}: {e}")
        return False

def main(test_mode=False):
    os.makedirs('sprites_download', exist_ok=True)
    pkm_list = get_pokemon_list()

    if test_mode:
        test_indices = []
        for i in range(0, 1100, 100):
            test_indices.extend([i, i+1, i+2])
        pkm_list = [p for idx, p in enumerate(pkm_list) if idx in test_indices]

    md_report = []

    for idx, p in enumerate(pkm_list):
        num = p['num']
        name = p['name']
        slug = p['slug']

        print(f"Processing {num} {name}...")
        links = get_links_for_pokemon(slug)

        for t in ['normal', 'shiny']:
            t_char = 'n' if t == 'normal' else 's'
            gen_statuses = []

            for gen in ['Gen5', 'Gen6', 'Gen7', 'Gen8']:
                gen_num = gen[-1]
                url = links[gen].get(t)
                if url:
                    suffix = "_shiny" if t == 'shiny' else ""
                    filename = f"Gen{gen_num}_{num}_{name}{suffix}.png"

                    filepath = os.path.join('sprites_download', filename)
                    if download_image(url, filepath):
                        gen_statuses.append('1')
                    else:
                        gen_statuses.append('0')
                else:
                    gen_statuses.append('0')

            status_str = "".join(gen_statuses)
            md_line = f"{num}{t_char}{status_str}"
            md_report.append(md_line)

        time.sleep(0.5)

    report_filename = 'report_test.md' if test_mode else 'report_full.md'
    with open(report_filename, 'w') as f:
        f.write("\n".join(md_report))
    print(f"Done! Report saved to {report_filename}")

if __name__ == "__main__":
    test_mode = len(sys.argv) > 1 and sys.argv[1] == '--test'
    main(True)
