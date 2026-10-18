import re

with open('scripts/data_collection/scrape_sinnoh_locations.py', 'r') as f:
    content = f.read()

# the sub_method parser was looking only at the very first row `first_tr = tbody.find('tr')`
# but the real sub-method is in the second row!
# <tr> <th class="cell-loc-spacer" colspan="8"> </th> </tr>
# <tr> <th class="cell-loc-status" colspan="8"> Pokémon FireRed in GBA slot </th> </tr>

old_sub_method_logic = """            # Check for sub-header in the first row of tbody
            first_tr = tbody.find('tr')
            if not first_tr: continue

            sub_method = method_from_heading
            th = first_tr.find('th')
            if th and th.get('colspan'):
                # it's a sub-header defining method!
                sub_method_text = th.text.strip()
                if sub_method_text and sub_method_text != "Pokémon FireRed in GBA slot":
                   sub_method = sub_method_text
                elif sub_method_text == "Pokémon FireRed in GBA slot":
                   sub_method = "Dual-slot\""""

new_sub_method_logic = """            sub_method = method_from_heading
            # Check for sub-header inside tbody (e.g. Swarm, GBA slot)
            for tr in tbody.find_all('tr'):
                th = tr.find('th')
                if th and th.get('colspan'):
                    sub_method_text = th.text.strip()
                    if sub_method_text:
                        if 'GBA slot' in sub_method_text or 'Ruby' in sub_method_text or 'Sapphire' in sub_method_text or 'Emerald' in sub_method_text or 'FireRed' in sub_method_text or 'LeafGreen' in sub_method_text:
                           sub_method = "Dual-slot"
                        else:
                           sub_method = sub_method_text"""

content = content.replace(old_sub_method_logic, new_sub_method_logic)

with open('scripts/data_collection/scrape_sinnoh_locations.py', 'w') as f:
    f.write(content)
