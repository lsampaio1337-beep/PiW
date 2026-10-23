import pandas as pd
import json
import random

# Load parsed raw data
with open('raw_encounters.json', 'r') as f:
    encounters = json.load(f)

# Group encounters by route
encounters_by_route = {}
for e in encounters:
    route = e['Route / Place']
    pokemon = e['Pokemon Name']

    # Exclude Urshifu completely
    if pokemon == "Urshifu":
        continue

    if route not in encounters_by_route:
        encounters_by_route[route] = []
    if pokemon not in encounters_by_route[route]:
        encounters_by_route[route].append(pokemon)

# Base starters at 30% progression
base_starters = ["Grookey", "Scorbunny", "Sobble"]
# Mid starters at 60% progression
mid_starters = ["Thwackey", "Raboot", "Drizzile"]

# Inject Kubfu to Fields of Honor (But no Urshifu anywhere)
if "Fields of Honor" not in encounters_by_route:
    encounters_by_route["Fields of Honor"] = []
if "Kubfu" not in encounters_by_route["Fields of Honor"]:
    encounters_by_route["Fields of Honor"].append("Kubfu")

main_game_order = [
    "Route 1",
    "Route 2",
    "Rolling Fields",
    "Dappled Grove",
    "West Lake Axewell",
    "East Lake Axewell",
    "South Lake Miloch",
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
    "Pokemon League"
]

# Ensure missing main game routes are added
if "Hulbury" in encounters_by_route and "Hulbury" not in main_game_order:
    main_game_order.insert(main_game_order.index("Galar Mine No. 2") + 1, "Hulbury")

main_routes_only = [r for r in main_game_order if 'Gym' not in r and 'League' not in r and 'Daycare' not in r]

# Inject starters
# 30% of main_routes_only is about index 8
idx_30 = int(len(main_routes_only) * 0.3)
route_30 = main_routes_only[idx_30]
if route_30 not in encounters_by_route:
    encounters_by_route[route_30] = []
for p in base_starters:
    if p not in encounters_by_route[route_30]:
        encounters_by_route[route_30].append(p)

# 60% of main_routes_only is about index 16
idx_60 = int(len(main_routes_only) * 0.6)
route_60 = main_routes_only[idx_60]
if route_60 not in encounters_by_route:
    encounters_by_route[route_60] = []
for p in mid_starters:
    if p not in encounters_by_route[route_60]:
        encounters_by_route[route_60].append(p)

# We want exactly 5 chains based on the 5 boss groups provided.
# We will split the DLC (Isle of Armor & Crown Tundra) routes sensibly across these 5 chains.
extra_chains = [
    {
        "id": "1",
        "name": "Heroes of Galar",
        # Sensible path: start at Slumbering Weald depths, head to Isle of armor dojo area, end at Energy Plant
        "routes": ["Slumbering Weald 2", "Fields of Honor", "Forest of Focus", "Training Lowlands", "Energy Plant"],
        "bosses": ["Zacian", "Zamazenta"]
    },
    {
        "id": "2",
        "name": "The Regis",
        # Sensible path: Isle of armor caves/roads -> Crown Tundra Ruins
        "routes": ["Brawlers' Cave", "Challenge Road", "Warm-Up Tunnel", "Potbottom Desert", "Rock Peak Ruins", "Iceberg Ruins", "Iron Ruins", "Split-Decision Ruins"],
        "bosses": ["Regieleki", "Regidrago"]
    },
    {
        "id": "3",
        "name": "The Steeds",
        # Sensible path: Crown Tundra snowy plains -> Crown Shrine
        "routes": ["Slippery Slope", "Old Cemetery", "Path to the Peak", "Crown Shrine"],
        "bosses": ["Glastrier", "Spectrier"]
    },
    {
        "id": "4",
        "name": "The Kings",
        # Sensible path: Crown Tundra caves & sea -> Tower Summit
        "routes": ["Roaring-Sea Caves", "Frigid Sea", "Tunnel to the Top", "Tower Summit"],
        "bosses": ["Calyrex", "Eternatus"]
    },
    {
        "id": "5",
        "name": "The Legendary Birds",
        # Sensible path: Isle of Armor Sea -> Crown Tundra Lakes/Trees
        "routes": ["Challenge Beach", "Workout Sea", "Stepping-Stone Sea", "Honeycalm Island", "Soothing Wetlands", "Giant's Foot", "Lakeside Cave", "Dyna Tree Hill"],
        "bosses": ["Articuno", "Zapdos", "Moltres"]
    }
]

# Ensure we create empty encounter lists for all new routes
for chain in extra_chains:
    for route in chain["routes"]:
        if route not in encounters_by_route:
            encounters_by_route[route] = []

    # Add bosses to the final route
    if chain["bosses"]:
        final_route = chain["routes"][-1]
        for boss in chain["bosses"]:
            if boss not in encounters_by_route[final_route]:
                encounters_by_route[final_route].append(boss)

