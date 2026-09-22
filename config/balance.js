const balance = {
    "baseAttackDelay": 2.0,
    "baseSearchTime": 3.0,
    "safariZonePrice": 5000,
    "casinoPrices": {
        "standard": 75,
        "doubleShiny": 200,
    },
    "qualityTiers": [
      {"name": "Weak", "min": 0.80, "max": 0.99, "rollMax": 1474},
      {"name": "Regular", "min": 1.00, "max": 1.19, "rollMax": 6586},
      {"name": "Uncommon", "min": 1.20, "max": 1.39, "rollMax": 9593},
      {"name": "Rare", "min": 1.40, "max": 1.59, "rollMax": 11097},
      {"name": "Epic", "min": 1.60, "max": 1.80, "rollMax": 11999},
      {"name": "Shiny", "min": 2.00, "max": 2.00, "rollMax": 12000}
    ],

    "expansions": {
      "ballPocket": [
{ "tier": 1, "name": "Ball1", "increment": 50, "cost": 150 },
        { "tier": 2, "name": "Ball2", "increment": 100, "cost": 450 },
        { "tier": 3, "name": "Ball3", "increment": 250, "cost": 1200 },
        { "tier": 4, "name": "Ball4", "increment": 500, "cost": 3000 },
        { "tier": 5, "name": "Ball5", "increment": 1000, "cost": 7500 },
        { "tier": 6, "name": "Ball6", "increment": 8000, "cost": 20000 }
      ],
      "potionSatchel": [
        { "tier": 1, "name": "Potion1", "increment": 20, "cost": 75 },
        { "tier": 2, "name": "Potion2", "increment": 30, "cost": 200 },
        { "tier": 3, "name": "Potion3", "increment": 50, "cost": 500 },
        { "tier": 4, "name": "Potion4", "increment": 100, "cost": 1200 },
        { "tier": 5, "name": "Potion5", "increment": 280, "cost": 3000 }
      ],
      "pokemonBox": [
        { "tier": 1, "name": "Storage1", "increment": 10, "cost": 100 },
        { "tier": 2, "name": "Storage2", "increment": 20, "cost": 300 },
        { "tier": 3, "name": "Storage3", "increment": 50, "cost": 900 },
        { "tier": 4, "name": "Storage4", "increment": 100, "cost": 2500 },
        { "tier": 5, "name": "Storage5", "increment": 300, "cost": 6000 }
      ],
      "glass": [
        { "tier": 1, "name": "Glass1", "increment": 0, "cost": 1 },
        { "tier": 2, "name": "Glass2", "increment": 0, "cost": 1 },
        { "tier": 3, "name": "Glass3", "increment": 0, "cost": 1 },
        { "tier": 4, "name": "Glass4", "increment": 0, "cost": 1 },
        { "tier": 5, "name": "Glass5", "increment": 0, "cost": 1 },
        { "tier": 6, "name": "Glass6", "increment": 0, "cost": 1 },
        { "tier": 7, "name": "Glass7", "increment": 0, "cost": 1 }
      ],
      "smartwatch": [
        { "tier": 1, "name": "Smartwatch1", "increment": 0, "cost": 1 },
        { "tier": 2, "name": "Smartwatch2", "increment": 0, "cost": 1 },
        { "tier": 3, "name": "Smartwatch3", "increment": 0, "cost": 1 },
        { "tier": 4, "name": "Smartwatch4", "increment": 0, "cost": 1 },
        { "tier": 5, "name": "Smartwatch5", "increment": 0, "cost": 1 },
        { "tier": 6, "name": "Smartwatch6", "increment": 0, "cost": 1 }
      ],
      "speed": [
        { "tier": 1, "name": "Speed1", "increment": 0, "cost": 1 },
        { "tier": 2, "name": "Speed2", "increment": 0, "cost": 1 },
        { "tier": 3, "name": "Speed3", "increment": 0, "cost": 1 },
        { "tier": 4, "name": "Speed4", "increment": 0, "cost": 1 },
        { "tier": 5, "name": "Speed5", "increment": 0, "cost": 1 }
      ],
      "loot": [
        { "tier": 1, "name": "Loot1", "increment": 0, "cost": 1 },
        { "tier": 2, "name": "Loot2", "increment": 0, "cost": 1 },
        { "tier": 3, "name": "Loot3", "increment": 0, "cost": 1 }
      ]
    },
    "items": {
      "pokeballs": [
        {"name": "Pokeball", "price": 2, "multiplier": 1.0},
        {"name": "Greatball", "price": 18, "multiplier": 1.5},
        {"name": "Ultraball", "price": 75, "multiplier": 2.0},
        {"name": "Masterball", "price": 1000000, "multiplier": 999.0}
      ],
      "potions": [
        {"name": "Tiny Potion", "price": 3, "heal": 25},
        {"name": "Small Potion", "price": 12, "heal": 50},
        {"name": "Regular Potion", "price": 35, "heal": 100},
        {"name": "Big", "price": 90, "heal": 250},
        {"name": "Huge Potion", "price": 220, "heal": 1000},
        {"name": "Ultra Potion", "price": 9000, "heal": 5000},
        {"name": "Max Potion", "price": 300000, "heal": 999999}
      ],
      "stones": {
         "price": 200,
         "sell": 200
      }
    }
  };
export default balance;
