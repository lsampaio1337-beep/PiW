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
        { "tier": 1, "name": "Ball1", "displayName": "Pocket Clip", "increment": 50, "cost": 150 },
        { "tier": 2, "name": "Ball2", "displayName": "Belt Carrier", "increment": 100, "cost": 450 },
        { "tier": 3, "name": "Ball3", "displayName": "Tactical Cinch", "increment": 250, "cost": 1200 },
        { "tier": 4, "name": "Ball4", "displayName": "Silph Loader", "increment": 500, "cost": 3000 },
        { "tier": 5, "name": "Ball5", "displayName": "Master Sling", "increment": 1000, "cost": 7500 },
        { "tier": 6, "name": "Ball6", "displayName": "Endless Reservoir", "increment": 8000, "cost": 20000 }
      ],
      "potionSatchel": [
        { "tier": 1, "name": "Potion1", "displayName": "Small Pouch Patch", "increment": 20, "cost": 75 },
        { "tier": 2, "name": "Potion2", "displayName": "Standard Pouch Patch", "increment": 30, "cost": 200 },
        { "tier": 3, "name": "Potion3", "displayName": "Heavy Pouch Patch", "increment": 50, "cost": 500 },
        { "tier": 4, "name": "Potion4", "displayName": "Expanded Satchel Kit", "increment": 100, "cost": 1200 },
        { "tier": 5, "name": "Potion5", "displayName": "Alchemist Belt Rig", "increment": 280, "cost": 3000 }
      ],
      "pokemonBox": [
        { "tier": 1, "name": "Storage1", "displayName": "Small Box Upgrade", "increment": 10, "cost": 100 },
        { "tier": 2, "name": "Storage2", "displayName": "Standard Box Upgrade", "increment": 20, "cost": 300 },
        { "tier": 3, "name": "Storage3", "displayName": "Large Box Upgrade", "increment": 50, "cost": 900 },
        { "tier": 4, "name": "Storage4", "displayName": "Huge Box Upgrade", "increment": 100, "cost": 2500 },
        { "tier": 5, "name": "Storage5", "displayName": "Ultimate Box Upgrade", "increment": 300, "cost": 6000 }
      ],
      "glass": [
        { "tier": 1, "name": "Glass1", "displayName": "Health Monocle", "increment": 0, "cost": 1, "description": "Show Healthbar in Main View" },
        { "tier": 2, "name": "Glass2", "displayName": "Basic Glasses", "increment": 0, "cost": 1, "description": "Show Damage in Main View" },
        { "tier": 3, "name": "Glass3", "displayName": "Great Glasses", "increment": 0, "cost": 1, "description": "Show Level in Main View" },
        { "tier": 4, "name": "Glass4", "displayName": "Ultra Glasses", "increment": 0, "cost": 1, "description": "Show Quality in Main View" },
        { "tier": 5, "name": "Glass5", "displayName": "Master Glasses", "increment": 0, "cost": 1, "description": "Show IV in Main View" }
      ],
      "smartwatch": [
        { "tier": 1, "name": "Smartwatch1", "displayName": "Ball Watch", "increment": 0, "cost": 1, "description": "Select Ball in Main View" },
        { "tier": 2, "name": "Smartwatch2", "displayName": "Potion Watch", "increment": 0, "cost": 1, "description": "Select Potion in Main View" },
        { "tier": 3, "name": "Smartwatch3", "displayName": "Smart Ball Watch", "increment": 0, "cost": 1, "description": "Select Ball Smart Mode" }
      ],
      "speed": [
        { "tier": 1, "name": "Speed1", "displayName": "Voltorb Sneakers", "increment": 0, "cost": 1, "description": "Decease encounter time in 10%" },
        { "tier": 2, "name": "Speed2", "displayName": "Shelder Skate", "increment": 0, "cost": 1, "description": "Decease encounter time in 20%" },
        { "tier": 3, "name": "Speed3", "displayName": "Primeape Scooter", "increment": 0, "cost": 1, "description": "Decease encounter time in 30%" },
        { "tier": 4, "name": "Speed4", "displayName": "Doduo Rollers", "increment": 0, "cost": 1, "description": "Decease encounter time in 40%" },
        { "tier": 5, "name": "Speed5", "displayName": "Rapidash Bike", "increment": 0, "cost": 1, "description": "Decease encounter time in 50%" }
      ],
      "loot": [
        { "tier": 1, "name": "Loot1", "displayName": "Potion Loot", "increment": 0, "cost": 1, "description": "Can loot Potion" },
        { "tier": 2, "name": "Loot2", "displayName": "Ball Loot", "increment": 0, "cost": 1, "description": "Can loot Balls" },
        { "tier": 3, "name": "Loot3", "displayName": "Evolution Loot", "increment": 0, "cost": 1, "description": "Can loot Stones" },
        { "tier": 4, "name": "Loot4", "displayName": "Vitamin Loot", "increment": 0, "cost": 1, "description": "Can loot Vitamins" }
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
