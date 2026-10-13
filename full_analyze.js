const fs = require('fs');
const https = require('https');

// Helper to get data
const fetchJson = (url) => {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { 'User-Agent': 'node.js' } }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch(e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
};

(async () => {

    // First, let's load the list the user provided
    const listRaw = fs.readFileSync('list.txt', 'utf8');
    const listLines = listRaw.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    // Fix casing on the list to match standard
    const inGameNames = new Set(listLines.map(n => {
        let name = n.toLowerCase();
        if (name === 'ho-oh') return 'ho-oh';
        if (name === 'nidoran♀') return 'nidoran-f';
        if (name === 'nidoran♂') return 'nidoran-m';
        if (name === "farfetch'd") return 'farfetchd';
        if (name === "mr. mime") return 'mr-mime';
        return name;
    }));


    // Fetch all pokemon 1-251
    const pokeRes = await fetchJson('https://pokeapi.co/api/v2/pokemon-species?limit=251');
    const idToName = new Map();
    const nameToId = new Map();

    for (let i = 0; i < 251; i++) {
        const id = i + 1;
        const name = pokeRes.results[i].name;
        idToName.set(id, name);
        nameToId.set(name, id);
    }

    // Check which ones are in game
    const inGameIds = new Set();
    for (const name of inGameNames) {
        if (nameToId.has(name)) {
            inGameIds.add(nameToId.get(name));
        }
    }


    const chainUrls = new Set();
    const batchSize = 25;
    for (let i = 1; i <= 251; i += batchSize) {
        const batch = [];
        for (let j = i; j < i + batchSize && j <= 251; j++) {
            batch.push(fetchJson(`https://pokeapi.co/api/v2/pokemon-species/${j}`));
        }
        const results = await Promise.all(batch);
        results.forEach(res => {
            if (res.evolution_chain && res.evolution_chain.url) {
                chainUrls.add(res.evolution_chain.url);
            }
        });
    }


    // Fetch all chains
    const chains = [];
    const chainArray = Array.from(chainUrls);
    for (let i = 0; i < chainArray.length; i += batchSize) {
        const batch = [];
        for (let j = i; j < i + batchSize && j < chainArray.length; j++) {
            batch.push(fetchJson(chainArray[j]));
        }
        const results = await Promise.all(batch);
        chains.push(...results);
    }


    const evolutionsFrom = new Map();

    const extractEvolutions = (node) => {
        const speciesUrlParts = node.species.url.split('/');
        const id = parseInt(speciesUrlParts[speciesUrlParts.length - 2]);

        let allEvos = new Set();
        node.evolves_to.forEach(evoNode => {
            const childSpeciesUrlParts = evoNode.species.url.split('/');
            const childId = parseInt(childSpeciesUrlParts[childSpeciesUrlParts.length - 2]);
            allEvos.add(childId);

            const childEvos = extractEvolutions(evoNode);
            childEvos.forEach(cId => allEvos.add(cId));
        });

        evolutionsFrom.set(id, allEvos);
        return allEvos;
    };

    chains.forEach(chainData => {
        extractEvolutions(chainData.chain);
    });

    const obtainableViaEvo = new Set();
    for (const inGameId of inGameIds) {

        const evos = evolutionsFrom.get(inGameId);
        if (evos) {
            evos.forEach(evoId => obtainableViaEvo.add(evoId));
        }
    }

    const gen1Ids = [];
    for (let i = 1; i <= 151; i++) gen1Ids.push(i);

    const gen2Ids = [];
    for (let i = 152; i <= 251; i++) gen2Ids.push(i);

    // Q1: 2nd gen not in game but can be obtained via evolution
    const q1 = gen2Ids.filter(id => !inGameIds.has(id) && obtainableViaEvo.has(id));

    // Q2: 2nd gen not in game and cannot be obtained
    const q2 = gen2Ids.filter(id => !inGameIds.has(id) && !obtainableViaEvo.has(id));

    // Q3: 1st gen not in game but can be obtained via evolution
    const q3 = gen1Ids.filter(id => !inGameIds.has(id) && obtainableViaEvo.has(id));

    // Q4: 1st gen not in game and cannot be obtained
    const q4 = gen1Ids.filter(id => !inGameIds.has(id) && !obtainableViaEvo.has(id));

    const capitalize = (str) => {
        if (str === 'ho-oh') return 'Ho-Oh';
        if (str === 'nidoran-f') return 'Nidoran♀';
        if (str === 'nidoran-m') return 'Nidoran♂';
        if (str === 'farfetchd') return "Farfetch'd";
        if (str === 'mr-mime') return 'Mr. Mime';
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    const formatList = (ids) => {
        if (ids.length === 0) return "None";
        return ids.map(id => `${id} - ${capitalize(idToName.get(id))}`).join('\n');
    };

    console.log("\n==================== RESULTS ====================\n");
    console.log("Which one from 2nd gen is not in game but can be obtained via evolution?");
    console.log(formatList(q1));
    console.log("");
    console.log("Which one from 2nd gen is not in game and cannot be obtained?");
    console.log(formatList(q2));
    console.log("");
    console.log("Which one from 1st gen is not in game but can be obtained via evolution?");
    console.log(formatList(q3));
    console.log("");
    console.log("Which one from 1st gen is not in game and cannot be obtained?");
    console.log(formatList(q4));
    console.log("\n=================================================");

})();
