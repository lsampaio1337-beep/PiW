import pandas as pd

import json

# Load scraped data
df = pd.read_csv("all_galar_scraped.csv")

# Load Pokemon game data for BST calculation
with open('data/pokemon.json', 'r', encoding='utf-8') as f:
    pokemon_data = json.load(f)

# Create a lookup dictionary for Pokemon BST by name
# Some names might differ slightly (e.g. Mr. Mime vs Mr. Mime (Galarian)), so we will handle exact matches first.
bst_lookup = {}
for p in pokemon_data:
    name = p['name']
    bst = p.get('hp', 0) + p.get('atk', 0) + p.get('def', 0) + p.get('spa', 0) + p.get('spd', 0) + p.get('spe', 0)
    bst_lookup[name.lower()] = bst

def get_bst(pokemon_name):
    # PokemonDB might append " (Galarian Form)", we strip it if needed, or check exact.
    base_name = str(pokemon_name).lower()

    # Check exact match
    if base_name in bst_lookup:
        return bst_lookup[base_name]

    # Check for Galarian forms (PokemonDB puts form in name sometimes, or just links it)
    if "galarian" in base_name:
        clean_name = base_name.replace("galarian", "").replace("form", "").replace("(", "").replace(")", "").strip()
        # In pokemon.json, Galarian forms might be named "Galarian Meowth" or something, but usually just exact match
        for k in bst_lookup.keys():
            if clean_name in k and "galarian" in k:
                return bst_lookup[k]

    # Fallback to simple contains
    for k in bst_lookup.keys():
        if base_name in k or k in base_name:
            return bst_lookup[k]

    return 0

# 1. Standardize Methods
def standardize_method(method):
    method = str(method).lower()

    if 'walking' in method or 'overworld' in method or 'grass' in method or 'cave' in method:
        return 'walk'
    elif 'surf' in method or 'water' in method:
        return 'surfing'
    elif 'rod' in method or 'fishing' in method:
        return 'fishing'
    elif 'tree' in method or 'berry' in method:
        return 'berry tree'
    elif 'gift' in method or 'interact' in method or 'trade' in method or 'fossil' in method:
        return 'interact/gift'
    else:
        return 'walk'

df['standardized_method'] = df['method'].apply(standardize_method)

# When grouping levels, we just take the first level string encountered or combine them uniquely.
def agg_levels(levels):
    unique_lvls = [str(lvl) for lvl in levels.dropna().unique() if str(lvl)]
    if not unique_lvls:
        return ""
    if len(unique_lvls) == 1:
        return unique_lvls[0]
    return ", ".join(unique_lvls)

# Group by route, method, pokemon_id, pokemon_name
grouped = df.groupby(['route', 'standardized_method', 'pokemon_id', 'pokemon_name'], dropna=False).agg({
    'rate': 'mean',
    'level': agg_levels
}).reset_index()

# Iterate and normalize rates
normalized_list = []
for (route, method), group in grouped.groupby(['route', 'standardized_method']):
    total = group['rate'].sum()
    if total > 0:
        group['rate'] = (group['rate'] / total) * 100
    normalized_list.append(group)

normalized = pd.concat(normalized_list, ignore_index=True)

# Format columns
normalized['rate'] = normalized['rate'].round(2)

# Add BST column
normalized['BST'] = normalized['pokemon_name'].apply(get_bst)

normalized = normalized.rename(columns={
    'route': 'Route / Place',
    'pokemon_name': 'Pokemon Name',
    'level': 'Level',
    'standardized_method': 'Method',
    'rate': '% of appearance'
})

print("Columns after rename:", normalized.columns.tolist())

# Reorder columns: Route / Place / Pokemon Name / Level / BST / Method / % of appearance
final_df = normalized[['Route / Place', 'Pokemon Name', 'Level', 'BST', 'Method', '% of appearance']]

final_df.to_csv("processed_galar.csv", index=False)
print("Data processing complete.")
print(final_df.head(20))
