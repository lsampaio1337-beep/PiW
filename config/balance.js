const balance = {
    "baseAttackDelay": 2.0,
    "baseSearchTime": 3.0,
    "safariZonePrice": 5000,
    "casinoPrices": {
        "standard": 5000,
        "doubleShiny": 10000
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
        { "tier": 1, "name": "Ball Carrier", "increment": 50, "cost": 150 },
        { "tier": 2, "name": "Ball Sling", "increment": 100, "cost": 450 },
        { "tier": 3, "name": "Tactical Ball Cinch", "increment": 250, "cost": 1200 },
        { "tier": 4, "name": "Silph Ball Loader", "increment": 500, "cost": 3000 },
        { "tier": 5, "name": "Upgraded Silph Ball Loader", "increment": 1000, "cost": 7500 },
        { "tier": 6, "name": "Endless Ball Reservoir", "increment": 8999, "cost": 20000 }
      ],
      "potionSatchel": [
        { "tier": 1, "name": "Small Pouch Patch", "increment": 20, "cost": 75 },
        { "tier": 2, "name": "Standard Pouch Patch", "increment": 30, "cost": 200 },
        { "tier": 3, "name": "Heavy Pouch Patch", "increment": 50, "cost": 500 },
        { "tier": 4, "name": "Expanded Satchel Kit", "increment": 100, "cost": 1200 },
        { "tier": 5, "name": "Alchemist Belt Rig", "increment": 280, "cost": 3000 }
      ],
      "pokemonBox": [
        { "tier": 1, "name": "Small Box Upgrade", "increment": 10, "cost": 100 },
        { "tier": 2, "name": "Standard Box Upgrade", "increment": 20, "cost": 300 },
        { "tier": 3, "name": "Large Box Upgrade", "increment": 50, "cost": 900 },
        { "tier": 4, "name": "Huge Box Upgrade", "increment": 100, "cost": 2500 },
        { "tier": 5, "name": "Ultimate Box Upgrade", "increment": 300, "cost": 6000 }
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
        {"name": "Hyper Potion", "price": 220, "heal": 1000},
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
