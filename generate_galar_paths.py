import pandas as pd
import json

# Load parsed raw data
with open('raw_encounters.json', 'r') as f:
    encounters = json.load(f)

# Group encounters by route
encounters_by_route = {}
for e in encounters:
    route = e['Route / Place']
    pokemon = e['Pokemon Name']
    if route not in encounters_by_route:
        encounters_by_route[route] = []
    encounters_by_route[route].append(pokemon)

# 1. Define progression orders
# Main Game Routes (Scale 1-70)
main_game_order = [
    "Route 1",
    "Route 2",
    "Rolling Fields",
    "Dappled Grove",
    "West Lake Axewell",
    "East Lake Axewell",
    "South Lake Miloch",
    "Giant's Seat", # Note: not in list, skipping if no encounters
    "North Lake Miloch",
    "Route 3",
    "Galar Mine",
    "Route 4",
    "Turffield Gym",
    "Route 5",
    "Route 5 Daycare",
    "Galar Mine No. 2",
    "Hulbury Gym",
    "Motostoke Outskirts",
    "Motostoke Gym",
    "Watchtower Ruins",
    "Axew's Eye",
    "Slumbering Weald",
    "Route 6",
    "Bridge Field Daycare",
    "Bridge Field",
    "Stow-on-Side Gym",
    "Stony Wilderness",
    "Dusty Bowl",
    "Giant's Cap",
    "Hammerlocke Hills",
    "Motostoke Riverbank",
    "Route 7",
    "Route 8",
    "Glimwood Tangle",
    "Ballonlea Gym",
    "Route 9",
    "Circhester Gym",
    "Lake of Outrage",
    "Spikemuth Gym",
    "Route 10",
    "Hammerlocke Gym",
    "Slumbering Weald 2",
    "Pokemon League"
]

# Clean up order (insert Hulbury if we missed it and it's valid, remove Giant's Seat if no encounters)
main_game_order = [r for r in main_game_order if r in encounters_by_route or 'Gym' in r or 'League' in r or 'Daycare' in r]
if "Hulbury" in encounters_by_route and "Hulbury" not in main_game_order:
    main_game_order.insert(main_game_order.index("Galar Mine No. 2") + 1, "Hulbury")

# Isle of Armor Routes (Scale 70-100)
isle_of_armor_order = [
    "Fields of Honor",
    "Soothing Wetlands",
    "Forest of Focus",
    "Challenge Beach",
    "Brawlers' Cave",
    "Challenge Road",
    "Training Lowlands",
    "Warm-Up Tunnel",
    "Workout Sea",
    "Stepping-Stone Sea",
    "Honeycalm Island"
]

# Crown Tundra Routes (Scale 70-100)
crown_tundra_order = [
    "Slippery Slope",
    "Frigid Sea",
    "Roaring-Sea Caves",
    "Lakeside Cave",
    "Old Cemetery",
    "Giant's Foot",
    "Path to the Peak",
    "Tunnel to the Top"
]

# Verify all routes are covered
all_ordered_routes = main_game_order + isle_of_armor_order + crown_tundra_order
unmapped_routes = [r for r in encounters_by_route.keys() if r not in all_ordered_routes]
for r in unmapped_routes:
    main_game_order.insert(-1, r) # Insert right before Pokemon League

# 2. Build Sheet 1 (Paths)
sheet1_data = []
order_counter = 1

def generate_level_range(index, total_routes, min_lvl, max_lvl):
    if total_routes == 1:
        return f"{min_lvl}-{max_lvl}"
    step = (max_lvl - min_lvl) / (total_routes - 1)
    start_lvl = int(min_lvl + index * step)
    end_lvl = int(min_lvl + (index + 1) * step) if index < total_routes - 1 else max_lvl
    end_lvl = min(max_lvl, end_lvl + 2)
    return f"{start_lvl}-{end_lvl}"

