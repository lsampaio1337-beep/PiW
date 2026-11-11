import { kalosRoutes, kalosUnlocks } from './kalosRoutes.js';
const routes = [
  {
    "name": "Spot",
    "spawns": []
  },
  {
    "name": "Route 1 (Kanto)",
    "spawns": [
      {
        "pokemonId": 16,
        "minLevel": 1,
        "maxLevel": 4,
        "chance": 0.5
      },
      {
        "pokemonId": 19,
        "minLevel": 1,
        "maxLevel": 4,
        "chance": 0.5
      }
    ]
  },
  {
    "name": "Route 2 (Kanto)",
    "spawns": [
      {
        "pokemonId": 16,
        "minLevel": 3,
        "maxLevel": 5,
        "chance": 0.35
      },
      {
        "pokemonId": 19,
        "minLevel": 3,
        "maxLevel": 5,
        "chance": 0.35
      },
      {
        "pokemonId": 29,
        "minLevel": 4,
        "maxLevel": 6,
        "chance": 0.15
      },
      {
        "pokemonId": 32,
        "minLevel": 4,
        "maxLevel": 6,
        "chance": 0.15
      }
    ]
  },
  {
    "name": "Viridian Forest (Kanto)",
    "spawns": [
      {
        "pokemonId": 10,
        "minLevel": 3,
        "maxLevel": 6,
        "chance": 0.36
      },
      {
        "pokemonId": 13,
        "minLevel": 3,
        "maxLevel": 6,
        "chance": 0.36
      },
      {
        "pokemonId": 11,
        "minLevel": 4,
        "maxLevel": 6,
        "chance": 0.1
      },
      {
        "pokemonId": 14,
        "minLevel": 4,
        "maxLevel": 6,
        "chance": 0.1
      },
      {
        "pokemonId": 25,
        "minLevel": 3,
        "maxLevel": 5,
        "chance": 0.08
      }
    ]
  },
  {
    "name": "Route 3 (Kanto)",
    "spawns": [
      {
        "pokemonId": 16,
        "minLevel": 6,
        "maxLevel": 9,
        "chance": 0.25
      },
      {
        "pokemonId": 21,
        "minLevel": 6,
        "maxLevel": 9,
        "chance": 0.25
      },
      {
        "pokemonId": 23,
        "minLevel": 6,
        "maxLevel": 9,
        "chance": 0.15
      },
      {
        "pokemonId": 27,
        "minLevel": 6,
        "maxLevel": 9,
        "chance": 0.15
      },
      {
        "pokemonId": 39,
        "minLevel": 5,
        "maxLevel": 7,
        "chance": 0.1
      },
      { "pokemonId": 29, "minLevel": 6, "maxLevel": 8, "chance": 0.05 },
      { "pokemonId": 32, "minLevel": 6, "maxLevel": 8, "chance": 0.05 }
    ]
  },
  {
    "name": "Mount Moon (Kanto)",
    "spawns": [
      {
        "pokemonId": 41,
        "minLevel": 8,
        "maxLevel": 13,
        "chance": 0.5
      },
      {
        "pokemonId": 74,
        "minLevel": 8,
        "maxLevel": 12,
        "chance": 0.25
      },
      {
        "pokemonId": 46,
        "minLevel": 8,
        "maxLevel": 12,
        "chance": 0.15
      },
      { "pokemonId": 35, "minLevel": 9, "maxLevel": 13, "chance": 0.1 }
    ]
  },
  {
    "name": "Route 4 (Kanto)",
    "spawns": [
      {
        "pokemonId": 19,
        "minLevel": 11,
        "maxLevel": 15,
        "chance": 0.3
      },
      {
        "pokemonId": 21,
        "minLevel": 11,
        "maxLevel": 15,
        "chance": 0.3
      },
      {
        "pokemonId": 56,
        "minLevel": 11,
        "maxLevel": 15,
        "chance": 0.15
      },
      {
        "pokemonId": 23,
        "minLevel": 10,
        "maxLevel": 14,
        "chance": 0.15
      },
      {
        "pokemonId": 27,
        "minLevel": 10,
        "maxLevel": 14,
        "chance": 0.1
      }
    ]
  },
  {
    "name": "Route 24",
    "spawns": [
      {
        "pokemonId": 69,
        "minLevel": 14,
        "maxLevel": 18,
        "chance": 0.25
      },
      {
        "pokemonId": 43,
        "minLevel": 14,
        "maxLevel": 18,
        "chance": 0.25
      },
      {
        "pokemonId": 63,
        "minLevel": 12,
        "maxLevel": 16,
        "chance": 0.2
      },
      {
        "pokemonId": 16,
        "minLevel": 13,
        "maxLevel": 17,
        "chance": 0.15
      },
      {
        "pokemonId": 48,
        "minLevel": 14,
        "maxLevel": 17,
        "chance": 0.15
      }
    ]
  },
  {
    "name": "Route 25",
    "spawns": [
      {
        "pokemonId": 69,
        "minLevel": 15,
        "maxLevel": 19,
        "chance": 0.25
      },
      {
        "pokemonId": 43,
        "minLevel": 15,
        "maxLevel": 19,
        "chance": 0.25
      },
      {
        "pokemonId": 63,
        "minLevel": 13,
        "maxLevel": 17,
        "chance": 0.2
      },
      {
        "pokemonId": 16,
        "minLevel": 14,
        "maxLevel": 18,
        "chance": 0.15
      },
      {
        "pokemonId": 48,
        "minLevel": 15,
        "maxLevel": 18,
        "chance": 0.15
      }
    ]
  },
  {
    "name": "Route 5 (Kanto)",
    "spawns": [
      {
        "pokemonId": 16,
        "minLevel": 18,
        "maxLevel": 22,
        "chance": 0.4
      },
      {
        "pokemonId": 52,
        "minLevel": 17,
        "maxLevel": 21,
        "chance": 0.35
      },
      {
        "pokemonId": 69,
        "minLevel": 18,
        "maxLevel": 22,
        "chance": 0.15
      },
      {
        "pokemonId": 43,
        "minLevel": 18,
        "maxLevel": 22,
        "chance": 0.1
      }
    ]
  },
  {
    "name": "Route 6 (Kanto)",
    "spawns": [
      {
        "pokemonId": 16,
        "minLevel": 19,
        "maxLevel": 24,
        "chance": 0.3
      },
      {
        "pokemonId": 52,
        "minLevel": 18,
        "maxLevel": 23,
        "chance": 0.3
      },
      {
        "pokemonId": 54,
        "minLevel": 18,
        "maxLevel": 23,
        "chance": 0.15
      },
      {
        "pokemonId": 118,
        "minLevel": 18,
        "maxLevel": 23,
        "chance": 0.15
      },
      {
        "pokemonId": 69,
        "minLevel": 19,
        "maxLevel": 24,
        "chance": 0.05
      },
      {
        "pokemonId": 43,
        "minLevel": 19,
        "maxLevel": 24,
        "chance": 0.05
      }
    ]
  },
  {
    "name": "Route 11 (Kanto)",
    "spawns": [
      {
        "pokemonId": 96,
        "minLevel": 22,
        "maxLevel": 27,
        "chance": 0.4
      },
      {
        "pokemonId": 21,
        "minLevel": 21,
        "maxLevel": 26,
        "chance": 0.25
      },
      {
        "pokemonId": 20,
        "minLevel": 23,
        "maxLevel": 28,
        "chance": 0.1
      },
      {
        "pokemonId": 122,
        "minLevel": 22,
        "maxLevel": 27,
        "chance": 0.05
      },
      {
        "pokemonId": 23,
        "minLevel": 21,
        "maxLevel": 25,
        "chance": 0.1
      },
      {
        "pokemonId": 27,
        "minLevel": 21,
        "maxLevel": 25,
        "chance": 0.1
      }
    ]
  },
  {
    "name": "Digglett Cave",
    "spawns": [
      {
        "pokemonId": 50,
        "minLevel": 23,
        "maxLevel": 29,
        "chance": 0.9
      },
      {
        "pokemonId": 51,
        "minLevel": 29,
        "maxLevel": 33,
        "chance": 0.1
      }
    ]
  },
  {
    "name": "Route 9 (Kanto)",
    "spawns": [
      {
        "pokemonId": 19,
        "minLevel": 25,
        "maxLevel": 30,
        "chance": 0.3
      },
      {
        "pokemonId": 21,
        "minLevel": 25,
        "maxLevel": 30,
        "chance": 0.3
      },
      {
        "pokemonId": 22,
        "minLevel": 26,
        "maxLevel": 31,
        "chance": 0.15
      },
      {
        "pokemonId": 23,
        "minLevel": 24,
        "maxLevel": 29,
        "chance": 0.15
      },
      {
        "pokemonId": 27,
        "minLevel": 24,
        "maxLevel": 29,
        "chance": 0.15
      }
    ]
  },
  {
    "name": "Route 10 (Kanto)",
    "spawns": [
      {
        "pokemonId": 21,
        "minLevel": 27,
        "maxLevel": 32,
        "chance": 0.35
      },
      {
        "pokemonId": 100,
        "minLevel": 26,
        "maxLevel": 31,
        "chance": 0.3
      },
      {
        "pokemonId": 81,
        "minLevel": 26,
        "maxLevel": 31,
        "chance": 0.25
      },
      {
        "pokemonId": 23,
        "minLevel": 26,
        "maxLevel": 30,
        "chance": 0.05
      },
      {
        "pokemonId": 27,
        "minLevel": 26,
        "maxLevel": 30,
        "chance": 0.05
      }
    ]
  },
  {
    "name": "Rock Tunnel (Kanto)",
    "spawns": [
      {
        "pokemonId": 41,
        "minLevel": 28,
        "maxLevel": 34,
        "chance": 0.4
      },
      {
        "pokemonId": 74,
        "minLevel": 28,
        "maxLevel": 33,
        "chance": 0.25
      },
      {
        "pokemonId": 66,
        "minLevel": 29,
        "maxLevel": 34,
        "chance": 0.2
      },
      {
        "pokemonId": 95,
        "minLevel": 30,
        "maxLevel": 35,
        "chance": 0.15
      }
    ]
  },
  {
    "name": "Route 8 (Kanto)",
    "spawns": [
      {
        "pokemonId": 58,
        "minLevel": 32,
        "maxLevel": 37,
        "chance": 0.25
      },
      {
        "pokemonId": 37,
        "minLevel": 32,
        "maxLevel": 37,
        "chance": 0.25
      },
      {
        "pokemonId": 17,
        "minLevel": 32,
        "maxLevel": 37,
        "chance": 0.2
      },
      {
        "pokemonId": 52,
        "minLevel": 31,
        "maxLevel": 36,
        "chance": 0.2
      },
      {
        "pokemonId": 64,
        "minLevel": 33,
        "maxLevel": 38,
        "chance": 0.1
      }
    ]
  },
  {
    "name": "Route 7 (Kanto)",
    "spawns": [
      {
        "pokemonId": 17,
        "minLevel": 34,
        "maxLevel": 39,
        "chance": 0.3
      },
      {
        "pokemonId": 52,
        "minLevel": 33,
        "maxLevel": 38,
        "chance": 0.25
      },
      {
        "pokemonId": 58,
        "minLevel": 34,
        "maxLevel": 39,
        "chance": 0.175
      },
      {
        "pokemonId": 37,
        "minLevel": 34,
        "maxLevel": 39,
        "chance": 0.175
      },
      {
        "pokemonId": 64,
        "minLevel": 35,
        "maxLevel": 40,
        "chance": 0.1
      }
    ]
  },
  {
    "name": "Celadon Casino Starter Troupe",
    "spawns": [
      {
        "pokemonId": 1,
        "minLevel": 35,
        "maxLevel": 42,
        "chance": 0.333
      },
      {
        "pokemonId": 4,
        "minLevel": 35,
        "maxLevel": 42,
        "chance": 0.333
      },
      {
        "pokemonId": 7,
        "minLevel": 35,
        "maxLevel": 42,
        "chance": 0.334
      }
    ]
  },
  {
    "name": "Celadon Casino Mid Troupe",
    "spawns": [
      {
        "pokemonId": 2,
        "minLevel": 41,
        "maxLevel": 48,
        "chance": 0.333
      },
      {
        "pokemonId": 5,
        "minLevel": 41,
        "maxLevel": 48,
        "chance": 0.333
      },
      {
        "pokemonId": 8,
        "minLevel": 41,
        "maxLevel": 48,
        "chance": 0.334
      }
    ]
  },
  {
    "name": "Celadon Casino Late Troupe",
    "spawns": [
      {
        "pokemonId": 3,
        "minLevel": 59,
        "maxLevel": 66,
        "chance": 0.333
      },
      {
        "pokemonId": 6,
        "minLevel": 59,
        "maxLevel": 66,
        "chance": 0.333
      },
      {
        "pokemonId": 9,
        "minLevel": 59,
        "maxLevel": 66,
        "chance": 0.334
      }
    ]
  },
  {
    "name": "Celadon Casino Eeveelutions",
    "spawns": [
      {
        "pokemonId": 133,
        "minLevel": 47,
        "maxLevel": 54,
        "chance": 0.4
      },
      {
        "pokemonId": 134,
        "minLevel": 47,
        "maxLevel": 54,
        "chance": 0.2
      },
      {
        "pokemonId": 135,
        "minLevel": 47,
        "maxLevel": 54,
        "chance": 0.2
      },
      {
        "pokemonId": 136,
        "minLevel": 47,
        "maxLevel": 54,
        "chance": 0.2
      }
    ]
  },
  {
    "name": "Celadon Casino Special Spot",
    "spawns": [
      {
        "pokemonId": 131,
        "minLevel": 53,
        "maxLevel": 60,
        "chance": 0.3
      },
      {
        "pokemonId": 137,
        "minLevel": 53,
        "maxLevel": 60,
        "chance": 0.35
      },
      {
        "pokemonId": 108,
        "minLevel": 53,
        "maxLevel": 60,
        "chance": 0.35
      }
    ]
  },
  {
    "name": "Pokemon Tower",
    "spawns": [
      {
        "pokemonId": 92,
        "minLevel": 38,
        "maxLevel": 43,
        "chance": 0.7
      },
      {
        "pokemonId": 93,
        "minLevel": 40,
        "maxLevel": 45,
        "chance": 0.15
      },
      {
        "pokemonId": 104,
        "minLevel": 38,
        "maxLevel": 43,
        "chance": 0.15
      }
    ]
  },
  {
    "name": "Route 12 (Kanto)",
    "spawns": [
      {
        "pokemonId": 69,
        "minLevel": 44,
        "maxLevel": 48,
        "chance": 0.2
      },
      {
        "pokemonId": 43,
        "minLevel": 44,
        "maxLevel": 48,
        "chance": 0.2
      },
      {
        "pokemonId": 17,
        "minLevel": 48,
        "maxLevel": 52,
        "chance": 0.2
      },
      {
        "pokemonId": 48,
        "minLevel": 44,
        "maxLevel": 48,
        "chance": 0.15
      },
      {
        "pokemonId": 83,
        "minLevel": 48,
        "maxLevel": 52,
        "chance": 0.15
      },
      {
        "pokemonId": 143,
        "minLevel": 50,
        "maxLevel": 55,
        "chance": 0.1
      }
    ]
  },
  {
    "name": "Route 13 (Kanto)",
    "spawns": [
      {
        "pokemonId": 69,
        "minLevel": 48,
        "maxLevel": 52,
        "chance": 0.2
      },
      {
        "pokemonId": 43,
        "minLevel": 48,
        "maxLevel": 52,
        "chance": 0.2
      },
      {
        "pokemonId": 17,
        "minLevel": 50,
        "maxLevel": 55,
        "chance": 0.1
      },
      {
        "pokemonId": 12,
        "minLevel": 50,
        "maxLevel": 55,
        "chance": 0.1
      },
      {
        "pokemonId": 44,
        "minLevel": 50,
        "maxLevel": 55,
        "chance": 0.1
      },
      {
        "pokemonId": 70,
        "minLevel": 53,
        "maxLevel": 58,
        "chance": 0.1
      },
      {
        "pokemonId": 71,
        "minLevel": 50,
        "maxLevel": 55,
        "chance": 0.1
      },
      {
        "pokemonId": 45,
        "minLevel": 53,
        "maxLevel": 58,
        "chance": 0.1
      }
    ]
  },
  {
    "name": "Route 14 (Kanto)",
    "spawns": [
      {
        "pokemonId": 17,
        "minLevel": 50,
        "maxLevel": 55,
        "chance": 0.15
      },
      {
        "pokemonId": 15,
        "minLevel": 50,
        "maxLevel": 55,
        "chance": 0.1
      },
      {
        "pokemonId": 18,
        "minLevel": 55,
        "maxLevel": 60,
        "chance": 0.05
      },
      {
        "pokemonId": 44,
        "minLevel": 50,
        "maxLevel": 55,
        "chance": 0.15
      },
      {
        "pokemonId": 70,
        "minLevel": 50,
        "maxLevel": 55,
        "chance": 0.15
      },
      {
        "pokemonId": 49,
        "minLevel": 50,
        "maxLevel": 55,
        "chance": 0.2
      },
      {
        "pokemonId": 132,
        "minLevel": 55,
        "maxLevel": 60,
        "chance": 0.2
      }
    ]
  },
  {
    "name": "Route 15 (Kanto)",
    "spawns": [
      {
        "pokemonId": 17,
        "minLevel": 50,
        "maxLevel": 55,
        "chance": 0.25
      },
      {
        "pokemonId": 18,
        "minLevel": 55,
        "maxLevel": 60,
        "chance": 0.05
      },
      {
        "pokemonId": 44,
        "minLevel": 50,
        "maxLevel": 55,
        "chance": 0.15
      },
      {
        "pokemonId": 70,
        "minLevel": 50,
        "maxLevel": 55,
        "chance": 0.15
      },
      {
        "pokemonId": 49,
        "minLevel": 50,
        "maxLevel": 55,
        "chance": 0.2
      },
      {
        "pokemonId": 132,
        "minLevel": 55,
        "maxLevel": 60,
        "chance": 0.2
      }
    ]
  },
  {
    "name": "Cycling Road (Kanto)",
    "spawns": [
      {
        "pokemonId": 20,
        "minLevel": 56,
        "maxLevel": 62,
        "chance": 0.25
      },
      {
        "pokemonId": 22,
        "minLevel": 56,
        "maxLevel": 62,
        "chance": 0.25
      },
      {
        "pokemonId": 84,
        "minLevel": 56,
        "maxLevel": 62,
        "chance": 0.2
      },
      {
        "pokemonId": 85,
        "minLevel": 58,
        "maxLevel": 64,
        "chance": 0.15
      },
      {
        "pokemonId": 143,
        "minLevel": 60,
        "maxLevel": 66,
        "chance": 0.15
      }
    ]
  },
  {
    "name": "Kanto Safari Zone (Kanto)",
    "spawns": [
      {
        "pokemonId": 33,
        "minLevel": 60,
        "maxLevel": 66,
        "chance": 0.1
      },
      {
        "pokemonId": 30,
        "minLevel": 60,
        "maxLevel": 66,
        "chance": 0.1
      },
      {
        "pokemonId": 111,
        "minLevel": 63,
        "maxLevel": 70,
        "chance": 0.15
      },
      {
        "pokemonId": 102,
        "minLevel": 62,
        "maxLevel": 69,
        "chance": 0.15
      },
      {
        "pokemonId": 47,
        "minLevel": 62,
        "maxLevel": 69,
        "chance": 0.1
      },
      {
        "pokemonId": 123,
        "minLevel": 63,
        "maxLevel": 70,
        "chance": 0.1
      },
      {
        "pokemonId": 127,
        "minLevel": 62,
        "maxLevel": 69,
        "chance": 0.1
      },
      {
        "pokemonId": 113,
        "minLevel": 65,
        "maxLevel": 72,
        "chance": 0.1
      },
      {
        "pokemonId": 128,
        "minLevel": 65,
        "maxLevel": 72,
        "chance": 0.05
      },
      {
        "pokemonId": 115,
        "minLevel": 65,
        "maxLevel": 72,
        "chance": 0.05
      }
    ]
  },
  {
    "name": "Sea Routes (Kanto)",
    "spawns": [
      {
        "pokemonId": 72,
        "minLevel": 68,
        "maxLevel": 75,
        "chance": 0.3
      },
      {
        "pokemonId": 73,
        "minLevel": 71,
        "maxLevel": 78,
        "chance": 0.1
      },
      {
        "pokemonId": 98,
        "minLevel": 68,
        "maxLevel": 75,
        "chance": 0.15
      },
      {
        "pokemonId": 99,
        "minLevel": 71,
        "maxLevel": 78,
        "chance": 0.1
      },
      {
        "pokemonId": 79,
        "minLevel": 68,
        "maxLevel": 75,
        "chance": 0.05
      },
      {
        "pokemonId": 114,
        "minLevel": 71,
        "maxLevel": 78,
        "chance": 0.05
      },
      {
        "pokemonId": 90,
        "minLevel": 68,
        "maxLevel": 75,
        "chance": 0.1
      },
      {
        "pokemonId": 91,
        "minLevel": 71,
        "maxLevel": 78,
        "chance": 0.025
      },
      {
        "pokemonId": 120,
        "minLevel": 68,
        "maxLevel": 75,
        "chance": 0.1
      },
      {
        "pokemonId": 121,
        "minLevel": 71,
        "maxLevel": 78,
        "chance": 0.025
      }
    ]
  },
  {
    "name": "Seafoam Islands",
    "spawns": [
      {
        "pokemonId": 86,
        "minLevel": 75,
        "maxLevel": 83,
        "chance": 0.2
      },
      {
        "pokemonId": 116,
        "minLevel": 75,
        "maxLevel": 83,
        "chance": 0.2
      },
      {
        "pokemonId": 55,
        "minLevel": 77,
        "maxLevel": 85,
        "chance": 0.15
      },
      {
        "pokemonId": 80,
        "minLevel": 77,
        "maxLevel": 85,
        "chance": 0.15
      },
      {
        "pokemonId": 124,
        "minLevel": 79,
        "maxLevel": 87,
        "chance": 0.13
      },
      {
        "pokemonId": 144,
        "minLevel": 90,
        "maxLevel": 90,
        "chance": 0.02
      },
      {
        "pokemonId": 87,
        "minLevel": 77,
        "maxLevel": 85,
        "chance": 0.15
      }
    ]
  },
  {
    "name": "Pokemon Mansion (Kanto)",
    "spawns": [
      {
        "pokemonId": 109,
        "minLevel": 72,
        "maxLevel": 79,
        "chance": 0.2
      },
      {
        "pokemonId": 88,
        "minLevel": 72,
        "maxLevel": 79,
        "chance": 0.15
      },
      {
        "pokemonId": 77,
        "minLevel": 75,
        "maxLevel": 82,
        "chance": 0.2
      },
      {
        "pokemonId": 110,
        "minLevel": 75,
        "maxLevel": 82,
        "chance": 0.15
      },
      {
        "pokemonId": 126,
        "minLevel": 75,
        "maxLevel": 82,
        "chance": 0.2
      },
      {
        "pokemonId": 38,
        "minLevel": 77,
        "maxLevel": 84,
        "chance": 0.05
      },
      {
        "pokemonId": 59,
        "minLevel": 77,
        "maxLevel": 84,
        "chance": 0.05
      }
    ]
  },
  {
    "name": "Power Plant",
    "spawns": [
      {
        "pokemonId": 100,
        "minLevel": 69,
        "maxLevel": 74,
        "chance": 0.2
      },
      {
        "pokemonId": 81,
        "minLevel": 69,
        "maxLevel": 74,
        "chance": 0.2
      },
      {
        "pokemonId": 101,
        "minLevel": 73,
        "maxLevel": 78,
        "chance": 0.2
      },
      {
        "pokemonId": 82,
        "minLevel": 71,
        "maxLevel": 78,
        "chance": 0.15
      },
      {
        "pokemonId": 125,
        "minLevel": 73,
        "maxLevel": 80,
        "chance": 0.15
      },
      {
        "pokemonId": 26,
        "minLevel": 72,
        "maxLevel": 79,
        "chance": 0.08
      },
      {
        "pokemonId": 145,
        "minLevel": 85,
        "maxLevel": 85,
        "chance": 0.02
      }
    ]
  },
  {
    "name": "Route 22 (Kanto)",
    "spawns": [
      {
        "pokemonId": 113,
        "minLevel": 81,
        "maxLevel": 88,
        "chance": 0.15
      },
      {
        "pokemonId": 28,
        "minLevel": 79,
        "maxLevel": 86,
        "chance": 0.15
      },
      {
        "pokemonId": 33,
        "minLevel": 77,
        "maxLevel": 84,
        "chance": 0.20
      },
      {
        "pokemonId": 30,
        "minLevel": 77,
        "maxLevel": 84,
        "chance": 0.20
      },
      {
        "pokemonId": 80,
        "minLevel": 79,
        "maxLevel": 86,
        "chance": 0.15
      },
      {
        "pokemonId": 57,
        "minLevel": 79,
        "maxLevel": 86,
        "chance": 0.15
      }
    ]
  },
  {
    "name": "Route 23 (Kanto)",
    "spawns": [
      {
        "pokemonId": 22,
        "minLevel": 83,
        "maxLevel": 91,
        "chance": 0.25
      },
      {
        "pokemonId": 24,
        "minLevel": 83,
        "maxLevel": 91,
        "chance": 0.125
      },
      {
        "pokemonId": 28,
        "minLevel": 83,
        "maxLevel": 91,
        "chance": 0.125
      },
      {
        "pokemonId": 57,
        "minLevel": 83,
        "maxLevel": 91,
        "chance": 0.2
      },
      {
        "pokemonId": 34,
        "minLevel": 87,
        "maxLevel": 95,
        "chance": 0.15
      },
      {
        "pokemonId": 31,
        "minLevel": 87,
        "maxLevel": 95,
        "chance": 0.15
      }
    ]
  },
  {
    "name": "Victory Road (Kanto)",
    "spawns": [
      {
        "pokemonId": 67,
        "minLevel": 82,
        "maxLevel": 90,
        "chance": 0.25
      },
      {
        "pokemonId": 75,
        "minLevel": 85,
        "maxLevel": 93,
        "chance": 0.25
      },
      {
        "pokemonId": 42,
        "minLevel": 80,
        "maxLevel": 87,
        "chance": 0.23
      },
      {
        "pokemonId": 95,
        "minLevel": 85,
        "maxLevel": 93,
        "chance": 0.15
      },
      {
        "pokemonId": 105,
        "minLevel": 85,
        "maxLevel": 93,
        "chance": 0.1
      },
      {
        "pokemonId": 146,
        "minLevel": 95,
        "maxLevel": 95,
        "chance": 0.02
      },
      { "pokemonId": 26, "minLevel": 95, "maxLevel": 99, "chance": 0.1 },
      { "pokemonId": 31, "minLevel": 96, "maxLevel": 100, "chance": 0.1 },
      { "pokemonId": 34, "minLevel": 96, "maxLevel": 100, "chance": 0.1 },
      { "pokemonId": 59, "minLevel": 96, "maxLevel": 100, "chance": 0.1 },
      { "pokemonId": 112, "minLevel": 96, "maxLevel": 100, "chance": 0.1 },
      { "pokemonId": 57, "minLevel": 95, "maxLevel": 99, "chance": 0.1 },
      { "pokemonId": 210, "minLevel": 94, "maxLevel": 98, "chance": 0.1 },
      { "pokemonId": 178, "minLevel": 94, "maxLevel": 98, "chance": 0.1 },
      { "pokemonId": 82, "minLevel": 95, "maxLevel": 99, "chance": 0.1 },
      { "pokemonId": 89, "minLevel": 94, "maxLevel": 98, "chance": 0.1 }
    ]
  },
  {
    "name": "Cerulean Cave",
    "spawns": [
      {
        "pokemonId": 42,
        "minLevel": 87,
        "maxLevel": 95,
        "chance": 0.2
      },
      {
        "pokemonId": 82,
        "minLevel": 87,
        "maxLevel": 95,
        "chance": 0.15
      },
      {
        "pokemonId": 112,
        "minLevel": 90,
        "maxLevel": 98,
        "chance": 0.15
      },
      {
        "pokemonId": 64,
        "minLevel": 90,
        "maxLevel": 98,
        "chance": 0.15
      },
      {
        "pokemonId": 97,
        "minLevel": 89,
        "maxLevel": 97,
        "chance": 0.15
      },
      {
        "pokemonId": 113,
        "minLevel": 90,
        "maxLevel": 98,
        "chance": 0.19
      },
      {
        "pokemonId": 150,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.01
      }
    ]
  },
  {
    "name": "Small Fishing Spot",
    "spawns": [
      {
        "pokemonId": 129,
        "minLevel": 41,
        "maxLevel": 48,
        "chance": 0.7
      },
      {
        "pokemonId": 98,
        "minLevel": 41,
        "maxLevel": 48,
        "chance": 0.15
      },
      {
        "pokemonId": 118,
        "minLevel": 41,
        "maxLevel": 48,
        "chance": 0.08
      },
      {
        "pokemonId": 60,
        "minLevel": 41,
        "maxLevel": 48,
        "chance": 0.07
      }
    ]
  },
  {
    "name": "Big Fishing Spot",
    "spawns": [
      {
        "pokemonId": 147,
        "minLevel": 53,
        "maxLevel": 60,
        "chance": 0.18
      },
      {
        "pokemonId": 148,
        "minLevel": 57,
        "maxLevel": 64,
        "chance": 0.05
      },
      {
        "pokemonId": 149,
        "minLevel": 60,
        "maxLevel": 67,
        "chance": 0.02
      },
      {
        "pokemonId": 130,
        "minLevel": 60,
        "maxLevel": 67,
        "chance": 0.25
      },
      {
        "pokemonId": 119,
        "minLevel": 53,
        "maxLevel": 60,
        "chance": 0.2
      },
      {
        "pokemonId": 61,
        "minLevel": 53,
        "maxLevel": 60,
        "chance": 0.15
      },
      {
        "pokemonId": 62,
        "minLevel": 57,
        "maxLevel": 64,
        "chance": 0.15
      }
    ]
  },
  {
    "name": "Fossil Revival Lab",
    "spawns": [
      { "pokemonId": 138, "minLevel": 78, "maxLevel": 86, "chance": 0.2 },
      { "pokemonId": 140, "minLevel": 78, "maxLevel": 86, "chance": 0.2 },
      { "pokemonId": 142, "minLevel": 82, "maxLevel": 90, "chance": 0.2 },
      { "pokemonId": 139, "minLevel": 80, "maxLevel": 88, "chance": 0.2 },
      { "pokemonId": 141, "minLevel": 80, "maxLevel": 88, "chance": 0.2 }
]
  },
  {
    "name": "Fighting Dojo",
    "spawns": [
      {
        "pokemonId": 106,
        "minLevel": 47,
        "maxLevel": 54,
        "chance": 0.4
      },
      {
        "pokemonId": 107,
        "minLevel": 47,
        "maxLevel": 54,
        "chance": 0.4
      },
      {
        "pokemonId": 57,
        "minLevel": 47,
        "maxLevel": 54,
        "chance": 0.1
      },
      {
        "pokemonId": 67,
        "minLevel": 47,
        "maxLevel": 54,
        "chance": 0.1
      }
    ]
  },
  {
    "name": "Trade With Friends Hub",
    "spawns": [
      {
        "pokemonId": 94,
        "minLevel": 64,
        "maxLevel": 71,
        "chance": 0.25
      },
      {
        "pokemonId": 65,
        "minLevel": 64,
        "maxLevel": 71,
        "chance": 0.25
      },
      {
        "pokemonId": 68,
        "minLevel": 64,
        "maxLevel": 71,
        "chance": 0.25
      },
      {
        "pokemonId": 76,
        "minLevel": 64,
        "maxLevel": 71,
        "chance": 0.25
      },
      { "pokemonId": 65, "minLevel": 93, "maxLevel": 97, "chance": 0.25 },
      { "pokemonId": 68, "minLevel": 93, "maxLevel": 97, "chance": 0.25 },
      { "pokemonId": 76, "minLevel": 93, "maxLevel": 97, "chance": 0.25 },
      { "pokemonId": 94, "minLevel": 93, "maxLevel": 97, "chance": 0.25 }
    ]
  },
  {
    "name": "Indigo Summit",
    "spawns": [
      {
        "pokemonId": 150,
        "minLevel": 120,
        "maxLevel": 120,
        "chance": 0.2
      },
      {
        "pokemonId": 144,
        "minLevel": 110,
        "maxLevel": 110,
        "chance": 0.2
      },
      {
        "pokemonId": 145,
        "minLevel": 110,
        "maxLevel": 110,
        "chance": 0.2
      },
      {
        "pokemonId": 146,
        "minLevel": 110,
        "maxLevel": 110,
        "chance": 0.2
      },
      {
        "pokemonId": 151,
        "minLevel": 120,
        "maxLevel": 120,
        "chance": 0.2
      }
    ]
  }
];

