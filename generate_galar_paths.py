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
    "Route 5",
    "Galar Mine No. 2",
    "Motostoke Outskirts",
    "Watchtower Ruins",
    "Axew's Eye",
    "Slumbering Weald",
    "Route 6",
    "Bridge Field",
    "Stony Wilderness",
    "Dusty Bowl",
    "Giant's Cap",
    "Hammerlocke Hills",
    "Motostoke Riverbank",
    "Route 7",
    "Route 8",
    "Glimwood Tangle",
    "Route 9",
    "Lake of Outrage",
    "Route 10",
    "Slumbering Weald 2"
]

# Add any main game routes that I might have missed from the provided list
for route in ["Hulbury"]:
    if route in encounters_by_route and route not in main_game_order:
        main_game_order.insert(main_game_order.index("Galar Mine No. 2") + 1, route)

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
print(f"Unmapped routes (will be added at end of main): {unmapped_routes}")

for r in unmapped_routes:
    main_game_order.append(r)

# 2. Build Sheet 1 (Paths)
sheet1_data = []
order_counter = 1

def generate_level_range(index, total_routes, min_lvl, max_lvl):
    if total_routes == 1:
        return f"{min_lvl}-{max_lvl}"
    step = (max_lvl - min_lvl) / (total_routes - 1)
    start_lvl = int(min_lvl + index * step)
    end_lvl = int(min_lvl + (index + 1) * step) if index < total_routes - 1 else max_lvl
    # Add a little fuzziness/overlap
    end_lvl = min(max_lvl, end_lvl + 2)
    return f"{start_lvl}-{end_lvl}"

def generate_percentages(num_pokemon):
    # Rough distribution: common, uncommon, rare
    if num_pokemon == 1:
        return [100]
    elif num_pokemon == 2:
        return [60, 40]
    elif num_pokemon == 3:
        return [40, 35, 25]
    elif num_pokemon == 4:
        return [30, 25, 25, 20]
    elif num_pokemon == 5:
        return [25, 25, 20, 15, 15]

    # Generic distribution for >5
    base = 100 // num_pokemon
    remainder = 100 % num_pokemon
    distribution = [base] * num_pokemon

    # Add remainder to first few (most common)
    for i in range(remainder):
        distribution[i] += 1

    # Introduce some variance (make first half more common, second half rarer)
    half = num_pokemon // 2
    for i in range(half):
        shift = 2
        if distribution[-(i+1)] > shift:
            distribution[i] += shift
            distribution[-(i+1)] -= shift

    return distribution

# Process Main Game
for i, route in enumerate([r for r in main_game_order if r in encounters_by_route]):
    level_range = generate_level_range(i, len([r for r in main_game_order if r in encounters_by_route]), 1, 70)
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
ioa_start_order = order_counter
for i, route in enumerate([r for r in isle_of_armor_order if r in encounters_by_route]):
    level_range = generate_level_range(i, len([r for r in isle_of_armor_order if r in encounters_by_route]), 70, 100)
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
for i, route in enumerate([r for r in crown_tundra_order if r in encounters_by_route]):
    level_range = generate_level_range(i, len([r for r in crown_tundra_order if r in encounters_by_route]), 70, 100)
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
# Interleave Gyms, Daycares, and League into the main progression
sheet2_data = []
challenge_counter = 1

def add_challenge(name, req, reward):
    global challenge_counter
    sheet2_data.append({
        "Challenge Name": f"Challenge {challenge_counter}" if not name.startswith("Extra") else name,
        "Name": name,
        "Requisite": req,
        "Rewards": reward
    })
    if not name.startswith("Extra"):
        challenge_counter += 1

# Main game progression
add_challenge("Turffield Gym", "Clear Route 4", "Unlocks Route 5")
add_challenge("Route 5 Daycare", "Clear Route 5", "Unlocks Galar Mine No. 2")
add_challenge("Hulbury Gym", "Clear Galar Mine No. 2", "Unlocks Motostoke Outskirts")
add_challenge("Motostoke Gym", "Clear Motostoke Outskirts", "Unlocks Watchtower Ruins")
add_challenge("Bridge Field Daycare", "Clear Route 6", "Unlocks Bridge Field")
add_challenge("Stow-on-Side Gym", "Clear Bridge Field", "Unlocks Stony Wilderness")
add_challenge("Ballonlea Gym", "Clear Glimwood Tangle", "Unlocks Route 9")
add_challenge("Circhester Gym", "Clear Route 9", "Unlocks Lake of Outrage")
add_challenge("Spikemuth Gym", "Clear Lake of Outrage", "Unlocks Route 10")
add_challenge("Hammerlocke Gym", "Clear Route 10", "Unlocks Slumbering Weald 2")
add_challenge("Pokemon League", "Clear Slumbering Weald 2", "Unlocks Isle of Armor & Crown Tundra")

# Isle of Armor progression (Extra Challenge $1)
e1_routes = [r for r in isle_of_armor_order if r in encounters_by_route]
for i in range(len(e1_routes) - 1):
    add_challenge(f"Extra Challenge $1-{i+1}", f"Clear {e1_routes[i]}", f"Unlocks {e1_routes[i+1]}")
add_challenge(f"Extra Challenge $1-{len(e1_routes)}", f"Clear {e1_routes[-1]}", "Isle of Armor Completed")

# Crown Tundra progression (Extra Challenge $2)
e2_routes = [r for r in crown_tundra_order if r in encounters_by_route]
for i in range(len(e2_routes) - 1):
    add_challenge(f"Extra Challenge $2-{i+1}", f"Clear {e2_routes[i]}", f"Unlocks {e2_routes[i+1]}")
add_challenge(f"Extra Challenge $2-{len(e2_routes)}", f"Clear {e2_routes[-1]}", "Crown Tundra Completed")

df2 = pd.DataFrame(sheet2_data)[["Challenge Name", "Requisite", "Rewards"]] # Exclude temporary "Name" column


# 4. Build Sheet 3 (Unlisted Pokemon)
# Given the raw list, we will generate some iconic unlisted ones (Starters, Legendaries, etc.)
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

print("Excel file generated successfully!")