seen_pokemon = set()
backup_galar_pokemon = ["Rookidee", "Corvisquire", "Corviknight", "Blipbug", "Dottler", "Orbeetle", "Nickit", "Thievul", "Gossifleur", "Eldegoss", "Wooloo", "Dubwool", "Chewtle", "Drednaw", "Yamper", "Boltund", "Rolycoly", "Carkol", "Coalossal", "Applin", "Flapple", "Appletun", "Silicobra", "Sandaconda", "Cramorant", "Arrokuda", "Barraskewda", "Toxel", "Toxtricity", "Sizzlipede", "Centiskorch", "Clobbopus", "Grapploct", "Sinistea", "Polteageist", "Hatenna", "Hattrem", "Hatterene", "Impidimp", "Morgrem", "Grimmsnarl", "Obstagoon", "Perrserker", "Cursola", "Sirfetch'd", "Mr. Rime", "Runerigus", "Milcery", "Alcremie", "Falinks", "Pincurchin", "Snom", "Frosmoth", "Stonjourner", "Eiscue", "Indeedee", "Morpeko", "Cufant", "Copperajah", "Dracozolt", "Arctozolt", "Dracovish", "Arctovish", "Duraludon", "Dreepy", "Drakloak", "Dragapult"]

def enforce_route_rules(route, pokemons):
    global seen_pokemon

    # Keep bosses if they are in this list
    is_final_route = False
    for chain in extra_chains:
        if route == chain["routes"][-1]:
            is_final_route = True

    # Figure out which are new
    new_pokes = [p for p in pokemons if p not in seen_pokemon]
    old_pokes = [p for p in pokemons if p in seen_pokemon]

    required_new = 2 if len(pokemons) >= 5 else 1

    # We must have `required_new` new pokemons
    while len(new_pokes) < required_new:
        if not backup_galar_pokemon:
            break
        # Grab a random new one
        random.shuffle(backup_galar_pokemon)
        cand = backup_galar_pokemon.pop()
        if cand not in seen_pokemon and cand not in pokemons:
            new_pokes.append(cand)

    # Combine
    final_list = new_pokes + old_pokes

    # Truncate to max 9, but don't lose the new pokes or the bosses!
    if len(final_list) > 9:
        # Prioritize new_pokes, then bosses
        bosses_here = []
        if is_final_route:
            for chain in extra_chains:
                if route == chain["routes"][-1]:
                    for b in chain["bosses"]:
                        if b in final_list:
                            bosses_here.append(b)

        keep = set(new_pokes + bosses_here)
        remaining = [p for p in final_list if p not in keep]
        while len(keep) < 9 and remaining:
            keep.add(remaining.pop(0))
        final_list = list(keep)

    for p in final_list:
        seen_pokemon.add(p)

    return final_list

def generate_level_range(index, total_routes, min_lvl, max_lvl, is_boss=False):
    if is_boss:
        return "100"
    if total_routes <= 1:
        return f"{min_lvl}-{max_lvl}"
    step = (max_lvl - min_lvl) / (total_routes - 1)
    start_lvl = int(min_lvl + index * step)
    end_lvl = int(min_lvl + (index + 1) * step) if index < total_routes - 1 else max_lvl
    end_lvl = min(max_lvl, end_lvl + 2)
    return f"{start_lvl}-{end_lvl}"

