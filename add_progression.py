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

# Save final
df.to_csv("final_galar.csv", index=False)
df.to_excel("Galar_Pokemon_Locations.xlsx", index=False)

print("Progression logic added and file saved.")
print(df.head(20))
