import pandas as pd

# The sequential progression logic for Galar:
progression_order = [
    # Main Game - Linear start
    "Slumbering Weald", # Intro/Tutorial
    "Route 1",
    "Route 2",

    # First Wild Area visit
    "Rolling Fields",
    "Dappled Grove",
    "Watchtower Ruins",
    "East Lake Axewell",
    "West Lake Axewell",
    "Axew's Eye",
    "South Lake Miloch",

    # Continuing on route to Turffield
    "Route 3",
    "Galar Mine",
    "Route 4",

    # Turffield (Grass Gym) -> Hulbury (Water Gym)
    "Route 5",
    "Hulbury",
    "Galar Mine No. 2",

    # Motostoke (Fire Gym) -> Hammerlocke (no gym yet)
    "Motostoke",
    "Motostoke Outskirts",

    # Second Wild Area visit (North)
    "North Lake Miloch",
    "Motostoke Riverbank",
    "Bridge Field",
    "Stony Wilderness",
    "Dusty Bowl",
    "Giant's Mirror",
    "Hammerlocke Hills",
    "Giant's Cap",
    "Giant's Seat",
    "Lake of Outrage", # Locked to water bike usually, but grouped here

    # Hammerlocke -> Stow-on-Side (Fighting/Ghost Gym) -> Ballonlea (Fairy Gym)
    "Route 6",
    "Route 7",
    "Route 8",

    # Circhester (Rock/Ice Gym) -> Spikemuth (Dark Gym)
    "Route 9",
    "Glimwood Tangle",

    # Wyndon (Champion)
    "Route 10",

    # DLC 1: Isle of Armor
    "Fields of Honor",
    "Soothing Wetlands",
    "Brawlers' Cave",
    "Challenge Beach",
    "Challenge Road",
    "Courageous Cavern",
    "Loop Lagoon",
    "Training Lowlands",
    "Warm-Up Tunnel",
    "Potbottom Desert",
    "Workout Sea",
    "Stepping-Stone Sea",
    "Insular Sea",
    "Honeycalm Sea",
    "Honeycalm Island",
    "Forest of Focus",

    # DLC 2: Crown Tundra
    "Slippery Slope",
    "Frostpoint Field",
    "Giant's Bed",
    "Old Cemetery",
    "Snowslide Slope",
    "Path to the Peak",
    "Tunnel to the Top",
    "Roaring-Sea Caves",
    "Frigid Sea",
    "Three-Point Pass",
    "Ballimere Lake",
    "Lakeside Cave",
    "Giant's Foot"
]

df = pd.read_csv("processed_galar.csv")

# Create a mapping for easy sorting
order_dict = {route: i+1 for i, route in enumerate(progression_order)}

# Check if any routes are missing from our manual list
all_routes = set(df['Route / Place'].unique())
mapped_routes = set(order_dict.keys())

missing = all_routes - mapped_routes
if missing:
    print("Warning: These routes were not given an order:", missing)
    # Give them a high order number so they appear at the end
    start_missing_idx = len(progression_order) + 1
    for i, route in enumerate(missing):
        order_dict[route] = start_missing_idx + i

# Apply the progression order
df['Progression Order'] = df['Route / Place'].map(order_dict)

# Reorder the dataframe rows
df = df.sort_values(['Progression Order', 'Route / Place', 'Method', '% of appearance'], ascending=[True, True, True, False])

# Move 'Progression Order' to the front
cols = ['Progression Order'] + [col for col in df.columns if col != 'Progression Order']
df = df[cols]

# --- NEW LOGIC: Filter almost similar routes ---
# A route is removed if its unique Pokemon set differs by 0 or 1 Pokemon
# from ANY previously accepted route.

accepted_routes = []
accepted_route_sets = {}

# Get routes in chronological order
ordered_routes = df['Route / Place'].drop_duplicates().tolist()

for route in ordered_routes:
    # Get set of all Pokemon names on this route
    route_pokemon = set(df[df['Route / Place'] == route]['Pokemon Name'].unique())

    is_similar = False
    for prev_route, prev_set in accepted_route_sets.items():
        # symmetric_difference gives us elements in A not in B, plus elements in B not in A.
        # If the length of symmetric difference is 0, they are identical.
        # If the length is 1, they differ by exactly 1 Pokemon overall.
        diff_len = len(route_pokemon.symmetric_difference(prev_set))

        if diff_len <= 1:
            print(f"Removing '{route}' because it is almost similar to '{prev_route}' (Difference: {diff_len})")
            is_similar = True
            break

    if not is_similar:
        accepted_routes.append(route)
        accepted_route_sets[route] = route_pokemon

# Filter dataframe to only include accepted routes
df_filtered = df[df['Route / Place'].isin(accepted_routes)].copy()

# --- NEW LOGIC: Calculate "1st?" Column ---
seen_pokemon = set()
first_time_list = []

# Because we need this strictly ordered chronologically by route,
# and df_filtered is already sorted by Progression Order, we can just iterate.
for idx, row in df_filtered.iterrows():
    pkmn = row['Pokemon Name']
    if pkmn not in seen_pokemon:
        first_time_list.append("Yes")
        seen_pokemon.add(pkmn)
    else:
        first_time_list.append("No")

df_filtered['1st?'] = first_time_list

# Reorder columns to final requested format
final_cols = ['Progression Order', 'Route / Place', 'Pokemon Name', 'Level', 'BST', 'Method', '% of appearance', '1st?']
df_filtered = df_filtered[final_cols]

# Save final
df_filtered.to_csv("final_galar.csv", index=False)
df_filtered.to_excel("Galar_Pokemon_Locations.xlsx", index=False)

print("Progression logic added, routes filtered, '1st?' column calculated, and file saved.")
print(f"Total routes remaining: {len(accepted_routes)}")
