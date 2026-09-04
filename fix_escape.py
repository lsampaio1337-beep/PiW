import re

with open("src/ui/pokedex.js", "r") as f:
    content = f.read()

content = content.replace(r"\`<b>Weak To (2x):</b> \${formatTypes(weaknesses)}<br>\`", r"`<b>Weak To (2x):</b> ${formatTypes(weaknesses)}<br>`")
content = content.replace(r"\`<b>Resists (0.5x):</b> \${formatTypes(resistances)}<br>\`", r"`<b>Resists (0.5x):</b> ${formatTypes(resistances)}<br>`")
content = content.replace(r"\`<b>Immune To (0x):</b> \${formatTypes(immunities)}<br>\`", r"`<b>Immune To (0x):</b> ${formatTypes(immunities)}<br>`")
content = content.replace(r"\`<b>Super Effective (2x):</b> \${formatTypes(effective)}<br>\`", r"`<b>Super Effective (2x):</b> ${formatTypes(effective)}<br>`")
content = content.replace(r"\`<b>Not Very Effective (0.5x):</b> \${formatTypes(notEffective)}<br>\`", r"`<b>Not Very Effective (0.5x):</b> ${formatTypes(notEffective)}<br>`")
content = content.replace(r"\`<b>No Effect (0x):</b> \${formatTypes(noEffect)}<br>\`", r"`<b>No Effect (0x):</b> ${formatTypes(noEffect)}<br>`")

with open("src/ui/pokedex.js", "w") as f:
    f.write(content)
