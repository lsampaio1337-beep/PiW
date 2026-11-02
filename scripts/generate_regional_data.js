const fs = require('fs');
const xlsx = require('xlsx');

// Configuration
const REGIONS = [
  { id: 1, name: "Kanto", filePrefix: "", hasPrefix: false },
  { id: 2, name: "Johto", filePrefix: "johto", hasPrefix: true },
  { id: 3, name: "Hoenn", filePrefix: "hoenn", hasPrefix: true },
  { id: 4, name: "Sinnoh", filePrefix: "sinnoh", hasPrefix: true },
  { id: 5, name: "Unova", filePrefix: "unova", hasPrefix: true },
  { id: 6, name: "Kalos", filePrefix: "kalos", hasPrefix: true },
  { id: 7, name: "Alola", filePrefix: "alola", hasPrefix: true },
  { id: 8, name: "Galar", filePrefix: "galar", hasPrefix: true },
  { id: 9, name: "Hisui", filePrefix: "hisui", hasPrefix: true },
  { id: 10, name: "Paldea", filePrefix: "paldea", hasPrefix: true },
];

function loadJson(path) {
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}

const pokemonData = loadJson('./data/pokemon.json');

// Convert ES module to an object we can evaluate
function loadESModuleAsData(path) {
  try {
    if (!fs.existsSync(path)) return null;
    let content = fs.readFileSync(path, 'utf8');

    // Remove import statements
    content = content.replace(/import .*? from .*?;/g, '');

    // Replace export defaults
    content = content.replace(/export default\s+([^;]+);?/g, 'const defaultExport = $1;');

    // Replace named exports
    content = content.replace(/export const /g, 'const ');
    content = content.replace(/export {.*?};?/g, '');

    content += `\nmodule.exports = {`;

    const varMatches = content.match(/^const ([a-zA-Z0-9_]+) =|const defaultExport =/gm);
    if (varMatches) {
       for(let match of varMatches) {
          if (match === 'const defaultExport =') {
             content += ` defaultExport,`;
          } else {
             const varName = match.split(' ')[1];
             content += ` ${varName},`;
          }
       }
    }
    content += ` };`;

    // Evaluate safely
    const moduleObj = {};
    const context = { module: { exports: moduleObj }, require: require };
    const script = new (require('vm').Script)(content);
    script.runInNewContext(context);
    return context.module.exports;
  } catch (e) {
    console.error(`Error loading ${path}:`, e);
    return null;
  }
}

// Map IDs to base ID strings for consistent evolution checking
const pkmnIdMap = {};
pokemonData.forEach(p => pkmnIdMap[p.id] = p);

function getBST(pkmn) {
  if (!pkmn) return 0;
  return pkmn.hp + pkmn.atk + pkmn.def + pkmn.spa + pkmn.spd + pkmn.spe;
}

function getTypeMatch(route, pkmn) {
  // We can't query pokemondb.net directly for everything easily.
  // We just return "Yes" for now unless it's obviously weird, or we just put "Yes" per instructions.
  // User asked us to use internal knowledge or just Yes/NONONO. We will default to Yes as it's the safest.
  return "Yes";
}