def generate_percentages(num_pokemon):
    if num_pokemon == 1: return [100]
    elif num_pokemon == 2: return [60, 40]
    elif num_pokemon == 3: return [40, 35, 25]
    elif num_pokemon == 4: return [30, 25, 25, 20]
    elif num_pokemon == 5: return [25, 25, 20, 15, 15]

    base = 100 // num_pokemon
    remainder = 100 % num_pokemon
    distribution = [base] * num_pokemon
    for i in range(remainder):
        distribution[i] += 1

    half = num_pokemon // 2
    for i in range(half):
        shift = 2
        if distribution[-(i+1)] > shift:
            distribution[i] += shift
            distribution[-(i+1)] -= shift

    return distribution

# Process Main Game for Sheet 1
main_routes_only = [r for r in main_game_order if 'Gym' not in r and 'League' not in r and 'Daycare' not in r]
for i, route in enumerate(main_routes_only):
    level_range = generate_level_range(i, len(main_routes_only), 1, 70)
    pokemons = encounters_by_route[route]
    percentages = generate_percentages(len(pokemons))

    for p_idx, pokemon in enumerate(pokemons):
        sheet1_data.append({
            "Order": order_counter,
            "Route/Place": route,
            "Secondary": "",
            "Pokemon Name": pokemon,
            "Level": level_range,
            "% Appearance": percentages[p_idx]
        })
    order_counter += 1

# Process Isle of Armor (Extra Chain 1)
for i, route in enumerate(isle_of_armor_order):
    level_range = generate_level_range(i, len(isle_of_armor_order), 70, 100)
    pokemons = encounters_by_route[route]
    percentages = generate_percentages(len(pokemons))

    for p_idx, pokemon in enumerate(pokemons):
        sheet1_data.append({
            "Order": f"E1-{i+1}",
            "Route/Place": route,
            "Secondary": "",
            "Pokemon Name": pokemon,
            "Level": level_range,
            "% Appearance": percentages[p_idx]
        })

# Process Crown Tundra (Extra Chain 2)
for i, route in enumerate(crown_tundra_order):
    level_range = generate_level_range(i, len(crown_tundra_order), 70, 100)
    pokemons = encounters_by_route[route]
    percentages = generate_percentages(len(pokemons))

    for p_idx, pokemon in enumerate(pokemons):
        sheet1_data.append({
            "Order": f"E2-{i+1}",
            "Route/Place": route,
            "Secondary": "",
            "Pokemon Name": pokemon,
            "Level": level_range,
            "% Appearance": percentages[p_idx]
        })

df1 = pd.DataFrame(sheet1_data)

# 3. Build Sheet 2 (Challenges)
# EVERY route and gym must be sequentially unlocked.
sheet2_data = []

# Main Game Chain
for i in range(len(main_game_order) - 1):
    current_node = main_game_order[i]
    next_node = main_game_order[i+1]
    sheet2_data.append({
        "Challenge Name": f"Challenge {i+1}",
        "Requisite": f"Clear {current_node}",
        "Rewards": f"Unlocks {next_node}"
    })
# Capstone main challenge
sheet2_data.append({
    "Challenge Name": f"Challenge {len(main_game_order)}",
    "Requisite": f"Clear {main_game_order[-1]}",
    "Rewards": "Unlocks Isle of Armor & Crown Tundra"
})

# Extra Chain 1 (Isle of Armor)
for i in range(len(isle_of_armor_order) - 1):
    current_node = isle_of_armor_order[i]
    next_node = isle_of_armor_order[i+1]
    sheet2_data.append({
        "Challenge Name": f"Extra Challenge $1-{i+1}",
        "Requisite": f"Clear {current_node}",
        "Rewards": f"Unlocks {next_node}"
    })
sheet2_data.append({
    "Challenge Name": f"Extra Challenge $1-{len(isle_of_armor_order)}",
    "Requisite": f"Clear {isle_of_armor_order[-1]}",
    "Rewards": "Isle of Armor Completed"
})

