const pokemonData = [
  {
    "id": 1,
    "name": "Bulbasaur",
    "types": [
      "Grass",
      "Poison"
    ],
    "hp": 45,
    "atk": 49,
    "def": 49,
    "spa": 65,
    "spd": 65,
    "spe": 45,
    "evolutions": [
      {
        "to": 2,
        "level": 16
      }
    ],
    "learnset": [
      {
        "level": 1,
        "move": "Tackle"
      },
      {
        "level": 7,
        "move": "Vine Whip"
      },
      {
        "level": 20,
        "move": "Razor Leaf"
      },
      {
        "level": 32,
        "move": "Solar Beam"
      }
    ]
  },
  {
    "id": 2,
    "name": "Ivysaur",
    "types": [
      "Grass",
      "Poison"
    ],
    "hp": 60,
    "atk": 62,
    "def": 63,
    "spa": 80,
    "spd": 80,
    "spe": 60,
    "evolutions": [
      {
        "to": 3,
        "level": 36
      }
    ],
    "learnset": [
      {
        "level": 1,
        "move": "Tackle"
      },
      {
        "level": 7,
        "move": "Vine Whip"
      },
      {
        "level": 22,
        "move": "Razor Leaf"
      },
      {
        "level": 38,
        "move": "Solar Beam"
      }
    ]
  },
  {
    "id": 3,
    "name": "Venusaur",
    "types": [
      "Grass",
      "Poison"
    ],
    "hp": 80,
    "atk": 82,
    "def": 83,
    "spa": 100,
    "spd": 100,
    "spe": 80,
    "evolutions": [],
    "learnset": [
      {
        "level": 1,
        "move": "Tackle"
      },
      {
        "level": 1,
        "move": "Vine Whip"
      },
      {
        "level": 22,
        "move": "Razor Leaf"
      },
      {
        "level": 42,
        "move": "Solar Beam"
      },
      {
        "level": 65,
        "move": "Petal Dance"
      }
    ]
  },
  {
    "id": 4,
    "name": "Charmander",
    "types": [
      "Fire"
    ],
    "hp": 39,
    "atk": 52,
    "def": 43,
    "spa": 60,
    "spd": 50,
    "spe": 65,
    "evolutions": [
      {
        "to": 5,
        "level": 16
      }
    ],
    "learnset": [
      {
        "level": 1,
        "move": "Scratch"
      },
      {
        "level": 7,
        "move": "Ember"
      },
      {
        "level": 22,
        "move": "Slash"
      },
      {
        "level": 30,
        "move": "Flamethrower"
      },
      {
        "level": 38,
        "move": "Fire Spin"
      }
    ]
  },
  {
    "id": 5,
    "name": "Charmeleon",
    "types": [
      "Fire"
    ],
    "hp": 58,
    "atk": 64,
    "def": 58,
    "spa": 80,
    "spd": 65,
    "spe": 80,
    "evolutions": [
      {
        "to": 6,
        "level": 36
      }
    ],
    "learnset": [
      {
        "level": 1,
        "move": "Scratch"
      },
      {
        "level": 7,
        "move": "Ember"
      },
      {
        "level": 24,
        "move": "Slash"
      },
      {
        "level": 33,
        "move": "Flamethrower"
      },
      {
        "level": 42,
        "move": "Fire Spin"
      }
    ]
  },
  {
    "id": 6,
    "name": "Charizard",
    "types": [
      "Fire",
      "Flying"
    ],
    "hp": 78,
    "atk": 84,
    "def": 78,
    "spa": 109,
    "spd": 85,
    "spe": 100,
    "evolutions": [],
    "learnset": [
      {
        "level": 1,
        "move": "Scratch"
      },
      {
        "level": 1,
        "move": "Ember"
      },
      {
        "level": 24,
        "move": "Slash"
      },
      {
        "level": 36,
        "move": "Flamethrower"
      },
      {
        "level": 46,
        "move": "Wing Attack"
      },
      {
        "level": 55,
        "move": "Fire Spin"
      },
      {
        "level": 70,
        "move": "Fire Blast"
      }
    ]
  },
  {
    "id": 7,
    "name": "Squirtle",
    "types": [
      "Water"
    ],
    "hp": 44,
    "atk": 48,
    "def": 65,
    "spa": 50,
    "spd": 64,
    "spe": 43,
    "evolutions": [
      {
        "to": 8,
        "level": 16
      }
    ],
    "learnset": [
      {
        "level": 1,
        "move": "Tackle"
      },
      {
        "level": 8,
        "move": "Water Gun"
      },
      {
        "level": 15,
        "move": "Bite"
      },
      {
        "level": 22,
        "move": "Bubble Beam"
      },
      {
        "level": 28,
        "move": "Water Pulse"
      },
      {
        "level": 35,
        "move": "Hydro Pump"
      },
      {
        "level": 42,
        "move": "Skull Bash"
      }
    ]
  },
  {
    "id": 8,
    "name": "Wartortle",
    "types": [
      "Water"
    ],
    "hp": 59,
    "atk": 63,
    "def": 80,
    "spa": 65,
    "spd": 80,
    "spe": 58,
    "evolutions": [
      {
        "to": 9,
        "level": 36
      }
    ],
    "learnset": [
      {
        "level": 1,
        "move": "Tackle"
      },
      {
        "level": 8,
        "move": "Water Gun"
      },
      {
        "level": 15,
        "move": "Bite"
      },
      {
        "level": 24,
        "move": "Bubble Beam"
      },
      {
        "level": 31,
        "move": "Water Pulse"
      },
      {
        "level": 39,
        "move": "Hydro Pump"
      },
      {
        "level": 47,
        "move": "Skull Bash"
      }
    ]
  },
  {
    "id": 9,
    "name": "Blastoise",
    "types": [
      "Water"
    ],
    "hp": 79,
    "atk": 83,
    "def": 100,
    "spa": 85,
    "spd": 105,
    "spe": 78,
    "evolutions": [],
    "learnset": [
      {
        "level": 1,
        "move": "Tackle"
      },
      {
        "level": 1,
        "move": "Water Gun"
      },
      {
        "level": 15,
        "move": "Bite"
      },
      {
        "level": 24,
        "move": "Bubble Beam"
      },
      {
        "level": 36,
        "move": "Flash Cannon"
      },
      {
        "level": 42,
        "move": "Hydro Pump"
      },
      {
        "level": 52,
        "move": "Skull Bash"
      },
      {
        "level": 68,
        "move": "Blizzard"
      }
    ]
  },
  {
    "id": 10,
    "name": "Caterpie",
    "types": [
      "Bug"
    ],
    "hp": 45,
    "atk": 30,
    "def": 35,
    "spa": 20,
    "spd": 20,
    "spe": 45,
    "evolutions": [
      {
        "to": 11,
        "level": 7
      }
    ],
    "learnset": [
      {
        "level": 1,
        "move": "Tackle"
      },
      {
        "level": 15,
        "move": "Bug Bite"
      }
    ]
  },
  {
    "id": 11,
    "name": "Metapod",
    "types": [
      "Bug"
    ],
    "hp": 50,
    "atk": 20,
    "def": 55,
    "spa": 25,
    "spd": 25,
    "spe": 30,
    "evolutions": [
      {
        "to": 12,
        "level": 12
      }
    ],
    "learnset": [
      {
        "level": 1,
        "move": "Tackle"
      },
      {
        "level": 10,
        "move": "Bug Bite"
      }
    ]
  },
  {
    "id": 12,
    "name": "Butterfree",
    "types": [
      "Bug",
      "Flying"
    ],
    "hp": 60,
    "atk": 45,
    "def": 50,
    "spa": 90,
    "spd": 80,
    "spe": 70,
    "evolutions": [],
    "learnset": [
      {
        "level": 1,
        "move": "Tackle"
      },
      {
        "level": 10,
        "move": "Confusion"
      },
      {
        "level": 18,
        "move": "Gust"
      },
      {
        "level": 26,
        "move": "Psybeam"
      },
      {
        "level": 38,
        "move": "Air Slash"
      },
      {
        "level": 52,
        "move": "Bug Buzz"
      }
    ]
  },
  {
    "id": 13,
    "name": "Weedle",
    "types": [
      "Bug",
      "Poison"
    ],
    "hp": 40,
    "atk": 35,
    "def": 30,
    "spa": 20,
    "spd": 20,
    "spe": 50,
    "evolutions": [
      {
        "to": 14,
        "level": 7
      }
    ],
    "learnset": [
      {
        "level": 1,
        "move": "Poison Sting"
      },
      {
        "level": 15,
        "move": "Bug Bite"
      }
    ]
  },
  {
    "id": 14,
    "name": "Kakuna",
    "types": [
      "Bug",
      "Poison"
    ],
    "hp": 45,
    "atk": 25,
    "def": 50,
    "spa": 25,
    "spd": 25,
    "spe": 35,
    "evolutions": [
      {
        "to": 15,
        "level": 12
      }
    ],
    "learnset": [
      {
        "level": 1,
        "move": "Poison Sting"
      },
      {
        "level": 10,
        "move": "Bug Bite"
      }
    ]
  },
  {
    "id": 15,
    "name": "Beedrill",
    "types": [
      "Bug",
      "Poison"
    ],
    "hp": 65,
    "atk": 90,
    "def": 40,
    "spa": 45,
    "spd": 80,
    "spe": 75,
    "evolutions": [],
    "learnset": [
      {
        "level": 1,
        "move": "Poison Sting"
      },
      {
        "level": 10,
        "move": "Fury Attack"
      },
      {
        "level": 20,
        "move": "Twineedle"
      },
      {
        "level": 32,
        "move": "Pin Missile"
      },
      {
        "level": 45,
        "move": "Poison Jab"
      },
      {
        "level": 60,
        "move": "X-Scissor"
      }
    ]
  },
  {
    "id": 16,
    "name": "Pidgey",
    "types": [
      "Normal",
      "Flying"
    ],
    "hp": 40,
    "atk": 45,
    "def": 40,
    "spa": 35,
    "spd": 35,
    "spe": 56,
    "evolutions": [
      {
        "to": 17,
        "level": 18
      }
    ],
    "learnset": [
      {
        "level": 1,
        "move": "Tackle"
      },
      {
        "level": 5,
        "move": "Gust"
      },
      {
        "level": 12,
        "move": "Quick Attack"
      },
      {
        "level": 21,
        "move": "Wing Attack"
      }
    ]
  },
  {
    "id": 17,
    "name": "Pidgeotto",
    "types": [
      "Normal",
      "Flying"
    ],
    "hp": 63,
    "atk": 60,
    "def": 55,
    "spa": 50,
    "spd": 50,
    "spe": 71,
    "evolutions": [
      {
        "to": 18,
        "level": 38
      }
    ],
    "learnset": [
      {
        "level": 1,
        "move": "Tackle"
      },
      {
        "level": 5,
        "move": "Gust"
      },
      {
        "level": 12,
        "move": "Quick Attack"
      },
      {
        "level": 21,
        "move": "Wing Attack"
      },
      {
        "level": 31,
        "move": "Air Slash"
      }
    ]
  },
  {
    "id": 18,
    "name": "Pidgeot",
    "types": [
      "Normal",
      "Flying"
    ],
    "hp": 83,
    "atk": 80,
    "def": 75,
    "spa": 70,
    "spd": 70,
    "spe": 101,
    "evolutions": [],
    "learnset": [
      {
        "level": 1,
        "move": "Tackle"
      },
      {
        "level": 1,
        "move": "Gust"
      },
      {
        "level": 12,
        "move": "Quick Attack"
      },
      {
        "level": 21,
        "move": "Wing Attack"
      },
      {
        "level": 36,
        "move": "Air Slash"
      },
      {
        "level": 54,
        "move": "Hurricane"
      }
    ]
  },
  {
    "id": 19,
    "name": "Rattata",
    "types": [
      "Normal"
    ],
    "hp": 30,
    "atk": 56,
    "def": 35,
    "spa": 25,
    "spd": 35,
    "spe": 72,
    "evolutions": [
      {
        "to": 20,
        "level": 20
      }
    ],
    "learnset": [
      {
        "level": 1,
        "move": "Tackle"
      },
      {
        "level": 4,
        "move": "Quick Attack"
      },
      {
        "level": 7,
        "move": "Bite"
      },
      {
        "level": 14,
        "move": "Hyper Fang"
      },
      {
        "level": 23,
        "move": "Super Fang"
      }
    ]
  },
  {
    "id": 20,
    "name": "Raticate",
    "types": [
      "Normal"
    ],
    "hp": 55,
    "atk": 81,
    "def": 60,
    "spa": 50,
    "spd": 70,
    "spe": 97,
    "evolutions": [],
    "learnset": [
      {
        "level": 1,
        "move": "Tackle"
      },
      {
        "level": 4,
        "move": "Quick Attack"
      },
      {
        "level": 7,
        "move": "Bite"
      },
      {
        "level": 14,
        "move": "Hyper Fang"
      },
      {
        "level": 20,
        "move": "Super Fang"
      },
      {
        "level": 34,
        "move": "Crunch"
      },
      {
        "level": 48,
        "move": "Double-Edge"
      }
    ]
  },
  {
    "id": 21,
    "name": "Spearow",
    "types": [
      "Normal",
      "Flying"
    ],
    "hp": 40,
    "atk": 60,
    "def": 30,
    "spa": 31,
    "spd": 31,
    "spe": 70,
    "evolutions": [
      {
        "to": 22,
        "level": 22
      }
    ],
    "learnset": [
      {
        "level": 1,
        "move": "Peck"
      },
      {
        "level": 9,
        "move": "Fury Attack"
      },
      {
        "level": 15,
        "move": "Aerial Ace"
      },
      {
        "level": 22,
        "move": "Drill Peck"
      }
    ]
  },
  {
    "id": 22,
    "name": "Fearow",
    "types": [
      "Normal",
      "Flying"
    ],
    "hp": 65,
    "atk": 90,
    "def": 65,
    "spa": 61,
    "spd": 61,
    "spe": 100,
    "evolutions": [],
    "learnset": [
      {
        "level": 1,
        "move": "Peck"
      },
      {
        "level": 9,
        "move": "Fury Attack"
      },
      {
        "level": 15,
        "move": "Aerial Ace"
      },
      {
        "level": 20,
        "move": "Drill Peck"
      },
      {
        "level": 38,
        "move": "Drill Run"
      },
      {
        "level": 55,
        "move": "Sky Attack"
      }
    ]
  },
  {
    "id": 23,
    "name": "Ekans",
    "types": [
      "Poison"
    ],
    "hp": 35,
    "atk": 60,
    "def": 44,
    "spa": 40,
    "spd": 54,
    "spe": 55,
    "evolutions": [
      {
        "to": 24,
        "level": 24
      }
    ],
    "learnset": [
      {
        "level": 1,
        "move": "Wrap"
      },
      {
        "level": 1,
        "move": "Poison Sting"
      },
      {
        "level": 9,
        "move": "Bite"
      },
      {
        "level": 17,
        "move": "Acid"
      },
      {
        "level": 27,
        "move": "Poison Jab"
      }
    ]
  },
  {
    "id": 24,
    "name": "Arbok",
    "types": [
      "Poison"
    ],
    "hp": 60,
    "atk": 95,
    "def": 69,
    "spa": 65,
    "spd": 79,
    "spe": 80,
    "evolutions": [],
    "learnset": [
      {
        "level": 1,
        "move": "Wrap"
      },
      {
        "level": 1,
        "move": "Poison Sting"
      },
      {
        "level": 9,
        "move": "Bite"
      },
      {
        "level": 17,
        "move": "Acid"
      },
      {
        "level": 22,
        "move": "Poison Jab"
      },
      {
        "level": 36,
        "move": "Crunch"
      },
      {
        "level": 48,
        "move": "Gunk Shot"
      },
      {
        "level": 62,
        "move": "Earthquake"
      }
    ]
  },
  {
    "id": 25,
    "name": "Pikachu",
    "types": [
      "Electric"
    ],
    "hp": 35,
    "atk": 55,
    "def": 40,
    "spa": 50,
    "spd": 50,
    "spe": 90,
    "evolutions": [
      {
        "to": 26,
        "level": 32
      }
    ],
    "learnset": [
      {
        "level": 1,
        "move": "Thundershock"
      },
      {
        "level": 6,
        "move": "Quick Attack"
      },
      {
        "level": 11,
        "move": "Spark"
      },
      {
        "level": 20,
        "move": "Slam"
      },
      {
        "level": 26,
        "move": "Thunderbolt"
      },
      {
        "level": 41,
        "move": "Thunder"
      }
    ]
  },
  {
    "id": 26,
    "name": "Raichu",
    "types": [
      "Electric"
    ],
    "hp": 60,
    "atk": 90,
    "def": 55,
    "spa": 90,
    "spd": 80,
    "spe": 110,
    "evolutions": [],
    "learnset": [
      {
        "level": 1,
        "move": "Thundershock"
      },
      {
        "level": 1,
        "move": "Quick Attack"
      },
      {
        "level": 11,
        "move": "Spark"
      },
      {
        "level": 20,
        "move": "Slam"
      },
      {
        "level": 26,
        "move": "Thunderbolt"
      },
      {
        "level": 41,
        "move": "Thunder"
      },
      {
        "level": 55,
        "move": "Volt Tackle"
      }
    ]
  },
  {
    "id": 27,
    "name": "Sandshrew",
    "types": [
      "Ground"
    ],
    "hp": 50,
    "atk": 75,
    "def": 85,
    "spa": 20,
    "spd": 30,
    "spe": 40,
    "evolutions": [
      {
        "to": 28,
        "level": 24
      }
    ],
    "learnset": [
      {
        "level": 1,
        "move": "Scratch"
      },
      {
        "level": 6,
        "move": "Poison Sting"
      },
      {
        "level": 11,
        "move": "Mud-Slap"
      },
      {
        "level": 17,
        "move": "Rollout"
      },
      {
        "level": 23,
        "move": "Slash"
      },
      {
        "level": 30,
        "move": "Dig"
      },
      {
        "level": 38,
        "move": "Earthquake"
      }
    ]
  },
  {
    "id": 28,
    "name": "Sandslash",
    "types": [
      "Ground"
    ],
    "hp": 75,
    "atk": 100,
    "def": 110,
    "spa": 45,
    "spd": 55,
    "spe": 65,
    "evolutions": [],
    "learnset": [
      {
        "level": 1,
        "move": "Scratch"
      },
      {
        "level": 6,
        "move": "Poison Sting"
      },
      {
        "level": 11,
        "move": "Mud-Slap"
      },
      {
        "level": 17,
        "move": "Rollout"
      },
      {
        "level": 22,
        "move": "Slash"
      },
      {
        "level": 32,
        "move": "Dig"
      },
      {
        "level": 42,
        "move": "Earthquake"
      }
    ]
  },
  {
    "id": 29,
    "name": "NidoranF",
    "types": [
      "Poison"
    ],
    "hp": 55,
    "atk": 47,
    "def": 52,
    "spa": 40,
    "spd": 40,
    "spe": 41,
    "evolutions": [
      {
        "to": 30,
        "level": 16
      }
    ],
    "learnset": [
      {
        "level": 1,
        "move": "Tackle"
      },
      {
        "level": 7,
        "move": "Scratch"
      },
      {
        "level": 12,
        "move": "Poison Sting"
      },
      {
        "level": 19,
        "move": "Bite"
      },
      {
        "level": 27,
        "move": "Poison Fang"
      },
      {
        "level": 36,
        "move": "Body Slam"
      }
    ]
  },
  {
    "id": 30,
    "name": "Nidorina",
    "types": [
      "Poison"
    ],
    "hp": 70,
    "atk": 62,
    "def": 67,
    "spa": 55,
    "spd": 55,
    "spe": 56,
    "evolutions": [
      {
        "to": 31,
        "level": 38
      }
    ],
    "learnset": [
      {
        "level": 1,
        "move": "Tackle"
      },
      {
        "level": 7,
        "move": "Scratch"
      },
      {
        "level": 12,
        "move": "Poison Sting"
      },
      {
        "level": 19,
        "move": "Bite"
      },
      {
        "level": 29,
        "move": "Poison Fang"
      },
      {
        "level": 39,
        "move": "Body Slam"
      },
      {
        "level": 50,
        "move": "Poison Jab"
      }
    ]
  },
  {
    "id": 31,
    "name": "Nidoqueen",
    "types": [
      "Poison",
      "Ground"
    ],
    "hp": 90,
    "atk": 92,
    "def": 87,
    "spa": 75,
    "spd": 85,
    "spe": 76,
    "evolutions": [],
    "learnset": [
      {
        "level": 1,
        "move": "Tackle"
      },
      {
        "level": 1,
        "move": "Poison Sting"
      },
      {
        "level": 19,
        "move": "Bite"
      },
      {
        "level": 29,
        "move": "Poison Fang"
      },
      {
        "level": 35,
        "move": "Body Slam"
      },
      {
        "level": 45,
        "move": "Earth Power"
      },
      {
        "level": 58,
        "move": "Sludge Wave"
      },
      {
        "level": 72,
        "move": "Superpower"
      }
    ]
  },
  {
    "id": 32,
    "name": "NidoranM",
    "types": [
      "Poison"
    ],
    "hp": 46,
    "atk": 57,
    "def": 40,
    "spa": 40,
    "spd": 40,
    "spe": 50,
    "evolutions": [
      {
        "to": 33,
        "level": 16
      }
    ],
    "learnset": [
      {
        "level": 1,
        "move": "Tackle"
      },
      {
        "level": 7,
        "move": "Peck"
      },
      {
        "level": 12,
        "move": "Poison Sting"
      },
      {
        "level": 19,
        "move": "Horn Attack"
      },
      {
        "level": 27,
        "move": "Poison Jab"
      },
      {
        "level": 36,
        "move": "Megahorn"
      }
    ]
  },
  {
    "id": 33,
    "name": "Nidorino",
    "types": [
      "Poison"
    ],
    "hp": 61,
    "atk": 72,
    "def": 57,
    "spa": 55,
    "spd": 55,
    "spe": 65,
    "evolutions": [
      {
        "to": 34,
        "level": 38
      }
    ],
    "learnset": [
      {
        "level": 1,
        "move": "Tackle"
      },
      {
        "level": 7,
        "move": "Peck"
      },
      {
        "level": 12,
        "move": "Poison Sting"
      },
      {
        "level": 19,
        "move": "Horn Attack"
      },
      {
        "level": 29,
        "move": "Poison Jab"
      },
      {
        "level": 39,
        "move": "Horn Drill"
      },
      {
        "level": 50,
        "move": "Megahorn"
      }
    ]
  },
  {
    "id": 34,
    "name": "Nidoking",
    "types": [
      "Poison",
      "Ground"
    ],
    "hp": 81,
    "atk": 102,
    "def": 77,
    "spa": 85,
    "spd": 75,
    "spe": 85,
    "evolutions": [],
    "learnset": [
      {
        "level": 1,
        "move": "Tackle"
      },
      {
        "level": 1,
        "move": "Poison Sting"
      },
      {
        "level": 19,
        "move": "Horn Attack"
      },
      {
        "level": 29,
        "move": "Poison Jab"
      },
      {
        "level": 35,
        "move": "Thrash"
      },
      {
        "level": 45,
        "move": "Earth Power"
      },
      {
        "level": 58,
        "move": "Sludge Wave"
      },
      {
        "level": 72,
        "move": "Megahorn"
      }
    ]
  },
  {
    "id": 35,
    "name": "Clefairy",
    "types": [
      "Fairy"
    ],
    "hp": 70,
    "atk": 45,
    "def": 48,
    "spa": 60,
    "spd": 65,
    "spe": 35,
    "evolutions": [
      {
        "to": 36,
        "level": 32
      }
    ],
    "learnset": [
      {
        "level": 1,
        "move": "Pound"
      },
      {
        "level": 10,
        "move": "Disarming Voice"
      },
      {
        "level": 16,
        "move": "Draining Kiss"
      },
      {
        "level": 24,
        "move": "Body Slam"
      },
      {
        "level": 33,
        "move": "Moonblast"
      },
      {
        "level": 44,
        "move": "Meteor Mash"
      }
    ]
  },
  {
    "id": 36,
    "name": "Clefable",
    "types": [
      "Fairy"
    ],
    "hp": 95,
    "atk": 70,
    "def": 73,
    "spa": 95,
    "spd": 90,
    "spe": 60,
    "evolutions": [],
    "learnset": [
      {
        "level": 1,
        "move": "Pound"
      },
      {
        "level": 1,
        "move": "Disarming Voice"
      },
      {
        "level": 16,
        "move": "Draining Kiss"
      },
      {
        "level": 24,
        "move": "Body Slam"
      },
      {
        "level": 35,
        "move": "Moonblast"
      },
      {
        "level": 48,
        "move": "Meteor Mash"
      },
      {
        "level": 64,
        "move": "Psychic"
      }
    ]
  },
  {
    "id": 37,
    "name": "Vulpix",
    "types": [
      "Fire"
    ],
    "hp": 38,
    "atk": 41,
    "def": 40,
    "spa": 50,
    "spd": 65,
    "spe": 65,
    "evolutions": [
      {
        "to": 38,
        "level": 32
      }
    ],
    "learnset": [
      {
        "level": 1,
        "move": "Ember"
      },
      {
        "level": 9,
        "move": "Quick Attack"
      },
      {
        "level": 16,
        "move": "Flame Burst"
      },
      {
        "level": 24,
        "move": "Hex"
      },
      {
        "level": 33,
        "move": "Flamethrower"
      },
      {
        "level": 42,
        "move": "Fire Blast"
      }
    ]
  },
  {
    "id": 38,
    "name": "Ninetales",
    "types": [
      "Fire"
    ],
    "hp": 73,
    "atk": 76,
    "def": 75,
    "spa": 81,
    "spd": 100,
    "spe": 100,
    "evolutions": [],
    "learnset": [
      {
        "level": 1,
        "move": "Ember"
      },
      {
        "level": 1,
        "move": "Quick Attack"
      },
      {
        "level": 16,
        "move": "Flame Burst"
      },
      {
        "level": 24,
        "move": "Hex"
      },
      {
        "level": 33,
        "move": "Flamethrower"
      },
      {
        "level": 45,
        "move": "Extra Sensory"
      },
      {
        "level": 60,
        "move": "Fire Blast"
      },
      {
        "level": 75,
        "move": "Solar Beam"
      }
    ]
  },
  {
    "id": 39,
    "name": "Jigglypuff",
    "types": [
      "Normal",
      "Fairy"
    ],
    "hp": 115,
    "atk": 45,
    "def": 20,
    "spa": 45,
    "spd": 25,
    "spe": 20,
    "evolutions": [
      {
        "to": 40,
        "level": 32
      }
    ],
    "learnset": [
      {
        "level": 1,
        "move": "Pound"
      },
      {
        "level": 9,
        "move": "Disarming Voice"
      },
      {
        "level": 14,
        "move": "Rollout"
      },
      {
        "level": 22,
        "move": "Body Slam"
      },
      {
        "level": 32,
        "move": "Dazzling Gleam"
      },
      {
        "level": 44,
        "move": "Hyper Voice"
      }
    ]
  },
  {
    "id": 40,
    "name": "Wigglytuff",
    "types": [
      "Normal",
      "Fairy"
    ],
    "hp": 140,
    "atk": 70,
    "def": 45,
    "spa": 85,
    "spd": 50,
    "spe": 45,
    "evolutions": [],
    "learnset": [
      {
        "level": 1,
        "move": "Pound"
      },
      {
        "level": 1,
        "move": "Disarming Voice"
      },
      {
        "level": 14,
        "move": "Rollout"
      },
      {
        "level": 22,
        "move": "Body Slam"
      },
      {
        "level": 32,
        "move": "Dazzling Gleam"
      },
      {
        "level": 44,
        "move": "Hyper Voice"
      },
      {
        "level": 62,
        "move": "Double-Edge"
      }
    ]
  },
  {
    "id": 41,
    "name": "Zubat",
    "types": [
      "Poison",
      "Flying"
    ],
    "hp": 40,
    "atk": 45,
    "def": 35,
    "spa": 30,
    "spd": 40,
    "spe": 55,
    "evolutions": [
      {
        "to": 42,
        "level": 24
      }
    ],
    "learnset": [
      {
        "level": 1,
        "move": "Absorb"
      },
      {
        "level": 5,
        "move": "Astonish"
      },
      {
        "level": 9,
        "move": "Bite"
      },
      {
        "level": 15,
        "move": "Wing Attack"
      },
      {
        "level": 23,
        "move": "Air Cutter"
      },
      {
        "level": 32,
        "move": "Poison Fang"
      },
      {
        "level": 43,
        "move": "Leech Life"
      }
    ]
  },
  {
    "id": 42,
    "name": "Golbat",
    "types": [
      "Poison",
      "Flying"
    ],
    "hp": 75,
    "atk": 80,
    "def": 70,
    "spa": 65,
    "spd": 75,
    "spe": 90,
    "evolutions": [],
    "learnset": [
      {
        "level": 1,
        "move": "Absorb"
      },
      {
        "level": 5,
        "move": "Astonish"
      },
      {
        "level": 9,
        "move": "Bite"
      },
      {
        "level": 15,
        "move": "Wing Attack"
      },
      {
        "level": 22,
        "move": "Air Cutter"
      },
      {
        "level": 34,
        "move": "Poison Fang"
      },
      {
        "level": 45,
        "move": "Leech Life"
      },
      {
        "level": 58,
        "move": "Air Slash"
      }
    ]
  },
  {
    "id": 43,
    "name": "Oddish",
    "types": [
      "Grass",
      "Poison"
    ],
    "hp": 45,
    "atk": 50,
    "def": 55,
    "spa": 75,
    "spd": 65,
    "spe": 30,
    "evolutions": [
      {
        "to": 44,
        "level": 22
      }
    ],
    "learnset": [
      {
        "level": 1,
        "move": "Absorb"
      },
      {
        "level": 8,
        "move": "Acid"
      },
      {
        "level": 15,
        "move": "Mega Drain"
      },
      {
        "level": 23,
        "move": "Giga Drain"
      },
      {
        "level": 33,
        "move": "Moonblast"
      },
      {
        "level": 43,
        "move": "Petal Dance"
      }
    ]
  },
  {
    "id": 44,
    "name": "Gloom",
    "types": [
      "Grass",
      "Poison"
    ],
    "hp": 60,
    "atk": 65,
    "def": 70,
    "spa": 85,
    "spd": 75,
    "spe": 40,
    "evolutions": [
      {
        "to": 45,
        "level": 40
      }
    ],
    "learnset": [
      {
        "level": 1,
        "move": "Absorb"
      },
      {
        "level": 8,
        "move": "Acid"
      },
      {
        "level": 15,
        "move": "Mega Drain"
      },
      {
        "level": 24,
        "move": "Giga Drain"
      },
      {
        "level": 35,
        "move": "Moonblast"
      },
      {
        "level": 47,
        "move": "Petal Dance"
      }
    ]
  },
  {
    "id": 45,
    "name": "Vileplume",
    "types": [
      "Grass",
      "Poison"
    ],
    "hp": 75,
    "atk": 80,
    "def": 85,
    "spa": 110,
    "spd": 90,
    "spe": 50,
    "evolutions": [],
    "learnset": [
      {
        "level": 1,
        "move": "Absorb"
      },
      {
        "level": 1,
        "move": "Acid"
      },
      {
        "level": 15,
        "move": "Mega Drain"
      },
      {
        "level": 24,
        "move": "Giga Drain"
      },
      {
        "level": 35,
        "move": "Sludge Bomb"
      },
      {
        "level": 48,
        "move": "Petal Dance"
      },
      {
        "level": 65,
        "move": "Solar Beam"
      }
    ]
  },
  {
    "id": 46,
    "name": "Paras",
    "types": [
      "Bug",
      "Grass"
    ],
    "hp": 35,
    "atk": 70,
    "def": 55,
    "spa": 45,
    "spd": 55,
    "spe": 25,
    "evolutions": [
      {
        "to": 47,
        "level": 26
      }
    ],
    "learnset": [
      {
        "level": 1,
        "move": "Scratch"
      },
      {
        "level": 6,
        "move": "Poison Powder"
      },
      {
        "level": 11,
        "move": "Absorb"
      },
      {
        "level": 17,
        "move": "Fury Cutter"
      },
      {
        "level": 25,
        "move": "Slash"
      },
      {
        "level": 35,
        "move": "Leech Life"
      },
      {
        "level": 45,
        "move": "X-Scissor"
      }
    ]
  },
  {
    "id": 47,
    "name": "Parasect",
    "types": [
      "Bug",
      "Grass"
    ],
    "hp": 60,
    "atk": 95,
    "def": 80,
    "spa": 60,
    "spd": 80,
    "spe": 30,
    "evolutions": [],
    "learnset": [
      {
        "level": 1,
        "move": "Scratch"
      },
      {
        "level": 1,
        "move": "Absorb"
      },
      {
        "level": 17,
        "move": "Fury Cutter"
      },
      {
        "level": 24,
        "move": "Slash"
      },
      {
        "level": 37,
        "move": "Leech Life"
      },
      {
        "level": 48,
        "move": "X-Scissor"
      },
      {
        "level": 62,
        "move": "Giga Drain"
      }
    ]
  },
  {
    "id": 48,
    "name": "Venonat",
    "types": [
      "Bug",
      "Poison"
    ],
    "hp": 60,
    "atk": 55,
    "def": 50,
    "spa": 40,
    "spd": 55,
    "spe": 45,
    "evolutions": [
      {
        "to": 49,
        "level": 32
      }
    ],
    "learnset": [
      {
        "level": 1,
        "move": "Tackle"
      },
      {
        "level": 9,
        "move": "Confusion"
      },
      {
        "level": 17,
        "move": "Psybeam"
      },
      {
        "level": 25,
        "move": "Signal Beam"
      },
      {
        "level": 33,
        "move": "Leech Life"
      },
      {
        "level": 41,
        "move": "Psychic"
      }
    ]
  },
  {
    "id": 49,
    "name": "Venomoth",
    "types": [
      "Bug",
      "Poison"
    ],
    "hp": 70,
    "atk": 65,
    "def": 60,
    "spa": 90,
    "spd": 75,
    "spe": 90,
    "evolutions": [],
    "learnset": [
      {
        "level": 1,
        "move": "Tackle"
      },
      {
        "level": 1,
        "move": "Confusion"
      },
      {
        "level": 17,
        "move": "Psybeam"
      },
      {
        "level": 25,
        "move": "Signal Beam"
      },
      {
        "level": 31,
        "move": "Gust"
      },
      {
        "level": 38,
        "move": "Leech Life"
      },
      {
        "level": 47,
        "move": "Psychic"
      },
      {
        "level": 58,
        "move": "Bug Buzz"
      }
    ]
  },
  {
    "id": 50,
    "name": "Diglett",
    "types": [
      "Ground"
    ],
    "hp": 10,
    "atk": 55,
    "def": 25,
    "spa": 35,
    "spd": 45,
    "spe": 95,
    "evolutions": [
      {
        "to": 51,
        "level": 28
      }
    ],
    "learnset": [
      {
        "level": 1,
        "move": "Scratch"
      },
      {
        "level": 7,
        "move": "Mud-Slap"
      },
      {
        "level": 14,
        "move": "Mud Bomb"
      },
      {
        "level": 22,
        "move": "Slash"
      },
      {
        "level": 30,
        "move": "Dig"
      },
      {
        "level": 40,
        "move": "Earthquake"
      }
    ]
  },
  {
    "id": 51,
    "name": "Dugtrio",
    "types": [
      "Ground"
    ],
    "hp": 35,
    "atk": 100,
    "def": 50,
    "spa": 50,
    "spd": 70,
    "spe": 120,
    "evolutions": [],
    "learnset": [
      {
        "level": 1,
        "move": "Scratch"
      },
      {
        "level": 7,
        "move": "Mud-Slap"
      },
      {
        "level": 14,
        "move": "Mud Bomb"
      },
      {
        "level": 22,
        "move": "Slash"
      },
      {
        "level": 26,
        "move": "Tri Attack"
      },
      {
        "level": 34,
        "move": "Dig"
      },
      {
        "level": 46,
        "move": "Earthquake"
      },
      {
        "level": 60,
        "move": "Fissure"
      }
    ]
  },
  {
    "id": 52,
    "name": "Meowth",
    "types": [
      "Normal"
    ],
    "hp": 40,
    "atk": 45,
    "def": 35,
    "spa": 40,
    "spd": 40,
    "spe": 90,
    "evolutions": [
      {
        "to": 53,
        "level": 30
      }
    ],
    "learnset": [
      {
        "level": 1,
        "move": "Scratch"
      },
      {
        "level": 6,
        "move": "Bite"
      },
      {
        "level": 14,
        "move": "Pay Day"
      },
      {
        "level": 22,
        "move": "Fury Swipes"
      },
      {
        "level": 30,
        "move": "Slash"
      },
      {
        "level": 40,
        "move": "Night Slash"
      }
    ]
  },
  {
    "id": 53,
    "name": "Persian",
    "types": [
      "Normal"
    ],
    "hp": 65,
    "atk": 70,
    "def": 60,
    "spa": 65,
    "spd": 65,
    "spe": 115,
    "evolutions": [],
    "learnset": [
      {
        "level": 1,
        "move": "Scratch"
      },
      {
        "level": 1,
        "move": "Bite"
      },
      {
        "level": 14,
        "move": "Pay Day"
      },
      {
        "level": 22,
        "move": "Fury Swipes"
      },
      {
        "level": 28,
        "move": "Power Gem"
      },
      {
        "level": 34,
        "move": "Slash"
      },
      {
        "level": 46,
        "move": "Night Slash"
      },
      {
        "level": 60,
        "move": "Play Rough"
      }
    ]
  },
  {
    "id": 54,
    "name": "Psyduck",
    "types": [
      "Water"
    ],
    "hp": 50,
    "atk": 52,
    "def": 48,
    "spa": 65,
    "spd": 50,
    "spe": 55,
    "evolutions": [
      {
        "to": 55,
        "level": 34
      }
    ],
    "learnset": [
      {
        "level": 1,
        "move": "Scratch"
      },
      {
        "level": 5,
        "move": "Water Gun"
      },
      {
        "level": 11,
        "move": "Confusion"
      },
      {
        "level": 19,
        "move": "Water Pulse"
      },
      {
        "level": 28,
        "move": "Zen Headbutt"
      },
      {
        "level": 38,
        "move": "Surf"
      },
      {
        "level": 48,
        "move": "Hydro Pump"
      }
    ]
  },
  {
    "id": 55,
    "name": "Golduck",
    "types": [
      "Water"
    ],
    "hp": 80,
    "atk": 82,
    "def": 78,
    "spa": 95,
    "spd": 80,
    "spe": 85,
    "evolutions": [],
    "learnset": [
      {
        "level": 1,
        "move": "Scratch"
      },
      {
        "level": 1,
        "move": "Water Gun"
      },
      {
        "level": 11,
        "move": "Confusion"
      },
      {
        "level": 19,
        "move": "Water Pulse"
      },
      {
        "level": 28,
        "move": "Zen Headbutt"
      },
      {
        "level": 33,
        "move": "Aqua Tail"
      },
      {
        "level": 42,
        "move": "Surf"
      },
      {
        "level": 54,
        "move": "Hydro Pump"
      },
      {
        "level": 68,
        "move": "Psychic"
      }
    ]
  },
  {
    "id": 56,
    "name": "Mankey",
    "types": [
      "Fighting"
    ],
    "hp": 40,
    "atk": 80,
    "def": 35,
    "spa": 35,
    "spd": 45,
    "spe": 70,
    "evolutions": [
      {
        "to": 57,
        "level": 30
      }
    ],
    "learnset": [
      {
        "level": 1,
        "move": "Scratch"
      },
      {
        "level": 5,
        "move": "Low Kick"
      },
      {
        "level": 11,
        "move": "Karate Chop"
      },
      {
        "level": 19,
        "move": "Fury Swipes"
      },
      {
        "level": 26,
        "move": "Cross Chop"
      },
      {
        "level": 35,
        "move": "Thrash"
      },
      {
        "level": 45,
        "move": "Close Combat"
      }
    ]
  },
  {
    "id": 57,
    "name": "Primeape",
    "types": [
      "Fighting"
    ],
    "hp": 65,
    "atk": 105,
    "def": 60,
    "spa": 60,
    "spd": 70,
    "spe": 95,
    "evolutions": [],
    "learnset": [
      {
        "level": 1,
        "move": "Scratch"
      },
      {
        "level": 5,
        "move": "Low Kick"
      },
      {
        "level": 11,
        "move": "Karate Chop"
      },
      {
        "level": 19,
        "move": "Fury Swipes"
      },
      {
        "level": 26,
        "move": "Cross Chop"
      },
      {
        "level": 28,
        "move": "Rage"
      },
      {
        "level": 38,
        "move": "Thrash"
      },
      {
        "level": 50,
        "move": "Close Combat"
      },
      {
        "level": 65,
        "move": "Outrage"
      }
    ]
  },
  {
    "id": 58,
    "name": "Growlithe",
    "types": [
      "Fire"
    ],
    "hp": 55,
    "atk": 70,
    "def": 45,
    "spa": 70,
    "spd": 50,
    "spe": 60,
    "evolutions": [
      {
        "to": 59,
        "level": 34
      }
    ],
    "learnset": [
      {
        "level": 1,
        "move": "Bite"
      },
      {
        "level": 6,
        "move": "Ember"
      },
      {
        "level": 14,
        "move": "Flame Wheel"
      },
      {
        "level": 22,
        "move": "Take Down"
      },
      {
        "level": 30,
        "move": "Flame Burst"
      },
      {
        "level": 39,
        "move": "Flamethrower"
      },
      {
        "level": 48,
        "move": "Crunch"
      },
      {
        "level": 56,
        "move": "Flare Blitz"
      }
    ]
  },
  {
    "id": 59,
    "name": "Arcanine",
    "types": [
      "Fire"
    ],
    "hp": 90,
    "atk": 110,
    "def": 80,
    "spa": 100,
    "spd": 80,
    "spe": 95,
    "evolutions": [],
    "learnset": [
      {
        "level": 1,
        "move": "Bite"
      },
      {
        "level": 1,
        "move": "Ember"
      },
      {
        "level": 14,
        "move": "Flame Wheel"
      },
      {
        "level": 22,
        "move": "Take Down"
      },
      {
        "level": 30,
        "move": "Extreme Speed"
      },
      {
        "level": 39,
        "move": "Flamethrower"
      },
      {
        "level": 48,
        "move": "Crunch"
      },
      {
        "level": 60,
        "move": "Flare Blitz"
      },
      {
        "level": 75,
        "move": "Outrage"
      }
    ]
  },
  {
    "id": 60,
    "name": "Poliwag",
    "types": [
      "Water"
    ],
    "hp": 40,
    "atk": 50,
    "def": 40,
    "spa": 40,
    "spd": 40,
    "spe": 90,
    "evolutions": [
      {
        "to": 61,
        "level": 25
      }
    ],
    "learnset": [
      {
        "level": 1,
        "move": "Water Gun"
      },
      {
        "level": 6,
        "move": "Pound"
      },
      {
        "level": 13,
        "move": "Bubble Beam"
      },
      {
        "level": 21,
        "move": "Mud Shot"
      },
      {
        "level": 30,
        "move": "Body Slam"
      },
      {
        "level": 38,
        "move": "Hydro Pump"
      }
    ]
  },
  {
    "id": 61,
    "name": "Poliwhirl",
    "types": [
      "Water"
    ],
    "hp": 65,
    "atk": 65,
    "def": 65,
    "spa": 50,
    "spd": 50,
    "spe": 90,
    "evolutions": [
      {
        "to": 62,
        "level": 42
      }
    ],
    "learnset": [
      {
        "level": 1,
        "move": "Water Gun"
      },
      {
        "level": 6,
        "move": "Pound"
      },
      {
        "level": 13,
        "move": "Bubble Beam"
      },
      {
        "level": 21,
        "move": "Mud Shot"
      },
      {
        "level": 32,
        "move": "Body Slam"
      },
      {
        "level": 42,
        "move": "Hydro Pump"
      },
      {
        "level": 53,
        "move": "Waterfall"
      }
    ]
  },
  {
    "id": 62,
    "name": "Poliwrath",
    "types": [
      "Water",
      "Fighting"
    ],
    "hp": 90,
    "atk": 95,
    "def": 95,
    "spa": 70,
    "spd": 90,
    "spe": 70,
    "evolutions": [],
    "learnset": [
      {
        "level": 1,
        "move": "Water Gun"
      },
      {
        "level": 1,
        "move": "Bubble Beam"
      },
      {
        "level": 21,
        "move": "Mud Shot"
      },
      {
        "level": 32,
        "move": "Dynamic Punch"
      },
      {
        "level": 44,
        "move": "Submission"
      },
      {
        "level": 55,
        "move": "Hydro Pump"
      },
      {
        "level": 68,
        "move": "Close Combat"
      }
    ]
  },
  {
    "id": 63,
    "name": "Abra",
    "types": [
      "Psychic"
    ],
    "hp": 25,
    "atk": 20,
    "def": 15,
    "spa": 105,
    "spd": 55,
    "spe": 90,
    "evolutions": [
      {
        "to": 64,
        "level": 16
      }
    ],
    "learnset": [
      {
        "level": 1,
        "move": "Flash"
      },
      {
        "level": 15,
        "move": "Confusion"
      }
    ]
  },
  {
    "id": 64,
    "name": "Kadabra",
    "types": [
      "Psychic"
    ],
    "hp": 40,
    "atk": 35,
    "def": 30,
    "spa": 120,
    "spd": 70,
    "spe": 105,
    "evolutions": [
      {
        "to": 65,
        "level": 40
      }
    ],
    "learnset": [
      {
        "level": 1,
        "move": "Confusion"
      },
      {
        "level": 16,
        "move": "Psybeam"
      },
      {
        "level": 24,
        "move": "Night Shade"
      },
      {
        "level": 34,
        "move": "Psychic"
      },
      {
        "level": 46,
        "move": "Shadow Ball"
      },
      {
        "level": 58,
        "move": "Future Sight"
      }
    ]
  },
  {
    "id": 65,
    "name": "Alakazam",
    "types": [
      "Psychic"
    ],
    "hp": 55,
    "atk": 50,
    "def": 45,
    "spa": 135,
    "spd": 95,
    "spe": 120,
    "evolutions": [],
    "learnset": [
      {
        "level": 1,
        "move": "Confusion"
      },
      {
        "level": 16,
        "move": "Psybeam"
      },
      {
        "level": 24,
        "move": "Night Shade"
      },
      {
        "level": 34,
        "move": "Psychic"
      },
      {
        "level": 46,
        "move": "Shadow Ball"
      },
      {
        "level": 58,
        "move": "Future Sight"
      },
      {
        "level": 72,
        "move": "Focus Blast"
      }
    ]
  },
  {
    "id": 66,
    "name": "Machop",
    "types": [
      "Fighting"
    ],
    "hp": 70,
    "atk": 80,
    "def": 50,
    "spa": 35,
    "spd": 35,
    "spe": 35,
    "evolutions": [
      {
        "to": 67,
        "level": 28
      }
    ],
    "learnset": [
      {
        "level": 1,
        "move": "Low Kick"
      },
      {
        "level": 7,
        "move": "Karate Chop"
      },
      {
        "level": 15,
        "move": "Seismic Toss"
      },
      {
        "level": 22,
        "move": "Revenge"
      },
      {
        "level": 30,
        "move": "Vital Throw"
      },
      {
        "level": 38,
        "move": "Submission"
      },
      {
        "level": 46,
        "move": "Cross Chop"
      }
    ]
  },
  {
    "id": 67,
    "name": "Machoke",
    "types": [
      "Fighting"
    ],
    "hp": 80,
    "atk": 100,
    "def": 70,
    "spa": 50,
    "spd": 60,
    "spe": 45,
    "evolutions": [
      {
        "to": 68,
        "level": 44
      }
    ],
    "learnset": [
      {
        "level": 1,
        "move": "Low Kick"
      },
      {
        "level": 7,
        "move": "Karate Chop"
      },
      {
        "level": 15,
        "move": "Seismic Toss"
      },
      {
        "level": 22,
        "move": "Revenge"
      },
      {
        "level": 32,
        "move": "Vital Throw"
      },
      {
        "level": 42,
        "move": "Submission"
      },
      {
        "level": 52,
        "move": "Cross Chop"
      },
      {
        "level": 62,
        "move": "Dynamic Punch"
      }
    ]
  },
  {
    "id": 68,
    "name": "Machamp",
    "types": [
      "Fighting"
    ],
    "hp": 90,
    "atk": 130,
    "def": 80,
    "spa": 65,
    "spd": 85,
    "spe": 55,
    "evolutions": [],
    "learnset": [
      {
        "level": 1,
        "move": "Low Kick"
      },
      {
        "level": 1,
        "move": "Karate Chop"
      },
      {
        "level": 15,
        "move": "Seismic Toss"
      },
      {
        "level": 22,
        "move": "Revenge"
      },
      {
        "level": 32,
        "move": "Vital Throw"
      },
      {
        "level": 42,
        "move": "Submission"
      },
      {
        "level": 52,
        "move": "Cross Chop"
      },
      {
        "level": 64,
        "move": "Dynamic Punch"
      },
      {
        "level": 76,
        "move": "Close Combat"
      }
    ]
  },
  {
    "id": 69,
    "name": "Bellsprout",
    "types": [
      "Grass",
      "Poison"
    ],
    "hp": 50,
    "atk": 75,
    "def": 35,
    "spa": 70,
    "spd": 30,
    "spe": 40,
    "evolutions": [
      {
        "to": 70,
        "level": 22
      }
    ],
    "learnset": [
      {
        "level": 1,
        "move": "Vine Whip"
      },
      {
        "level": 9,
        "move": "Acid"
      },
      {
        "level": 17,
        "move": "Razor Leaf"
      },
      {
        "level": 26,
        "move": "Poison Jab"
      },
      {
        "level": 35,
        "move": "Slam"
      }
    ]
  },
  {
    "id": 70,
    "name": "Weepinbell",
    "types": [
      "Grass",
      "Poison"
    ],
    "hp": 65,
    "atk": 90,
    "def": 50,
    "spa": 85,
    "spd": 45,
    "spe": 55,
    "evolutions": [
      {
        "to": 71,
        "level": 40
      }
    ],
    "learnset": [
      {
        "level": 1,
        "move": "Vine Whip"
      },
      {
        "level": 9,
        "move": "Acid"
      },
      {
        "level": 17,
        "move": "Razor Leaf"
      },
      {
        "level": 28,
        "move": "Poison Jab"
      },
      {
        "level": 38,
        "move": "Slam"
      },
      {
        "level": 48,
        "move": "Leaf Blade"
      }
    ]
  },
  {
    "id": 71,
    "name": "Victreebel",
    "types": [
      "Grass",
      "Poison"
    ],
    "hp": 80,
    "atk": 105,
    "def": 65,
    "spa": 100,
    "spd": 70,
    "spe": 70,
    "evolutions": [],
    "learnset": [
      {
        "level": 1,
        "move": "Vine Whip"
      },
      {
        "level": 1,
        "move": "Acid"
      },
      {
        "level": 17,
        "move": "Razor Leaf"
      },
      {
        "level": 28,
        "move": "Poison Jab"
      },
      {
        "level": 38,
        "move": "Leaf Blade"
      },
      {
        "level": 52,
        "move": "Sludge Bomb"
      },
      {
        "level": 66,
        "move": "Solar Beam"
      }
    ]
  },
  {
    "id": 72,
    "name": "Tentacool",
    "types": [
      "Water",
      "Poison"
    ],
    "hp": 40,
    "atk": 40,
    "def": 35,
    "spa": 50,
    "spd": 100,
    "spe": 70,
    "evolutions": [
      {
        "to": 73,
        "level": 32
      }
    ],
    "learnset": [
      {
        "level": 1,
        "move": "Poison Sting"
      },
      {
        "level": 6,
        "move": "Water Gun"
      },
      {
        "level": 12,
        "move": "Acid"
      },
      {
        "level": 19,
        "move": "Bubble Beam"
      },
      {
        "level": 28,
        "move": "Water Pulse"
      },
      {
        "level": 37,
        "move": "Poison Jab"
      },
      {
        "level": 46,
        "move": "Hydro Pump"
      }
    ]
  },
  {
    "id": 73,
    "name": "Tentacruel",
    "types": [
      "Water",
      "Poison"
    ],
    "hp": 80,
    "atk": 70,
    "def": 65,
    "spa": 80,
    "spd": 120,
    "spe": 100,
    "evolutions": [],
    "learnset": [
      {
        "level": 1,
        "move": "Poison Sting"
      },
      {
        "level": 1,
        "move": "Water Gun"
      },
      {
        "level": 12,
        "move": "Acid"
      },
      {
        "level": 19,
        "move": "Bubble Beam"
      },
      {
        "level": 30,
        "move": "Water Pulse"
      },
      {
        "level": 40,
        "move": "Poison Jab"
      },
      {
        "level": 50,
        "move": "Hydro Pump"
      },
      {
        "level": 64,
        "move": "Sludge Wave"
      }
    ]
  },
  {
    "id": 74,
    "name": "Geodude",
    "types": [
      "Rock",
      "Ground"
    ],
    "hp": 40,
    "atk": 80,
    "def": 100,
    "spa": 30,
    "spd": 30,
    "spe": 20,
    "evolutions": [
      {
        "to": 75,
        "level": 25
      }
    ],
    "learnset": [
      {
        "level": 1,
        "move": "Tackle"
      },
      {
        "level": 6,
        "move": "Rock Throw"
      },
      {
        "level": 12,
        "move": "Magnitude"
      },
      {
        "level": 18,
        "move": "Rollout"
      },
      {
        "level": 24,
        "move": "Rock Slide"
      },
      {
        "level": 32,
        "move": "Earthquake"
      },
      {
        "level": 40,
        "move": "Stone Edge"
      }
    ]
  },
  {
    "id": 75,
    "name": "Graveler",
    "types": [
      "Rock",
      "Ground"
    ],
    "hp": 55,
    "atk": 95,
    "def": 115,
    "spa": 45,
    "spd": 45,
    "spe": 35,
    "evolutions": [
      {
        "to": 76,
        "level": 42
      }
    ],
    "learnset": [
      {
        "level": 1,
        "move": "Tackle"
      },
      {
        "level": 6,
        "move": "Rock Throw"
      },
      {
        "level": 12,
        "move": "Magnitude"
      },
      {
        "level": 18,
        "move": "Rollout"
      },
      {
        "level": 24,
        "move": "Rock Slide"
      },
      {
        "level": 35,
        "move": "Earthquake"
      },
      {
        "level": 45,
        "move": "Stone Edge"
      },
      {
        "level": 55,
        "move": "Explosion"
      }
    ]
  },
  {
    "id": 76,
    "name": "Golem",
    "types": [
      "Rock",
      "Ground"
    ],
    "hp": 80,
    "atk": 120,
    "def": 130,
    "spa": 55,
    "spd": 65,
    "spe": 45,
    "evolutions": [],
    "learnset": [
      {
        "level": 1,
        "move": "Tackle"
      },
      {
        "level": 1,
        "move": "Rock Throw"
      },
      {
        "level": 12,
        "move": "Magnitude"
      },
      {
        "level": 18,
        "move": "Rollout"
      },
      {
        "level": 24,
        "move": "Rock Slide"
      },
      {
        "level": 35,
        "move": "Earthquake"
      },
      {
        "level": 48,
        "move": "Stone Edge"
      },
      {
        "level": 60,
        "move": "Heavy Slam"
      },
      {
        "level": 74,
        "move": "Explosion"
      }
    ]
  },
  {
    "id": 77,
    "name": "Ponyta",
    "types": [
      "Fire"
    ],
    "hp": 50,
    "atk": 85,
    "def": 55,
    "spa": 65,
    "spd": 65,
    "spe": 90,
    "evolutions": [
      {
        "to": 78,
        "level": 42
      }
    ],
    "learnset": [
      {
        "level": 1,
        "move": "Tackle"
      },
      {
        "level": 5,
        "move": "Ember"
      },
      {
        "level": 13,
        "move": "Flame Wheel"
      },
      {
        "level": 21,
        "move": "Stomp"
      },
      {
        "level": 29,
        "move": "Flame Charge"
      },
      {
        "level": 37,
        "move": "Fire Spin"
      },
      {
        "level": 46,
        "move": "Take Down"
      },
      {
        "level": 54,
        "move": "Flare Blitz"
      }
    ]
  },
  {
    "id": 78,
    "name": "Rapidash",
    "types": [
      "Fire"
    ],
    "hp": 65,
    "atk": 100,
    "def": 70,
    "spa": 80,
    "spd": 80,
    "spe": 105,
    "evolutions": [],
    "learnset": [
      {
        "level": 1,
        "move": "Tackle"
      },
      {
        "level": 1,
        "move": "Ember"
      },
      {
        "level": 13,
        "move": "Flame Wheel"
      },
      {
        "level": 21,
        "move": "Stomp"
      },
      {
        "level": 29,
        "move": "Flame Charge"
      },
      {
        "level": 37,
        "move": "Fire Spin"
      },
      {
        "level": 40,
        "move": "Fury Attack"
      },
      {
        "level": 50,
        "move": "Flare Blitz"
      },
      {
        "level": 65,
        "move": "Megahorn"
      }
    ]
  },
  {
    "id": 79,
    "name": "Slowpoke",
    "types": [
      "Water",
      "Psychic"
    ],
    "hp": 90,
    "atk": 65,
    "def": 65,
    "spa": 40,
    "spd": 40,
    "spe": 15,
    "evolutions": [
      {
        "to": 80,
        "level": 38
      }
    ],
    "learnset": [
      {
        "level": 1,
        "move": "Tackle"
      },
      {
        "level": 6,
        "move": "Water Gun"
      },
      {
        "level": 14,
        "move": "Confusion"
      },
      {
        "level": 22,
        "move": "Water Pulse"
      },
      {
        "level": 30,
        "move": "Zen Headbutt"
      },
      {
        "level": 39,
        "move": "Surf"
      },
      {
        "level": 48,
        "move": "Psychic"
      }
    ]
  },
  {
    "id": 80,
    "name": "Slowbro",
    "types": [
      "Water",
      "Psychic"
    ],
    "hp": 95,
    "atk": 75,
    "def": 110,
    "spa": 100,
    "spd": 80,
    "spe": 30,
    "evolutions": [],
    "learnset": [
      {
        "level": 1,
        "move": "Tackle"
      },
      {
        "level": 1,
        "move": "Water Gun"
      },
      {
        "level": 14,
        "move": "Confusion"
      },
      {
        "level": 22,
        "move": "Water Pulse"
      },
      {
        "level": 30,
        "move": "Zen Headbutt"
      },
      {
        "level": 37,
        "move": "Surf"
      },
      {
        "level": 46,
        "move": "Psychic"
      },
      {
        "level": 60,
        "move": "Scald"
      }
    ]
  },
  {
    "id": 81,
    "name": "Magnemite",
    "types": [
      "Electric",
      "Steel"
    ],
    "hp": 25,
    "atk": 35,
    "def": 70,
    "spa": 95,
    "spd": 55,
    "spe": 45,
    "evolutions": [
      {
        "to": 82,
        "level": 32
      }
    ],
    "learnset": [
      {
        "level": 1,
        "move": "Tackle"
      },
      {
        "level": 5,
        "move": "Thundershock"
      },
      {
        "level": 11,
        "move": "Spark"
      },
      {
        "level": 19,
        "move": "Flash Cannon"
      },
      {
        "level": 27,
        "move": "Discharge"
      },
      {
        "level": 35,
        "move": "Thunderbolt"
      },
      {
        "level": 45,
        "move": "Zap Cannon"
      }
    ]
  },
  {
    "id": 82,
    "name": "Magneton",
    "types": [
      "Electric",
      "Steel"
    ],
    "hp": 50,
    "atk": 60,
    "def": 95,
    "spa": 120,
    "spd": 70,
    "spe": 70,
    "evolutions": [],
    "learnset": [
      {
        "level": 1,
        "move": "Tackle"
      },
      {
        "level": 1,
        "move": "Thundershock"
      },
      {
        "level": 11,
        "move": "Spark"
      },
      {
        "level": 19,
        "move": "Flash Cannon"
      },
      {
        "level": 27,
        "move": "Discharge"
      },
      {
        "level": 30,
        "move": "Tri Attack"
      },
      {
        "level": 40,
        "move": "Thunderbolt"
      },
      {
        "level": 52,
        "move": "Zap Cannon"
      }
    ]
  },
  {
    "id": 83,
    "name": "Farfetchd",
    "types": [
      "Normal",
      "Flying"
    ],
    "hp": 52,
    "atk": 90,
    "def": 55,
    "spa": 58,
    "spd": 62,
    "spe": 60,
    "evolutions": [],
    "learnset": [
      {
        "level": 1,
        "move": "Peck"
      },
      {
        "level": 7,
        "move": "Fury Cutter"
      },
      {
        "level": 15,
        "move": "Aerial Ace"
      },
      {
        "level": 23,
        "move": "Slash"
      },
      {
        "level": 32,
        "move": "Leaf Blade"
      },
      {
        "level": 42,
        "move": "Brave Bird"
      }
    ]
  },
  {
    "id": 84,
    "name": "Doduo",
    "types": [
      "Normal",
      "Flying"
    ],
    "hp": 35,
    "atk": 85,
    "def": 45,
    "spa": 35,
    "spd": 35,
    "spe": 75,
    "evolutions": [
      {
        "to": 85,
        "level": 32
      }
    ],
    "learnset": [
      {
        "level": 1,
        "move": "Peck"
      },
      {
        "level": 8,
        "move": "Quick Attack"
      },
      {
        "level": 15,
        "move": "Fury Attack"
      },
      {
        "level": 23,
        "move": "Pluck"
      },
      {
        "level": 30,
        "move": "Drill Peck"
      },
      {
        "level": 38,
        "move": "Jump Kick"
      }
    ]
  },
  {
    "id": 85,
    "name": "Dodrio",
    "types": [
      "Normal",
      "Flying"
    ],
    "hp": 60,
    "atk": 110,
    "def": 70,
    "spa": 60,
    "spd": 60,
    "spe": 110,
    "evolutions": [],
    "learnset": [
      {
        "level": 1,
        "move": "Peck"
      },
      {
        "level": 1,
        "move": "Quick Attack"
      },
      {
        "level": 15,
        "move": "Fury Attack"
      },
      {
        "level": 23,
        "move": "Pluck"
      },
      {
        "level": 30,
        "move": "Tri Attack"
      },
      {
        "level": 35,
        "move": "Drill Peck"
      },
      {
        "level": 45,
        "move": "Jump Kick"
      },
      {
        "level": 60,
        "move": "Thrash"
      }
    ]
  },
  {
    "id": 86,
    "name": "Seel",
    "types": [
      "Water"
    ],
    "hp": 65,
    "atk": 45,
    "def": 55,
    "spa": 45,
    "spd": 70,
    "spe": 45,
    "evolutions": [
      {
        "to": 87,
        "level": 36
      }
    ],
    "learnset": [
      {
        "level": 1,
        "move": "Headbutt"
      },
      {
        "level": 7,
        "move": "Water Gun"
      },
      {
        "level": 14,
        "move": "Icy Wind"
      },
      {
        "level": 21,
        "move": "Aurora Beam"
      },
      {
        "level": 30,
        "move": "Aqua Tail"
      },
      {
        "level": 40,
        "move": "Ice Beam"
      },
      {
        "level": 50,
        "move": "Blizzard"
      }
    ]
  },
  {
    "id": 87,
    "name": "Dewgong",
    "types": [
      "Water",
      "Ice"
    ],
    "hp": 90,
    "atk": 70,
    "def": 80,
    "spa": 70,
    "spd": 95,
    "spe": 70,
    "evolutions": [],
    "learnset": [
      {
        "level": 1,
        "move": "Headbutt"
      },
      {
        "level": 1,
        "move": "Water Gun"
      },
      {
        "level": 14,
        "move": "Icy Wind"
      },
      {
        "level": 21,
        "move": "Aurora Beam"
      },
      {
        "level": 30,
        "move": "Aqua Tail"
      },
      {
        "level": 34,
        "move": "Sheer Cold"
      },
      {
        "level": 44,
        "move": "Ice Beam"
      },
      {
        "level": 56,
        "move": "Blizzard"
      }
    ]
  },
  {
    "id": 88,
    "name": "Grimer",
    "types": [
      "Poison"
    ],
    "hp": 80,
    "atk": 80,
    "def": 50,
    "spa": 40,
    "spd": 50,
    "spe": 25,
    "evolutions": [
      {
        "to": 89,
        "level": 38
      }
    ],
    "learnset": [
      {
        "level": 1,
        "move": "Pound"
      },
      {
        "level": 6,
        "move": "Poison Gas"
      },
      {
        "level": 12,
        "move": "Mud-Slap"
      },
      {
        "level": 18,
        "move": "Sludge"
      },
      {
        "level": 26,
        "move": "Mud Bomb"
      },
      {
        "level": 34,
        "move": "Sludge Bomb"
      },
      {
        "level": 44,
        "move": "Gunk Shot"
      }
    ]
  },
  {
    "id": 89,
    "name": "Muk",
    "types": [
      "Poison"
    ],
    "hp": 105,
    "atk": 105,
    "def": 75,
    "spa": 65,
    "spd": 100,
    "spe": 50,
    "evolutions": [],
    "learnset": [
      {
        "level": 1,
        "move": "Pound"
      },
      {
        "level": 1,
        "move": "Mud-Slap"
      },
      {
        "level": 18,
        "move": "Sludge"
      },
      {
        "level": 26,
        "move": "Mud Bomb"
      },
      {
        "level": 34,
        "move": "Sludge Bomb"
      },
      {
        "level": 40,
        "move": "Sludge Wave"
      },
      {
        "level": 52,
        "move": "Gunk Shot"
      }
    ]
  },
  {
    "id": 90,
    "name": "Shellder",
    "types": [
      "Water"
    ],
    "hp": 30,
    "atk": 65,
    "def": 100,
    "spa": 45,
    "spd": 25,
    "spe": 40,
    "evolutions": [
      {
        "to": 91,
        "level": 34
      }
    ],
    "learnset": [
      {
        "level": 1,
        "move": "Tackle"
      },
      {
        "level": 8,
        "move": "Water Gun"
      },
      {
        "level": 16,
        "move": "Icicle Spear"
      },
      {
        "level": 24,
        "move": "Aurora Beam"
      },
      {
        "level": 34,
        "move": "Razor Shell"
      },
      {
        "level": 44,
        "move": "Hydro Pump"
      }
    ]
  },
  {
    "id": 91,
    "name": "Cloyster",
    "types": [
      "Water",
      "Ice"
    ],
    "hp": 50,
    "atk": 95,
    "def": 180,
    "spa": 85,
    "spd": 45,
    "spe": 70,
    "evolutions": [],
    "learnset": [
      {
        "level": 1,
        "move": "Tackle"
      },
      {
        "level": 1,
        "move": "Water Gun"
      },
      {
        "level": 16,
        "move": "Icicle Spear"
      },
      {
        "level": 24,
        "move": "Aurora Beam"
      },
      {
        "level": 36,
        "move": "Spike Cannon"
      },
      {
        "level": 48,
        "move": "Razor Shell"
      },
      {
        "level": 60,
        "move": "Ice Beam"
      },
      {
        "level": 75,
        "move": "Hydro Pump"
      }
    ]
  },
  {
    "id": 92,
    "name": "Gastly",
    "types": [
      "Ghost",
      "Poison"
    ],
    "hp": 30,
    "atk": 35,
    "def": 30,
    "spa": 100,
    "spd": 35,
    "spe": 80,
    "evolutions": [
      {
        "to": 93,
        "level": 25
      }
    ],
    "learnset": [
      {
        "level": 1,
        "move": "Lick"
      },
      {
        "level": 8,
        "move": "Smog"
      },
      {
        "level": 15,
        "move": "Night Shade"
      },
      {
        "level": 24,
        "move": "Shadow Ball"
      },
      {
        "level": 34,
        "move": "Dark Pulse"
      },
      {
        "level": 45,
        "move": "Hex"
      }
    ]
  },
  {
    "id": 93,
    "name": "Haunter",
    "types": [
      "Ghost",
      "Poison"
    ],
    "hp": 45,
    "atk": 50,
    "def": 45,
    "spa": 115,
    "spd": 55,
    "spe": 95,
    "evolutions": [
      {
        "to": 94,
        "level": 42
      }
    ],
    "learnset": [
      {
        "level": 1,
        "move": "Lick"
      },
      {
        "level": 1,
        "move": "Smog"
      },
      {
        "level": 15,
        "move": "Night Shade"
      },
      {
        "level": 24,
        "move": "Shadow Ball"
      },
      {
        "level": 30,
        "move": "Shadow Punch"
      },
      {
        "level": 38,
        "move": "Dark Pulse"
      },
      {
        "level": 50,
        "move": "Sludge Bomb"
      }
    ]
  },
  {
    "id": 94,
    "name": "Gengar",
    "types": [
      "Ghost",
      "Poison"
    ],
    "hp": 60,
    "atk": 65,
    "def": 60,
    "spa": 130,
    "spd": 75,
    "spe": 110,
    "evolutions": [],
    "learnset": [
      {
        "level": 1,
        "move": "Lick"
      },
      {
        "level": 1,
        "move": "Smog"
      },
      {
        "level": 15,
        "move": "Night Shade"
      },
      {
        "level": 24,
        "move": "Shadow Ball"
      },
      {
        "level": 30,
        "move": "Shadow Punch"
      },
      {
        "level": 38,
        "move": "Dark Pulse"
      },
      {
        "level": 50,
        "move": "Sludge Bomb"
      },
      {
        "level": 68,
        "move": "Focus Blast"
      }
    ]
  },
  {
    "id": 95,
    "name": "Onix",
    "types": [
      "Rock",
      "Ground"
    ],
    "hp": 35,
    "atk": 45,
    "def": 160,
    "spa": 30,
    "spd": 45,
    "spe": 70,
    "evolutions": [],
    "learnset": [
      {
        "level": 1,
        "move": "Tackle"
      },
      {
        "level": 7,
        "move": "Rock Throw"
      },
      {
        "level": 15,
        "move": "Rock Tomb"
      },
      {
        "level": 22,
        "move": "Slam"
      },
      {
        "level": 30,
        "move": "Rock Slide"
      },
      {
        "level": 40,
        "move": "Iron Tail"
      },
      {
        "level": 52,
        "move": "Earthquake"
      }
    ]
  },
  {
    "id": 96,
    "name": "Drowzee",
    "types": [
      "Psychic"
    ],
    "hp": 60,
    "atk": 48,
    "def": 45,
    "spa": 43,
    "spd": 90,
    "spe": 42,
    "evolutions": [
      {
        "to": 97,
        "level": 28
      }
    ],
    "learnset": [
      {
        "level": 1,
        "move": "Pound"
      },
      {
        "level": 7,
        "move": "Confusion"
      },
      {
        "level": 15,
        "move": "Headbutt"
      },
      {
        "level": 23,
        "move": "Psybeam"
      },
      {
        "level": 32,
        "move": "Zen Headbutt"
      },
      {
        "level": 42,
        "move": "Psychic"
      },
      {
        "level": 52,
        "move": "Future Sight"
      }
    ]
  },
  {
    "id": 97,
    "name": "Hypno",
    "types": [
      "Psychic"
    ],
    "hp": 85,
    "atk": 73,
    "def": 70,
    "spa": 73,
    "spd": 115,
    "spe": 67,
    "evolutions": [],
    "learnset": [
      {
        "level": 1,
        "move": "Pound"
      },
      {
        "level": 1,
        "move": "Confusion"
      },
      {
        "level": 15,
        "move": "Headbutt"
      },
      {
        "level": 23,
        "move": "Psybeam"
      },
      {
        "level": 26,
        "move": "Headbutt"
      },
      {
        "level": 34,
        "move": "Zen Headbutt"
      },
      {
        "level": 45,
        "move": "Psychic"
      },
      {
        "level": 58,
        "move": "Future Sight"
      }
    ]
  },
  {
    "id": 98,
    "name": "Krabby",
    "types": [
      "Water"
    ],
    "hp": 30,
    "atk": 105,
    "def": 90,
    "spa": 25,
    "spd": 25,
    "spe": 50,
    "evolutions": [
      {
        "to": 99,
        "level": 30
      }
    ],
    "learnset": [
      {
        "level": 1,
        "move": "Bubble"
      },
      {
        "level": 7,
        "move": "Vice Grip"
      },
      {
        "level": 15,
        "move": "Mud Shot"
      },
      {
        "level": 23,
        "move": "Bubble Beam"
      },
      {
        "level": 30,
        "move": "Stomp"
      },
      {
        "level": 38,
        "move": "Crabhammer"
      }
    ]
  },
  {
    "id": 99,
    "name": "Kingler",
    "types": [
      "Water"
    ],
    "hp": 55,
    "atk": 130,
    "def": 115,
    "spa": 50,
    "spd": 50,
    "spe": 75,
    "evolutions": [],
    "learnset": [
      {
        "level": 1,
        "move": "Bubble"
      },
      {
        "level": 1,
        "move": "Vice Grip"
      },
      {
        "level": 15,
        "move": "Mud Shot"
      },
      {
        "level": 23,
        "move": "Bubble Beam"
      },
      {
        "level": 28,
        "move": "Metal Claw"
      },
      {
        "level": 36,
        "move": "Stomp"
      },
      {
        "level": 46,
        "move": "Crabhammer"
      },
      {
        "level": 60,
        "move": "Hyper Beam"
      }
    ]
  },
  {
    "id": 100,
    "name": "Voltorb",
    "types": [
      "Electric"
    ],
    "hp": 40,
    "atk": 30,
    "def": 50,
    "spa": 55,
    "spd": 55,
    "spe": 100,
    "evolutions": [
      {
        "to": 101,
        "level": 32
      }
    ],
    "learnset": [
      {
        "level": 1,
        "move": "Tackle"
      },
      {
        "level": 6,
        "move": "Spark"
      },
      {
        "level": 12,
        "move": "Rollout"
      },
      {
        "level": 20,
        "move": "Swift"
      },
      {
        "level": 28,
        "move": "Discharge"
      },
      {
        "level": 36,
        "move": "Thunderbolt"
      },
      {
        "level": 46,
        "move": "Explosion"
      }
    ]
  },
  {
    "id": 101,
    "name": "Electrode",
    "types": [
      "Electric"
    ],
    "hp": 60,
    "atk": 50,
    "def": 70,
    "spa": 80,
    "spd": 80,
    "spe": 150,
    "evolutions": [],
    "learnset": [
      {
        "level": 1,
        "move": "Tackle"
      },
      {
        "level": 1,
        "move": "Spark"
      },
      {
        "level": 12,
        "move": "Rollout"
      },
      {
        "level": 20,
        "move": "Swift"
      },
      {
        "level": 28,
        "move": "Discharge"
      },
      {
        "level": 38,
        "move": "Thunderbolt"
      },
      {
        "level": 50,
        "move": "Explosion"
      }
    ]
  },
  {
    "id": 102,
    "name": "Exeggcute",
    "types": [
      "Grass",
      "Psychic"
    ],
    "hp": 60,
    "atk": 40,
    "def": 80,
    "spa": 60,
    "spd": 45,
    "spe": 40,
    "evolutions": [
      {
        "to": 103,
        "level": 34
      }
    ],
    "learnset": [
      {
        "level": 1,
        "move": "Barrage"
      },
      {
        "level": 7,
        "move": "Confusion"
      },
      {
        "level": 16,
        "move": "Bullet Seed"
      },
      {
        "level": 25,
        "move": "Mega Drain"
      },
      {
        "level": 35,
        "move": "Extra Sensory"
      },
      {
        "level": 45,
        "move": "Solar Beam"
      }
    ]
  },
  {
    "id": 103,
    "name": "Exeggutor",
    "types": [
      "Grass",
      "Psychic"
    ],
    "hp": 95,
    "atk": 95,
    "def": 85,
    "spa": 125,
    "spd": 75,
    "spe": 55,
    "evolutions": [],
    "learnset": [
      {
        "level": 1,
        "move": "Barrage"
      },
      {
        "level": 1,
        "move": "Confusion"
      },
      {
        "level": 16,
        "move": "Bullet Seed"
      },
      {
        "level": 25,
        "move": "Stomp"
      },
      {
        "level": 35,
        "move": "Extra Sensory"
      },
      {
        "level": 48,
        "move": "Wood Hammer"
      },
      {
        "level": 62,
        "move": "Psychic"
      },
      {
        "level": 76,
        "move": "Solar Beam"
      }
    ]
  },
  {
    "id": 104,
    "name": "Cubone",
    "types": [
      "Ground"
    ],
    "hp": 50,
    "atk": 50,
    "def": 95,
    "spa": 40,
    "spd": 50,
    "spe": 35,
    "evolutions": [
      {
        "to": 105,
        "level": 30
      }
    ],
    "learnset": [
      {
        "level": 1,
        "move": "Growl"
      },
      {
        "level": 1,
        "move": "Bone Club"
      },
      {
        "level": 7,
        "move": "Headbutt"
      },
      {
        "level": 15,
        "move": "Bonemerang"
      },
      {
        "level": 24,
        "move": "Thrash"
      },
      {
        "level": 34,
        "move": "Bone Rush"
      },
      {
        "level": 45,
        "move": "Double-Edge"
      }
    ]
  },
  {
    "id": 105,
    "name": "Marowak",
    "types": [
      "Ground"
    ],
    "hp": 60,
    "atk": 80,
    "def": 110,
    "spa": 50,
    "spd": 80,
    "spe": 45,
    "evolutions": [],
    "learnset": [
      {
        "level": 1,
        "move": "Bone Club"
      },
      {
        "level": 7,
        "move": "Headbutt"
      },
      {
        "level": 15,
        "move": "Bonemerang"
      },
      {
        "level": 24,
        "move": "Thrash"
      },
      {
        "level": 30,
        "move": "Bone Rush"
      },
      {
        "level": 40,
        "move": "Earthquake"
      },
      {
        "level": 52,
        "move": "Double-Edge"
      }
    ]
  },
  {
    "id": 106,
    "name": "Hitmonlee",
    "types": [
      "Fighting"
    ],
    "hp": 50,
    "atk": 120,
    "def": 53,
    "spa": 35,
    "spd": 110,
    "spe": 87,
    "evolutions": [],
    "learnset": [
      {
        "level": 1,
        "move": "Tackle"
      },
      {
        "level": 1,
        "move": "Double Kick"
      },
      {
        "level": 15,
        "move": "Rolling Kick"
      },
      {
        "level": 25,
        "move": "Jump Kick"
      },
      {
        "level": 35,
        "move": "Mega Kick"
      },
      {
        "level": 48,
        "move": "High Jump Kick"
      },
      {
        "level": 62,
        "move": "Close Combat"
      }
    ]
  },
  {
    "id": 107,
    "name": "Hitmonchan",
    "types": [
      "Fighting"
    ],
    "hp": 50,
    "atk": 105,
    "def": 79,
    "spa": 35,
    "spd": 110,
    "spe": 76,
    "evolutions": [],
    "learnset": [
      {
        "level": 1,
        "move": "Tackle"
      },
      {
        "level": 1,
        "move": "Comet Punch"
      },
      {
        "level": 15,
        "move": "Mach Punch"
      },
      {
        "level": 25,
        "move": "Fire Punch"
      },
      {
        "level": 25,
        "move": "Ice Punch"
      },
      {
        "level": 25,
        "move": "Thunder Punch"
      },
      {
        "level": 40,
        "move": "Mega Punch"
      },
      {
        "level": 55,
        "move": "Drain Punch"
      },
      {
        "level": 70,
        "move": "Close Combat"
      }
    ]
  },
  {
    "id": 108,
    "name": "Lickitung",
    "types": [
      "Normal"
    ],
    "hp": 90,
    "atk": 55,
    "def": 75,
    "spa": 60,
    "spd": 75,
    "spe": 30,
    "evolutions": [],
    "learnset": [
      {
        "level": 1,
        "move": "Lick"
      },
      {
        "level": 7,
        "move": "Wrap"
      },
      {
        "level": 15,
        "move": "Stomp"
      },
      {
        "level": 23,
        "move": "Rollout"
      },
      {
        "level": 32,
        "move": "Slam"
      },
      {
        "level": 42,
        "move": "Body Slam"
      },
      {
        "level": 54,
        "move": "Power Whip"
      }
    ]
  },
  {
    "id": 109,
    "name": "Koffing",
    "types": [
      "Poison"
    ],
    "hp": 40,
    "atk": 65,
    "def": 95,
    "spa": 60,
    "spd": 45,
    "spe": 35,
    "evolutions": [
      {
        "to": 110,
        "level": 36
      }
    ],
    "learnset": [
      {
        "level": 1,
        "move": "Tackle"
      },
      {
        "level": 6,
        "move": "Smog"
      },
      {
        "level": 14,
        "move": "Sludge"
      },
      {
        "level": 22,
        "move": "Clear Smog"
      },
      {
        "level": 30,
        "move": "Sludge Bomb"
      },
      {
        "level": 40,
        "move": "Self-Destruct"
      }
    ]
  },
  {
    "id": 110,
    "name": "Weezing",
    "types": [
      "Poison"
    ],
    "hp": 65,
    "atk": 90,
    "def": 120,
    "spa": 85,
    "spd": 70,
    "spe": 60,
    "evolutions": [],
    "learnset": [
      {
        "level": 1,
        "move": "Tackle"
      },
      {
        "level": 1,
        "move": "Smog"
      },
      {
        "level": 14,
        "move": "Sludge"
      },
      {
        "level": 22,
        "move": "Clear Smog"
      },
      {
        "level": 30,
        "move": "Sludge Bomb"
      },
      {
        "level": 35,
        "move": "Double Hit"
      },
      {
        "level": 45,
        "move": "Sludge Wave"
      },
      {
        "level": 58,
        "move": "Explosion"
      }
    ]
  },
  {
    "id": 111,
    "name": "Rhyhorn",
    "types": [
      "Ground",
      "Rock"
    ],
    "hp": 80,
    "atk": 85,
    "def": 95,
    "spa": 30,
    "spd": 30,
    "spe": 25,
    "evolutions": [
      {
        "to": 112,
        "level": 45
      }
    ],
    "learnset": [
      {
        "level": 1,
        "move": "Tackle"
      },
      {
        "level": 8,
        "move": "Horn Attack"
      },
      {
        "level": 16,
        "move": "Stomp"
      },
      {
        "level": 24,
        "move": "Rock Slide"
      },
      {
        "level": 32,
        "move": "Drill Run"
      },
      {
        "level": 42,
        "move": "Earthquake"
      },
      {
        "level": 52,
        "move": "Megahorn"
      }
    ]
  },
  {
    "id": 112,
    "name": "Rhydon",
    "types": [
      "Ground",
      "Rock"
    ],
    "hp": 105,
    "atk": 130,
    "def": 120,
    "spa": 45,
    "spd": 45,
    "spe": 40,
    "evolutions": [],
    "learnset": [
      {
        "level": 1,
        "move": "Tackle"
      },
      {
        "level": 1,
        "move": "Horn Attack"
      },
      {
        "level": 16,
        "move": "Stomp"
      },
      {
        "level": 24,
        "move": "Rock Slide"
      },
      {
        "level": 32,
        "move": "Drill Run"
      },
      {
        "level": 42,
        "move": "Earthquake"
      },
      {
        "level": 50,
        "move": "Hammer Arm"
      },
      {
        "level": 62,
        "move": "Megahorn"
      },
      {
        "level": 75,
        "move": "Stone Edge"
      }
    ]
  },
  {
    "id": 113,
    "name": "Chansey",
    "types": [
      "Normal"
    ],
    "hp": 250,
    "atk": 5,
    "def": 5,
    "spa": 35,
    "spd": 105,
    "spe": 50,
    "evolutions": [],
    "learnset": [
      {
        "level": 1,
        "move": "Pound"
      },
      {
        "level": 9,
        "move": "Double Slap"
      },
      {
        "level": 18,
        "move": "Disarming Voice"
      },
      {
        "level": 28,
        "move": "Take Down"
      },
      {
        "level": 40,
        "move": "Hyper Voice"
      },
      {
        "level": 55,
        "move": "Egg Bomb"
      },
      {
        "level": 70,
        "move": "Double-Edge"
      }
    ]
  },
  {
    "id": 114,
    "name": "Tangela",
    "types": [
      "Grass"
    ],
    "hp": 65,
    "atk": 55,
    "def": 115,
    "spa": 100,
    "spd": 40,
    "spe": 60,
    "evolutions": [],
    "learnset": [
      {
        "level": 1,
        "move": "Absorb"
      },
      {
        "level": 7,
        "move": "Vine Whip"
      },
      {
        "level": 15,
        "move": "Mega Drain"
      },
      {
        "level": 24,
        "move": "Ancient Power"
      },
      {
        "level": 34,
        "move": "Giga Drain"
      },
      {
        "level": 45,
        "move": "Slam"
      },
      {
        "level": 58,
        "move": "Power Whip"
      }
    ]
  },
  {
    "id": 115,
    "name": "Kangaskhan",
    "types": [
      "Normal"
    ],
    "hp": 105,
    "atk": 95,
    "def": 80,
    "spa": 40,
    "spd": 80,
    "spe": 90,
    "evolutions": [],
    "learnset": [
      {
        "level": 1,
        "move": "Comet Punch"
      },
      {
        "level": 7,
        "move": "Bite"
      },
      {
        "level": 16,
        "move": "Fake Out"
      },
      {
        "level": 25,
        "move": "Mega Punch"
      },
      {
        "level": 35,
        "move": "Crunch"
      },
      {
        "level": 46,
        "move": "Dizzy Punch"
      },
      {
        "level": 60,
        "move": "Outrage"
      }
    ]
  },
  {
    "id": 116,
    "name": "Horsea",
    "types": [
      "Water"
    ],
    "hp": 30,
    "atk": 40,
    "def": 70,
    "spa": 70,
    "spd": 25,
    "spe": 60,
    "evolutions": [
      {
        "to": 117,
        "level": 34
      }
    ],
    "learnset": [
      {
        "level": 1,
        "move": "Water Gun"
      },
      {
        "level": 8,
        "move": "Bubble Beam"
      },
      {
        "level": 16,
        "move": "Twister"
      },
      {
        "level": 24,
        "move": "Water Pulse"
      },
      {
        "level": 34,
        "move": "Hydro Pump"
      },
      {
        "level": 45,
        "move": "Dragon Pulse"
      }
    ]
  },
  {
    "id": 117,
    "name": "Seadra",
    "types": [
      "Water"
    ],
    "hp": 55,
    "atk": 65,
    "def": 95,
    "spa": 95,
    "spd": 45,
    "spe": 85,
    "evolutions": [],
    "learnset": [
      {
        "level": 1,
        "move": "Water Gun"
      },
      {
        "level": 1,
        "move": "Bubble Beam"
      },
      {
        "level": 16,
        "move": "Twister"
      },
      {
        "level": 24,
        "move": "Water Pulse"
      },
      {
        "level": 32,
        "move": "Waterfall"
      },
      {
        "level": 40,
        "move": "Hydro Pump"
      },
      {
        "level": 52,
        "move": "Dragon Pulse"
      }
    ]
  },
  {
    "id": 118,
    "name": "Goldeen",
    "types": [
      "Water"
    ],
    "hp": 45,
    "atk": 67,
    "def": 60,
    "spa": 35,
    "spd": 50,
    "spe": 63,
    "evolutions": [
      {
        "to": 119,
        "level": 34
      }
    ],
    "learnset": [
      {
        "level": 1,
        "move": "Peck"
      },
      {
        "level": 7,
        "move": "Water Gun"
      },
      {
        "level": 14,
        "move": "Horn Attack"
      },
      {
        "level": 22,
        "move": "Water Pulse"
      },
      {
        "level": 30,
        "move": "Aqua Tail"
      },
      {
        "level": 40,
        "move": "Waterfall"
      },
      {
        "level": 50,
        "move": "Megahorn"
      }
    ]
  },
  {
    "id": 119,
    "name": "Seaking",
    "types": [
      "Water"
    ],
    "hp": 80,
    "atk": 92,
    "def": 65,
    "spa": 65,
    "spd": 80,
    "spe": 68,
    "evolutions": [],
    "learnset": [
      {
        "level": 1,
        "move": "Peck"
      },
      {
        "level": 1,
        "move": "Water Gun"
      },
      {
        "level": 14,
        "move": "Horn Attack"
      },
      {
        "level": 22,
        "move": "Water Pulse"
      },
      {
        "level": 30,
        "move": "Aqua Tail"
      },
      {
        "level": 33,
        "move": "Poison Jab"
      },
      {
        "level": 44,
        "move": "Waterfall"
      },
      {
        "level": 58,
        "move": "Megahorn"
      }
    ]
  },
  {
    "id": 120,
    "name": "Staryu",
    "types": [
      "Water"
    ],
    "hp": 30,
    "atk": 45,
    "def": 55,
    "spa": 70,
    "spd": 55,
    "spe": 85,
    "evolutions": [
      {
        "to": 121,
        "level": 34
      }
    ],
    "learnset": [
      {
        "level": 1,
        "move": "Tackle"
      },
      {
        "level": 6,
        "move": "Water Gun"
      },
      {
        "level": 13,
        "move": "Swift"
      },
      {
        "level": 21,
        "move": "Bubble Beam"
      },
      {
        "level": 29,
        "move": "Power Gem"
      },
      {
        "level": 38,
        "move": "Psychic"
      },
      {
        "level": 48,
        "move": "Hydro Pump"
      }
    ]
  },
  {
    "id": 121,
    "name": "Starmie",
    "types": [
      "Water",
      "Psychic"
    ],
    "hp": 60,
    "atk": 75,
    "def": 85,
    "spa": 100,
    "spd": 85,
    "spe": 115,
    "evolutions": [],
    "learnset": [
      {
        "level": 1,
        "move": "Tackle"
      },
      {
        "level": 1,
        "move": "Water Gun"
      },
      {
        "level": 13,
        "move": "Swift"
      },
      {
        "level": 21,
        "move": "Bubble Beam"
      },
      {
        "level": 29,
        "move": "Power Gem"
      },
      {
        "level": 38,
        "move": "Psychic"
      },
      {
        "level": 50,
        "move": "Hydro Pump"
      },
      {
        "level": 65,
        "move": "Thunderbolt"
      },
      {
        "level": 78,
        "move": "Ice Beam"
      }
    ]
  },
  {
    "id": 122,
    "name": "Mr. Mime",
    "types": [
      "Psychic",
      "Fairy"
    ],
    "hp": 40,
    "atk": 45,
    "def": 65,
    "spa": 100,
    "spd": 120,
    "spe": 90,
    "evolutions": [],
    "learnset": [
      {
        "level": 1,
        "move": "Confusion"
      },
      {
        "level": 8,
        "move": "Psybeam"
      },
      {
        "level": 16,
        "move": "Double Slap"
      },
      {
        "level": 26,
        "move": "Dazzling Gleam"
      },
      {
        "level": 36,
        "move": "Psychic"
      },
      {
        "level": 48,
        "move": "Shadow Ball"
      }
    ]
  },
  {
    "id": 123,
    "name": "Scyther",
    "types": [
      "Bug",
      "Flying"
    ],
    "hp": 70,
    "atk": 110,
    "def": 80,
    "spa": 55,
    "spd": 80,
    "spe": 105,
    "evolutions": [],
    "learnset": [
      {
        "level": 1,
        "move": "Quick Attack"
      },
      {
        "level": 7,
        "move": "Fury Cutter"
      },
      {
        "level": 15,
        "move": "Wing Attack"
      },
      {
        "level": 24,
        "move": "Slash"
      },
      {
        "level": 35,
        "move": "X-Scissor"
      },
      {
        "level": 46,
        "move": "Night Slash"
      },
      {
        "level": 60,
        "move": "Air Slash"
      }
    ]
  },
  {
    "id": 124,
    "name": "Jynx",
    "types": [
      "Ice",
      "Psychic"
    ],
    "hp": 65,
    "atk": 50,
    "def": 35,
    "spa": 115,
    "spd": 95,
    "spe": 95,
    "evolutions": [],
    "learnset": [
      {
        "level": 1,
        "move": "Pound"
      },
      {
        "level": 8,
        "move": "Powder Snow"
      },
      {
        "level": 15,
        "move": "Confusion"
      },
      {
        "level": 23,
        "move": "Ice Punch"
      },
      {
        "level": 32,
        "move": "Ice Beam"
      },
      {
        "level": 42,
        "move": "Psychic"
      },
      {
        "level": 55,
        "move": "Blizzard"
      }
    ]
  },
  {
    "id": 125,
    "name": "Electabuzz",
    "types": [
      "Electric"
    ],
    "hp": 65,
    "atk": 83,
    "def": 57,
    "spa": 95,
    "spd": 85,
    "spe": 105,
    "evolutions": [],
    "learnset": [
      {
        "level": 1,
        "move": "Quick Attack"
      },
      {
        "level": 8,
        "move": "Thundershock"
      },
      {
        "level": 16,
        "move": "Swift"
      },
      {
        "level": 25,
        "move": "Thunder Punch"
      },
      {
        "level": 36,
        "move": "Thunderbolt"
      },
      {
        "level": 48,
        "move": "Discharge"
      },
      {
        "level": 62,
        "move": "Thunder"
      }
    ]
  },
  {
    "id": 126,
    "name": "Magmar",
    "types": [
      "Fire"
    ],
    "hp": 65,
    "atk": 95,
    "def": 57,
    "spa": 100,
    "spd": 85,
    "spe": 93,
    "evolutions": [],
    "learnset": [
      {
        "level": 1,
        "move": "Smog"
      },
      {
        "level": 8,
        "move": "Ember"
      },
      {
        "level": 16,
        "move": "Flame Wheel"
      },
      {
        "level": 25,
        "move": "Fire Punch"
      },
      {
        "level": 36,
        "move": "Flamethrower"
      },
      {
        "level": 48,
        "move": "Lava Plume"
      },
      {
        "level": 62,
        "move": "Fire Blast"
      }
    ]
  },
  {
    "id": 127,
    "name": "Pinsir",
    "types": [
      "Bug"
    ],
    "hp": 65,
    "atk": 125,
    "def": 100,
    "spa": 55,
    "spd": 70,
    "spe": 85,
    "evolutions": [],
    "learnset": [
      {
        "level": 1,
        "move": "Vice Grip"
      },
      {
        "level": 8,
        "move": "Seismic Toss"
      },
      {
        "level": 16,
        "move": "Bug Bite"
      },
      {
        "level": 26,
        "move": "Brick Break"
      },
      {
        "level": 36,
        "move": "X-Scissor"
      },
      {
        "level": 48,
        "move": "Superpower"
      },
      {
        "level": 62,
        "move": "Guillotine"
      }
    ]
  },
  {
    "id": 128,
    "name": "Tauros",
    "types": [
      "Normal"
    ],
    "hp": 75,
    "atk": 100,
    "def": 95,
    "spa": 40,
    "spd": 70,
    "spe": 110,
    "evolutions": [],
    "learnset": [
      {
        "level": 1,
        "move": "Tackle"
      },
      {
        "level": 7,
        "move": "Horn Attack"
      },
      {
        "level": 15,
        "move": "Pursuit"
      },
      {
        "level": 24,
        "move": "Zen Headbutt"
      },
      {
        "level": 35,
        "move": "Take Down"
      },
      {
        "level": 48,
        "move": "Thrash"
      },
      {
        "level": 62,
        "move": "Outrage"
      }
    ]
  },
  {
    "id": 129,
    "name": "Magikarp",
    "types": [
      "Water"
    ],
    "hp": 20,
    "atk": 10,
    "def": 55,
    "spa": 15,
    "spd": 20,
    "spe": 80,
    "evolutions": [
      {
        "to": 130,
        "level": 20
      }
    ],
    "learnset": [
      {
        "level": 1,
        "move": "Tackle"
      },
      {
        "level": 15,
        "move": "Flail"
      },
      {
        "level": 25,
        "move": "Bounce"
      }
    ]
  },
  {
    "id": 130,
    "name": "Gyarados",
    "types": [
      "Water",
      "Flying"
    ],
    "hp": 95,
    "atk": 125,
    "def": 79,
    "spa": 60,
    "spd": 100,
    "spe": 81,
    "evolutions": [],
    "learnset": [
      {
        "level": 1,
        "move": "Tackle"
      },
      {
        "level": 20,
        "move": "Bite"
      },
      {
        "level": 27,
        "move": "Dragon Rage"
      },
      {
        "level": 35,
        "move": "Aqua Tail"
      },
      {
        "level": 44,
        "move": "Crunch"
      },
      {
        "level": 54,
        "move": "Hydro Pump"
      },
      {
        "level": 68,
        "move": "Hyper Beam"
      }
    ]
  },
  {
    "id": 131,
    "name": "Lapras",
    "types": [
      "Water",
      "Ice"
    ],
    "hp": 130,
    "atk": 85,
    "def": 80,
    "spa": 85,
    "spd": 95,
    "spe": 60,
    "evolutions": [],
    "learnset": [
      {
        "level": 1,
        "move": "Water Gun"
      },
      {
        "level": 7,
        "move": "Ice Shard"
      },
      {
        "level": 15,
        "move": "Water Pulse"
      },
      {
        "level": 24,
        "move": "Body Slam"
      },
      {
        "level": 35,
        "move": "Ice Beam"
      },
      {
        "level": 48,
        "move": "Surf"
      },
      {
        "level": 62,
        "move": "Hydro Pump"
      },
      {
        "level": 75,
        "move": "Blizzard"
      }
    ]
  },
  {
    "id": 132,
    "name": "Ditto",
    "types": [
      "Normal"
    ],
    "hp": 48,
    "atk": 48,
    "def": 48,
    "spa": 48,
    "spd": 48,
    "spe": 48,
    "evolutions": [],
    "learnset": [
      {
        "level": 1,
        "move": "Struggle"
      }
    ]
  },
  {
    "id": 133,
    "name": "Eevee",
    "types": [
      "Normal"
    ],
    "hp": 55,
    "atk": 55,
    "def": 50,
    "spa": 45,
    "spd": 65,
    "spe": 55,
    "evolutions": [
      {
        "to": 134,
        "level": 25
      },
      {
        "to": 135,
        "level": 25
      },
      {
        "to": 136,
        "level": 25
      }
    ],
    "learnset": [
      {
        "level": 1,
        "move": "Tackle"
      },
      {
        "level": 6,
        "move": "Quick Attack"
      },
      {
        "level": 14,
        "move": "Bite"
      },
      {
        "level": 22,
        "move": "Swift"
      },
      {
        "level": 30,
        "move": "Take Down"
      },
      {
        "level": 40,
        "move": "Double-Edge"
      }
    ]
  },
  {
    "id": 134,
    "name": "Vaporeon",
    "types": [
      "Water"
    ],
    "hp": 130,
    "atk": 65,
    "def": 60,
    "spa": 110,
    "spd": 95,
    "spe": 65,
    "evolutions": [],
    "learnset": [
      {
        "level": 1,
        "move": "Tackle"
      },
      {
        "level": 1,
        "move": "Quick Attack"
      },
      {
        "level": 14,
        "move": "Water Gun"
      },
      {
        "level": 22,
        "move": "Water Pulse"
      },
      {
        "level": 30,
        "move": "Aurora Beam"
      },
      {
        "level": 42,
        "move": "Muddy Water"
      },
      {
        "level": 55,
        "move": "Hydro Pump"
      }
    ]
  },
  {
    "id": 135,
    "name": "Jolteon",
    "types": [
      "Electric"
    ],
    "hp": 65,
    "atk": 65,
    "def": 60,
    "spa": 110,
    "spd": 95,
    "spe": 130,
    "evolutions": [],
    "learnset": [
      {
        "level": 1,
        "move": "Tackle"
      },
      {
        "level": 1,
        "move": "Quick Attack"
      },
      {
        "level": 14,
        "move": "Thundershock"
      },
      {
        "level": 22,
        "move": "Double Kick"
      },
      {
        "level": 30,
        "move": "Pin Missile"
      },
      {
        "level": 42,
        "move": "Thunderbolt"
      },
      {
        "level": 55,
        "move": "Thunder"
      }
    ]
  },
  {
    "id": 136,
    "name": "Flareon",
    "types": [
      "Fire"
    ],
    "hp": 65,
    "atk": 130,
    "def": 60,
    "spa": 95,
    "spd": 110,
    "spe": 65,
    "evolutions": [],
    "learnset": [
      {
        "level": 1,
        "move": "Tackle"
      },
      {
        "level": 1,
        "move": "Quick Attack"
      },
      {
        "level": 14,
        "move": "Ember"
      },
      {
        "level": 22,
        "move": "Fire Spin"
      },
      {
        "level": 30,
        "move": "Flame Charge"
      },
      {
        "level": 42,
        "move": "Flamethrower"
      },
      {
        "level": 55,
        "move": "Flare Blitz"
      }
    ]
  },
  {
    "id": 137,
    "name": "Porygon",
    "types": [
      "Normal"
    ],
    "hp": 65,
    "atk": 60,
    "def": 70,
    "spa": 85,
    "spd": 75,
    "spe": 40,
    "evolutions": [],
    "learnset": [
      {
        "level": 1,
        "move": "Tackle"
      },
      {
        "level": 9,
        "move": "Psybeam"
      },
      {
        "level": 18,
        "move": "Signal Beam"
      },
      {
        "level": 28,
        "move": "Discharge"
      },
      {
        "level": 38,
        "move": "Tri Attack"
      },
      {
        "level": 50,
        "move": "Zap Cannon"
      }
    ]
  },
  {
    "id": 138,
    "name": "Omanyte",
    "types": [
      "Rock",
      "Water"
    ],
    "hp": 35,
    "atk": 40,
    "def": 100,
    "spa": 90,
    "spd": 55,
    "spe": 35,
    "evolutions": [
      {
        "to": 139,
        "level": 42
      }
    ],
    "learnset": [
      {
        "level": 1,
        "move": "Constrict"
      },
      {
        "level": 7,
        "move": "Water Gun"
      },
      {
        "level": 15,
        "move": "Rollout"
      },
      {
        "level": 23,
        "move": "Ancient Power"
      },
      {
        "level": 32,
        "move": "Muddy Water"
      },
      {
        "level": 42,
        "move": "Rock Slide"
      },
      {
        "level": 52,
        "move": "Hydro Pump"
      }
    ]
  },
  {
    "id": 139,
    "name": "Omastar",
    "types": [
      "Rock",
      "Water"
    ],
    "hp": 70,
    "atk": 60,
    "def": 125,
    "spa": 115,
    "spd": 70,
    "spe": 55,
    "evolutions": [],
    "learnset": [
      {
        "level": 1,
        "move": "Constrict"
      },
      {
        "level": 1,
        "move": "Water Gun"
      },
      {
        "level": 15,
        "move": "Rollout"
      },
      {
        "level": 23,
        "move": "Ancient Power"
      },
      {
        "level": 32,
        "move": "Muddy Water"
      },
      {
        "level": 40,
        "move": "Spike Cannon"
      },
      {
        "level": 50,
        "move": "Hydro Pump"
      },
      {
        "level": 65,
        "move": "Stone Edge"
      }
    ]
  },
  {
    "id": 140,
    "name": "Kabuto",
    "types": [
      "Rock",
      "Water"
    ],
    "hp": 30,
    "atk": 80,
    "def": 90,
    "spa": 55,
    "spd": 45,
    "spe": 55,
    "evolutions": [
      {
        "to": 141,
        "level": 42
      }
    ],
    "learnset": [
      {
        "level": 1,
        "move": "Scratch"
      },
      {
        "level": 7,
        "move": "Absorb"
      },
      {
        "level": 15,
        "move": "Aqua Jet"
      },
      {
        "level": 23,
        "move": "Ancient Power"
      },
      {
        "level": 32,
        "move": "Rock Slide"
      },
      {
        "level": 42,
        "move": "Leech Life"
      },
      {
        "level": 52,
        "move": "Waterfall"
      }
    ]
  },
  {
    "id": 141,
    "name": "Kabutops",
    "types": [
      "Rock",
      "Water"
    ],
    "hp": 60,
    "atk": 115,
    "def": 105,
    "spa": 65,
    "spd": 70,
    "spe": 80,
    "evolutions": [],
    "learnset": [
      {
        "level": 1,
        "move": "Scratch"
      },
      {
        "level": 1,
        "move": "Absorb"
      },
      {
        "level": 15,
        "move": "Aqua Jet"
      },
      {
        "level": 23,
        "move": "Ancient Power"
      },
      {
        "level": 32,
        "move": "Rock Slide"
      },
      {
        "level": 40,
        "move": "Slash"
      },
      {
        "level": 50,
        "move": "Night Slash"
      },
      {
        "level": 62,
        "move": "Stone Edge"
      },
      {
        "level": 76,
        "move": "Waterfall"
      }
    ]
  },
  {
    "id": 142,
    "name": "Aerodactyl",
    "types": [
      "Rock",
      "Flying"
    ],
    "hp": 80,
    "atk": 105,
    "def": 65,
    "spa": 60,
    "spd": 75,
    "spe": 130,
    "evolutions": [],
    "learnset": [
      {
        "level": 1,
        "move": "Bite"
      },
      {
        "level": 9,
        "move": "Ancient Power"
      },
      {
        "level": 18,
        "move": "Wing Attack"
      },
      {
        "level": 28,
        "move": "Rock Slide"
      },
      {
        "level": 38,
        "move": "Crunch"
      },
      {
        "level": 50,
        "move": "Iron Head"
      },
      {
        "level": 64,
        "move": "Stone Edge"
      },
      {
        "level": 78,
        "move": "Hyper Beam"
      }
    ]
  },
  {
    "id": 143,
    "name": "Snorlax",
    "types": [
      "Normal"
    ],
    "hp": 160,
    "atk": 110,
    "def": 65,
    "spa": 65,
    "spd": 110,
    "spe": 30,
    "evolutions": [],
    "learnset": [
      {
        "level": 1,
        "move": "Tackle"
      },
      {
        "level": 8,
        "move": "Lick"
      },
      {
        "level": 17,
        "move": "Bite"
      },
      {
        "level": 26,
        "move": "Body Slam"
      },
      {
        "level": 36,
        "move": "Heavy Slam"
      },
      {
        "level": 48,
        "move": "Crunch"
      },
      {
        "level": 60,
        "move": "High Horsepower"
      },
      {
        "level": 75,
        "move": "Giga Impact"
      }
    ]
  },
  {
    "id": 144,
    "name": "Articuno",
    "types": [
      "Ice",
      "Flying"
    ],
    "hp": 90,
    "atk": 85,
    "def": 100,
    "spa": 95,
    "spd": 125,
    "spe": 85,
    "evolutions": [],
    "learnset": [
      {
        "level": 1,
        "move": "Gust"
      },
      {
        "level": 10,
        "move": "Powder Snow"
      },
      {
        "level": 25,
        "move": "Ancient Power"
      },
      {
        "level": 40,
        "move": "Ice Beam"
      },
      {
        "level": 55,
        "move": "Air Slash"
      },
      {
        "level": 70,
        "move": "Blizzard"
      },
      {
        "level": 80,
        "move": "Hurricane"
      }
    ]
  },
  {
    "id": 145,
    "name": "Zapdos",
    "types": [
      "Electric",
      "Flying"
    ],
    "hp": 90,
    "atk": 90,
    "def": 85,
    "spa": 125,
    "spd": 90,
    "spe": 100,
    "evolutions": [],
    "learnset": [
      {
        "level": 1,
        "move": "Peck"
      },
      {
        "level": 10,
        "move": "Thundershock"
      },
      {
        "level": 25,
        "move": "Ancient Power"
      },
      {
        "level": 40,
        "move": "Thunderbolt"
      },
      {
        "level": 55,
        "move": "Drill Peck"
      },
      {
        "level": 70,
        "move": "Thunder"
      },
      {
        "level": 80,
        "move": "Zap Cannon"
      }
    ]
  },
  {
    "id": 146,
    "name": "Moltres",
    "types": [
      "Fire",
      "Flying"
    ],
    "hp": 90,
    "atk": 100,
    "def": 90,
    "spa": 125,
    "spd": 85,
    "spe": 90,
    "evolutions": [],
    "learnset": [
      {
        "level": 1,
        "move": "Wing Attack"
      },
      {
        "level": 10,
        "move": "Ember"
      },
      {
        "level": 25,
        "move": "Ancient Power"
      },
      {
        "level": 40,
        "move": "Flamethrower"
      },
      {
        "level": 55,
        "move": "Air Slash"
      },
      {
        "level": 70,
        "move": "Fire Blast"
      },
      {
        "level": 80,
        "move": "Hurricane"
      }
    ]
  },
  {
    "id": 147,
    "name": "Dratini",
    "types": [
      "Dragon"
    ],
    "hp": 41,
    "atk": 64,
    "def": 45,
    "spa": 50,
    "spd": 50,
    "spe": 50,
    "evolutions": [
      {
        "to": 148,
        "level": 30
      }
    ],
    "learnset": [
      {
        "level": 1,
        "move": "Wrap"
      },
      {
        "level": 8,
        "move": "Thunder Wave"
      },
      {
        "level": 15,
        "move": "Twister"
      },
      {
        "level": 22,
        "move": "Dragon Rage"
      },
      {
        "level": 30,
        "move": "Slam"
      },
      {
        "level": 40,
        "move": "Aqua Tail"
      },
      {
        "level": 50,
        "move": "Dragon Pulse"
      }
    ]
  },
  {
    "id": 148,
    "name": "Dragonair",
    "types": [
      "Dragon"
    ],
    "hp": 61,
    "atk": 84,
    "def": 65,
    "spa": 70,
    "spd": 70,
    "spe": 70,
    "evolutions": [
      {
        "to": 149,
        "level": 60
      }
    ],
    "learnset": [
      {
        "level": 1,
        "move": "Wrap"
      },
      {
        "level": 15,
        "move": "Twister"
      },
      {
        "level": 22,
        "move": "Dragon Rage"
      },
      {
        "level": 30,
        "move": "Slam"
      },
      {
        "level": 42,
        "move": "Aqua Tail"
      },
      {
        "level": 54,
        "move": "Dragon Pulse"
      },
      {
        "level": 65,
        "move": "Outrage"
      }
    ]
  },
  {
    "id": 149,
    "name": "Dragonite",
    "types": [
      "Dragon",
      "Flying"
    ],
    "hp": 91,
    "atk": 134,
    "def": 95,
    "spa": 100,
    "spd": 100,
    "spe": 80,
    "evolutions": [],
    "learnset": [
      {
        "level": 1,
        "move": "Wrap"
      },
      {
        "level": 15,
        "move": "Twister"
      },
      {
        "level": 22,
        "move": "Dragon Rage"
      },
      {
        "level": 30,
        "move": "Wing Attack"
      },
      {
        "level": 42,
        "move": "Aqua Tail"
      },
      {
        "level": 55,
        "move": "Dragon Pulse"
      },
      {
        "level": 68,
        "move": "Outrage"
      },
      {
        "level": 78,
        "move": "Hyper Beam"
      }
    ]
  },
  {
    "id": 150,
    "name": "Mewtwo",
    "types": [
      "Psychic"
    ],
    "hp": 106,
    "atk": 110,
    "def": 90,
    "spa": 154,
    "spd": 90,
    "spe": 130,
    "evolutions": [],
    "learnset": [
      {
        "level": 1,
        "move": "Confusion"
      },
      {
        "level": 15,
        "move": "Swift"
      },
      {
        "level": 30,
        "move": "Psycho Cut"
      },
      {
        "level": 45,
        "move": "Aura Sphere"
      },
      {
        "level": 60,
        "move": "Psychic"
      },
      {
        "level": 72,
        "move": "Shadow Ball"
      },
      {
        "level": 80,
        "move": "Psystrike"
      }
    ]
  },
  {
    "id": 151,
    "name": "Mew",
    "types": [
      "Psychic"
    ],
    "hp": 100,
    "atk": 100,
    "def": 100,
    "spa": 100,
    "spd": 100,
    "spe": 100,
    "evolutions": [],
    "learnset": [
      {
        "level": 1,
        "move": "Pound"
      },
      {
        "level": 10,
        "move": "Mega Punch"
      },
      {
        "level": 20,
        "move": "Ancient Power"
      },
      {
        "level": 30,
        "move": "Metronome"
      },
      {
        "level": 40,
        "move": "Psychic"
      },
      {
        "level": 55,
        "move": "Aura Sphere"
      },
      {
        "level": 70,
        "move": "Dazzling Gleam"
      },
      {
        "level": 80,
        "move": "Solar Beam"
      }
    ]
  }
];
export default pokemonData;
