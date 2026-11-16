import urllib.request
from bs4 import BeautifulSoup
import time
import os
import sys

OUTPUT_DIR = r"C:\Users\lsamp\OneDrive\Desktop\PiW\Sprites\remaining"

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
    return filename == f"{slug}.png"

def find_female_only_link(links, is_shiny, slug):
    filtered = [l for l in links if 'back' not in l]
    if is_shiny:
        filtered = [l for l in filtered if 'shiny' in l]
    else:
        filtered = [l for l in filtered if 'normal' in l]

    if not filtered:
        return None

    # If standard sprite exists, skip
    for l in filtered:
        if is_base_link(l, slug):
            return None

    # No standard sprite: look for female version (excluding mega/gmax/primal/ultra)
    exclude_keywords = ['mega', 'gigantamax', 'gmax', 'primal', 'ultra']
    for l in filtered:
        if any(k in l for k in exclude_keywords):
            continue
        filename = l.split('/')[-1]
        if '-f.png' in filename or 'female' in filename:
            return l

    return None

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
                results['Gen5']['normal'] = find_female_only_link(absolute_links, False, slug)
            if not results['Gen5'].get('shiny'):
                results['Gen5']['shiny'] = find_female_only_link(absolute_links, True, slug)

        if "OmegaRuby" in text and "AlphaSapphire" in text:
            if not results['Gen6'].get('normal'):
                results['Gen6']['normal'] = find_female_only_link(absolute_links, False, slug)
            if not results['Gen6'].get('shiny'):
                results['Gen6']['shiny'] = find_female_only_link(absolute_links, True, slug)

        if "UltraSun" in text or "UltraMoon" in text or "SunMoon" in text:
            if not results['Gen7'].get('normal'):
                results['Gen7']['normal'] = find_female_only_link(absolute_links, False, slug)
            if not results['Gen7'].get('shiny'):
                results['Gen7']['shiny'] = find_female_only_link(absolute_links, True, slug)

        if "Home" in text:
            if not results['Gen8'].get('normal'):
                results['Gen8']['normal'] = find_female_only_link(absolute_links, False, slug)
            if not results['Gen8'].get('shiny'):
                results['Gen8']['shiny'] = find_female_only_link(absolute_links, True, slug)

    return results

def download_image(url, filepath):
    if os.path.exists(filepath):
        return True
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response, open(filepath, 'wb') as out_file:
            out_file.write(response.read())
        return True
    except Exception as e:
        print(f"Error downloading {url}: {e}")
        return False

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    pkm_list = get_pokemon_list()

    if len(sys.argv) > 1 and sys.argv[1] == '--test':
        pkm_list = [p for p in pkm_list if p['slug'] in ('meowstic', 'frillish', 'pikachu')]

    for p in pkm_list:
        num = p['num']
        name = p['name']
        slug = p['slug']

        links = get_links_for_pokemon(slug)
        downloaded_any = False

        for t in ['normal', 'shiny']:
            for gen in ['Gen5', 'Gen6', 'Gen7', 'Gen8']:
                gen_num = gen[-1]
                url = links[gen].get(t)
                if url:
                    suffix = "_shiny" if t == 'shiny' else ""
                    filename = f"Gen{gen_num}_{num}_{name}{suffix}.png"
                    filepath = os.path.join(OUTPUT_DIR, filename)
                    if download_image(url, filepath):
                        print(f"Downloaded {filename} from {url}")
                        downloaded_any = True

        if not downloaded_any:
            print(f"Skipped {num} {name} (has standard or no female-only sprite)")

        time.sleep(0.3)

if __name__ == "__main__":
    main()
