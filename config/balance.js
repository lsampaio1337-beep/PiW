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
        { "tier": 1, "name": "Ball1", "increment": 50, "cost": 150, "displayName": "Ball Pocket Clip" },
        { "tier": 2, "name": "Ball2", "increment": 100, "cost": 450, "displayName": "Belt Carrier Harness" },
        { "tier": 3, "name": "Ball3", "increment": 250, "cost": 1200, "displayName": "Tactical Ball Cinch" },
        { "tier": 4, "name": "Ball4", "increment": 500, "cost": 3000, "displayName": "Silph Ball Loader" },
        { "tier": 5, "name": "Ball5", "increment": 1000, "cost": 7500, "displayName": "Master Ball Sling" },
        { "tier": 6, "name": "Ball6", "increment": 8000, "cost": 20000, "displayName": "Endless Ball Reservoir" }
      ],
      "potionSatchel": [
        { "tier": 1, "name": "Potion1", "increment": 20, "cost": 75, "displayName": "Small Pouch Patch" },
        { "tier": 2, "name": "Potion2", "increment": 30, "cost": 200, "displayName": "Standard Pouch Patch" },
        { "tier": 3, "name": "Potion3", "increment": 50, "cost": 500, "displayName": "Heavy Pouch Patch" },
        { "tier": 4, "name": "Potion4", "increment": 100, "cost": 1200, "displayName": "Expanded Satchel Kit" },
        { "tier": 5, "name": "Potion5", "increment": 280, "cost": 3000, "displayName": "Alchemist Belt Rig" }
      ],
      "pokemonBox": [
        { "tier": 1, "name": "Storage1", "increment": 10, "cost": 100, "displayName": "Small Box Upgrade" },
        { "tier": 2, "name": "Storage2", "increment": 20, "cost": 300, "displayName": "Standard Box Upgrade" },
        { "tier": 3, "name": "Storage3", "increment": 50, "cost": 900, "displayName": "Large Box Upgrade" },
        { "tier": 4, "name": "Storage4", "increment": 100, "cost": 2500, "displayName": "Huge Box Upgrade" },
        { "tier": 5, "name": "Storage5", "increment": 300, "cost": 6000, "displayName": "Ultimate Box Upgrade" }
      ],
      "glass": [
        { "tier": 1, "name": "Glass1", "increment": 0, "cost": 1, "displayName": "Health Monocle" },
        { "tier": 2, "name": "Glass2", "increment": 0, "cost": 1, "displayName": "Basic Glasses" },
        { "tier": 3, "name": "Glass3", "increment": 0, "cost": 1, "displayName": "Great Glasses" },
        { "tier": 4, "name": "Glass4", "increment": 0, "cost": 1, "displayName": "Ultra Glasses" },
        { "tier": 5, "name": "Glass5", "increment": 0, "cost": 1, "displayName": "Master Glasses" }
      ],
      "smartwatch": [
        { "tier": 1, "name": "Smartwatch1", "increment": 0, "cost": 1, "displayName": "Ball Watch" },
        { "tier": 2, "name": "Smartwatch2", "increment": 0, "cost": 1, "displayName": "Potion Watch" },
        { "tier": 3, "name": "Smartwatch3", "increment": 0, "cost": 1, "displayName": "Smart Ball Watch" }
      ],
      "speed": [
        { "tier": 1, "name": "Speed1", "increment": 0, "cost": 1, "displayName": "Voltorb Sneakers" },
        { "tier": 2, "name": "Speed2", "increment": 0, "cost": 1, "displayName": "Shelder Skate" },
        { "tier": 3, "name": "Speed3", "increment": 0, "cost": 1, "displayName": "Primeape Scooter" },
        { "tier": 4, "name": "Speed4", "increment": 0, "cost": 1, "displayName": "Doduo Rollers" },
        { "tier": 5, "name": "Speed5", "increment": 0, "cost": 1, "displayName": "Rapidash Bike" }
      ],
      "loot": [
        { "tier": 1, "name": "Loot1", "increment": 0, "cost": 1, "displayName": "Potion Loot" },
        { "tier": 2, "name": "Loot2", "increment": 0, "cost": 1, "displayName": "Ball Loot" },
        { "tier": 3, "name": "Loot3", "increment": 0, "cost": 1, "displayName": "Evolution Loot" },
        { "tier": 4, "name": "Loot4", "increment": 0, "cost": 1, "displayName": "Vitamin Loot" }
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
