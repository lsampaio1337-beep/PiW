import pandas as pd
df = pd.read_excel('Sinnoh_Location_Data.xlsx')
print(df[df['Method'].isin(['Swarm', 'Dual-slot', 'Poké Radar', 'Gift/Event/Fossil'])])
