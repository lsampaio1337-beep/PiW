export const alolaRoutes = [
  {
    "name": "Route 1 East",
    "spawns": [
      {
        "pokemonId": 731,
        "minLevel": 2,
        "maxLevel": 7,
        "chance": 0.125
      },
      {
        "pokemonId": 734,
        "minLevel": 2,
        "maxLevel": 7,
        "chance": 0.125
      },
      {
        "pokemonId": 19,
        "minLevel": 2,
        "maxLevel": 7,
        "chance": 0.125
      },
      {
        "pokemonId": 165,
        "minLevel": 2,
        "maxLevel": 7,
        "chance": 0.125
      },
      {
        "pokemonId": 167,
        "minLevel": 2,
        "maxLevel": 7,
        "chance": 0.125
      },
      {
        "pokemonId": 736,
        "minLevel": 2,
        "maxLevel": 7,
        "chance": 0.125
      },
      {
        "pokemonId": 172,
        "minLevel": 2,
        "maxLevel": 7,
        "chance": 0.125
      },
      {
        "pokemonId": 25,
        "minLevel": 2,
        "maxLevel": 7,
        "chance": 0.125
      }
    ],
    "challengeName": "Challenge 1",
    "areaId": "Route 1 East",
    "unlocks": [
      "Route 1 Hau'oli Outskirts"
    ],
    "requirements": {
      "defeatCountRoute": {
        "route": "Route 1 East",
        "count": 15
      }
    }
  },
  {
    "name": "Route 1 Hau'oli Outskirts",
    "spawns": [
      {
        "pokemonId": 686,
        "minLevel": 4,
        "maxLevel": 9,
        "chance": 0.2
      },
      {
        "pokemonId": 79,
        "minLevel": 4,
        "maxLevel": 9,
        "chance": 0.2
      },
      {
        "pokemonId": 52,
        "minLevel": 4,
        "maxLevel": 9,
        "chance": 0.2
      },
      {
        "pokemonId": 72,
        "minLevel": 4,
        "maxLevel": 9,
        "chance": 0.2
      },
      {
        "pokemonId": 456,
        "minLevel": 4,
        "maxLevel": 9,
        "chance": 0.2
      }
    ],
    "challengeName": "Challenge 2",
    "areaId": "Route 1 Hau'oli Outskirts",
    "unlocks": [
      "Route 2 North"
    ],
    "requirements": {
      "catchByType": {
        "type": "Dark",
        "count": 3
      }
    }
  },
  {
    "name": "Route 2 North",
    "spawns": [
      {
        "pokemonId": 96,
        "minLevel": 7,
        "maxLevel": 12,
        "chance": 0.16670000000000001
      },
      {
        "pokemonId": 296,
        "minLevel": 7,
        "maxLevel": 12,
        "chance": 0.16670000000000001
      },
      {
        "pokemonId": 21,
        "minLevel": 7,
        "maxLevel": 12,
        "chance": 0.16670000000000001
      },
      {
        "pokemonId": 23,
        "minLevel": 7,
        "maxLevel": 12,
        "chance": 0.16670000000000001
      },
      {
        "pokemonId": 58,
        "minLevel": 7,
        "maxLevel": 12,
        "chance": 0.16670000000000001
      },
      {
        "pokemonId": 235,
        "minLevel": 7,
        "maxLevel": 12,
        "chance": 0.16670000000000001
      },
      {
        "pokemonId": 739,
        "minLevel": 7,
        "maxLevel": 12,
        "chance": 0.1
      }
    ],
    "challengeName": "Challenge 3",
    "areaId": "Route 2 North",
    "unlocks": [
      "Captain Ilima"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Uncommon+",
        "count": 5
      }
    }
  },
  {
    "name": "Captain Ilima Boss Battle",
    "spawns": [],
    "challengeName": "Challenge 4",
    "areaId": "Captain Ilima Boss Battle",
    "unlocks": [
      "Hau'oli Cemetery"
    ],
    "requirements": {
      "defeatBoss": "Captain Ilima"
    }
  },
  {
    "name": "Hau'oli Cemetery",
    "spawns": [
      {
        "pokemonId": 92,
        "minLevel": 10,
        "maxLevel": 15,
        "chance": 0.25
      },
      {
        "pokemonId": 425,
        "minLevel": 10,
        "maxLevel": 15,
        "chance": 0.25
      },
      {
        "pokemonId": 198,
        "minLevel": 10,
        "maxLevel": 15,
        "chance": 0.25
      },
      {
        "pokemonId": 200,
        "minLevel": 10,
        "maxLevel": 15,
        "chance": 0.25
      }
    ],
    "challengeName": "Challenge 5",
    "areaId": "Hau'oli Cemetery",
    "unlocks": [
      "Ten Carat Hill Farthest Hollow"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 2
      }
    }
  },
  {
    "name": "Ten Carat Hill Farthest Hollow",
    "spawns": [
      {
        "pokemonId": 524,
        "minLevel": 14,
        "maxLevel": 19,
        "chance": 0.2
      },
      {
        "pokemonId": 703,
        "minLevel": 14,
        "maxLevel": 19,
        "chance": 0.2
      },
      {
        "pokemonId": 327,
        "minLevel": 14,
        "maxLevel": 19,
        "chance": 0.2
      },
      {
        "pokemonId": 303,
        "minLevel": 14,
        "maxLevel": 19,
        "chance": 0.2
      },
      {
        "pokemonId": 745,
        "minLevel": 14,
        "maxLevel": 19,
        "chance": 0.2
      },
      {
        "pokemonId": 744,
        "minLevel": 14,
        "maxLevel": 19,
        "chance": 0.1
      }
    ],
    "challengeName": "Challenge 6",
    "areaId": "Ten Carat Hill Farthest Hollow",
    "unlocks": [
      "Seaward Cave"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Epic+",
        "count": 1
      }
    }
  },
  {
    "name": "Seaward Cave",
    "spawns": [
      {
        "pokemonId": 339,
        "minLevel": 16,
        "maxLevel": 21,
        "chance": 0.3333
      },
      {
        "pokemonId": 238,
        "minLevel": 16,
        "maxLevel": 21,
        "chance": 0.3333
      },
      {
        "pokemonId": 86,
        "minLevel": 16,
        "maxLevel": 21,
        "chance": 0.3333
      }
    ],
    "areaId": "Seaward Cave",
    "unlocks": [],
    "requirements": {}
  },
  {
    "name": "Kahuna Hala Boss Battle",
    "spawns": [],
    "challengeName": "Challenge 7",
    "areaId": "Kahuna Hala Boss Battle",
    "unlocks": [
      "Kahuna Hala"
    ],
    "requirements": {
      "defeatMultipleSpecific": [
        {
          "name": "Poliwag",
          "count": 1
        },
        {
          "name": "Tentacool",
          "count": 1
        },
        {
          "name": "Slowpoke",
          "count": 1
        },
        {
          "name": "Seel",
          "count": 1
        },
        {
          "name": "Shellder",
          "count": 1
        }
      ]
    }
  },
  {
    "name": "Paniola Ranch",
    "spawns": [
      {
        "pokemonId": 133,
        "minLevel": 20,
        "maxLevel": 25,
        "chance": 0.25
      },
      {
        "pokemonId": 179,
        "minLevel": 20,
        "maxLevel": 25,
        "chance": 0.25
      },
      {
        "pokemonId": 128,
        "minLevel": 20,
        "maxLevel": 25,
        "chance": 0.25
      },
      {
        "pokemonId": 241,
        "minLevel": 20,
        "maxLevel": 25,
        "chance": 0.25
      }
    ],
    "challengeName": "Challenge 9",
    "areaId": "Paniola Ranch",
    "unlocks": [
      "Daycare NPC"
    ],
    "requirements": {
      "catchCountRoute": {
        "route": "Paniola Ranch",
        "count": 10
      }
    }
  },
  {
    "name": "Daycare NPC",
    "spawns": [],
    "challengeName": "Challenge 10",
    "areaId": "Daycare NPC",
    "unlocks": [
      "Route 5"
    ],
    "requirements": {
      "interact": "Daycare NPC"
    }
  },
  {
    "name": "Route 5",
    "spawns": [
      {
        "pokemonId": 714,
        "minLevel": 23,
        "maxLevel": 28,
        "chance": 0.3333
      },
      {
        "pokemonId": 753,
        "minLevel": 23,
        "maxLevel": 28,
        "chance": 0.3333
      },
      {
        "pokemonId": 761,
        "minLevel": 23,
        "maxLevel": 28,
        "chance": 0.3333
      },
      {
        "pokemonId": 751,
        "minLevel": 23,
        "maxLevel": 28,
        "chance": 0.1
      }
    ],
    "challengeName": "Challenge 11",
    "areaId": "Route 5",
    "unlocks": [
      "Captain Lana"
    ],
    "requirements": {
      "catchSpeciesUniqueCount": 2
    }
  },
  {
    "name": "Captain Lana Boss Battle",
    "spawns": [],
    "challengeName": "Challenge 12",
    "areaId": "Captain Lana Boss Battle",
    "unlocks": [
      "Wela Volcano Park"
    ],
    "requirements": {
      "defeatBoss": "Captain Lana"
    }
  },
  {
    "name": "Wela Volcano Park",
    "spawns": [
      {
        "pokemonId": 104,
        "minLevel": 28,
        "maxLevel": 33,
        "chance": 0.3333
      },
      {
        "pokemonId": 115,
        "minLevel": 28,
        "maxLevel": 33,
        "chance": 0.3333
      },
      {
        "pokemonId": 240,
        "minLevel": 28,
        "maxLevel": 33,
        "chance": 0.3333
      }
    ],
    "challengeName": "Challenge 13",
    "areaId": "Wela Volcano Park",
    "unlocks": [
      "Captain Kiawe"
    ],
    "requirements": {
      "defeatCountRoute": {
        "route": "Wela Volcano Park",
        "count": 15
      }
    }
  },
  {
    "name": "Captain Kiawe Boss Battle",
    "spawns": [],
    "challengeName": "Challenge 14",
    "areaId": "Captain Kiawe Boss Battle",
    "unlocks": [
      "Route 7"
    ],
    "requirements": {
      "defeatBoss": "Captain Kiawe"
    }
  },
  {
    "name": "Route 7",
    "spawns": [
      {
        "pokemonId": 120,
        "minLevel": 31,
        "maxLevel": 36,
        "chance": 0.2
      },
      {
        "pokemonId": 771,
        "minLevel": 31,
        "maxLevel": 36,
        "chance": 0.2
      },
      {
        "pokemonId": 222,
        "minLevel": 31,
        "maxLevel": 36,
        "chance": 0.2
      },
      {
        "pokemonId": 747,
        "minLevel": 31,
        "maxLevel": 36,
        "chance": 0.2
      },
      {
        "pokemonId": 779,
        "minLevel": 31,
        "maxLevel": 36,
        "chance": 0.2
      },
      {
        "pokemonId": 746,
        "minLevel": 31,
        "maxLevel": 36,
        "chance": 0.1
      }
    ],
    "challengeName": "Challenge 15",
    "areaId": "Route 7",
    "unlocks": [
      "Route 8 Fossil Restoration Center Part 1"
    ],
    "requirements": {
      "catchByType": {
        "type": "Water",
        "count": 3
      }
    }
  },
  {
    "name": "Route 8 Fossil Restoration Center Part 1",
    "spawns": [
      {
        "pokemonId": 138,
        "minLevel": 32,
        "maxLevel": 37,
        "chance": 0.2
      },
      {
        "pokemonId": 140,
        "minLevel": 32,
        "maxLevel": 37,
        "chance": 0.2
      },
      {
        "pokemonId": 345,
        "minLevel": 32,
        "maxLevel": 37,
        "chance": 0.2
      },
      {
        "pokemonId": 347,
        "minLevel": 32,
        "maxLevel": 37,
        "chance": 0.2
      },
      {
        "pokemonId": 408,
        "minLevel": 32,
        "maxLevel": 37,
        "chance": 0.2
      }
    ],
    "challengeName": "Challenge 16",
    "areaId": "Route 8 Fossil Restoration Center Part 1",
    "unlocks": [
      "Lush Jungle North"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Uncommon+",
        "count": 5
      }
    }
  },
  {
    "name": "Route 8 Fossil Restoration Center Part 2",
    "spawns": [
      {
        "pokemonId": 410,
        "minLevel": 32,
        "maxLevel": 37,
        "chance": 0.2
      },
      {
        "pokemonId": 566,
        "minLevel": 32,
        "maxLevel": 37,
        "chance": 0.2
      },
      {
        "pokemonId": 564,
        "minLevel": 32,
        "maxLevel": 37,
        "chance": 0.2
      },
      {
        "pokemonId": 696,
        "minLevel": 32,
        "maxLevel": 37,
        "chance": 0.2
      },
      {
        "pokemonId": 698,
        "minLevel": 32,
        "maxLevel": 37,
        "chance": 0.2
      }
    ],
    "areaId": "Route 8 Fossil Restoration Center Part 2",
    "unlocks": [],
    "requirements": {}
  },
  {
    "name": "Lush Jungle North",
    "spawns": [
      {
        "pokemonId": 732,
        "minLevel": 34,
        "maxLevel": 39,
        "chance": 0.16670000000000001
      },
      {
        "pokemonId": 762,
        "minLevel": 34,
        "maxLevel": 39,
        "chance": 0.16670000000000001
      },
      {
        "pokemonId": 764,
        "minLevel": 34,
        "maxLevel": 39,
        "chance": 0.16670000000000001
      },
      {
        "pokemonId": 163,
        "minLevel": 34,
        "maxLevel": 39,
        "chance": 0.16670000000000001
      },
      {
        "pokemonId": 765,
        "minLevel": 34,
        "maxLevel": 39,
        "chance": 0.16670000000000001
      },
      {
        "pokemonId": 761,
        "minLevel": 34,
        "maxLevel": 39,
        "chance": 0.16670000000000001
      },
      {
        "pokemonId": 755,
        "minLevel": 34,
        "maxLevel": 39,
        "chance": 0.1
      }
    ],
    "challengeName": "Challenge 17",
    "areaId": "Lush Jungle North",
    "unlocks": [
      "Lush Jungle East Cave"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Epic+",
        "count": 1
      }
    }
  },
  {
    "name": "Lush Jungle East Cave",
    "spawns": [
      {
        "pokemonId": 42,
        "minLevel": 35,
        "maxLevel": 40,
        "chance": 0.2
      },
      {
        "pokemonId": 757,
        "minLevel": 35,
        "maxLevel": 40,
        "chance": 0.2
      },
      {
        "pokemonId": 636,
        "minLevel": 35,
        "maxLevel": 40,
        "chance": 0.2
      },
      {
        "pokemonId": 765,
        "minLevel": 35,
        "maxLevel": 40,
        "chance": 0.2
      },
      {
        "pokemonId": 766,
        "minLevel": 35,
        "maxLevel": 40,
        "chance": 0.2
      }
    ],
    "challengeName": "Challenge 18",
    "areaId": "Lush Jungle East Cave",
    "unlocks": [
      "Captain Mallow"
    ],
    "requirements": {
      "defeatMultipleSpecific": [
        {
          "name": "Zubat",
          "count": 1
        },
        {
          "name": "Ekans",
          "count": 1
        },
        {
          "name": "Nidoran♀",
          "count": 1
        },
        {
          "name": "Nidoran♂",
          "count": 1
        },
        {
          "name": "Oddish",
          "count": 1
        }
      ]
    }
  },
  {
    "name": "Captain Mallow Boss Battle",
    "spawns": [],
    "areaId": "Captain Mallow Boss Battle",
    "unlocks": [],
    "requirements": {}
  },
  {
    "name": "Diglett's Tunnel",
    "spawns": [
      {
        "pokemonId": 41,
        "minLevel": 38,
        "maxLevel": 43,
        "chance": 0.25
      },
      {
        "pokemonId": 50,
        "minLevel": 38,
        "maxLevel": 43,
        "chance": 0.25
      },
      {
        "pokemonId": 352,
        "minLevel": 38,
        "maxLevel": 43,
        "chance": 0.25
      },
      {
        "pokemonId": 246,
        "minLevel": 38,
        "maxLevel": 43,
        "chance": 0.25
      }
    ],
    "challengeName": "Challenge 20",
    "areaId": "Diglett's Tunnel",
    "unlocks": [
      "Akala Outskirts"
    ],
    "requirements": {
      "catchCountRoute": {
        "route": "Diglett's Tunnel",
        "count": 10
      }
    }
  },
  {
    "name": "Akala Outskirts",
    "spawns": [
      {
        "pokemonId": 735,
        "minLevel": 43,
        "maxLevel": 48,
        "chance": 0.125
      },
      {
        "pokemonId": 278,
        "minLevel": 43,
        "maxLevel": 48,
        "chance": 0.125
      },
      {
        "pokemonId": 129,
        "minLevel": 43,
        "maxLevel": 48,
        "chance": 0.125
      },
      {
        "pokemonId": 759,
        "minLevel": 43,
        "maxLevel": 48,
        "chance": 0.125
      },
      {
        "pokemonId": 170,
        "minLevel": 43,
        "maxLevel": 48,
        "chance": 0.125
      },
      {
        "pokemonId": 20,
        "minLevel": 43,
        "maxLevel": 48,
        "chance": 0.125
      },
      {
        "pokemonId": 177,
        "minLevel": 43,
        "maxLevel": 48,
        "chance": 0.125
      },
      {
        "pokemonId": 299,
        "minLevel": 43,
        "maxLevel": 48,
        "chance": 0.125
      }
    ],
    "challengeName": "Challenge 21",
    "areaId": "Akala Outskirts",
    "unlocks": [
      "Kahuna Olivia"
    ],
    "requirements": {
      "catchSpeciesUniqueCount": 2
    }
  },
  {
    "name": "Kahuna Olivia Boss Battle",
    "spawns": [],
    "areaId": "Kahuna Olivia Boss Battle",
    "unlocks": [],
    "requirements": {}
  },
  {
    "name": "Malie City",
    "spawns": [
      {
        "pokemonId": 81,
        "minLevel": 48,
        "maxLevel": 53,
        "chance": 0.2
      },
      {
        "pokemonId": 88,
        "minLevel": 48,
        "maxLevel": 53,
        "chance": 0.2
      },
      {
        "pokemonId": 568,
        "minLevel": 48,
        "maxLevel": 53,
        "chance": 0.2
      },
      {
        "pokemonId": 572,
        "minLevel": 48,
        "maxLevel": 53,
        "chance": 0.2
      },
      {
        "pokemonId": 284,
        "minLevel": 48,
        "maxLevel": 53,
        "chance": 0.2
      }
    ],
    "challengeName": "Challenge 23",
    "areaId": "Malie City",
    "unlocks": [
      "Mount Hokulani East"
    ],
    "requirements": {
      "defeatCountRoute": {
        "route": "Malie City",
        "count": 15
      }
    }
  },
  {
    "name": "Mount Hokulani East",
    "spawns": [
      {
        "pokemonId": 173,
        "minLevel": 52,
        "maxLevel": 57,
        "chance": 0.25
      },
      {
        "pokemonId": 605,
        "minLevel": 52,
        "maxLevel": 57,
        "chance": 0.25
      },
      {
        "pokemonId": 374,
        "minLevel": 52,
        "maxLevel": 57,
        "chance": 0.25
      },
      {
        "pokemonId": 774,
        "minLevel": 52,
        "maxLevel": 57,
        "chance": 0.25
      }
    ],
    "challengeName": "Challenge 24",
    "areaId": "Mount Hokulani East",
    "unlocks": [
      "Captain Sophocles"
    ],
    "requirements": {
      "catchByType": {
        "type": "Fairy",
        "count": 3
      }
    }
  },
  {
    "name": "Captain Sophocles Boss Battle",
    "spawns": [],
    "areaId": "Captain Sophocles Boss Battle",
    "unlocks": [],
    "requirements": {}
  },
  {
    "name": "Haina Desert",
    "spawns": [
      {
        "pokemonId": 51,
        "minLevel": 58,
        "maxLevel": 63,
        "chance": 0.2
      },
      {
        "pokemonId": 551,
        "minLevel": 58,
        "maxLevel": 63,
        "chance": 0.2
      },
      {
        "pokemonId": 552,
        "minLevel": 58,
        "maxLevel": 63,
        "chance": 0.2
      },
      {
        "pokemonId": 120,
        "minLevel": 58,
        "maxLevel": 63,
        "chance": 0.2
      },
      {
        "pokemonId": 769,
        "minLevel": 58,
        "maxLevel": 63,
        "chance": 0.2
      }
    ],
    "challengeName": "Challenge 26",
    "areaId": "Haina Desert",
    "unlocks": [
      "Tapu Village"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Uncommon+",
        "count": 5
      }
    }
  },
  {
    "name": "Tapu Village",
    "spawns": [
      {
        "pokemonId": 75,
        "minLevel": 60,
        "maxLevel": 65,
        "chance": 0.16670000000000001
      },
      {
        "pokemonId": 779,
        "minLevel": 60,
        "maxLevel": 65,
        "chance": 0.16670000000000001
      },
      {
        "pokemonId": 359,
        "minLevel": 60,
        "maxLevel": 65,
        "chance": 0.16670000000000001
      },
      {
        "pokemonId": 361,
        "minLevel": 60,
        "maxLevel": 65,
        "chance": 0.16670000000000001
      },
      {
        "pokemonId": 27,
        "minLevel": 60,
        "maxLevel": 65,
        "chance": 0.16670000000000001
      },
      {
        "pokemonId": 37,
        "minLevel": 60,
        "maxLevel": 65,
        "chance": 0.16670000000000001
      }
    ],
    "challengeName": "Challenge 27",
    "areaId": "Tapu Village",
    "unlocks": [
      "Thrifty Megamart"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 2
      }
    }
  },
  {
    "name": "Thrifty Megamart",
    "spawns": [
      {
        "pokemonId": 93,
        "minLevel": 63,
        "maxLevel": 68,
        "chance": 0.25
      },
      {
        "pokemonId": 707,
        "minLevel": 63,
        "maxLevel": 68,
        "chance": 0.25
      },
      {
        "pokemonId": 353,
        "minLevel": 63,
        "maxLevel": 68,
        "chance": 0.25
      },
      {
        "pokemonId": 525,
        "minLevel": 63,
        "maxLevel": 68,
        "chance": 0.25
      },
      {
        "pokemonId": 778,
        "minLevel": 63,
        "maxLevel": 68,
        "chance": 0.1
      }
    ],
    "challengeName": "Challenge 28",
    "areaId": "Thrifty Megamart",
    "unlocks": [
      "Captain Acerola"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Epic+",
        "count": 1
      }
    }
  },
  {
    "name": "Captain Acerola Boss Battle",
    "spawns": [],
    "challengeName": "Challenge 30",
    "areaId": "Captain Acerola Boss Battle",
    "unlocks": [
      "Seafolk Village"
    ],
    "requirements": {
      "defeatBoss": "Kahuna Nanu"
    }
  },
  {
    "name": "Kahuna Nanu Boss Battle",
    "spawns": [],
    "areaId": "Kahuna Nanu Boss Battle",
    "unlocks": [],
    "requirements": {}
  },
  {
    "name": "Seafolk Village",
    "spawns": [
      {
        "pokemonId": 762,
        "minLevel": 69,
        "maxLevel": 74,
        "chance": 0.3333
      },
      {
        "pokemonId": 422,
        "minLevel": 69,
        "maxLevel": 74,
        "chance": 0.3333
      },
      {
        "pokemonId": 781,
        "minLevel": 69,
        "maxLevel": 74,
        "chance": 0.3333
      }
    ],
    "areaId": "Seafolk Village",
    "unlocks": [],
    "requirements": {}
  },
  {
    "name": "Poni Wilds",
    "spawns": [
      {
        "pokemonId": 73,
        "minLevel": 70,
        "maxLevel": 75,
        "chance": 0.2
      },
      {
        "pokemonId": 457,
        "minLevel": 70,
        "maxLevel": 75,
        "chance": 0.2
      },
      {
        "pokemonId": 131,
        "minLevel": 70,
        "maxLevel": 75,
        "chance": 0.2
      },
      {
        "pokemonId": 715,
        "minLevel": 70,
        "maxLevel": 75,
        "chance": 0.2
      },
      {
        "pokemonId": 621,
        "minLevel": 70,
        "maxLevel": 75,
        "chance": 0.2
      }
    ],
    "challengeName": "Challenge 31",
    "areaId": "Poni Wilds",
    "unlocks": [
      "Poni Wilds"
    ],
    "requirements": {
      "defeatMultipleSpecific": [
        {
          "name": "Bulbasaur",
          "count": 1
        },
        {
          "name": "Oddish",
          "count": 1
        },
        {
          "name": "Paras",
          "count": 1
        },
        {
          "name": "Bellsprout",
          "count": 1
        },
        {
          "name": "Exeggcute",
          "count": 1
        }
      ]
    }
  },
  {
    "name": "Poni Breaker Coast",
    "spawns": [
      {
        "pokemonId": 767,
        "minLevel": 72,
        "maxLevel": 77,
        "chance": 0.2
      },
      {
        "pokemonId": 369,
        "minLevel": 72,
        "maxLevel": 77,
        "chance": 0.2
      },
      {
        "pokemonId": 320,
        "minLevel": 72,
        "maxLevel": 77,
        "chance": 0.2
      },
      {
        "pokemonId": 318,
        "minLevel": 72,
        "maxLevel": 77,
        "chance": 0.2
      },
      {
        "pokemonId": 319,
        "minLevel": 72,
        "maxLevel": 77,
        "chance": 0.2
      }
    ],
    "challengeName": "Challenge 33",
    "areaId": "Poni Breaker Coast",
    "unlocks": [
      "Exeggutor Island"
    ],
    "requirements": {
      "catchSpeciesUniqueCount": 2
    }
  },
  {
    "name": "Exeggutor Island",
    "spawns": [
      {
        "pokemonId": 279,
        "minLevel": 73,
        "maxLevel": 78,
        "chance": 0.16670000000000001
      },
      {
        "pokemonId": 127,
        "minLevel": 73,
        "maxLevel": 78,
        "chance": 0.16670000000000001
      },
      {
        "pokemonId": 423,
        "minLevel": 73,
        "maxLevel": 78,
        "chance": 0.16670000000000001
      },
      {
        "pokemonId": 102,
        "minLevel": 73,
        "maxLevel": 78,
        "chance": 0.16670000000000001
      },
      {
        "pokemonId": 357,
        "minLevel": 73,
        "maxLevel": 78,
        "chance": 0.16670000000000001
      },
      {
        "pokemonId": 103,
        "minLevel": 73,
        "maxLevel": 78,
        "chance": 0.16670000000000001
      }
    ],
    "challengeName": "Challenge 34",
    "areaId": "Exeggutor Island",
    "unlocks": [
      "Vast Poni Canyon Outside"
    ],
    "requirements": {
      "defeatCountRoute": {
        "route": "Exeggutor Island",
        "count": 15
      }
    }
  },
  {
    "name": "Vast Poni Canyon Outside",
    "spawns": [
      {
        "pokemonId": 67,
        "minLevel": 75,
        "maxLevel": 80,
        "chance": 0.3333
      },
      {
        "pokemonId": 619,
        "minLevel": 75,
        "maxLevel": 80,
        "chance": 0.3333
      },
      {
        "pokemonId": 782,
        "minLevel": 75,
        "maxLevel": 80,
        "chance": 0.3333
      },
      {
        "pokemonId": 783,
        "minLevel": 75,
        "maxLevel": 80,
        "chance": 0.1
      }
    ],
    "challengeName": "Challenge 35",
    "areaId": "Vast Poni Canyon Outside",
    "unlocks": [
      "Captain Kommo-o"
    ],
    "requirements": {
      "catchByType": {
        "type": "Fighting",
        "count": 3
      }
    }
  },
  {
    "name": "Captain Kommo-o Boss Battle",
    "spawns": [],
    "challengeName": "Challenge 37",
    "areaId": "Captain Kommo-o Boss Battle",
    "unlocks": [
      "Kahuna Hapu"
    ],
    "requirements": {
      "defeatBoss": "Captain Mina"
    }
  },
  {
    "name": "Captain Mina Boss Battle",
    "spawns": [],
    "challengeName": "Challenge 38",
    "areaId": "Captain Mina Boss Battle",
    "unlocks": [
      "Mount Lanakila"
    ],
    "requirements": {
      "defeatBoss": "Kahuna Hapu"
    }
  },
  {
    "name": "Kahuna Hapu Boss Battle",
    "spawns": [],
    "areaId": "Kahuna Hapu Boss Battle",
    "unlocks": [],
    "requirements": {}
  },
  {
    "name": "Mount Lanakila",
    "spawns": [
      {
        "pokemonId": 780,
        "minLevel": 82,
        "maxLevel": 87,
        "chance": 0.25
      },
      {
        "pokemonId": 362,
        "minLevel": 82,
        "maxLevel": 87,
        "chance": 0.25
      },
      {
        "pokemonId": 215,
        "minLevel": 82,
        "maxLevel": 87,
        "chance": 0.25
      },
      {
        "pokemonId": 740,
        "minLevel": 82,
        "maxLevel": 87,
        "chance": 0.25
      }
    ],
    "challengeName": "Challenge 39",
    "areaId": "Mount Lanakila",
    "unlocks": [
      "Alola Pokemon League"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Uncommon+",
        "count": 5
      }
    }
  },
  {
    "name": "Alola Pokemon League Boss Battle",
    "spawns": [],
    "challengeName": "Extra Challenge A-1",
    "areaId": "Alola Pokemon League Boss Battle",
    "unlocks": [
      "Route 6"
    ],
    "requirements": {
      "defeatBoss": "Captain Lana"
    }
  },
  {
    "name": "Champion Hau Boss Battle",
    "spawns": [],
    "areaId": "Champion Hau Boss Battle",
    "unlocks": [],
    "requirements": {}
  },
  {
    "name": "Route 6",
    "spawns": [],
    "challengeName": "Extra Challenge A-2",
    "areaId": "Route 6",
    "unlocks": [
      "Royal Avenue"
    ],
    "requirements": {
      "defeatCountRoute": {
        "route": "Route 6",
        "count": 10
      }
    }
  },
  {
    "name": "Shopping Mall Antiquities",
    "spawns": [],
    "challengeName": "Extra Challenge B-4",
    "areaId": "Shopping Mall Antiquities",
    "unlocks": [
      "The Zenith Anomaly"
    ],
    "requirements": {
      "defeatCountRoute": {
        "route": "Shopping Mall Antiquities",
        "count": 10
      }
    }
  },
  {
    "name": "Ruins of Conflict",
    "spawns": [],
    "challengeName": "Extra Challenge B-1",
    "areaId": "Ruins of Conflict",
    "unlocks": [
      "Ula'ula Meadow"
    ],
    "requirements": {
      "defeatAlolaChampion": true
    }
  },
  {
    "name": "Ten Carat Hill Deepest Cave",
    "spawns": [],
    "challengeName": "Extra Challenge C-3",
    "areaId": "Ten Carat Hill Deepest Cave",
    "unlocks": [
      "Kala'e Bay"
    ],
    "requirements": {
      "defeatCountRoute": {
        "route": "Ten Carat Hill Deepest Cave",
        "count": 10
      }
    }
  },
  {
    "name": "Poni Plains",
    "spawns": [],
    "challengeName": "Extra Challenge D-1",
    "areaId": "Poni Plains",
    "unlocks": [
      "Poni Coast"
    ],
    "requirements": {
      "defeatCountRoute": {
        "route": "Poni Plains",
        "count": 10
      }
    }
  },
  {
    "name": "Resolution Cave",
    "spawns": [],
    "challengeName": "Extra Challenge D-3",
    "areaId": "Resolution Cave",
    "unlocks": [
      "Ruins of Hope"
    ],
    "requirements": {
      "defeatCountRoute": {
        "route": "Resolution Cave",
        "count": 10
      }
    }
  },
  {
    "name": "Ruins of Hope",
    "spawns": [],
    "challengeName": "Extra Challenge D-4",
    "areaId": "Ruins of Hope",
    "unlocks": [
      "The Interdimensional Rift"
    ],
    "requirements": {
      "defeatCountRoute": {
        "route": "Ruins of Hope",
        "count": 10
      }
    }
  },
  {
    "name": "Route 16",
    "spawns": [],
    "challengeName": "Extra Challenge E-1",
    "areaId": "Route 16",
    "unlocks": [
      "Aether Paradise Labs"
    ],
    "requirements": {
      "defeatCountRoute": {
        "route": "Route 16",
        "count": 10
      }
    }
  },
  {
    "name": "Royal Avenue",
    "spawns": [
      {
        "pokemonId": 741,
        "minLevel": 85,
        "maxLevel": 90,
        "chance": 0.3333
      },
      {
        "pokemonId": 732,
        "minLevel": 85,
        "maxLevel": 90,
        "chance": 0.3333
      },
      {
        "pokemonId": 743,
        "minLevel": 85,
        "maxLevel": 90,
        "chance": 0.3333
      }
    ],
    "challengeName": "Extra Challenge A-3",
    "areaId": "Royal Avenue",
    "unlocks": [
      "Pikachu Valley"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 2
      }
    }
  },
  {
    "name": "Pikachu Valley",
    "spawns": [
      {
        "pokemonId": 25,
        "minLevel": 85,
        "maxLevel": 90,
        "chance": 0.25
      },
      {
        "pokemonId": 26,
        "minLevel": 85,
        "maxLevel": 90,
        "chance": 0.25
      },
      {
        "pokemonId": 172,
        "minLevel": 85,
        "maxLevel": 90,
        "chance": 0.25
      },
      {
        "pokemonId": 81,
        "minLevel": 85,
        "maxLevel": 90,
        "chance": 0.25
      }
    ],
    "challengeName": "Extra Challenge A-4",
    "areaId": "Pikachu Valley",
    "unlocks": [
      "Starter Depot"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Epic+",
        "count": 1
      }
    }
  },
  {
    "name": "Starter Depot",
    "spawns": [
      {
        "pokemonId": 722,
        "minLevel": 85,
        "maxLevel": 90,
        "chance": 0.16670000000000001
      },
      {
        "pokemonId": 723,
        "minLevel": 85,
        "maxLevel": 90,
        "chance": 0.16670000000000001
      },
      {
        "pokemonId": 725,
        "minLevel": 85,
        "maxLevel": 90,
        "chance": 0.16670000000000001
      },
      {
        "pokemonId": 726,
        "minLevel": 85,
        "maxLevel": 90,
        "chance": 0.16670000000000001
      },
      {
        "pokemonId": 728,
        "minLevel": 85,
        "maxLevel": 90,
        "chance": 0.16670000000000001
      },
      {
        "pokemonId": 729,
        "minLevel": 85,
        "maxLevel": 90,
        "chance": 0.16670000000000001
      }
    ],
    "areaId": "Starter Depot",
    "unlocks": [],
    "requirements": {}
  },
  {
    "name": "Ula'ula Meadow",
    "spawns": [
      {
        "pokemonId": 166,
        "minLevel": 85,
        "maxLevel": 90,
        "chance": 0.3333
      },
      {
        "pokemonId": 168,
        "minLevel": 85,
        "maxLevel": 90,
        "chance": 0.3333
      },
      {
        "pokemonId": 741,
        "minLevel": 85,
        "maxLevel": 90,
        "chance": 0.3333
      },
      {
        "pokemonId": 775,
        "minLevel": 85,
        "maxLevel": 90,
        "chance": 0.1
      }
    ],
    "areaId": "Ula'ula Meadow",
    "unlocks": [],
    "requirements": {}
  },
  {
    "name": "Blush Mountain",
    "spawns": [
      {
        "pokemonId": 749,
        "minLevel": 85,
        "maxLevel": 90,
        "chance": 0.11109999999999999
      },
      {
        "pokemonId": 324,
        "minLevel": 85,
        "maxLevel": 90,
        "chance": 0.11109999999999999
      },
      {
        "pokemonId": 777,
        "minLevel": 85,
        "maxLevel": 90,
        "chance": 0.11109999999999999
      },
      {
        "pokemonId": 239,
        "minLevel": 85,
        "maxLevel": 90,
        "chance": 0.11109999999999999
      },
      {
        "pokemonId": 74,
        "minLevel": 85,
        "maxLevel": 90,
        "chance": 0.11109999999999999
      },
      {
        "pokemonId": 75,
        "minLevel": 85,
        "maxLevel": 90,
        "chance": 0.11109999999999999
      },
      {
        "pokemonId": 737,
        "minLevel": 85,
        "maxLevel": 90,
        "chance": 0.11109999999999999
      },
      {
        "pokemonId": 776,
        "minLevel": 85,
        "maxLevel": 90,
        "chance": 0.11109999999999999
      },
      {
        "pokemonId": 702,
        "minLevel": 85,
        "maxLevel": 90,
        "chance": 0.11109999999999999
      }
    ],
    "challengeName": "Extra Challenge B-2",
    "areaId": "Blush Mountain",
    "unlocks": [
      "Blush Mountain"
    ],
    "requirements": {
      "defeatMultipleSpecific": [
        {
          "name": "Caterpie",
          "count": 1
        },
        {
          "name": "Weedle",
          "count": 1
        },
        {
          "name": "Paras",
          "count": 1
        },
        {
          "name": "Venonat",
          "count": 1
        },
        {
          "name": "Scyther",
          "count": 1
        }
      ]
    }
  },
  {
    "name": "The Zenith Anomaly",
    "spawns": [
      {
        "pokemonId": 801,
        "minLevel": 95,
        "maxLevel": 100,
        "chance": 0.3333
      },
      {
        "pokemonId": 802,
        "minLevel": 95,
        "maxLevel": 100,
        "chance": 0.3333
      },
      {
        "pokemonId": 807,
        "minLevel": 95,
        "maxLevel": 100,
        "chance": 0.3333
      }
    ],
    "challengeName": "Extra Challenge B-5",
    "areaId": "The Zenith Anomaly",
    "unlocks": [],
    "requirements": {
      "catchSpecies": [
        {
          "species": "Magearna",
          "count": 1
        },
        {
          "species": "Marshadow",
          "count": 1
        },
        {
          "species": "Zeraora",
          "count": 1
        }
      ]
    },
    "gift": {
      "item": "Masterball",
      "count": 1
    }
  },
  {
    "name": "Melemele Meadow",
    "spawns": [
      {
        "pokemonId": 10,
        "minLevel": 85,
        "maxLevel": 90,
        "chance": 0.125
      },
      {
        "pokemonId": 11,
        "minLevel": 85,
        "maxLevel": 90,
        "chance": 0.125
      },
      {
        "pokemonId": 742,
        "minLevel": 85,
        "maxLevel": 90,
        "chance": 0.125
      },
      {
        "pokemonId": 12,
        "minLevel": 85,
        "maxLevel": 90,
        "chance": 0.125
      },
      {
        "pokemonId": 669,
        "minLevel": 85,
        "maxLevel": 90,
        "chance": 0.125
      },
      {
        "pokemonId": 548,
        "minLevel": 85,
        "maxLevel": 90,
        "chance": 0.125
      },
      {
        "pokemonId": 546,
        "minLevel": 85,
        "maxLevel": 90,
        "chance": 0.125
      },
      {
        "pokemonId": 708,
        "minLevel": 85,
        "maxLevel": 90,
        "chance": 0.125
      }
    ],
    "challengeName": "Extra Challenge C-1",
    "areaId": "Melemele Meadow",
    "unlocks": [
      "Ruins of Conflict"
    ],
    "requirements": {
      "catchSpeciesUniqueCount": 2
    }
  },
  {
    "name": "Kala'e Bay",
    "spawns": [
      {
        "pokemonId": 90,
        "minLevel": 85,
        "maxLevel": 90,
        "chance": 0.3333
      },
      {
        "pokemonId": 79,
        "minLevel": 85,
        "maxLevel": 90,
        "chance": 0.3333
      },
      {
        "pokemonId": 456,
        "minLevel": 85,
        "maxLevel": 90,
        "chance": 0.3333
      }
    ],
    "challengeName": "Extra Challenge C-4",
    "areaId": "Kala'e Bay",
    "unlocks": [
      "Sacred Shrine"
    ],
    "requirements": {
      "defeatCountRoute": {
        "route": "Kala'e Bay",
        "count": 15
      }
    }
  },
  {
    "name": "Sacred Shrine",
    "spawns": [
      {
        "pokemonId": 785,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.25
      },
      {
        "pokemonId": 786,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.25
      },
      {
        "pokemonId": 787,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.25
      },
      {
        "pokemonId": 788,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.25
      }
    ],
    "challengeName": "Extra Challenge C-5",
    "areaId": "Sacred Shrine",
    "unlocks": [],
    "requirements": {
      "catchSpecies": [
        {
          "species": "Tapu Koko",
          "count": 1
        },
        {
          "species": "Tapu Lele",
          "count": 1
        },
        {
          "species": "Tapu Bulu",
          "count": 1
        },
        {
          "species": "Tapu Fini",
          "count": 1
        }
      ]
    },
    "gift": {
      "item": "Masterball",
      "count": 2
    }
  },
  {
    "name": "Poni Coast",
    "spawns": [
      {
        "pokemonId": 51,
        "minLevel": 85,
        "maxLevel": 90,
        "chance": 0.3333
      },
      {
        "pokemonId": 423,
        "minLevel": 85,
        "maxLevel": 90,
        "chance": 0.3333
      },
      {
        "pokemonId": 102,
        "minLevel": 85,
        "maxLevel": 90,
        "chance": 0.3333
      }
    ],
    "challengeName": "Extra Challenge D-2",
    "areaId": "Poni Coast",
    "unlocks": [
      "Resolution Cave"
    ],
    "requirements": {
      "catchByType": {
        "type": "Normal",
        "count": 3
      }
    }
  },
  {
    "name": "The Interdimensional Rift",
    "spawns": [
      {
        "pokemonId": 793,
        "minLevel": 110,
        "maxLevel": 110,
        "chance": 0.1
      },
      {
        "pokemonId": 794,
        "minLevel": 110,
        "maxLevel": 110,
        "chance": 0.1
      },
      {
        "pokemonId": 795,
        "minLevel": 110,
        "maxLevel": 110,
        "chance": 0.1
      },
      {
        "pokemonId": 796,
        "minLevel": 110,
        "maxLevel": 110,
        "chance": 0.1
      },
      {
        "pokemonId": 797,
        "minLevel": 110,
        "maxLevel": 110,
        "chance": 0.1
      },
      {
        "pokemonId": 798,
        "minLevel": 110,
        "maxLevel": 110,
        "chance": 0.1
      },
      {
        "pokemonId": 799,
        "minLevel": 110,
        "maxLevel": 110,
        "chance": 0.1
      },
      {
        "pokemonId": 803,
        "minLevel": 110,
        "maxLevel": 110,
        "chance": 0.1
      },
      {
        "pokemonId": 805,
        "minLevel": 110,
        "maxLevel": 110,
        "chance": 0.1
      },
      {
        "pokemonId": 806,
        "minLevel": 110,
        "maxLevel": 110,
        "chance": 0.1
      }
    ],
    "challengeName": "Extra Challenge D-5",
    "areaId": "The Interdimensional Rift",
    "unlocks": [],
    "requirements": {
      "defeatCountRoute": {
        "route": "The Interdimensional Rift",
        "count": 100
      }
    },
    "gift": {
      "item": "Masterball",
      "count": 3
    }
  },
  {
    "name": "Aether Paradise Labs",
    "spawns": [
      {
        "pokemonId": 772,
        "minLevel": 85,
        "maxLevel": 90,
        "chance": 0.5
      },
      {
        "pokemonId": 137,
        "minLevel": 85,
        "maxLevel": 90,
        "chance": 0.5
      },
      {
        "pokemonId": 808,
        "minLevel": 85,
        "maxLevel": 90,
        "chance": 0.1
      }
    ],
    "challengeName": "Extra Challenge E-2",
    "areaId": "Aether Paradise Labs",
    "unlocks": [
      "Aether Paradise Secret Lab"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Uncommon+",
        "count": 5
      }
    }
  },
  {
    "name": "Aether Paradise Secret Lab",
    "spawns": [
      {
        "pokemonId": 773,
        "minLevel": 85,
        "maxLevel": 90,
        "chance": 1
      }
    ],
    "challengeName": "Extra Challenge E-3",
    "areaId": "Aether Paradise Secret Lab",
    "unlocks": [
      "Lake of the Sunne"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 2
      }
    }
  },
  {
    "name": "Lake of the Sunne",
    "spawns": [
      {
        "pokemonId": 42,
        "minLevel": 85,
        "maxLevel": 90,
        "chance": 0.3333
      },
      {
        "pokemonId": 92,
        "minLevel": 85,
        "maxLevel": 90,
        "chance": 0.3333
      },
      {
        "pokemonId": 93,
        "minLevel": 85,
        "maxLevel": 90,
        "chance": 0.3333
      }
    ],
    "challengeName": "Extra Challenge E-4",
    "areaId": "Lake of the Sunne",
    "unlocks": [
      "Obsidian Sphere"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Epic+",
        "count": 1
      }
    }
  },
  {
    "name": "Obsidian Sphere",
    "spawns": [
      {
        "pokemonId": 789,
        "minLevel": 110,
        "maxLevel": 110,
        "chance": 0.6
      },
      {
        "pokemonId": 790,
        "minLevel": 110,
        "maxLevel": 110,
        "chance": 0.4
      }
    ],
    "areaId": "Obsidian Sphere",
    "unlocks": [],
    "requirements": {}
  },
  {
    "name": "Obsidian Tesseract",
    "spawns": [
      {
        "pokemonId": 791,
        "minLevel": 120,
        "maxLevel": 120,
        "chance": 0.3333
      },
      {
        "pokemonId": 792,
        "minLevel": 120,
        "maxLevel": 120,
        "chance": 0.3333
      },
      {
        "pokemonId": 800,
        "minLevel": 120,
        "maxLevel": 120,
        "chance": 0.3333
      }
    ],
    "challengeName": "Extra Challenge E-5",
    "areaId": "Obsidian Tesseract",
    "unlocks": [
      "Obsidian Tesseract"
    ],
    "requirements": {
      "catchSpecies": [
        {
          "species": "Cosmog",
          "count": 1
        },
        {
          "species": "Cosmoem",
          "count": 1
        }
      ]
    }
  }
];

