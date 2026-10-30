const fs = require('fs');

const pokemonData = require('./data/pokemon.json');
const getPokemonId = (name) => {
    let p = pokemonData.find(p => p.name === name);
    if (!p) {
        if (name === 'Wo-Chien' || name === 'Wo Chien') return pokemonData.find(p => p.name === 'Wo-Chien').id;
        if (name === 'Ting-Lu' || name === 'Ting Lu') return pokemonData.find(p => p.name === 'Ting-Lu').id;
        if (name === 'Chi-Yu' || name === 'Chi Yu') return pokemonData.find(p => p.name === 'Chi-Yu').id;
        if (name === 'Chien-Pao' || name === 'Chien Pao') return pokemonData.find(p => p.name === 'Chien-Pao').id;

        console.log('not found: ' + name);
        return null;
    }
    return p.id;
};

const req = fs.readFileSync('req.txt', 'utf8').split('\n').map(l => l.trim()).filter(l => l.length > 0);

const routesMap = new Map(); // key -> { name, spawns: [] }
const challenges = [];

let parsingChallenges = false;

for (const line of req) {
    if (line.startsWith('Order\t') || line.startsWith('Order ')) {
        continue;
    }
    if (line.startsWith('Challenge Name\t') || line.startsWith('Challenge Name ')) {
        parsingChallenges = true;
        continue;
    }

    if (!parsingChallenges) {
        // Parse Route
        const parts = line.split('\t');
        if (parts.length >= 6) {
            const order = parts[0];
            const route = parts[1];
            const secondary = parts[2];
            const pokename = parts[3];
            const levelRange = parts[4];
            const percent = parts[5];

            const routeName = secondary === 'Main' || secondary === 'Start' || secondary === 'Middle' || secondary === 'Upper' || secondary === 'Lower' || secondary === 'Gate' || secondary === 'Camp'
                                ? route
                                : `${route} - ${secondary}`;

            if (!routesMap.has(routeName)) {
                routesMap.set(routeName, {
                    name: routeName,
                    spawns: []
                });
            }

            if (pokename !== 'None') {
                const levels = levelRange.split('-');
                let minLevel = parseInt(levels[0]);
                let maxLevel = parseInt(levels[1] || levels[0]);
                let chance = parseFloat(percent.replace('%', '')) / 100;

                const pid = getPokemonId(pokename);
                if (pid) {
                    routesMap.get(routeName).spawns.push({
                        pokemonId: pid,
                        minLevel,
                        maxLevel,
                        chance
                    });
                }
            }
        }
    } else {
        // Parse Challenge
        const parts = line.split('\t');
        if (parts.length >= 3) {
            const name = parts[0];
            const reqStr = parts[1];
            const reward = parts[2];
            challenges.push({
                challengeName: name,
                reqStr,
                reward
            });
        }
    }
}

const routes = Array.from(routesMap.values());
const unlocks = [];

for (const c of challenges) {
    let reqObj = {};
    let unlockList = [];

    // Process reqStr
    if (c.reqStr.startsWith('Defeat 150 Pokemon in ')) {
        const area = c.reqStr.replace('Defeat 150 Pokemon in ', '');
        reqObj = {
            defeatCountRoute: {
                route: area,
                count: 150
            }
        };
    } else if (c.reqStr.startsWith('Defeat ')) {
        const area = c.reqStr.replace('Defeat ', '');
        if (area.includes('Gym') || area.includes('League') || area.includes('Road') || area.includes('Confluence') || area.includes('Pass') || area.includes('Shrine') || area.includes('Legends') || area.includes('Street') || area.includes('Crater')) {
            // It might be a gym or specific area. Let's see if we should create a custom one or find the route.
            if (area === 'Paldea Pokemon League') {
                reqObj = { defeatPaldeaChampion: true };
            } else if (area.includes('Gym')) {
                // Determine gym name map to badge
                let gymName = area.split(' ')[0];
                let badgeCounts = {
                    "Cortondo": 73,
                    "Artazon": 74,
                    "Levincia": 75,
                    "Cascarrafa": 76,
                    "Medali": 77,
                    "Montenevera": 78,
                    "Alfornada": 79,
                    "Glaseado": 80
                };
                if (badgeCounts[gymName]) {
                    reqObj = {
                        earnBadge: {
                            badgeCount: badgeCounts[gymName],
                            name: gymName + " Gym Badge" // We could improve this later if needed. The prompt says "badgeCount: 73" for Paldea Gyms.
                        }
                    };
                } else {
                     // Fallback
                     reqObj = { defeatCountRoute: { route: area, count: 150 } };
                }
            } else {
                // E.g., Defeat Shrine of Wood
                reqObj = { defeatCountRoute: { route: area, count: 150 } };
            }
        } else {
             reqObj = { defeatCountRoute: { route: area, count: 150 } };
        }
    } else if (c.reqStr.startsWith('Complete Extra Challenge ')) {
        const challengesListStr = c.reqStr.replace('Complete ', '').split(', ').join(',').split(' and ').join(',').split(',').map(s => s.trim());
        reqObj = { completeChallenges: challengesListStr };
    }

    // Process reward
    if (c.reward.startsWith('Unlocks ')) {
        const target = c.reward.replace('Unlocks ', '');
        if (target !== 'Item / Badge / Money' && !target.startsWith('Component for ')) {
            unlockList.push(target);
        }
    } else if (c.reward === 'Game Completed') {
        // No unlock list
    }

    // Now attach this to a route or add to unlocks
    let attached = false;
    let targetAreaId = c.reqStr.replace('Defeat 150 Pokemon in ', '').replace('Defeat ', '');
    // If it's a "Complete Extra Challenge...", target area ID is the final challenge area
    if (c.challengeName === 'Final Extra Challenge 1') {
        targetAreaId = 'The Great Crater of Paldea - Upper'; // Custom mapping perhaps?
    }

    // Find the route if it matches area Id
    let route = routes.find(r => r.name === targetAreaId);
    if (route) {
        route.challengeName = c.challengeName;
        route.areaId = targetAreaId;
        route.requirements = reqObj;
        if (unlockList.length > 0) {
            route.unlocks = unlockList;
        }

        if (c.reward.includes('Item / Badge / Money') || c.reward.includes('Component for ')) {
            route.gift = { item: "Masterball", count: 1 }; // Default gift, will adjust based on common pattern
        }
        attached = true;
    } else {
        // Some challenges might be standalone in unlocks
        let uObj = {
            challengeName: c.challengeName,
            areaId: targetAreaId,
            requirements: reqObj
        };
        if (unlockList.length > 0) {
            uObj.unlocks = unlockList;
        }
        unlocks.push(uObj);
    }
}

// Generate the final js file text
let out = 'export const paldeaRoutes = ' + JSON.stringify(routes, null, 2) + ';\n';
out += 'export const paldeaUnlocks = ' + JSON.stringify(unlocks, null, 2) + ';\n';

fs.writeFileSync('config/paldeaRoutes.js', out);
console.log('Generated paldeaRoutes.js');
