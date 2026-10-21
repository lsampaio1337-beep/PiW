import pandas as pd

# Load scraped data
df = pd.read_csv("all_galar_scraped.csv")

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

# Group by route, method, pokemon_id, pokemon_name
grouped = df.groupby(['route', 'standardized_method', 'pokemon_id', 'pokemon_name'], dropna=False)['rate'].mean().reset_index()

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

normalized = normalized.rename(columns={
    'route': 'Route / Place',
    'pokemon_id': 'Pokemon ID Regional',
    'pokemon_name': 'Pokemon Name',
    'standardized_method': 'Method',
    'rate': '% of appearance'
})

print("Columns after rename:", normalized.columns.tolist())

# Reorder columns
final_df = normalized[['Route / Place', 'Pokemon ID Regional', 'Pokemon Name', 'Method', '% of appearance']]

final_df.to_csv("processed_galar.csv", index=False)
print("Data processing complete.")
print(final_df.head(20))
