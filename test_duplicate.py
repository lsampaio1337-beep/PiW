import pandas as pd
df = pd.read_excel('Sinnoh_Location_Data.xlsx')
# Check Twinleaf Town for duplicates
print(df[df['Route / Place'] == 'Twinleaf Town'])
