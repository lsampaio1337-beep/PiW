import re

with open("src/ui/pokemonStats.js", "r") as f:
    content = f.read()

# Fix the button sizing since the image loading was a bit weird and text formatting is off for missing stones.
# Also fix the Pokedex BST display replacing `|` correctly, and fixing the text formatting.

old_btn = r"<button \$\{req\.canEvolve \? '' : 'disabled'\} onclick=\"window\.evolvePokemon\('\$\{location\}', \$\{idx\}, \$\{evo\.to\}\)\" style=\"\$\{req\.canEvolve \? 'background: #2ecc71;' : 'background: #7f8c8d; cursor: not-allowed;'\} margin-left: 10px; vertical-align: middle; width: 250px; height: 50px; font-size: 10px; line-height: 1\.2; padding: 5px; text-align: center; display: inline-flex; align-items: center; justify-content: center; flex-direction: column;\">\$\{btnText\}</button>"
new_btn = """<button ${req.canEvolve ? '' : 'disabled'} onclick="window.evolvePokemon('${location}', ${idx}, ${evo.to})" style="${req.canEvolve ? 'background: #2ecc71;' : 'background: #7f8c8d; cursor: not-allowed;'} margin-left: 10px; vertical-align: middle; width: max-content; min-width: 200px; height: 40px; font-size: 12px; line-height: 1.2; padding: 5px 10px; text-align: center; display: inline-flex; align-items: center; justify-content: center; flex-direction: column;">${btnText}</button>"""

content = re.sub(old_btn, new_btn, content)

# Change the missing stones html to have standard formatting.
old_get_evolve = r"missingStonesHtml \+= `\$\{stonesReq\}<img src=\"Assets/Items/Stones/\$\{stoneName\}\.png\" style=\"width: 16px; height: 16px; vertical-align: middle; margin-left: 2px; margin-right: 5px;\" title=\"\$\{stoneName\}\">`;"
new_get_evolve = """missingStonesHtml += `${stonesReq}<img src="Assets/Items/Stones/${stoneName}.png" style="width: 16px; height: 16px; vertical-align: middle; margin-left: 2px; margin-right: 5px;" title="${stoneName}">`;"""

content = content.replace(old_get_evolve, new_get_evolve)

old_missing_logic = r"if \(\!req\.hasLevel && \!req\.hasStones\) \{.*?\} else if \(\!req\.hasStones\) \{.*?btnText = `Need \$\{req\.missingStonesHtml\} to evolve`;.*?    \}"
new_missing_logic = """if (!req.hasLevel && !req.hasStones) {
                    btnText = `<span style="line-height:1.2;">Need Lv. ${req.requiredLevel}</span><span style="line-height:1.2; display:flex; align-items:center;">Need ${req.missingStonesHtml} to evolve</span>`;
                } else if (!req.hasLevel) {
                    btnText = `Need Lv. ${req.requiredLevel} to evolve`;
                } else if (!req.hasStones) {
                    btnText = `<span style="display:flex; align-items:center;">Need ${req.missingStonesHtml} to evolve</span>`;
                }"""

content = re.sub(old_missing_logic, new_missing_logic, content, flags=re.DOTALL)

with open("src/ui/pokemonStats.js", "w") as f:
    f.write(content)
