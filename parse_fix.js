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
        const parts = line.split('\t');
        if (parts.length >= 6) {
            const order = parts[0];
            const route = parts[1];
            const secondary = parts[2];
            const pokename = parts[3];
            const levelRange = parts[4];
            const percent = parts[5];

            // Format name properly: "Route - Secondary"
            let routeName = route;
            if (secondary && secondary !== 'Main' && secondary !== 'Start' && secondary !== 'Middle' && secondary !== 'Upper' && secondary !== 'Lower' && secondary !== 'Gate' && secondary !== 'Camp' && secondary !== 'None') {
                routeName = `${route} - ${secondary}`;
            } else if (secondary === 'Start' || secondary === 'Middle' || secondary === 'Upper' || secondary === 'Lower' || secondary === 'Gate' || secondary === 'Camp') {
                routeName = `${route} - ${secondary}`;
            }
            // Actually, looking at the challenges table, some "Main" are appended (e.g. "Poco Path - Main").
            // Let's use exactly what the challenges table will look for.
            if (secondary !== 'None' && secondary) {
                routeName = `${route} - ${secondary}`;
            }
            if (routeName.endsWith(' - Main')) {
                 if (routeName !== 'Poco Path - Main' && routeName !== 'Los Platos - Main' && routeName !== 'Mesagoza - Main' && routeName !== 'Jubilife Village - Main') {
                     // For gyms and some others, 'Main' is not usually in the name.
                     routeName = routeName.replace(' - Main', '');
                 }
            }

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

const unlocksMap = new Map();
const unlocksArr = [];

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
        if (area === 'Paldea Pokemon League') {
            reqObj = { defeatPaldeaChampion: true };
        } else if (area.includes('Gym')) {
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
                        name: gymName + " Gym Badge"
                    }
                };
            } else {
                 reqObj = { defeatCountRoute: { route: area, count: 150 } };
            }
        } else {
             reqObj = { defeatCountRoute: { route: area, count: 150 } };
        }
    } else if (c.reqStr.startsWith('Complete Extra Challenge ')) {
        const challengesListStr = ["Extra Challenge H 4", "Extra Challenge I 4", "Extra Challenge J 3", "Extra Challenge K 3"];
        reqObj = { completeChallenges: challengesListStr };
    }

    // Process reward
    if (c.reward.startsWith('Unlocks ')) {
        const target = c.reward.replace('Unlocks ', '');
        if (target !== 'Item / Badge / Money' && !target.startsWith('Component for ')) {
            unlockList.push(target);
        }
    }

    // Create unlock object
    let targetAreaId = c.reqStr.replace('Defeat 150 Pokemon in ', '').replace('Defeat ', '');

    if (c.challengeName === 'Final Extra Challenge 1') {
        targetAreaId = 'The Great Crater of Paldea - Upper';
    } else if (c.challengeName === 'Final Extra Challenge 2') {
        targetAreaId = 'The Great Crater of Paldea - Lower';
        reqObj = { defeatCountRoute: { route: "The Great Crater of Paldea - Upper", count: 150 } };
    } else if (c.challengeName === 'Final Extra Challenge 3') {
        targetAreaId = 'Zero Gate - Main';
        reqObj = { defeatCountRoute: { route: "The Great Crater of Paldea - Lower", count: 150 } };
    }

    let uObj = {
        challengeName: c.challengeName,
        areaId: targetAreaId,
        requirements: reqObj
    };
    if (unlockList.length > 0) {
        uObj.unlocks = unlockList;
    }

    if (c.reward.includes('Item / Badge / Money') || c.reward.includes('Component for ')) {
        uObj.gift = { item: "Masterball", count: 1 };
    }

    unlocksArr.push(uObj);
}

const routes = Array.from(routesMap.values());

let out = 'export const paldeaRoutes = ' + JSON.stringify(routes, null, 2) + ';\n';
out += 'export const paldeaUnlocks = ' + JSON.stringify(unlocksArr, null, 2) + ';\n';

fs.writeFileSync('config/paldeaRoutes.js', out);

// Map coords empty
fs.writeFileSync('config/paldeaMapCoordinates.js', 'export const paldeaMapCoordinates = {};\n');

// We also need to add paldea to src/ui.js import map and setup logic for region.
// I will just use string manipulation for that.
console.log('Fixed paldeaRoutes.js');
