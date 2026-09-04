import re

with open("src/ui/pokemonStats.js", "r") as f:
    stats_content = f.read()

import_match = re.search(r'import \{([^}]+)\} from "\.\/pokedex\.js";', stats_content)
if import_match:
    old_import = import_match.group(0)
    inner = import_match.group(1).strip()
    if "getSpeciesDataHtml" not in inner:
        new_import = f'import {{{inner}, getSpeciesDataHtml}} from "./pokedex.js";'
        stats_content = stats_content.replace(old_import, new_import)
else:
    stats_content = 'import { getSpeciesDataHtml } from "./pokedex.js";\n' + stats_content

with open("src/ui/pokemonStats.js", "w") as f:
    f.write(stats_content)
