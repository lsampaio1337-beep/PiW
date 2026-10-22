import requests
from bs4 import BeautifulSoup
import pandas as pd

# Load the current dataset to see if "Surfing" or "Old Rod" is present for Twinleaf Town
df = pd.read_excel('Sinnoh_Location_Data.xlsx')
twinleaf_df = df[df['Route / Place'] == 'Twinleaf Town']
print(twinleaf_df[['Pokemon Name', 'Method', 'Level']])