export const unlocks = [
  { "challengeName": "Challenge 01", "areaId": "Route 1 (Kanto)", "unlocks": ["Route 2 (Kanto)"], "requirements": { "defeatCountRoute": { "route": "Route 1 (Kanto)", "count": 25 } } },
  { "challengeName": "Challenge 02", "areaId": "Route 2 (Kanto)", "unlocks": ["Viridian Forest (Kanto)"], "requirements": { "catchSpecies": [{ "species": "Nidoran♀", "count": 1 }, { "species": "Nidoran♂", "count": 1 }] } },
  { "challengeName": "Challenge 03", "areaId": "Viridian Forest (Kanto)", "unlocks": ["Pewter Gym"], "requirements": { "catchByQualityAndType": { "type": "Bug", "quality": "Rare", "count": 1 } } },
  { "challengeName": "Challenge 04", "areaId": "Pewter Gym", "unlocks": ["Route 3 (Kanto)"], "requirements": { "earnBadge": { "name": "Boulder Badge", "leader": "Brock", "badgeCount": 1 } } },
  { "challengeName": "Challenge 05", "areaId": "Route 3 (Kanto)", "unlocks": ["Mount Moon (Kanto)"], "requirements": { "catchSpecies": [{ "species": "Ekans", "count": 1 }, { "species": "Sandshrew", "count": 1 }] } },
  { "challengeName": "Challenge 06", "areaId": "Mount Moon (Kanto)", "unlocks": ["Route 4 (Kanto)"], "gift": { "item": "Fairy Stone", "count": 1 }, "requirements": { "catchSpecies": [{ "species": "Clefairy", "count": 1 }], "catchSpeciesByQualityOrHigher": [{ "species": "Zubat", "quality": "Uncommon", "count": 1 }] } },
  { "challengeName": "Challenge 07", "areaId": "Route 4 (Kanto)", "unlocks": ["Cerulean Gym"], "requirements": { "catchSpecies": [{ "species": "Mankey", "count": 2 }] } },
  { "challengeName": "Challenge 08", "areaId": "Cerulean Gym", "unlocks": ["Route 24"], "requirements": { "earnBadge": { "name": "Cascade Badge", "leader": "Misty", "badgeCount": 2 } } },
  { "challengeName": "Challenge 09", "areaId": "Route 24", "unlocks": ["Route 25"], "requirements": { "catchSpecies": [{ "species": "Abra", "count": 2 }] } },
  { "challengeName": "Challenge 10", "areaId": "Route 25", "unlocks": ["Route 5 (Kanto)", "Daycare"], "gift": { "item": "Psychic Stone", "count": 1 }, "requirements": { "catchSpecies": [{ "species": "Abra", "count": 5 }] } },
  { "challengeName": "Challenge 11", "areaId": "Route 5 (Kanto)", "unlocks": ["Route 6 (Kanto)"], "requirements": { "defeatCountRoute": { "route": "Route 5 (Kanto)", "count": 100 } } },
  { "challengeName": "Challenge 12", "areaId": "Route 6 (Kanto)", "unlocks": ["Vermilion Gym"], "requirements": { "catchSpecies": [{ "species": "Psyduck", "count": 1 }, { "species": "Goldeen", "count": 1 }] } },
  { "challengeName": "Challenge 13", "areaId": "Vermilion Gym", "unlocks": ["Route 11 (Kanto)"], "requirements": { "earnBadge": { "name": "Thunder Badge", "leader": "Lt. Surge", "badgeCount": 3 } } },
  { "challengeName": "Challenge 14", "areaId": "Route 11 (Kanto)", "unlocks": ["Digglett Cave"], "requirements": { "catchSpecies": [{ "species": "Drowzee", "count": 5 }, { "species": "Raticate", "count": 1 }] } },
  { "challengeName": "Challenge 15", "areaId": "Digglett Cave", "unlocks": ["Route 9 (Kanto)"], "gift": { "item": "Ground Stone", "count": 1 }, "requirements": { "catchSpecies": [{ "species": "Dugtrio", "count": 2 }] } },
  { "challengeName": "Challenge 16", "areaId": "Route 9 (Kanto)", "unlocks": ["Route 10 (Kanto)"], "requirements": { "catchSpecies": [{ "species": "Fearow", "count": 2 }] } },
  { "challengeName": "Challenge 17", "areaId": "Route 10 (Kanto)", "unlocks": ["Rock Tunnel (Kanto)"], "requirements": { "defeatCountRoute": { "route": "Route 10 (Kanto)", "count": 100 } } },
  { "challengeName": "Challenge 18", "areaId": "Rock Tunnel (Kanto)", "unlocks": ["Route 8 (Kanto)"], "gift": { "item": "Rock Stone", "count": 1 }, "requirements": { "catchSpecies": [{ "species": "Onix", "count": 2 }, { "species": "Machop", "count": 2 }] } },
  { "challengeName": "Challenge 19", "areaId": "Route 8 (Kanto)", "unlocks": ["Celadon Gym"], "requirements": { "catchSpecies": [{ "species": "Kadabra", "count": 2 }], "catchByType": { "type": "Fire", "count": 10 } } },
  { "challengeName": "Challenge 20", "areaId": "Celadon Gym", "unlocks": ["Route 7 (Kanto)", "Celadon Casino", "Celadon Casino Starter Troupe"], "requirements": { "earnBadge": { "name": "Rainbow Badge", "leader": "Erika", "badgeCount": 4 } } },
  { "challengeName": "Challenge 21", "areaId": "Route 7 (Kanto)", "unlocks": ["Pokemon Tower"], "requirements": { "defeatCountRoute": { "route": "Route 7 (Kanto)", "count": 150 } } },
  { "challengeName": "Challenge 22", "areaId": "Pokemon Tower", "unlocks": ["Route 12 (Kanto)"], "gift": { "item": "Ghost Stone", "count": 2 }, "requirements": { "catchSpecies": [{ "species": "Haunter", "count": 2 }, { "species": "Cubone", "count": 1 }] } },
  { "challengeName": "Challenge 23", "areaId": "Route 12 (Kanto)", "unlocks": ["Route 13 (Kanto)"], "requirements": { "catchSpecies": [{ "species": "Farfetch'd", "count": 3 }] } },
  { "challengeName": "Challenge 24", "areaId": "Route 13 (Kanto)", "unlocks": ["Route 14,15"], "requirements": { "catchSpecies": [{ "species": "Victreebel", "count": 1 }, { "species": "Vileplume", "count": 1 }] } },
  { "challengeName": "Challenge 25", "areaId": "Route 14,15", "unlocks": ["Saffron Gym"], "gift": { "item": "Normal Stone", "count": 2 }, "requirements": { "catchSpecies": [{ "species": "Ditto", "count": 5 }] } },
  { "challengeName": "Challenge 26", "areaId": "Saffron Gym", "unlocks": ["Cycling Road (16-18)"], "requirements": { "earnBadge": { "name": "Marsh Badge", "leader": "Sabrina", "badgeCount": 5 } } },
  { "challengeName": "Challenge 27", "areaId": "Cycling Road (16-18)", "unlocks": ["Kanto Safari Zone (Kanto)"], "requirements": { "catchSpecies": [{ "species": "Dodrio", "count": 2 }] } },
  { "challengeName": "Challenge 28", "areaId": "Kanto Safari Zone (Kanto)", "unlocks": ["Fuchsia Gym"], "gift": { "item": "Ultraball", "count": 10 }, "requirements": { "defeatCountRoute": { "route": "Kanto Safari Zone (Kanto)", "count": 100 } } },
  { "challengeName": "Challenge 29", "areaId": "Fuchsia Gym", "unlocks": ["Sea Routes (Kanto)"], "requirements": { "earnBadge": { "name": "Soul Badge", "leader": "Koga", "badgeCount": 6 } } },
  { "challengeName": "Challenge 30", "areaId": "Sea Routes (Kanto)", "unlocks": ["Pokemon Mansion (Kanto)"], "requirements": { "defeatCountRoute": { "route": "Sea Routes (Kanto)", "count": 250 } } },
  { "challengeName": "Challenge 31", "areaId": "Pokemon Mansion (Kanto)", "unlocks": ["Cinnabar Gym"], "gift": { "item": "Fire Stone", "count": 3 }, "requirements": { "catchSpeciesByQuality": [{ "species": "Magmar", "quality": "Rare", "count": 1 }] } },
  { "challengeName": "Challenge 32", "areaId": "Cinnabar Gym", "unlocks": ["Viridian Gym"], "requirements": { "earnBadge": { "name": "Volcano Badge", "leader": "Blaine", "badgeCount": 7 } } },
  { "challengeName": "Challenge 33", "areaId": "Viridian Gym", "unlocks": ["Route 22 (Kanto)"], "requirements": { "earnBadge": { "name": "Earth Badge", "leader": "Giovanni", "badgeCount": 8 } } },
  { "challengeName": "Challenge 34", "areaId": "Route 22 (Kanto)", "unlocks": ["Route 23 (Kanto)"], "gift": { "item": "Big Potion", "count": 10 }, "requirements": { "defeatCountRoute": { "route": "Route 22 (Kanto)", "count": 350 } } },
  { "challengeName": "Challenge 35", "areaId": "Route 23 (Kanto)", "unlocks": ["Kanto Pokemon League"], "requirements": { "catchSpeciesAnyOfByQuality": [{ "species": ["Nidoking", "Nidoqueen"], "quality": "Rare", "count": 1 }] } },
  { "challengeName": "Challenge 36", "areaId": "Kanto Pokemon League", "unlocks": ["New Region to Travel", "Extra Challenge B"], "requirements": { "defeatEliteFourAndChampion": true } },
  { "challengeName": "Extra Challenge A 01", "areaId": "Celadon Casino", "unlocks": [
      "Small Fishing Spot",
      "Celadon Casino Mid Troupe"
    ], "gift": { "item": "Ultraball", "count": 10 }, "requirements": { "catchSpecies": [{ "species": "Bulbasaur", "count": 1 }, { "species": "Charmander", "count": 1 }, { "species": "Squirtle", "count": 1 }] } },
  { "challengeName": "Extra Challenge A 02", "areaId": "Small Fishing Spot", "unlocks": ["Fighting Dojo", "Celadon Casino Eeveelutions"], "gift": { "item": "Ultraball", "count": 10 }, "requirements": { "catchSpeciesByQuality": [{ "species": "Magikarp", "quality": "Epic", "count": 1 }], "catchEachFromSlotMachine": { "machines": [["Ivysaur", "Charmeleon", "Wartortle"]] } } },
  { "challengeName": "Extra Challenge A 03", "areaId": "Fighting Dojo", "unlocks": ["Big Fishing Spot", "Celadon Casino Special Spot"], "gift": { "item": "Fighting Stone", "count": 3 }, "requirements": { "catchSpeciesByQuality": [{ "species": "Hitmonchan", "quality": "Rare", "count": 1 }, { "species": "Hitmonlee", "quality": "Rare", "count": 1 }, { "species": "Eevee", "quality": "Rare", "count": 1 }] } },
  { "challengeName": "Extra Challenge A 04", "areaId": "Big Fishing Spot", "unlocks": ["Fossil Revival Lab", "Celadon Casino Late Troupe"], "gift": { "item": "Dragon Stone", "count": 6 }, "requirements": { "catchByQualityAndType": { "type": "Dragon", "quality": "Rare", "count": 2 }, "catchEachFromSlotMachine": { "machines": [["Lapras", "Porygon", "Lickitung"]] } } },
  { "challengeName": "Extra Challenge A 05", "areaId": "Fossil Revival Lab", "unlocks": ["Trade With Friends Hub", "Battle Stadium"], "gift": { "item": "Ultraball", "count": 20 }, "requirements": { "catchSpeciesByQuality": [{ "species": "Aerodactyl", "quality": "Rare", "count": 1 }], "catchEachFromSlotMachine": { "machines": [["Venusaur", "Charizard", "Blastoise"]] } } },
  { "challengeName": "Extra Challenge A 06", "areaId": "Trade With Friends Hub", "unlocks": ["Power Plant"], "gift": { "item": "Ultraball", "count": 20 }, "requirements": { "catchSpecies": [{ "species": "Gengar", "count": 1 }, { "species": "Golem", "count": 1 }, { "species": "Alakazam", "count": 1 }, { "species": "Machamp", "count": 1 }] } },
  { "challengeName": "Extra Challenge A 07", "areaId": "Power Plant", "unlocks": ["Seafoam Islands"], "gift": { "item": "Masterball", "count": 1 }, "requirements": { "defeatSpecific": { "name": "Zapdos", "count": 5 } } },
  { "challengeName": "Extra Challenge A 08", "areaId": "Seafoam Islands", "unlocks": ["Victory Road (Kanto)"], "gift": { "item": "Masterball", "count": 1 }, "requirements": { "defeatSpecific": { "name": "Articuno", "count": 5 } } },
  { "challengeName": "Extra Challenge A 09", "areaId": "Victory Road (Kanto)", "unlocks": ["Cerulean Cave"], "gift": { "item": "Masterball", "count": 1 }, "requirements": { "defeatSpecific": { "name": "Moltres", "count": 5 } } },
  { "challengeName": "Extra Challenge A 10", "areaId": "Cerulean Cave", "unlocks": ["Kanto Pokemon League", "Key for Indigo Summit Challenge"], "gift": { "item": "Masterball", "count": 2 }, "requirements": { "defeatSpecific": { "name": "Mewtwo", "count": 5 } } },
  { "challengeName": "Extra Challenge B", "areaId": "Extra Challenge B", "unlocks": ["Key for Indigo Summit Challenge"], "requirements": { "catchSpeciesUniqueCount": 150 } },
  { "challengeName": "Key for Indigo Summit Challenge", "areaId": "Key for Indigo Summit Challenge", "unlocks": ["Indigo Summit", "Indigo Summit Challenge"], "requirements": { "completeChallenges": ["Extra Challenge A 10", "Extra Challenge B"] } },
  { "challengeName": "Indigo Summit Challenge", "areaId": "Indigo Summit", "gift": { "item": "Masterball", "count": 3 }, "requirements": { "catchSpecies": [{ "species": "Mewtwo", "count": 1 }, { "species": "Mew", "count": 1 }, { "species": "Articuno", "count": 1 }, { "species": "Zapdos", "count": 1 }, { "species": "Moltres", "count": 1 }] } }
];

export { routes };