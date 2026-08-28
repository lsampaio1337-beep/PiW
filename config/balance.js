const balance = {
    "baseAttackDelay": 2.0,
    "baseSearchTime": 3.0,
    "qualityTiers": [
      {"name": "Weak", "min": 0.80, "max": 0.99, "rollMax": 1474},
      {"name": "Regular", "min": 1.00, "max": 1.19, "rollMax": 6586},
      {"name": "Uncommon", "min": 1.20, "max": 1.39, "rollMax": 9593},
      {"name": "Rare", "min": 1.40, "max": 1.59, "rollMax": 11097},
      {"name": "Epic", "min": 1.60, "max": 1.80, "rollMax": 11999},
      {"name": "Shiny", "min": 2.00, "max": 2.00, "rollMax": 12000}
    ],
    "items": {
      "pokeballs": [
        {"name": "Pokeball", "price": 5, "multiplier": 1.0},
        {"name": "Greatball", "price": 50, "multiplier": 1.5},
        {"name": "Ultraball", "price": 600, "multiplier": 2.0},
        {"name": "Masterball", "price": 25000, "multiplier": 999.0}
      ],
      "potions": [
        {"name": "Tiny Potion", "price": 10, "heal": 25},
        {"name": "Small Potion", "price": 25, "heal": 50},
        {"name": "Regular Potion", "price": 75, "heal": 100},
        {"name": "Big", "price": 300, "heal": 250},
        {"name": "Hyper Potion", "price": 1500, "heal": 1000},
        {"name": "Ultimate Potion", "price": 9000, "heal": 5000},
        {"name": "Max Potion", "price": 50000, "heal": 999999}
      ],
      "stones": {
         "price": 500,
         "sell": 200
      }
    }
  };
export default balance;