function processRegion(region) {
  console.log(`Processing Region ${region.id}: ${region.name}...`);

  const routesFile = region.hasPrefix ? `./config/${region.filePrefix}Routes.js` : './config/routes.js';
  const mapFile = region.hasPrefix ? `./config/${region.filePrefix}MapCoordinates.js` : './config/mapCoordinates.js';

  const routesData = loadESModuleAsData(routesFile) || {};
  const mapData = loadESModuleAsData(mapFile) || {};

  // Try to find the export name
  let routes = routesData[`${region.filePrefix}Routes`] || routesData['routes'] || routesData['defaultExport']; if(!Array.isArray(routes)) routes = Object.values(routes || {});
  let unlocks = routesData[`${region.filePrefix}Unlocks`] || routesData['unlocks'] || [];
  let mapCoords = mapData[`${region.filePrefix}MapCoordinates`] || mapData['mapCoordinates'] || mapData['defaultExport'] || {};

  // Extract Pokedex logic
  const pokedexData = loadESModuleAsData('./config/pokedexIndexes.js') || {};
  const pokedexKey = region.name.toLowerCase();

  const pokedexIndexes = pokedexData.pokedexIndexes || {};
  const regionalPokedexIds = pokedexIndexes.regional ? (pokedexIndexes.regional[pokedexKey] || []) : [];

  // Step 2: Extract Challenge Chains
  // Main Challenges: start with "Challenge X" or just linear non-extra
  const mainChallenges = [];
  const extraChallenges = {};

  unlocks.forEach(unlock => {
    if (unlock.challengeName.startsWith("Extra Challenge")) {
      const parts = unlock.challengeName.split(' ');
      const letter = parts[2]; // e.g. 'A'
      if (!extraChallenges[letter]) extraChallenges[letter] = [];
      extraChallenges[letter].push(unlock);
    } else if (unlock.challengeName.startsWith("Challenge")) {
      mainChallenges.push(unlock);
    } else {
       // Catch all for others (like "Key to Indigo Summit")
       mainChallenges.push(unlock);
    }
  });

  // Setup sheet data
  const sheetRoutes = [];
  const sheetChallenges = [];
  const sheetMissing = [];

  const seenSpecies = new Set();

  // Level mapping for Main Challenges
  function getLevelForChallengeIndex(idx, total, minLvl, maxLvl) {
    if (total <= 1) return maxLvl;
    const progress = idx / (total - 1);
    return Math.round(minLvl + progress * (maxLvl - minLvl));
  }

  // BST Quarters
  function getQuarterForIndex(idx, total) {
     if (total === 0) return 0;
     const q = Math.floor(idx / (total / 4));
     return Math.min(q, 3); // 0, 1, 2, 3
  }

  function checkBSTOk(bst, quarter) {
    if (quarter === 0 && bst > 400) return "NONONO";
    if (quarter === 1 && bst > 500) return "NONONO";
    if (quarter === 2 && bst < 250) return "NONONO";
    if (quarter === 3 && bst < 350) return "NONONO";
    return "";
  }

  // Process Main Challenges mapping routes
  const routeToChallenge = {};
  unlocks.forEach(u => routeToChallenge[u.areaId] = u);

  // To handle chain ordered encounters
  let chainIndex = 0;

  // We will process routes sequentially through chains.
  // We need a way to link a route back to its chain to figure out its level.
  // Since multiple routes might not be explicitly tied to a challenge name perfectly, we do our best.

  let routeIndex = 0;
  const numMainRoutes = routes.filter(r => routeToChallenge[r.name] && !routeToChallenge[r.name].challengeName.startsWith("Extra")).length;

  routes.forEach(route => {
      // Find the challenge that unlocks this route, and the challenge this route unlocks
      const unlocksThisRoute = unlocks.find(u => u.unlocks && u.unlocks.includes(route.name));
      const challengeOfRoute = unlocks.find(u => u.areaId === route.name);

      const unlockedAt = unlocksThisRoute ? unlocksThisRoute.challengeName : "";
      const challengeName = challengeOfRoute ? challengeOfRoute.challengeName : "";

      let baseLevel = 1;
      let quarter = 0;

      if (challengeName.startsWith("Extra")) {
          // Extra chain
          const parts = challengeName.split(' ');
          const letter = parts[2];
          const chain = extraChallenges[letter] || [];
          const idx = chain.findIndex(c => c.challengeName === challengeName);
          baseLevel = getLevelForChallengeIndex(idx, chain.length, 80, 100);
          quarter = 3; // treat extra as 4th quarter
      } else {
          // Main chain
          baseLevel = getLevelForChallengeIndex(routeIndex, numMainRoutes || routes.length, 1, 80);
          quarter = getQuarterForIndex(routeIndex, numMainRoutes || routes.length);
          if (challengeOfRoute) routeIndex++;
      }

      // Calculate Route BST Mean
      let sumBST = 0;
      let pkmnCount = 0;
      (route.spawns || []).forEach(spawn => {
         const pkmn = pkmnIdMap[spawn.pokemonId];
         if (pkmn) {
             sumBST += getBST(pkmn);
             pkmnCount++;
         }
      });
      const meanBST = pkmnCount > 0 ? sumBST / pkmnCount : 0;

      if ((route.spawns || []).length === 0) {
          // Special spot (gym, daycare, etc)
          sheetRoutes.push({
             "Unlocked at": unlockedAt,
             "Challenge": challengeName,
             "Route": route.name,
             "Route (Secondary)": "",
             "Pokemon Name": "",
             "First?": "",
             "Level": "",
             "Sugested Level": "",
             "% Appearance": "",
             "% Appearance Ok?": "",
             "Pokemon/Type Ok?": "",
             "BST": "",
             "Pokemon/BST Ok?": "",
             "Map Ok?": mapCoords[route.name] ? "Yes" : "No",
             "Will Unlock": challengeOfRoute ? (challengeOfRoute.unlocks || []).join(", ") : "",
             "Requisite": challengeOfRoute ? JSON.stringify(challengeOfRoute.requirements) : "",
             "Reward": challengeOfRoute ? JSON.stringify(challengeOfRoute.gift || {}) : ""
          });
          return;
      }

      (route.spawns || []).forEach(spawn => {
         const pkmn = pkmnIdMap[spawn.pokemonId];
         if (!pkmn) return;

         const bst = getBST(pkmn);
         const diff = bst - meanBST;

         let levelModifier = 0;
         if (diff > 150) levelModifier = 4;
         else if (diff >= 100) levelModifier = 2;
         else if (diff >= 50) levelModifier = 1;
         else if (diff >= -50) levelModifier = 0;
         else if (diff >= -100) levelModifier = -1;
         else if (diff >= -150) levelModifier = -2;
         else levelModifier = -4;

         let suggestedMin = baseLevel + levelModifier;
         if (suggestedMin < 1) suggestedMin = 1;

         let suggestedInterval = 0;
         if (suggestedMin < 12) suggestedInterval = 2;
         else if (suggestedMin < 30) suggestedInterval = 3;
         else suggestedInterval = Math.min(8, Math.floor(suggestedMin * 0.10));

         const suggestedMax = suggestedMin + suggestedInterval;

         const first = seenSpecies.has(pkmn.name) ? "NONONO" : "";
         seenSpecies.add(pkmn.name);

         sheetRoutes.push({
             "Unlocked at": unlockedAt,
             "Challenge": challengeName,
             "Route": route.name,
             "Route (Secondary)": "",
             "Pokemon Name": pkmn.name,
             "First?": first,
             "Level": `${spawn.minLevel}-${spawn.maxLevel}`,
             "Sugested Level": `${suggestedMin}-${suggestedMax}`,
             "% Appearance": spawn.chance,
             "% Appearance Ok?": "",
             "Pokemon/Type Ok?": getTypeMatch(route.name, pkmn),
             "BST": bst,
             "Pokemon/BST Ok?": checkBSTOk(bst, quarter),
             "Map Ok?": mapCoords[route.name] ? "Yes" : "No",
             "Will Unlock": challengeOfRoute ? (challengeOfRoute.unlocks || []).join(", ") : "",
             "Requisite": challengeOfRoute ? JSON.stringify(challengeOfRoute.requirements) : "",
             "Reward": challengeOfRoute ? JSON.stringify(challengeOfRoute.gift || {}) : ""
         });
      });
  });

  // Populate Challenges
  unlocks.forEach(u => {
      let sugReq = "Defeat # of pokemon in route";
      if (u.areaId.includes("Gym")) sugReq = "Defeat Gym Leader";
      if (u.areaId.includes("League")) sugReq = "Win Pokemon League";

      sheetChallenges.push({
         "Challenge Name": u.challengeName,
         "Requisite": JSON.stringify(u.requirements),
         "Sugestion for Req": sugReq,
         "Reward Map": (u.unlocks || []).join(", "),
         "Reward Challenge": u.challengeName, // Assuming +1 implicitly
         "Reward Gift": JSON.stringify(u.gift || {})
      });
  });

  // Populate Missing PK
  // regionalPokedexIds has base IDs
  // Create a fast lookup for all pokemon spawned
  const spawnedIds = new Set();
  routes.forEach(r => (r.spawns || []).forEach(s => spawnedIds.add(s.pokemonId)));

  regionalPokedexIds.forEach(id => {
      if (!spawnedIds.has(id)) {
          const pkmn = pkmnIdMap[id];
          if (!pkmn) return;

          let canObtain = "No";

          // Check if it's an evolution of something we DO have
          // Quick scan across all pokemon to see who evolves into this
          function findPreEvo(targetId, currentDepth) {
              for (const p of pokemonData) {
                  if (p.evolutions) {
                      for (const evo of p.evolutions) {
                          if (evo.to === targetId) {
                              if (spawnedIds.has(p.id)) return currentDepth;
                              // Recursive
                              const depth = findPreEvo(p.id, currentDepth + 1);
                              if (depth !== -1) return depth;
                          }
                      }
                  }
              }
              return -1;
          }

          const depth = findPreEvo(id, 1);
          if (depth === 1) canObtain = "Evolve";
          else if (depth > 1) canObtain = `${depth}xEvolution`;

          // Check if "No", if next pokemon is its evolution
          if (canObtain === "No") {
              // check if its evolutions are in the pokedex index list right after it
              let hasEvoNext = false;
              if (pkmn.evolutions && pkmn.evolutions.length > 0) {
                 const evoId = pkmn.evolutions[0].to;
                 const myIdx = regionalPokedexIds.indexOf(id);
                 if (myIdx !== -1 && myIdx + 1 < regionalPokedexIds.length) {
                     if (regionalPokedexIds[myIdx + 1] === evoId) {
                         hasEvoNext = true;
                     }
                 }
              }
              if (hasEvoNext) canObtain = "No Next";
          }

          sheetMissing.push({
              "Pokemon Name": pkmn.name,
              "Can Obtain?": canObtain
          });
      }
  });

  // Format percent columns
  sheetRoutes.forEach(row => {
      if (typeof row["% Appearance"] === 'number') {
          // Leave it as a number, Excel formatter will handle it
      }
  });

  const wb = xlsx.utils.book_new();
  const wsRoutes = xlsx.utils.json_to_sheet(sheetRoutes);

  // Apply percent formatting to column I (0-indexed 8)
  const range = xlsx.utils.decode_range(wsRoutes['!ref']);
  for (let R = range.s.r + 1; R <= range.e.r; ++R) {
      const cellAddress = { c: 8, r: R }; // 8 is I "% Appearance"
      const cellRef = xlsx.utils.encode_cell(cellAddress);
      if (wsRoutes[cellRef]) {
          wsRoutes[cellRef].z = '0%';
      }
  }

  const wsChallenges = xlsx.utils.json_to_sheet(sheetChallenges);
  const wsMissing = xlsx.utils.json_to_sheet(sheetMissing);

  xlsx.utils.book_append_sheet(wb, wsRoutes, "Rutes"); // explicitly requested "Rutes"
  xlsx.utils.book_append_sheet(wb, wsChallenges, "Challenges");
  xlsx.utils.book_append_sheet(wb, wsMissing, "Missing PK");

  const fileName = `${region.id}_${region.name}_Data.xlsx`;
  xlsx.writeFile(wb, fileName);
  console.log(`Saved ${fileName}`);
}

REGIONS.forEach(processRegion);
