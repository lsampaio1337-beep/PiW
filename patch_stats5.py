import re

with open("src/ui/pokemonStats.js", "r") as f:
    content = f.read()

# Update tree HTML slightly for Eevee/branched evolutions to line up better, and make the button size uniform.
old_btn = r"<button \$\{req\.canEvolve \? '' : 'disabled'\} onclick=\"window\.evolvePokemon\('\$\{location\}', \$\{idx\}, \$\{evo\.to\}\)\" style=\"\$\{req\.canEvolve \? 'background: #2ecc71;' : 'background: #7f8c8d; cursor: not-allowed; font-size: 10px; line-height: 1\.2; padding: 5px;'\} margin-left: 10px; vertical-align: middle;\">\$\{btnText\}</button>"

new_btn = """<button ${req.canEvolve ? '' : 'disabled'} onclick="window.evolvePokemon('${location}', ${idx}, ${evo.to})" style="${req.canEvolve ? 'background: #2ecc71;' : 'background: #7f8c8d; cursor: not-allowed;'} margin-left: 10px; vertical-align: middle; width: 250px; height: 50px; font-size: 10px; line-height: 1.2; padding: 5px; text-align: center; display: inline-flex; align-items: center; justify-content: center; flex-direction: column;">${btnText}</button>"""

content = re.sub(old_btn, new_btn, content)

with open("src/ui/pokemonStats.js", "w") as f:
    f.write(content)
