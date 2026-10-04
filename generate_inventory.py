import os
import re
import pandas as pd

directory = "Assets/Pokemon Sprites/New Natural"

# Dictionary to hold data: (number, name) -> {'normal': {gens}, 'shiny': {gens}}
pokemon_data = {}

# Match pattern: GenX_####_Name.png or GenX_####_Name_shiny.png
pattern = re.compile(r"Gen(\d+)_(\d+)_([^_.]+)(?:_(shiny))?\.png")

for filename in os.listdir(directory):
    if not filename.endswith(".png"):
        continue

    match = pattern.match(filename)
    if not match:
        continue

    gen, number, name, shiny = match.groups()
    is_shiny = bool(shiny)

    key = (number, name)
    if key not in pokemon_data:
        pokemon_data[key] = {
            'normal': {'Gen5': '', 'Gen6': '', 'Gen7': '', 'Gen9': ''},
            'shiny': {'Gen5': '', 'Gen6': '', 'Gen7': '', 'Gen9': ''}
        }

    gen_key = f"Gen{gen}"
    if is_shiny:
        pokemon_data[key]['shiny'][gen_key] = 1
    else:
        pokemon_data[key]['normal'][gen_key] = 1

# Prepare rows for DataFrame
rows = []
# Sort keys by number (integer) then name
sorted_keys = sorted(pokemon_data.keys(), key=lambda x: (int(x[0]), x[1]))

for number, name in sorted_keys:
    # Normal row
    normal_data = pokemon_data[(number, name)]['normal']
    rows.append({
        'Number': number,
        'Name': name,
        'Gen5': normal_data['Gen5'],
        'Gen6': normal_data['Gen6'],
        'Gen7': normal_data['Gen7'],
        'Gen9': normal_data['Gen9']
    })

    # Shiny row
    shiny_data = pokemon_data[(number, name)]['shiny']
    rows.append({
        'Number': number,
        'Name': name,  # Kept exactly the same name for the shiny row as per instructions
        'Gen5': shiny_data['Gen5'],
        'Gen6': shiny_data['Gen6'],
        'Gen7': shiny_data['Gen7'],
        'Gen9': shiny_data['Gen9']
    })

df = pd.DataFrame(rows, columns=['Number', 'Name', 'Gen5', 'Gen6', 'Gen7', 'Gen9'])
df.to_excel("pokemon_sprites.xlsx", index=False)
print("Saved to pokemon_sprites.xlsx")
