import requests
from bs4 import BeautifulSoup

res = requests.get('https://pokemondb.net/location/sinnoh-twinleaf-town')
soup = BeautifulSoup(res.text, 'html.parser')

gen4 = soup.find(id='tab-locations-gen4')
if not gen4:
    gen4 = soup.find(lambda tag: tag.name == 'h2' and 'Generation 4' in tag.text)

print(gen4.prettify()[:1500] if gen4 else "NO GEN 4 FOUND")

# look at headings
if gen4.name == 'div': # it's a tab
    for h in gen4.find_all(['h3', 'h4']):
        print(h.text)
else:
    curr = gen4.find_next_sibling()
    while curr and curr.name != 'h2':
        if curr.name in ['h3', 'h4']:
            print(curr.text)
        curr = curr.find_next_sibling()
