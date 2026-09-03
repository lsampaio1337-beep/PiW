import re

with open("src/ui/pokemonStats.js", "r") as f:
    content = f.read()

# Update evolvePokemon function to consume stones
old_evolve = re.search(r"export function evolvePokemon.*?\n\s+alert\(`\$\{p\.name\} evolved into \$\{newBase\.name\}!`\);", content, flags=re.DOTALL).group(0)

new_evolve = old_evolve.replace(
    "    let p = list[idx];\n    const newBase = state.config.pokemonData.find(pd => pd.id === toId);\n    if (!newBase) return;",
    """    let p = list[idx];
    const newBase = state.config.pokemonData.find(pd => pd.id === toId);
    if (!newBase) return;

    // Re-verify requirements and consume stones
    const oldPData = state.config.pokemonData.find(pd => pd.id === p.id);
    const evoObj = oldPData ? oldPData.evolutions.find(e => e.to === toId) : null;
    if (evoObj) {
        const req = getEvolveRequirements(p, evoObj, state);
        if (!req.canEvolve) {
            alert("Requirements not met!");
            return;
        }
        // Deduct stones
        for (const type of p.types) {
            const stoneName = type + " Stone";
            state.backpack.stones[stoneName] -= req.stonesReq;
        }
    }
"""
)

content = content.replace(old_evolve, new_evolve)
with open("src/ui/pokemonStats.js", "w") as f:
    f.write(content)
