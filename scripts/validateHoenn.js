const fs = require('fs');

const hoennRoutesContent = fs.readFileSync('./config/hoennRoutes.js', 'utf8').replace(/export const/g, 'const');

const pokemonData = JSON.parse(fs.readFileSync('./data/pokemon.json', 'utf8'));

let hoennRoutes, hoennUnlocks;
eval(hoennRoutesContent + '\n; hoennRoutesLocal = hoennRoutes; hoennUnlocksLocal = hoennUnlocks;');

function getPokemonId(name) {
    const p = pokemonData.find(p => p.name.toLowerCase() === name.toLowerCase());
    return p ? p.id : null;
}

const unlockedAreas = new Set(['Route 101']);
const completedChallenges = new Set();
const availablePokemon = new Set();

function addEvolutions(pokemonId) {
    const p = pokemonData.find(pk => pk.id === pokemonId);
    if (p && p.evolutions) {
        p.evolutions.forEach(ev => {
            const evId = ev.to || ev.id;
            if (evId && !availablePokemon.has(evId)) {
                availablePokemon.add(evId);
                addEvolutions(evId);
            }
        });
    }
}

function updateAvailablePokemon() {
    hoennRoutesLocal.forEach(r => {
        if (r.name && unlockedAreas.has(r.name)) {
            r.spawns?.forEach(spawn => {
                availablePokemon.add(spawn.pokemonId);
                addEvolutions(spawn.pokemonId);
            });
        }
    });
}

updateAvailablePokemon();

let progressMade = true;

while (progressMade) {
    progressMade = false;

    for (const challenge of hoennUnlocksLocal) {
        if (completedChallenges.has(challenge.challengeName)) continue;

        if (!unlockedAreas.has(challenge.areaId)) continue;

        let canComplete = true;
        let failureReason = '';

        if (challenge.requirements) {
            if (challenge.requirements.defeatCountRoute) {
                if (!unlockedAreas.has(challenge.requirements.defeatCountRoute.route)) {
                    canComplete = false;
                    failureReason = `Route ${challenge.requirements.defeatCountRoute.route} not unlocked.`;
                }
            }

            if (challenge.requirements.catchSpecies) {
                for (const req of challenge.requirements.catchSpecies) {
                    const id = getPokemonId(req.species);
                    if (!id) {
                        canComplete = false;
                        failureReason = `Pokemon ${req.species} not found in database.`;
                        break;
                    }
                    if (!availablePokemon.has(id)) {
                        canComplete = false;
                        failureReason = `Pokemon ${req.species} (ID ${id}) not available to catch/evolve yet.`;
                        break;
                    }
                }
            }

            if (challenge.requirements.catchSpeciesAnyOfByQuality) {
                 for (const req of challenge.requirements.catchSpeciesAnyOfByQuality) {
                     let foundAny = false;
                     for (const speciesName of req.species) {
                         const id = getPokemonId(speciesName);
                         if (id && availablePokemon.has(id)) {
                             foundAny = true;
                             break;
                         }
                     }
                     if (!foundAny) {
                         canComplete = false;
                         failureReason = `None of the species ${req.species.join(', ')} are available.`;
                         break;
                     }
                 }
            }

            if (challenge.requirements.defeatSpecific) {
                const id = getPokemonId(challenge.requirements.defeatSpecific.name);
                if (!id || !availablePokemon.has(id)) {
                    canComplete = false;
                    failureReason = `Specific target ${challenge.requirements.defeatSpecific.name} not available.`;
                }
            }

            if (challenge.requirements.defeatMultipleSpecific) {
                for (const req of challenge.requirements.defeatMultipleSpecific) {
                    const id = getPokemonId(req.name);
                    if (!id || !availablePokemon.has(id)) {
                        canComplete = false;
                        failureReason = `Multiple Specific target ${req.name} not available.`;
                        break;
                    }
                }
            }

            if (challenge.requirements.completeChallenges) {
                for (const reqChal of challenge.requirements.completeChallenges) {
                    if (!completedChallenges.has(reqChal)) {
                        canComplete = false;
                        failureReason = `Required challenge ${reqChal} not completed yet.`;
                        break;
                    }
                }
            }

            if (challenge.requirements.completeAnyOfChallenges) {
                let anyDone = false;
                for (const reqChal of challenge.requirements.completeAnyOfChallenges) {
                    if (completedChallenges.has(reqChal)) {
                        anyDone = true;
                        break;
                    }
                }
                if (!anyDone) {
                    canComplete = false;
                    failureReason = `None of required challenges ${challenge.requirements.completeAnyOfChallenges.join(', ')} are completed.`;
                }
            }
        }

        if (canComplete) {
            completedChallenges.add(challenge.challengeName);
            progressMade = true;

            if (challenge.unlocks) {
                challenge.unlocks.forEach(area => {
                    unlockedAreas.add(area);
                });
            }

            updateAvailablePokemon();
        } else {
            challenge._lastFailureReason = failureReason;
        }
    }
}

console.log("\n--- Validation Report ---");

const unusedChallenges = hoennUnlocksLocal.filter(c => !completedChallenges.has(c.challengeName));
if (unusedChallenges.length === 0) {
    console.log("✅ All challenges can be completed.");
} else {
    console.log(`❌ ${unusedChallenges.length} challenges cannot be completed:`);
    unusedChallenges.forEach(c => {
        console.log(`  - ${c.challengeName} (Area: ${c.areaId}) | Reason: ${c._lastFailureReason || 'Area not unlocked'}`);
    });
}

const allDefinedAreas = new Set(hoennRoutesLocal.map(r => r.name).filter(Boolean));
hoennUnlocksLocal.forEach(c => {
    if (c.areaId && !allDefinedAreas.has(c.areaId)) allDefinedAreas.add(c.areaId);
    if (c.unlocks) c.unlocks.forEach(u => {
        if (!allDefinedAreas.has(u)) allDefinedAreas.add(u);
    });
});

const untouchedAreas = Array.from(allDefinedAreas).filter(a => !unlockedAreas.has(a));
if (untouchedAreas.length === 0) {
    console.log("✅ All defined areas can be unlocked.");
} else {
    console.log(`❌ ${untouchedAreas.length} areas are never unlocked:`);
    untouchedAreas.forEach(a => console.log(`  - ${a}`));
}