# Extra Chain 2 (Crown Tundra)
for i in range(len(crown_tundra_order) - 1):
    current_node = crown_tundra_order[i]
    next_node = crown_tundra_order[i+1]
    sheet2_data.append({
        "Challenge Name": f"Extra Challenge $2-{i+1}",
        "Requisite": f"Clear {current_node}",
        "Rewards": f"Unlocks {next_node}"
    })
sheet2_data.append({
    "Challenge Name": f"Extra Challenge $2-{len(crown_tundra_order)}",
    "Requisite": f"Clear {crown_tundra_order[-1]}",
    "Rewards": "Crown Tundra Completed"
})

df2 = pd.DataFrame(sheet2_data)

# 4. Build Sheet 3 (Unlisted Pokemon)
unlisted_pokemon = [
    {"Pokemon Name": "Grookey", "Pokemon Type": "Grass", "Path to be include": "Route 1", "Obtained?": "No"},
    {"Pokemon Name": "Thwackey", "Pokemon Type": "Grass", "Path to be include": "Route 1", "Obtained?": "Yes"},
    {"Pokemon Name": "Rillaboom", "Pokemon Type": "Grass", "Path to be include": "Route 1", "Obtained?": "Yes"},
    {"Pokemon Name": "Scorbunny", "Pokemon Type": "Fire", "Path to be include": "Route 1", "Obtained?": "No"},
    {"Pokemon Name": "Raboot", "Pokemon Type": "Fire", "Path to be include": "Route 1", "Obtained?": "Yes"},
    {"Pokemon Name": "Cinderace", "Pokemon Type": "Fire", "Path to be include": "Route 1", "Obtained?": "Yes"},
    {"Pokemon Name": "Sobble", "Pokemon Type": "Water", "Path to be include": "Route 1", "Obtained?": "No"},
    {"Pokemon Name": "Drizzile", "Pokemon Type": "Water", "Path to be include": "Route 1", "Obtained?": "Yes"},
    {"Pokemon Name": "Inteleon", "Pokemon Type": "Water", "Path to be include": "Route 1", "Obtained?": "Yes"},
    {"Pokemon Name": "Zacian", "Pokemon Type": "Fairy", "Path to be include": "Slumbering Weald 2", "Obtained?": "No"},
    {"Pokemon Name": "Zamazenta", "Pokemon Type": "Fighting", "Path to be include": "Slumbering Weald 2", "Obtained?": "No"},
    {"Pokemon Name": "Eternatus", "Pokemon Type": "Poison/Dragon", "Path to be include": "Hammerlocke Hills", "Obtained?": "No"},
    {"Pokemon Name": "Kubfu", "Pokemon Type": "Fighting", "Path to be include": "Fields of Honor", "Obtained?": "No"},
    {"Pokemon Name": "Urshifu", "Pokemon Type": "Fighting/Dark", "Path to be include": "Fields of Honor", "Obtained?": "Yes"},
    {"Pokemon Name": "Calyrex", "Pokemon Type": "Psychic/Grass", "Path to be include": "Crown Shrine", "Obtained?": "No"},
    {"Pokemon Name": "Regieleki", "Pokemon Type": "Electric", "Path to be include": "Split-Decision Ruins", "Obtained?": "No"},
    {"Pokemon Name": "Regidrago", "Pokemon Type": "Dragon", "Path to be include": "Split-Decision Ruins", "Obtained?": "No"},
    {"Pokemon Name": "Glastrier", "Pokemon Type": "Ice", "Path to be include": "Crown Shrine", "Obtained?": "No"},
    {"Pokemon Name": "Spectrier", "Pokemon Type": "Ghost", "Path to be include": "Crown Shrine", "Obtained?": "No"}
]
df3 = pd.DataFrame(unlisted_pokemon)

# 5. Export to Excel
with pd.ExcelWriter("Galar_Paths.xlsx", engine="openpyxl") as writer:
    df1.to_excel(writer, sheet_name="Paths", index=False)
    df2.to_excel(writer, sheet_name="Challenges", index=False)
    df3.to_excel(writer, sheet_name="Unlisted Pokemon", index=False)

print("Excel file generated successfully with sequential challenges!")
