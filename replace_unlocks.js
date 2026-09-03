const fs = require('fs');

const unlocks = [
  {
    "areaId": "Route 1",
    "unlocks": ["Route 2"],
    "requirements": {
      "defeatCountRoute": { "route": "Route 1", "count": 25 }
    }
  },
  {
    "areaId": "Route 2",
    "unlocks": ["Viridian Forest"],
    "requirements": {
      "catchSpecies": [
        { "species": "Nidoran♀", "count": 1 },
        { "species": "Nidoran♂", "count": 1 }
      ]
    }
  },
  {
    "areaId": "Viridian Forest",
    "unlocks": ["Pewter Gym"],
    "requirements": {
      "catchByRarityAndType": { "type": "Bug", "rarity": "Epic", "count": 10 }
    }
  },
  {
    "areaId": "Pewter Gym",
    "unlocks": ["Route 3"],
    "requirements": {
      "earnBadge": { "name": "Boulder Badge", "leader": "Brock", "badgeCount": 1 }
    }
  },
  {
    "areaId": "Route 3",
    "unlocks": ["Mount Moon"],
    "requirements": {
      "catchSpecies": [
        { "species": "Ekans", "count": 1 },
        { "species": "Sandshrew", "count": 1 }
      ]
    }
  },
  {
    "areaId": "Mount Moon",
    "unlocks": ["Route 4"],
    "requirements": {
      "catchSpecies": [
        { "species": "Clefairy", "count": 1 }
      ],
      "catchSpeciesByRarity": [
        { "species": "Zubat", "rarity": "Epic", "count": 1 }
      ]
    }
  },
  {
    "areaId": "Route 4",
    "unlocks": ["Cerulean Gym"],
    "requirements": {
      "catchSpecies": [
        { "species": "Mankey", "count": 2 }
      ]
    }
  },
  {
    "areaId": "Cerulean Gym",
    "unlocks": ["Route 24 & 25"],
    "requirements": {
      "earnBadge": { "name": "Cascade Badge", "leader": "Misty", "badgeCount": 2 }
    }
  },
  {
    "areaId": "Route 24 & 25",
    "unlocks": ["Route 5"],
    "requirements": {
      "catchSpecies": [{ "species": "Abra", "count": 5 }]
    }
  },
  {
    "areaId": "Route 5",
    "unlocks": ["Route 6"],
    "requirements": {
      "defeatCountRoute": { "route": "Route 5", "count": 200 }
    }
  },
  {
    "areaId": "Route 6",
    "unlocks": ["Vermilion Gym"],
    "requirements": {
      "catchSpeciesAnyOf": [{ "species": ["Psyduck", "Goldeen"], "count": 1 }]
    }
  },
  {
    "areaId": "Vermilion Gym",
    "unlocks": ["Route 11"],
    "requirements": {
      "earnBadge": { "name": "Thunder Badge", "leader": "Lt. Surge", "badgeCount": 3 }
    }
  },
  {
    "areaId": "Route 11",
    "unlocks": ["Diglett's Cave"],
    "requirements": {
      "catchSpecies": [
        { "species": "Drowzee", "count": 10 },
        { "species": "Raticate", "count": 1 }
      ]
    }
  },
  {
    "areaId": "Diglett's Cave",
    "unlocks": ["Route 9"],
    "requirements": {
      "catchSpecies": [{ "species": "Dugtrio", "count": 2 }]
    }
  },
  {
    "areaId": "Route 9",
    "unlocks": ["Route 10"],
    "requirements": {
      "catchSpecies": [{ "species": "Fearow", "count": 2 }]
    }
  },
  {
    "areaId": "Route 10",
    "unlocks": ["Rock Tunnel"],
    "requirements": {
      "defeatCountRoute": { "route": "Route 10", "count": 250 }
    }
  },
  {
    "areaId": "Rock Tunnel",
    "unlocks": ["Route 8"],
    "requirements": {
      "catchSpecies": [
        { "species": "Onix", "count": 2 },
        { "species": "Machop", "count": 4 }
      ]
    }
  },
  {
    "areaId": "Route 8",
    "unlocks": ["Celadon Gym", "Casino"],
    "requirements": {
      "catchSpecies": [{ "species": "Kadabra", "count": 2 }],
      "catchByType": { "type": "Fire", "count": 10 }
    }
  },
  {
    "areaId": "Celadon Gym",
    "unlocks": ["Route 7"],
    "requirements": {
      "earnBadge": { "name": "Rainbow Badge", "leader": "Erika", "badgeCount": 4 }
    }
  },
  {
    "areaId": "Route 7",
    "unlocks": ["Pokémon Tower"],
    "requirements": {
      "defeatCountRoute": { "route": "Route 7", "count": 300 }
    }
  },
  {
    "areaId": "Pokémon Tower",
    "unlocks": ["Route 12", "Small Fishing Spot"],
    "requirements": {
      "catchSpecies": [
        { "species": "Haunter", "count": 2 },
        { "species": "Cubone", "count": 1 }
      ]
    }
  },
  {
    "areaId": "Route 12",
    "unlocks": ["Route 13", "Fighting Dojo"],
    "requirements": {
      "catchSpecies": [{ "species": "Farfetch'd", "count": 1 }]
    }
  },
  {
    "areaId": "Route 13",
    "unlocks": ["Route 14, 15"],
    "requirements": {
      "catchSpecies": [
        { "species": "Victreebel", "count": 2 },
        { "species": "Vileplume", "count": 2 }
      ]
    }
  },
  {
    "areaId": "Route 14, 15",
    "unlocks": ["Fuchsia Gym"],
    "requirements": {
      "catchSpecies": [{ "species": "Ditto", "count": 10 }]
    }
  },
  {
    "areaId": "Fuchsia Gym",
    "unlocks": ["Cycling Road"],
    "requirements": {
      "earnBadge": { "name": "Soul Badge", "leader": "Koga", "badgeCount": 5 }
    }
  },
  {
    "areaId": "Cycling Road",
    "unlocks": ["Safari Zone"],
    "requirements": {
      "catchSpecies": [{ "species": "Dodrio", "count": 2 }]
    }
  },
  {
    "areaId": "Safari Zone",
    "unlocks": ["Saffron Gym"],
    "requirements": {
      "defeatCountRoute": { "route": "Safari Zone", "count": 1000 }
    }
  },
  {
    "areaId": "Saffron Gym",
    "unlocks": ["Sea Routes"],
    "requirements": {
      "earnBadge": { "name": "Marsh Badge", "leader": "Sabrina", "badgeCount": 6 }
    }
  },
  {
    "areaId": "Sea Routes",
    "unlocks": ["Seafoam Islands"],
    "requirements": {
      "defeatCountRoute": { "route": "Sea Routes", "count": 500 }
    }
  },
  {
    "areaId": "Seafoam Islands",
    "unlocks": ["Pokémon Mansion", "Big Fishing Spot"],
    "requirements": {
      "defeatSpecific": { "name": "Articuno", "count": 3 }
    }
  },
  {
    "areaId": "Pokémon Mansion",
    "unlocks": ["Cinnabar Gym", "Fossil Revival Lab"],
    "requirements": {
      "catchSpeciesByRarity": [{ "species": "Magmar", "rarity": "Epic", "count": 1 }]
    }
  },
  {
    "areaId": "Cinnabar Gym",
    "unlocks": ["Power Plant", "Trade With Friends Hub"],
    "requirements": {
      "earnBadge": { "name": "Volcano Badge", "leader": "Blaine", "badgeCount": 7 }
    }
  },
  {
    "areaId": "Power Plant",
    "unlocks": ["Viridian Gym"],
    "requirements": {
      "defeatSpecific": { "name": "Zapdos", "count": 3 }
    }
  },
  {
    "areaId": "Viridian Gym",
    "unlocks": ["Route 22"],
    "requirements": {
      "earnBadge": { "name": "Earth Badge", "leader": "Giovanni", "badgeCount": 8 }
    }
  },
  {
    "areaId": "Route 22",
    "unlocks": ["Route 23"],
    "requirements": {
      "defeatCountRoute": { "route": "Route 22", "count": 750 }
    }
  },
  {
    "areaId": "Route 23",
    "unlocks": ["Victory Road"],
    "requirements": {
      "catchSpeciesAnyOfByRarity": [{ "species": ["Nidoking", "Nidoqueen"], "rarity": "Epic", "count": 1 }]
    }
  },
  {
    "areaId": "Victory Road",
    "unlocks": ["Cerulean Cave"],
    "requirements": {
      "defeatSpecific": { "name": "Moltres", "count": 3 }
    }
  },
  {
    "areaId": "Cerulean Cave",
    "unlocks": ["Elite 4"],
    "requirements": {
      "defeatSpecific": { "name": "Mewtwo", "count": 5 }
    }
  },
  {
    "areaId": "Elite 4",
    "unlocks": ["Prestige / Region Reset"],
    "requirements": {
      "defeatEliteFourAndChampion": true
    }
  }
];

let content = fs.readFileSync('config/routes.js', 'utf8');
let newContent = content.replace(/export const unlocks = \[\s*\{[\s\S]*\}\s*\];/, 'export const unlocks = ' + JSON.stringify(unlocks, null, 2) + ';');
fs.writeFileSync('config/routes.js', newContent);