def generate_percentages(num_pokemon):
    if num_pokemon == 0: return []
    if num_pokemon == 1: return [100]
    elif num_pokemon == 2: return [60, 40]
    elif num_pokemon == 3: return [40, 35, 25]
    elif num_pokemon == 4: return [30, 25, 25, 20]
    elif num_pokemon == 5: return [25, 25, 20, 15, 15]
    elif num_pokemon == 6: return [20, 20, 20, 15, 15, 10]
    elif num_pokemon == 7: return [20, 15, 15, 15, 15, 10, 10]
    elif num_pokemon == 8: return [15, 15, 15, 15, 10, 10, 10, 10]
    elif num_pokemon == 9: return [15, 15, 15, 15, 10, 10, 10, 5, 5]
    else: return [100//num_pokemon]*num_pokemon

# Build Sheet 1
sheet1_data = []
order_counter = 1

# Process Main Game
for i, route in enumerate(main_routes_only):
    level_range = generate_level_range(i, len(main_routes_only), 1, 70)
    pokemons = encounters_by_route.get(route, [])
    pokemons = enforce_route_rules(route, pokemons)
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

# Process Extra Chains
for chain in extra_chains:
    for i, route in enumerate(chain["routes"]):
        is_final = (i == len(chain["routes"]) - 1)

        pokemons = encounters_by_route.get(route, [])
        pokemons = enforce_route_rules(route, pokemons)

        # If it's the final route with bosses, bosses get Level 100
        bosses = chain["bosses"]
        regular_pokes = [p for p in pokemons if p not in bosses]
        final_bosses = [p for p in pokemons if p in bosses]

        # Assign percentages
        if is_final and len(final_bosses) > 0:
            # Safe rounding for percentages so it adds to exactly 100 on boss routes
            if len(regular_pokes) > 0:
                base_pct = 100 // len(regular_pokes)
                rem_pct = 100 % len(regular_pokes)
                for p_idx, p in enumerate(regular_pokes):
                    pct = base_pct + (1 if p_idx < rem_pct else 0)
                    sheet1_data.append({
                        "Order": f"E{chain['id']}-{i+1}",
                        "Route/Place": route,
                        "Secondary": "",
                        "Pokemon Name": p,
                        "Level": generate_level_range(i, len(chain["routes"]), 70, 95),
                        "% Appearance": pct
                    })
            if len(final_bosses) > 0:
                base_pct = 100 // len(final_bosses)
                rem_pct = 100 % len(final_bosses)
                for p_idx, p in enumerate(final_bosses):
                    pct = base_pct + (1 if p_idx < rem_pct else 0)
                    sheet1_data.append({
                        "Order": f"E{chain['id']}-{i+1}",
                        "Route/Place": route,
                        "Secondary": "Boss",
                        "Pokemon Name": p,
                        "Level": "100",
                        "% Appearance": pct
                    })
        else:
            level_range = generate_level_range(i, len(chain["routes"]), 70, 100)
            percentages = generate_percentages(len(pokemons))

            # fix rounding issues from predefined lists
            if sum(percentages) != 100 and len(percentages) > 0:
                diff = 100 - sum(percentages)
                percentages[0] += diff

            for p_idx, p in enumerate(pokemons):
                sheet1_data.append({
                    "Order": f"E{chain['id']}-{i+1}",
                    "Route/Place": route,
                    "Secondary": "",
                    "Pokemon Name": p,
                    "Level": level_range,
                    "% Appearance": percentages[p_idx]
                })

df1 = pd.DataFrame(sheet1_data)

# Build Sheet 2 (Challenges)
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
# Capstone main challenge unlocks all Extra Chains starts
sheet2_data.append({
    "Challenge Name": f"Challenge {len(main_game_order)}",
    "Requisite": f"Clear {main_game_order[-1]}",
    "Rewards": "Unlocks all 5 DLC Chains (Heroes, Regis, Steeds, Kings, Birds)"
})

# Extra Chains
for chain in extra_chains:
    routes = chain["routes"]
    for i in range(len(routes) - 1):
        sheet2_data.append({
            "Challenge Name": f"Extra Challenge ${chain['id']}-{i+1}",
            "Requisite": f"Clear {routes[i]}",
            "Rewards": f"Unlocks {routes[i+1]}"
        })

    reward_str = f"Completed {chain['name']}"
    if chain["bosses"]:
        reward_str += f" (Defeated {' & '.join(chain['bosses'])})"

    sheet2_data.append({
        "Challenge Name": f"Extra Challenge ${chain['id']}-{len(routes)}",
        "Requisite": f"Clear {routes[-1]}",
        "Rewards": reward_str
    })

df2 = pd.DataFrame(sheet2_data)

# Build Sheet 3 (Unlisted Pokemon)
# We don't include Starters or final bosses in Sheet 3 anymore because they are in the routes!
unlisted_pokemon = [
    {"Pokemon Name": "Rillaboom", "Pokemon Type": "Grass", "Path to be include": "-", "Obtained?": "Yes (Evolution)"},
    {"Pokemon Name": "Cinderace", "Pokemon Type": "Fire", "Path to be include": "-", "Obtained?": "Yes (Evolution)"},
    {"Pokemon Name": "Inteleon", "Pokemon Type": "Water", "Path to be include": "-", "Obtained?": "Yes (Evolution)"},
    {"Pokemon Name": "Urshifu", "Pokemon Type": "Fighting/Dark", "Path to be include": "-", "Obtained?": "No (Excluded per instructions)"},
]
df3 = pd.DataFrame(unlisted_pokemon)

# Export to Excel
with pd.ExcelWriter("Galar_Paths.xlsx", engine="openpyxl") as writer:
    df1.to_excel(writer, sheet_name="Paths", index=False)
    df2.to_excel(writer, sheet_name="Challenges", index=False)
    df3.to_excel(writer, sheet_name="Unlisted Pokemon", index=False)

print("Excel file generated correctly with 5 exact chains and no Urshifu!")
