import re

with open("src/ui/pokedex.js", "r") as f:
    content = f.read()

# Export formatType and formatTypes
content = content.replace("function formatType(typeStr) {", "export function formatType(typeStr) {")
content = content.replace("function formatTypes(obj) {", "export function formatTypes(obj) {")

# Update BST line
old_bst = "<p><b>BST:</b> ${bst} (HP:${pData.hp} A:${pData.atk} D:${pData.def} SA:${pData.spa} SD:${pData.spd} S:${pData.spe})</p>"
new_bst = "<p><b>BST:</b> ${bst} (HP:${pData.hp} | Speed:${pData.spe} | Atk:${pData.atk} SpAtk:${pData.spa} | Def:${pData.def} SpDef:${pData.spd})</p>"
content = content.replace(old_bst, new_bst)

with open("src/ui/pokedex.js", "w") as f:
    f.write(content)
