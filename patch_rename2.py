import re

# Update Map modal title
with open('src/ui/map.js', 'r') as f:
    content = f.read()
content = content.replace('if (modalHeader) modalHeader.innerText = "Map";', 'if (modalHeader) modalHeader.innerText = "Map";')
with open('src/ui/map.js', 'w') as f:
    f.write(content)

# Update Pokedex modal title
with open('src/ui/pokedex.js', 'r') as f:
    content = f.read()
content = content.replace('showModal("", html)', 'showModal("Pokedex", html)')
with open('src/ui/pokedex.js', 'w') as f:
    f.write(content)

# Update Bonus Candy modal title
with open('src/ui/bonusCandy.js', 'r') as f:
    content = f.read()
content = content.replace('showModal(null, html)', 'showModal("Bonus Candy", html)')
with open('src/ui/bonusCandy.js', 'w') as f:
    f.write(content)
