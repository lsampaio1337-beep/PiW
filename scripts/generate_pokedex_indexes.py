import urllib.request, json

def get_pokedex(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    response = urllib.request.urlopen(req)
    data = json.loads(response.read())
    return data

national_data = get_pokedex('https://pokeapi.co/api/v2/pokedex/1/')
# Map species url to national ID
species_to_national = {}
for entry in national_data['pokemon_entries']:
    species_url = entry['pokemon_species']['url']
    national_id = entry['entry_number']
    species_to_national[species_url] = national_id

def extract_national_ids(pokedex_url):
    data = get_pokedex(pokedex_url)
    ids = []
    for entry in data['pokemon_entries']:
        species_url = entry['pokemon_species']['url']
        national_id = species_to_national.get(species_url)
        if national_id is not None:
            ids.append(national_id)
    return ids

kanto_ids = extract_national_ids('https://pokeapi.co/api/v2/pokedex/2/')
johto_ids = extract_national_ids('https://pokeapi.co/api/v2/pokedex/3/')
hoenn_ids = extract_national_ids('https://pokeapi.co/api/v2/pokedex/4/')
sinnoh_ids = extract_national_ids('https://pokeapi.co/api/v2/pokedex/5/')
unova_ids = extract_national_ids('https://pokeapi.co/api/v2/pokedex/8/')

print(f"Kanto length: {len(kanto_ids)}")
print(f"Johto length: {len(johto_ids)}")
print(f"Hoenn length: {len(hoenn_ids)}")
print(f"Sinnoh length: {len(sinnoh_ids)}")
print(f"Unova length: {len(unova_ids)}")

js_content = "export const pokedexIndexes = {\n"
js_content += "  national: Array.from({ length: 649 }, (_, i) => i + 1),\n"
js_content += "  regional: {\n"
js_content += f"    kanto: {kanto_ids},\n"
js_content += f"    johto: {johto_ids},\n"
js_content += f"    hoenn: {hoenn_ids},\n"
js_content += f"    sinnoh: {sinnoh_ids},\n"
js_content += f"    unova: {unova_ids}\n"
js_content += "  }\n"
js_content += "};\n"

with open('config/pokedexIndexes.js', 'w') as f:
    f.write(js_content)
