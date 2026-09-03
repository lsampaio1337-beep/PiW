import re

with open("src/ui/pokemonStats.js", "r") as f:
    content = f.read()

# Add formatType import
content = content.replace("import { updateUI, showModal } from '../ui.js';", "import { updateUI, showModal } from '../ui.js';\nimport { formatType, formatTypes } from './pokedex.js';")

with open("src/ui/pokemonStats.js", "w") as f:
    f.write(content)