export const alolaUnlocks = [
  {
    "challengeName": "Challenge 1",
    "areaId": "Route 1 East",
    "unlocks": [
      "Route 1 Hau'oli Outskirts"
    ],
    "requirements": {
      "defeatCountRoute": {
        "route": "Route 1 East",
        "count": 15
      }
    }
  },
  {
    "challengeName": "Challenge 2",
    "areaId": "Route 1 Hau'oli Outskirts",
    "unlocks": [
      "Route 2 North"
    ],
    "requirements": {
      "catchByType": {
        "type": "Dark",
        "count": 3
      }
    }
  },
  {
    "challengeName": "Challenge 3",
    "areaId": "Route 2 North",
    "unlocks": [
      "Captain Ilima"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Uncommon+",
        "count": 5
      }
    }
  },
  {
    "challengeName": "Challenge 4",
    "areaId": "Captain Ilima Boss Battle",
    "unlocks": [
      "Hau'oli Cemetery"
    ],
    "requirements": {
      "defeatBoss": "Captain Ilima"
    }
  },
  {
    "challengeName": "Challenge 5",
    "areaId": "Hau'oli Cemetery",
    "unlocks": [
      "Ten Carat Hill Farthest Hollow"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 2
      }
    }
  },
  {
    "challengeName": "Challenge 6",
    "areaId": "Ten Carat Hill Farthest Hollow",
    "unlocks": [
      "Seaward Cave"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Epic+",
        "count": 1
      }
    }
  },
  {
    "challengeName": "Challenge 7",
    "areaId": "Kahuna Hala Boss Battle",
    "unlocks": [
      "Kahuna Hala"
    ],
    "requirements": {
      "defeatMultipleSpecific": [
        {
          "name": "Poliwag",
          "count": 1
        },
        {
          "name": "Tentacool",
          "count": 1
        },
        {
          "name": "Slowpoke",
          "count": 1
        },
        {
          "name": "Seel",
          "count": 1
        },
        {
          "name": "Shellder",
          "count": 1
        }
      ]
    }
  },
  {
    "challengeName": "Challenge 8",
    "areaId": "Kahuna Hala Boss Battle",
    "unlocks": [
      "Paniola Ranch"
    ],
    "requirements": {
      "defeatCountRoute": {
        "route": "Kahuna Hala",
        "count": 10
      }
    }
  },
  {
    "challengeName": "Challenge 9",
    "areaId": "Paniola Ranch",
    "unlocks": [
      "Daycare NPC"
    ],
    "requirements": {
      "catchCountRoute": {
        "route": "Paniola Ranch",
        "count": 10
      }
    }
  },
  {
    "challengeName": "Challenge 10",
    "areaId": "Daycare NPC",
    "unlocks": [
      "Route 5"
    ],
    "requirements": {
      "interact": "Daycare NPC"
    }
  },
  {
    "challengeName": "Challenge 11",
    "areaId": "Route 5",
    "unlocks": [
      "Captain Lana"
    ],
    "requirements": {
      "catchSpeciesUniqueCount": 2
    }
  },
  {
    "challengeName": "Challenge 12",
    "areaId": "Captain Lana Boss Battle",
    "unlocks": [
      "Wela Volcano Park"
    ],
    "requirements": {
      "defeatBoss": "Captain Lana"
    }
  },
  {
    "challengeName": "Challenge 13",
    "areaId": "Wela Volcano Park",
    "unlocks": [
      "Captain Kiawe"
    ],
    "requirements": {
      "defeatCountRoute": {
        "route": "Wela Volcano Park",
        "count": 15
      }
    }
  },
  {
    "challengeName": "Challenge 14",
    "areaId": "Captain Kiawe Boss Battle",
    "unlocks": [
      "Route 7"
    ],
    "requirements": {
      "defeatBoss": "Captain Kiawe"
    }
  },
  {
    "challengeName": "Challenge 15",
    "areaId": "Route 7",
    "unlocks": [
      "Route 8 Fossil Restoration Center Part 1"
    ],
    "requirements": {
      "catchByType": {
        "type": "Water",
        "count": 3
      }
    }
  },
  {
    "challengeName": "Challenge 16",
    "areaId": "Route 8 Fossil Restoration Center Part 1",
    "unlocks": [
      "Lush Jungle North"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Uncommon+",
        "count": 5
      }
    }
  },
  {
    "challengeName": "Challenge 17",
    "areaId": "Lush Jungle North",
    "unlocks": [
      "Lush Jungle East Cave"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Epic+",
        "count": 1
      }
    }
  },
  {
    "challengeName": "Challenge 18",
    "areaId": "Lush Jungle East Cave",
    "unlocks": [
      "Captain Mallow"
    ],
    "requirements": {
      "defeatMultipleSpecific": [
        {
          "name": "Zubat",
          "count": 1
        },
        {
          "name": "Ekans",
          "count": 1
        },
        {
          "name": "Nidoran♀",
          "count": 1
        },
        {
          "name": "Nidoran♂",
          "count": 1
        },
        {
          "name": "Oddish",
          "count": 1
        }
      ]
    }
  },
  {
    "challengeName": "Challenge 19",
    "areaId": "Lush Jungle East Cave",
    "unlocks": [
      "Diglett's Tunnel"
    ],
    "requirements": {
      "defeatBoss": "Captain Mallow"
    }
  },
  {
    "challengeName": "Challenge 20",
    "areaId": "Diglett's Tunnel",
    "unlocks": [
      "Akala Outskirts"
    ],
    "requirements": {
      "catchCountRoute": {
        "route": "Diglett's Tunnel",
        "count": 10
      }
    }
  },
  {
    "challengeName": "Challenge 21",
    "areaId": "Akala Outskirts",
    "unlocks": [
      "Kahuna Olivia"
    ],
    "requirements": {
      "catchSpeciesUniqueCount": 2
    }
  },
  {
    "challengeName": "Challenge 22",
    "areaId": "Akala Outskirts",
    "unlocks": [
      "Malie City"
    ],
    "requirements": {
      "defeatCountRoute": {
        "route": "Kahuna Olivia",
        "count": 10
      }
    }
  },
  {
    "challengeName": "Challenge 23",
    "areaId": "Malie City",
    "unlocks": [
      "Mount Hokulani East"
    ],
    "requirements": {
      "defeatCountRoute": {
        "route": "Malie City",
        "count": 15
      }
    }
  },
  {
    "challengeName": "Challenge 24",
    "areaId": "Mount Hokulani East",
    "unlocks": [
      "Captain Sophocles"
    ],
    "requirements": {
      "catchByType": {
        "type": "Fairy",
        "count": 3
      }
    }
  },
  {
    "challengeName": "Challenge 25",
    "areaId": "Mount Hokulani East",
    "unlocks": [
      "Haina Desert"
    ],
    "requirements": {
      "defeatCountRoute": {
        "route": "Captain Sophocles",
        "count": 10
      }
    }
  },
  {
    "challengeName": "Challenge 26",
    "areaId": "Haina Desert",
    "unlocks": [
      "Tapu Village"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Uncommon+",
        "count": 5
      }
    }
  },
  {
    "challengeName": "Challenge 27",
    "areaId": "Tapu Village",
    "unlocks": [
      "Thrifty Megamart"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 2
      }
    }
  },
  {
    "challengeName": "Challenge 28",
    "areaId": "Thrifty Megamart",
    "unlocks": [
      "Captain Acerola"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Epic+",
        "count": 1
      }
    }
  },
  {
    "challengeName": "Challenge 29",
    "areaId": "Thrifty Megamart",
    "unlocks": [
      "Kahuna Nanu"
    ],
    "requirements": {
      "defeatCountRoute": {
        "route": "Captain Acerola",
        "count": 10
      }
    }
  },
  {
    "challengeName": "Challenge 30",
    "areaId": "Captain Acerola Boss Battle",
    "unlocks": [
      "Seafolk Village"
    ],
    "requirements": {
      "defeatBoss": "Kahuna Nanu"
    }
  },
  {
    "challengeName": "Challenge 31",
    "areaId": "Poni Wilds",
    "unlocks": [
      "Poni Wilds"
    ],
    "requirements": {
      "defeatMultipleSpecific": [
        {
          "name": "Bulbasaur",
          "count": 1
        },
        {
          "name": "Oddish",
          "count": 1
        },
        {
          "name": "Paras",
          "count": 1
        },
        {
          "name": "Bellsprout",
          "count": 1
        },
        {
          "name": "Exeggcute",
          "count": 1
        }
      ]
    }
  },
  {
    "challengeName": "Challenge 32",
    "areaId": "Poni Wilds",
    "unlocks": [
      "Poni Breaker Coast"
    ],
    "requirements": {
      "catchCountRoute": {
        "route": "Poni Wilds",
        "count": 10
      }
    }
  },
  {
    "challengeName": "Challenge 33",
    "areaId": "Poni Breaker Coast",
    "unlocks": [
      "Exeggutor Island"
    ],
    "requirements": {
      "catchSpeciesUniqueCount": 2
    }
  },
  {
    "challengeName": "Challenge 34",
    "areaId": "Exeggutor Island",
    "unlocks": [
      "Vast Poni Canyon Outside"
    ],
    "requirements": {
      "defeatCountRoute": {
        "route": "Exeggutor Island",
        "count": 15
      }
    }
  },
  {
    "challengeName": "Challenge 35",
    "areaId": "Vast Poni Canyon Outside",
    "unlocks": [
      "Captain Kommo-o"
    ],
    "requirements": {
      "catchByType": {
        "type": "Fighting",
        "count": 3
      }
    }
  },
  {
    "challengeName": "Challenge 36",
    "areaId": "Vast Poni Canyon Outside",
    "unlocks": [
      "Captain Mina"
    ],
    "requirements": {
      "defeatBoss": "Captain Kommo-o"
    }
  },
  {
    "challengeName": "Challenge 37",
    "areaId": "Captain Kommo-o Boss Battle",
    "unlocks": [
      "Kahuna Hapu"
    ],
    "requirements": {
      "defeatBoss": "Captain Mina"
    }
  },
  {
    "challengeName": "Challenge 38",
    "areaId": "Captain Mina Boss Battle",
    "unlocks": [
      "Mount Lanakila"
    ],
    "requirements": {
      "defeatBoss": "Kahuna Hapu"
    }
  },
  {
    "challengeName": "Challenge 39",
    "areaId": "Mount Lanakila",
    "unlocks": [
      "Alola Pokemon League"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Uncommon+",
        "count": 5
      }
    }
  },
  {
    "challengeName": "Challenge 40",
    "areaId": "Mount Lanakila",
    "unlocks": [
      "Champion Hau"
    ],
    "requirements": {
      "defeatAlolaChampion": true
    }
  },
  {
    "challengeName": "Extra Challenge A-1",
    "areaId": "Alola Pokemon League Boss Battle",
    "unlocks": [
      "Route 6"
    ],
    "requirements": {
      "defeatBoss": "Captain Lana"
    }
  },
  {
    "challengeName": "Extra Challenge A-2",
    "areaId": "Route 6",
    "unlocks": [
      "Royal Avenue"
    ],
    "requirements": {
      "defeatCountRoute": {
        "route": "Route 6",
        "count": 10
      }
    }
  },
  {
    "challengeName": "Extra Challenge A-3",
    "areaId": "Royal Avenue",
    "unlocks": [
      "Pikachu Valley"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 2
      }
    }
  },
  {
    "challengeName": "Extra Challenge A-4",
    "areaId": "Pikachu Valley",
    "unlocks": [
      "Starter Depot"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Epic+",
        "count": 1
      }
    }
  },
  {
    "challengeName": "Extra Challenge B-1",
    "areaId": "Ruins of Conflict",
    "unlocks": [
      "Ula'ula Meadow"
    ],
    "requirements": {
      "defeatAlolaChampion": true
    }
  },
  {
    "challengeName": "Extra Challenge B-2",
    "areaId": "Blush Mountain",
    "unlocks": [
      "Blush Mountain"
    ],
    "requirements": {
      "defeatMultipleSpecific": [
        {
          "name": "Caterpie",
          "count": 1
        },
        {
          "name": "Weedle",
          "count": 1
        },
        {
          "name": "Paras",
          "count": 1
        },
        {
          "name": "Venonat",
          "count": 1
        },
        {
          "name": "Scyther",
          "count": 1
        }
      ]
    }
  },
  {
    "challengeName": "Extra Challenge B-3",
    "areaId": "Blush Mountain",
    "unlocks": [
      "Shopping Mall Antiquities"
    ],
    "requirements": {
      "catchCountRoute": {
        "route": "Blush Mountain",
        "count": 10
      }
    }
  },
  {
    "challengeName": "Extra Challenge B-4",
    "areaId": "Shopping Mall Antiquities",
    "unlocks": [
      "The Zenith Anomaly"
    ],
    "requirements": {
      "defeatCountRoute": {
        "route": "Shopping Mall Antiquities",
        "count": 10
      }
    }
  },
  {
    "challengeName": "Extra Challenge B-5",
    "areaId": "The Zenith Anomaly",
    "unlocks": [],
    "requirements": {
      "catchSpecies": [
        {
          "species": "Magearna",
          "count": 1
        },
        {
          "species": "Marshadow",
          "count": 1
        },
        {
          "species": "Zeraora",
          "count": 1
        }
      ]
    },
    "gift": {
      "item": "Masterball",
      "count": 1
    }
  },
  {
    "challengeName": "Extra Challenge C-1",
    "areaId": "Melemele Meadow",
    "unlocks": [
      "Ruins of Conflict"
    ],
    "requirements": {
      "catchSpeciesUniqueCount": 2
    }
  },
  {
    "challengeName": "Extra Challenge C-2",
    "areaId": "Ruins of Conflict",
    "unlocks": [
      "Ten Carat Hill Deepest Cave"
    ],
    "requirements": {
      "defeatCountRoute": {
        "route": "Ruins of Conflict",
        "count": 10
      }
    }
  },
  {
    "challengeName": "Extra Challenge C-3",
    "areaId": "Ten Carat Hill Deepest Cave",
    "unlocks": [
      "Kala'e Bay"
    ],
    "requirements": {
      "defeatCountRoute": {
        "route": "Ten Carat Hill Deepest Cave",
        "count": 10
      }
    }
  },
  {
    "challengeName": "Extra Challenge C-4",
    "areaId": "Kala'e Bay",
    "unlocks": [
      "Sacred Shrine"
    ],
    "requirements": {
      "defeatCountRoute": {
        "route": "Kala'e Bay",
        "count": 15
      }
    }
  },
  {
    "challengeName": "Extra Challenge C-5",
    "areaId": "Sacred Shrine",
    "unlocks": [],
    "requirements": {
      "catchSpecies": [
        {
          "species": "Tapu Koko",
          "count": 1
        },
        {
          "species": "Tapu Lele",
          "count": 1
        },
        {
          "species": "Tapu Bulu",
          "count": 1
        },
        {
          "species": "Tapu Fini",
          "count": 1
        }
      ]
    },
    "gift": {
      "item": "Masterball",
      "count": 2
    }
  },
  {
    "challengeName": "Extra Challenge D-1",
    "areaId": "Poni Plains",
    "unlocks": [
      "Poni Coast"
    ],
    "requirements": {
      "defeatCountRoute": {
        "route": "Poni Plains",
        "count": 10
      }
    }
  },
  {
    "challengeName": "Extra Challenge D-2",
    "areaId": "Poni Coast",
    "unlocks": [
      "Resolution Cave"
    ],
    "requirements": {
      "catchByType": {
        "type": "Normal",
        "count": 3
      }
    }
  },
  {
    "challengeName": "Extra Challenge D-3",
    "areaId": "Resolution Cave",
    "unlocks": [
      "Ruins of Hope"
    ],
    "requirements": {
      "defeatCountRoute": {
        "route": "Resolution Cave",
        "count": 10
      }
    }
  },
  {
    "challengeName": "Extra Challenge D-4",
    "areaId": "Ruins of Hope",
    "unlocks": [
      "The Interdimensional Rift"
    ],
    "requirements": {
      "defeatCountRoute": {
        "route": "Ruins of Hope",
        "count": 10
      }
    }
  },
  {
    "challengeName": "Extra Challenge D-5",
    "areaId": "The Interdimensional Rift",
    "unlocks": [],
    "requirements": {
      "defeatCountRoute": {
        "route": "The Interdimensional Rift",
        "count": 100
      }
    },
    "gift": {
      "item": "Masterball",
      "count": 3
    }
  },
  {
    "challengeName": "Extra Challenge E-1",
    "areaId": "Route 16",
    "unlocks": [
      "Aether Paradise Labs"
    ],
    "requirements": {
      "defeatCountRoute": {
        "route": "Route 16",
        "count": 10
      }
    }
  },
  {
    "challengeName": "Extra Challenge E-2",
    "areaId": "Aether Paradise Labs",
    "unlocks": [
      "Aether Paradise Secret Lab"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Uncommon+",
        "count": 5
      }
    }
  },
  {
    "challengeName": "Extra Challenge E-3",
    "areaId": "Aether Paradise Secret Lab",
    "unlocks": [
      "Lake of the Sunne"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 2
      }
    }
  },
  {
    "challengeName": "Extra Challenge E-4",
    "areaId": "Lake of the Sunne",
    "unlocks": [
      "Obsidian Sphere"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Epic+",
        "count": 1
      }
    }
  },
  {
    "challengeName": "Extra Challenge E-5",
    "areaId": "Obsidian Tesseract",
    "unlocks": [
      "Obsidian Tesseract"
    ],
    "requirements": {
      "catchSpecies": [
        {
          "species": "Cosmog",
          "count": 1
        },
        {
          "species": "Cosmoem",
          "count": 1
        }
      ]
    }
  },
  {
    "challengeName": "Extra Challenge E-6",
    "areaId": "Obsidian Tesseract",
    "unlocks": [],
    "requirements": {
      "catchSpecies": [
        {
          "species": "Necrozma",
          "count": 1
        },
        {
          "species": "Cosmog",
          "count": 1
        },
        {
          "species": "Cosmoem",
          "count": 1
        }
      ]
    },
    "gift": {
      "item": "Masterball",
      "count": 2
    }
  }
];
