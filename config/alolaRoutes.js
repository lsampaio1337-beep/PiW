export const alolaRoutes = [
  {
    "name": "Route 1 East",
    "spawns": [
      {
        "pokemonId": 427,
        "minLevel": 1,
        "maxLevel": 1,
        "chance": 0
      },
      {
        "pokemonId": 440,
        "minLevel": 1,
        "maxLevel": 1,
        "chance": 0
      },
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
    "challengeName": "Challenge 01",
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
    "challengeName": "Challenge 02",
    "areaId": "Route 1 Hau'oli Outskirts",
    "unlocks": [
      "Hau'oli Cemetery"
    ],
    "requirements": {
      "catchByType": {
        "type": "Dark",
        "count": 3
      }
    }
  },
  {
    "name": "Hau'oli Cemetery",
    "spawns": [
      {
        "pokemonId": 92,
        "minLevel": 7,
        "maxLevel": 12,
        "chance": 0.25
      },
      {
        "pokemonId": 425,
        "minLevel": 7,
        "maxLevel": 12,
        "chance": 0.25
      },
      {
        "pokemonId": 198,
        "minLevel": 7,
        "maxLevel": 12,
        "chance": 0.25
      },
      {
        "pokemonId": 200,
        "minLevel": 7,
        "maxLevel": 12,
        "chance": 0.25
      }
    ],
    "challengeName": "Challenge 03",
    "areaId": "Hau'oli Cemetery",
    "unlocks": [
      "Route 2 North"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 2
      }
    }
  },
  {
    "name": "Route 2 North",
    "spawns": [
      {
        "pokemonId": 204,
        "minLevel": 1,
        "maxLevel": 1,
        "chance": 0
      },
      {
        "pokemonId": 96,
        "minLevel": 10,
        "maxLevel": 15,
        "chance": 0.1515
      },
      {
        "pokemonId": 296,
        "minLevel": 10,
        "maxLevel": 15,
        "chance": 0.1515
      },
      {
        "pokemonId": 21,
        "minLevel": 10,
        "maxLevel": 15,
        "chance": 0.1515
      },
      {
        "pokemonId": 23,
        "minLevel": 10,
        "maxLevel": 15,
        "chance": 0.1515
      },
      {
        "pokemonId": 58,
        "minLevel": 10,
        "maxLevel": 15,
        "chance": 0.1515
      },
      {
        "pokemonId": 235,
        "minLevel": 10,
        "maxLevel": 15,
        "chance": 0.1515
      },
      {
        "pokemonId": 739,
        "minLevel": 10,
        "maxLevel": 15,
        "chance": 0.091
      }
    ],
    "challengeName": "Challenge 04",
    "areaId": "Route 2 North",
    "unlocks": [
      "Captain Ilima Boss Battle"
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
    "challengeName": "Challenge 05",
    "areaId": "Captain Ilima Boss Battle",
    "unlocks": [
      "Seaward Cave"
    ],
    "requirements": {
      "defeatBoss": "Captain Ilima"
    }
  },
  {
    "name": "Seaward Cave",
    "spawns": [
      {
        "pokemonId": 225,
        "minLevel": 1,
        "maxLevel": 1,
        "chance": 0
      },
      {
        "pokemonId": 339,
        "minLevel": 14,
        "maxLevel": 19,
        "chance": 0.3333
      },
      {
        "pokemonId": 238,
        "minLevel": 14,
        "maxLevel": 19,
        "chance": 0.3333
      },
      {
        "pokemonId": 86,
        "minLevel": 14,
        "maxLevel": 19,
        "chance": 0.3333
      }
    ],
    "areaId": "Seaward Cave",
    "unlocks": [
      "Kahuna Hala Boss Battle"
    ],
    "requirements": {},
    "challengeName": "Challenge 06"
  },
  {
    "name": "Kahuna Hala Boss Battle",
    "spawns": [],
    "challengeName": "Challenge 07",
    "areaId": "Kahuna Hala Boss Battle",
    "unlocks": [
      "Ten Carat Hill Farthest Hollow"
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
    "name": "Ten Carat Hill Farthest Hollow",
    "spawns": [
      {
        "pokemonId": 524,
        "minLevel": 16,
        "maxLevel": 21,
        "chance": 0.2
      },
      {
        "pokemonId": 703,
        "minLevel": 16,
        "maxLevel": 21,
        "chance": 0.2
      },
      {
        "pokemonId": 327,
        "minLevel": 16,
        "maxLevel": 21,
        "chance": 0.2
      },
      {
        "pokemonId": 303,
        "minLevel": 16,
        "maxLevel": 21,
        "chance": 0.2
      },
      {
        "pokemonId": 745,
        "minLevel": 16,
        "maxLevel": 21,
        "chance": 0.2
      },
      {
        "pokemonId": 744,
        "minLevel": 16,
        "maxLevel": 21,
        "chance": 0.1
      }
    ],
    "challengeName": "Challenge 08",
    "areaId": "Ten Carat Hill Farthest Hollow",
    "unlocks": [
      "Paniola Ranch"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Epic+",
        "count": 1
      }
    }
  },
  {
    "name": "Paniola Ranch",
    "spawns": [
      {
        "pokemonId": 506,
        "minLevel": 1,
        "maxLevel": 1,
        "chance": 0
      },
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
    "challengeName": "Challenge 09",
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
    "name": "Route 5",
    "spawns": [
      {
        "pokemonId": 674,
        "minLevel": 1,
        "maxLevel": 1,
        "chance": 0
      },
      {
        "pokemonId": 714,
        "minLevel": 23,
        "maxLevel": 28,
        "chance": 0.303
      },
      {
        "pokemonId": 753,
        "minLevel": 23,
        "maxLevel": 28,
        "chance": 0.303
      },
      {
        "pokemonId": 761,
        "minLevel": 23,
        "maxLevel": 28,
        "chance": 0.303
      },
      {
        "pokemonId": 751,
        "minLevel": 23,
        "maxLevel": 28,
        "chance": 0.091
      }
    ],
    "challengeName": "Challenge 10",
    "areaId": "Route 5",
    "unlocks": [
      "Captain Lana Boss Battle"
    ],
    "requirements": {
      "catchSpeciesUniqueCount": 2
    }
  },
  {
    "name": "Captain Lana Boss Battle",
    "spawns": [],
    "challengeName": "Challenge 11",
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
        "pokemonId": 661,
        "minLevel": 1,
        "maxLevel": 1,
        "chance": 0
      },
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
    "challengeName": "Challenge 12",
    "areaId": "Wela Volcano Park",
    "unlocks": [
      "Captain Kiawe Boss Battle"
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
    "challengeName": "Challenge 13",
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
        "pokemonId": 228,
        "minLevel": 1,
        "maxLevel": 1,
        "chance": 0
      },
      {
        "pokemonId": 209,
        "minLevel": 1,
        "maxLevel": 1,
        "chance": 0
      },
      {
        "pokemonId": 54,
        "minLevel": 1,
        "maxLevel": 1,
        "chance": 0
      },
      {
        "pokemonId": 56,
        "minLevel": 1,
        "maxLevel": 1,
        "chance": 0
      },
      {
        "pokemonId": 63,
        "minLevel": 1,
        "maxLevel": 1,
        "chance": 0
      },
      {
        "pokemonId": 120,
        "minLevel": 31,
        "maxLevel": 36,
        "chance": 0.1818
      },
      {
        "pokemonId": 771,
        "minLevel": 31,
        "maxLevel": 36,
        "chance": 0.1818
      },
      {
        "pokemonId": 222,
        "minLevel": 31,
        "maxLevel": 36,
        "chance": 0.1818
      },
      {
        "pokemonId": 747,
        "minLevel": 31,
        "maxLevel": 36,
        "chance": 0.1818
      },
      {
        "pokemonId": 779,
        "minLevel": 31,
        "maxLevel": 36,
        "chance": 0.1818
      },
      {
        "pokemonId": 746,
        "minLevel": 31,
        "maxLevel": 36,
        "chance": 0.091
      }
    ],
    "challengeName": "Challenge 14",
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
    "challengeName": "Challenge 15",
    "areaId": "Route 8 Fossil Restoration Center Part 1",
    "unlocks": [
      "Lush Jungle North",
      "Route 8 Fossil Restoration Center Part 2"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Uncommon+",
        "count": 5
      }
    }
  },
  {
    "name": "Lush Jungle North",
    "spawns": [
      {
        "pokemonId": 704,
        "minLevel": 1,
        "maxLevel": 1,
        "chance": 0
      },
      {
        "pokemonId": 46,
        "minLevel": 1,
        "maxLevel": 1,
        "chance": 0
      },
      {
        "pokemonId": 438,
        "minLevel": 1,
        "maxLevel": 1,
        "chance": 0
      },
      {
        "pokemonId": 732,
        "minLevel": 34,
        "maxLevel": 39,
        "chance": 0.1515
      },
      {
        "pokemonId": 762,
        "minLevel": 34,
        "maxLevel": 39,
        "chance": 0.1515
      },
      {
        "pokemonId": 764,
        "minLevel": 34,
        "maxLevel": 39,
        "chance": 0.1515
      },
      {
        "pokemonId": 163,
        "minLevel": 34,
        "maxLevel": 39,
        "chance": 0.1515
      },
      {
        "pokemonId": 765,
        "minLevel": 34,
        "maxLevel": 39,
        "chance": 0.1515
      },
      {
        "pokemonId": 761,
        "minLevel": 34,
        "maxLevel": 39,
        "chance": 0.1515
      },
      {
        "pokemonId": 755,
        "minLevel": 34,
        "maxLevel": 39,
        "chance": 0.091
      }
    ],
    "challengeName": "Challenge 16",
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
    "challengeName": "Challenge 17",
    "areaId": "Lush Jungle East Cave",
    "unlocks": [
      "Captain Mallow Boss Battle"
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
    "unlocks": [
      "Diglett's Tunnel"
    ],
    "requirements": {},
    "challengeName": "Challenge 18"
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
    "challengeName": "Challenge 19",
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
    "challengeName": "Challenge 20",
    "areaId": "Akala Outskirts",
    "unlocks": [
      "Kahuna Olivia Boss Battle"
    ],
    "requirements": {
      "catchSpeciesUniqueCount": 2
    }
  },
  {
    "name": "Kahuna Olivia Boss Battle",
    "spawns": [],
    "areaId": "Kahuna Olivia Boss Battle",
    "unlocks": [
      "Malie City"
    ],
    "requirements": {},
    "challengeName": "Challenge 21"
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
    "challengeName": "Challenge 22",
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
        "pokemonId": 132,
        "minLevel": 1,
        "maxLevel": 1,
        "chance": 0
      },
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
    "challengeName": "Challenge 23",
    "areaId": "Mount Hokulani East",
    "unlocks": [
      "Captain Sophocles Boss Battle"
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
    "unlocks": [
      "Tapu Village"
    ],
    "requirements": {},
    "challengeName": "Challenge 24"
  },
  {
    "name": "Tapu Village",
    "spawns": [
      {
        "pokemonId": 75,
        "minLevel": 58,
        "maxLevel": 63,
        "chance": 0.16670000000000001
      },
      {
        "pokemonId": 779,
        "minLevel": 58,
        "maxLevel": 63,
        "chance": 0.16670000000000001
      },
      {
        "pokemonId": 359,
        "minLevel": 58,
        "maxLevel": 63,
        "chance": 0.16670000000000001
      },
      {
        "pokemonId": 361,
        "minLevel": 58,
        "maxLevel": 63,
        "chance": 0.16670000000000001
      },
      {
        "pokemonId": 27,
        "minLevel": 58,
        "maxLevel": 63,
        "chance": 0.16670000000000001
      },
      {
        "pokemonId": 37,
        "minLevel": 58,
        "maxLevel": 63,
        "chance": 0.16670000000000001
      }
    ],
    "challengeName": "Challenge 25",
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
        "minLevel": 60,
        "maxLevel": 65,
        "chance": 0.25
      },
      {
        "pokemonId": 707,
        "minLevel": 60,
        "maxLevel": 65,
        "chance": 0.25
      },
      {
        "pokemonId": 353,
        "minLevel": 60,
        "maxLevel": 65,
        "chance": 0.25
      },
      {
        "pokemonId": 525,
        "minLevel": 60,
        "maxLevel": 65,
        "chance": 0.25
      },
      {
        "pokemonId": 778,
        "minLevel": 60,
        "maxLevel": 65,
        "chance": 0.1
      }
    ],
    "challengeName": "Challenge 26",
    "areaId": "Thrifty Megamart",
    "unlocks": [
      "Captain Acerola Boss Battle"
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
    "challengeName": "Challenge 27",
    "areaId": "Captain Acerola Boss Battle",
    "unlocks": [
      "Haina Desert"
    ],
    "requirements": {
      "defeatBoss": "Kahuna Nanu"
    }
  },
  {
    "name": "Haina Desert",
    "spawns": [
      {
        "pokemonId": 622,
        "minLevel": 1,
        "maxLevel": 1,
        "chance": 0
      },
      {
        "pokemonId": 343,
        "minLevel": 1,
        "maxLevel": 1,
        "chance": 0
      },
      {
        "pokemonId": 328,
        "minLevel": 1,
        "maxLevel": 1,
        "chance": 0
      },
      {
        "pokemonId": 51,
        "minLevel": 63,
        "maxLevel": 68,
        "chance": 0.2
      },
      {
        "pokemonId": 551,
        "minLevel": 63,
        "maxLevel": 68,
        "chance": 0.2
      },
      {
        "pokemonId": 552,
        "minLevel": 63,
        "maxLevel": 68,
        "chance": 0.2
      },
      {
        "pokemonId": 120,
        "minLevel": 63,
        "maxLevel": 68,
        "chance": 0.2
      },
      {
        "pokemonId": 769,
        "minLevel": 63,
        "maxLevel": 68,
        "chance": 0.2
      }
    ],
    "challengeName": "Challenge 28",
    "areaId": "Haina Desert",
    "unlocks": [
      "Kahuna Nanu Boss Battle"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Uncommon+",
        "count": 5
      }
    }
  },
  {
    "name": "Kahuna Nanu Boss Battle",
    "spawns": [],
    "areaId": "Kahuna Nanu Boss Battle",
    "unlocks": [
      "Seafolk Village"
    ],
    "requirements": {},
    "challengeName": "Challenge 29"
  },
  {
    "name": "Seafolk Village",
    "spawns": [
      {
        "pokemonId": 142,
        "minLevel": 1,
        "maxLevel": 1,
        "chance": 0
      },
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
    "unlocks": [
      "Poni Wilds"
    ],
    "requirements": {},
    "challengeName": "Challenge 30"
  },
  {
    "name": "Poni Wilds",
    "spawns": [
      {
        "pokemonId": 676,
        "minLevel": 1,
        "maxLevel": 1,
        "chance": 0
      },
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
      "Poni Breaker Coast"
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
    "challengeName": "Challenge 32",
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
        "pokemonId": 351,
        "minLevel": 1,
        "maxLevel": 1,
        "chance": 0
      },
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
    "challengeName": "Challenge 33",
    "areaId": "Exeggutor Island",
    "unlocks": [
      "Kahuna Hapu Boss Battle"
    ],
    "requirements": {
      "defeatCountRoute": {
        "route": "Exeggutor Island",
        "count": 15
      }
    }
  },
  {
    "name": "Kahuna Hapu Boss Battle",
    "spawns": [],
    "areaId": "Kahuna Hapu Boss Battle",
    "unlocks": [
      "Vast Poni Canyon Outside"
    ],
    "requirements": {},
    "challengeName": "Challenge 34"
  },
  {
    "name": "Vast Poni Canyon Outside",
    "spawns": [
      {
        "pokemonId": 227,
        "minLevel": 1,
        "maxLevel": 1,
        "chance": 0
      },
      {
        "pokemonId": 67,
        "minLevel": 75,
        "maxLevel": 80,
        "chance": 0.303
      },
      {
        "pokemonId": 619,
        "minLevel": 75,
        "maxLevel": 80,
        "chance": 0.303
      },
      {
        "pokemonId": 782,
        "minLevel": 75,
        "maxLevel": 80,
        "chance": 0.303
      },
      {
        "pokemonId": 783,
        "minLevel": 75,
        "maxLevel": 80,
        "chance": 0.091
      }
    ],
    "challengeName": "Challenge 35",
    "areaId": "Vast Poni Canyon Outside",
    "unlocks": [
      "Captain Mina Boss Battle"
    ],
    "requirements": {
      "catchByType": {
        "type": "Fighting",
        "count": 3
      }
    }
  },
  {
    "name": "Captain Mina Boss Battle",
    "spawns": [],
    "challengeName": "Challenge 36",
    "areaId": "Captain Mina Boss Battle",
    "unlocks": [
      "Captain Kommo-o Boss Battle"
    ],
    "requirements": {
      "defeatBoss": "Kahuna Hapu"
    }
  },
  {
    "name": "Captain Kommo-o Boss Battle",
    "spawns": [],
    "challengeName": "Challenge 37",
    "areaId": "Captain Kommo-o Boss Battle",
    "unlocks": [
      "Mount Lanakila"
    ],
    "requirements": {
      "defeatBoss": "Captain Mina"
    }
  },
  {
    "name": "Mount Lanakila",
    "spawns": [
      {
        "pokemonId": 584,
        "minLevel": 1,
        "maxLevel": 1,
        "chance": 0
      },
      {
        "pokemonId": 582,
        "minLevel": 1,
        "maxLevel": 1,
        "chance": 0
      },
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
    "challengeName": "Challenge 38",
    "areaId": "Mount Lanakila",
    "unlocks": [
      "Alola Pokemon League Boss Battle"
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
    "challengeName": "Challenge 39",
    "areaId": "Alola Pokemon League Boss Battle",
    "unlocks": [
      "Champion Hau Boss Battle"
    ],
    "requirements": {
      "defeatBoss": "Captain Lana"
    }
  },
  {
    "name": "Champion Hau Boss Battle",
    "spawns": [],
    "areaId": "Champion Hau Boss Battle",
    "unlocks": [
      "Route 3",
      "Poni Grove",
      "Route 10",
      "Aether Base",
      "Route 9"
    ],
    "requirements": {
      "defeatCountRoute": {
        "route": "Champion Hau Boss Battle",
        "count": 250
      }
    },
    "challengeName": "Challenge 40"
  },
  {
    "name": "Crystal Depths",
    "spawns": [
      {
        "pokemonId": 341,
        "minLevel": 125,
        "maxLevel": 130,
        "chance": 0.111
      },
      {
        "pokemonId": 349,
        "minLevel": 125,
        "maxLevel": 130,
        "chance": 0.111
      },
      {
        "pokemonId": 366,
        "minLevel": 125,
        "maxLevel": 130,
        "chance": 0.111
      },
      {
        "pokemonId": 368,
        "minLevel": 125,
        "maxLevel": 130,
        "chance": 0.111
      },
      {
        "pokemonId": 370,
        "minLevel": 125,
        "maxLevel": 130,
        "chance": 0.111
      },
      {
        "pokemonId": 550,
        "minLevel": 125,
        "maxLevel": 130,
        "chance": 0.111
      },
      {
        "pokemonId": 592,
        "minLevel": 125,
        "maxLevel": 130,
        "chance": 0.111
      },
      {
        "pokemonId": 594,
        "minLevel": 125,
        "maxLevel": 130,
        "chance": 0.111
      },
      {
        "pokemonId": 692,
        "minLevel": 125,
        "maxLevel": 130,
        "chance": 0.112
      }
    ],
    "challengeName": "Extra Challenge Z 01",
    "areaId": "Crystal Depths",
    "unlocks": [
      "Dragon's Peak"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Uncommon+",
        "count": 5
      }
    }
  },
  {
    "name": "Dragon's Peak",
    "spawns": [
      {
        "pokemonId": 147,
        "minLevel": 125,
        "maxLevel": 130,
        "chance": 0.111
      },
      {
        "pokemonId": 330,
        "minLevel": 125,
        "maxLevel": 130,
        "chance": 0.111
      },
      {
        "pokemonId": 373,
        "minLevel": 125,
        "maxLevel": 130,
        "chance": 0.111
      },
      {
        "pokemonId": 443,
        "minLevel": 125,
        "maxLevel": 130,
        "chance": 0.111
      },
      {
        "pokemonId": 445,
        "minLevel": 125,
        "maxLevel": 130,
        "chance": 0.111
      },
      {
        "pokemonId": 706,
        "minLevel": 125,
        "maxLevel": 130,
        "chance": 0.111
      },
      {
        "pokemonId": 718,
        "minLevel": 125,
        "maxLevel": 130,
        "chance": 0.111
      },
      {
        "pokemonId": 467,
        "minLevel": 125,
        "maxLevel": 130,
        "chance": 0.111
      },
      {
        "pokemonId": 663,
        "minLevel": 125,
        "maxLevel": 130,
        "chance": 0.112
      }
    ],
    "challengeName": "Extra Challenge Z 02",
    "areaId": "Dragon's Peak",
    "unlocks": [
      "Serene Meadows"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Uncommon+",
        "count": 5
      }
    }
  },
  {
    "name": "Serene Meadows",
    "spawns": [
      {
        "pokemonId": 36,
        "minLevel": 125,
        "maxLevel": 130,
        "chance": 0.111
      },
      {
        "pokemonId": 40,
        "minLevel": 125,
        "maxLevel": 130,
        "chance": 0.111
      },
      {
        "pokemonId": 108,
        "minLevel": 125,
        "maxLevel": 130,
        "chance": 0.111
      },
      {
        "pokemonId": 439,
        "minLevel": 125,
        "maxLevel": 130,
        "chance": 0.111
      },
      {
        "pokemonId": 446,
        "minLevel": 125,
        "maxLevel": 130,
        "chance": 0.111
      },
      {
        "pokemonId": 474,
        "minLevel": 125,
        "maxLevel": 130,
        "chance": 0.111
      },
      {
        "pokemonId": 508,
        "minLevel": 125,
        "maxLevel": 130,
        "chance": 0.111
      },
      {
        "pokemonId": 627,
        "minLevel": 125,
        "maxLevel": 130,
        "chance": 0.111
      },
      {
        "pokemonId": 667,
        "minLevel": 125,
        "maxLevel": 130,
        "chance": 0.112
      }
    ],
    "challengeName": "Extra Challenge Z 03",
    "areaId": "Serene Meadows",
    "unlocks": [
      "Shadow Forge"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Uncommon+",
        "count": 5
      }
    }
  },
  {
    "name": "Shadow Forge",
    "spawns": [
      {
        "pokemonId": 181,
        "minLevel": 125,
        "maxLevel": 130,
        "chance": 0.125
      },
      {
        "pokemonId": 248,
        "minLevel": 125,
        "maxLevel": 130,
        "chance": 0.125
      },
      {
        "pokemonId": 309,
        "minLevel": 125,
        "maxLevel": 130,
        "chance": 0.125
      },
      {
        "pokemonId": 462,
        "minLevel": 125,
        "maxLevel": 130,
        "chance": 0.125
      },
      {
        "pokemonId": 466,
        "minLevel": 125,
        "maxLevel": 130,
        "chance": 0.125
      },
      {
        "pokemonId": 570,
        "minLevel": 125,
        "maxLevel": 130,
        "chance": 0.125
      },
      {
        "pokemonId": 624,
        "minLevel": 125,
        "maxLevel": 130,
        "chance": 0.125
      },
      {
        "pokemonId": 629,
        "minLevel": 125,
        "maxLevel": 130,
        "chance": 0.125
      }
    ],
    "challengeName": "Extra Challenge Z 04",
    "areaId": "Shadow Forge",
    "unlocks": [
      "Mystic Grotto"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Uncommon+",
        "count": 5
      }
    }
  },
  {
    "name": "Mystic Grotto",
    "spawns": [
      {
        "pokemonId": 65,
        "minLevel": 125,
        "maxLevel": 130,
        "chance": 0.166
      },
      {
        "pokemonId": 302,
        "minLevel": 125,
        "maxLevel": 130,
        "chance": 0.166
      },
      {
        "pokemonId": 376,
        "minLevel": 125,
        "maxLevel": 130,
        "chance": 0.166
      },
      {
        "pokemonId": 671,
        "minLevel": 125,
        "maxLevel": 130,
        "chance": 0.166
      },
      {
        "pokemonId": 447,
        "minLevel": 125,
        "maxLevel": 130,
        "chance": 0.166
      },
      {
        "pokemonId": 690,
        "minLevel": 125,
        "maxLevel": 130,
        "chance": 0.17
      }
    ],
    "challengeName": "Extra Challenge Z 05",
    "areaId": "Mystic Grotto",
    "unlocks": [],
    "requirements": {
      "catchByQuality": {
        "quality": "Uncommon+",
        "count": 5
      }
    }
  },
  {
    "name": "Alola Forest W01",
    "spawns": [
      {
        "pokemonId": 10,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 12,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 46,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 123,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 127,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 165,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 166,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.142
      }
    ]
  },
  {
    "name": "Alola Forest W02",
    "spawns": [
      {
        "pokemonId": 167,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 168,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 204,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 205,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 212,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 214,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 283,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.142
      }
    ]
  },
  {
    "name": "Alola Forest W03",
    "spawns": [
      {
        "pokemonId": 284,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 636,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 637,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 736,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 737,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 738,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 742,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.142
      }
    ]
  },
  {
    "name": "Alola Forest W04",
    "spawns": [
      {
        "pokemonId": 743,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.2
      },
      {
        "pokemonId": 767,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.2
      },
      {
        "pokemonId": 768,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.2
      },
      {
        "pokemonId": 794,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.2
      },
      {
        "pokemonId": 795,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.2
      }
    ]
  },
  {
    "name": "Alola Plain W05",
    "spawns": [
      {
        "pokemonId": 19,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 21,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 40,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 52,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 108,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 115,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 128,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.142
      }
    ]
  },
  {
    "name": "Alola Plain W06",
    "spawns": [
      {
        "pokemonId": 132,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 137,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 143,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 163,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 164,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 174,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 190,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.142
      }
    ]
  },
  {
    "name": "Alola Plain W07",
    "spawns": [
      {
        "pokemonId": 206,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 233,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 235,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 241,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 242,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 327,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 351,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.142
      }
    ]
  },
  {
    "name": "Alola Plain W08",
    "spawns": [
      {
        "pokemonId": 352,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 424,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 427,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 428,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 440,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 446,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 463,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.142
      }
    ]
  },
  {
    "name": "Alola Plain W09",
    "spawns": [
      {
        "pokemonId": 474,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 506,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 507,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 508,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 572,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 573,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 627,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.142
      }
    ]
  },
  {
    "name": "Alola Plain W10",
    "spawns": [
      {
        "pokemonId": 628,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 661,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 676,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 731,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 732,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 733,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 734,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.142
      }
    ]
  },
  {
    "name": "Alola Plain W11",
    "spawns": [
      {
        "pokemonId": 735,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.125
      },
      {
        "pokemonId": 759,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.125
      },
      {
        "pokemonId": 760,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.125
      },
      {
        "pokemonId": 765,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.125
      },
      {
        "pokemonId": 772,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.125
      },
      {
        "pokemonId": 773,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.125
      },
      {
        "pokemonId": 775,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.125
      },
      {
        "pokemonId": 780,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.125
      }
    ]
  },
  {
    "name": "Alola Swamp W12",
    "spawns": [
      {
        "pokemonId": 23,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 41,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 88,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 169,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 568,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 569,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 690,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.142
      }
    ]
  },
  {
    "name": "Alola Swamp W13",
    "spawns": [
      {
        "pokemonId": 691,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 747,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 748,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 757,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 758,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 803,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 804,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.142
      }
    ]
  },
  {
    "name": "Alola Power Plant W14",
    "spawns": [
      {
        "pokemonId": 26,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 81,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 135,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 172,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 179,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 180,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 181,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.142
      }
    ]
  },
  {
    "name": "Alola Power Plant W15",
    "spawns": [
      {
        "pokemonId": 239,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 309,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 310,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 462,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 466,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 587,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 702,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.142
      }
    ]
  },
  {
    "name": "Alola Power Plant W16",
    "spawns": [
      {
        "pokemonId": 777,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.25
      },
      {
        "pokemonId": 785,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.25
      },
      {
        "pokemonId": 796,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.25
      },
      {
        "pokemonId": 807,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.25
      }
    ]
  },
  {
    "name": "Alola Desert W17",
    "spawns": [
      {
        "pokemonId": 27,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 50,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 104,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 328,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 329,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 330,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 343,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.142
      }
    ]
  },
  {
    "name": "Alola Desert W18",
    "spawns": [
      {
        "pokemonId": 344,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.125
      },
      {
        "pokemonId": 551,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.125
      },
      {
        "pokemonId": 552,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.125
      },
      {
        "pokemonId": 553,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.125
      },
      {
        "pokemonId": 622,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.125
      },
      {
        "pokemonId": 623,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.125
      },
      {
        "pokemonId": 749,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.125
      },
      {
        "pokemonId": 750,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.125
      }
    ]
  },
  {
    "name": "Alola Meadow W19",
    "spawns": [
      {
        "pokemonId": 36,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.111
      },
      {
        "pokemonId": 173,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.111
      },
      {
        "pokemonId": 209,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.111
      },
      {
        "pokemonId": 210,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.111
      },
      {
        "pokemonId": 669,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.111
      },
      {
        "pokemonId": 670,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.111
      },
      {
        "pokemonId": 671,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.111
      },
      {
        "pokemonId": 700,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.111
      },
      {
        "pokemonId": 764,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.112
      }
    ]
  },
  {
    "name": "Alola Volcano W20",
    "spawns": [
      {
        "pokemonId": 37,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 58,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 136,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 240,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 324,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 467,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 662,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.142
      }
    ]
  },
  {
    "name": "Alola Volcano W21",
    "spawns": [
      {
        "pokemonId": 663,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.111
      },
      {
        "pokemonId": 667,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.111
      },
      {
        "pokemonId": 668,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.111
      },
      {
        "pokemonId": 725,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.111
      },
      {
        "pokemonId": 726,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.111
      },
      {
        "pokemonId": 727,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.111
      },
      {
        "pokemonId": 741,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.111
      },
      {
        "pokemonId": 776,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.111
      },
      {
        "pokemonId": 806,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.112
      }
    ]
  },
  {
    "name": "Alola Ocean W22",
    "spawns": [
      {
        "pokemonId": 54,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 72,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 79,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 86,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 90,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 118,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 120,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.142
      }
    ]
  },
  {
    "name": "Alola Ocean W23",
    "spawns": [
      {
        "pokemonId": 129,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 131,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 134,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 170,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 171,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 186,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 199,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.142
      }
    ]
  },
  {
    "name": "Alola Ocean W24",
    "spawns": [
      {
        "pokemonId": 222,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 223,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 224,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 226,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 278,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 279,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 318,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.142
      }
    ]
  },
  {
    "name": "Alola Ocean W25",
    "spawns": [
      {
        "pokemonId": 319,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 320,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 321,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 339,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 340,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 341,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 342,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.142
      }
    ]
  },
  {
    "name": "Alola Ocean W26",
    "spawns": [
      {
        "pokemonId": 349,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 350,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 366,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 367,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 368,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 369,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 370,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.142
      }
    ]
  },
  {
    "name": "Alola Ocean W27",
    "spawns": [
      {
        "pokemonId": 422,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 423,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 456,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 457,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 458,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 550,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 564,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.142
      }
    ]
  },
  {
    "name": "Alola Ocean W28",
    "spawns": [
      {
        "pokemonId": 565,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 592,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 593,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 594,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 692,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 693,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 728,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.142
      }
    ]
  },
  {
    "name": "Alola Ocean W29",
    "spawns": [
      {
        "pokemonId": 729,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.125
      },
      {
        "pokemonId": 730,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.125
      },
      {
        "pokemonId": 746,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.125
      },
      {
        "pokemonId": 751,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.125
      },
      {
        "pokemonId": 752,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.125
      },
      {
        "pokemonId": 771,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.125
      },
      {
        "pokemonId": 779,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.125
      },
      {
        "pokemonId": 788,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.125
      }
    ]
  },
  {
    "name": "Alola Dojo W30",
    "spawns": [
      {
        "pokemonId": 56,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 66,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 68,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 296,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 297,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 447,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 448,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.142
      }
    ]
  },
  {
    "name": "Alola Dojo W31",
    "spawns": [
      {
        "pokemonId": 619,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.111
      },
      {
        "pokemonId": 620,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.111
      },
      {
        "pokemonId": 674,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.111
      },
      {
        "pokemonId": 675,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.111
      },
      {
        "pokemonId": 701,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.111
      },
      {
        "pokemonId": 739,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.111
      },
      {
        "pokemonId": 740,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.111
      },
      {
        "pokemonId": 766,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.111
      },
      {
        "pokemonId": 802,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.112
      }
    ]
  },
  {
    "name": "Alola Mind W32",
    "spawns": [
      {
        "pokemonId": 63,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 65,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 96,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 177,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 178,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 196,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 439,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.142
      }
    ]
  },
  {
    "name": "Alola Mind W33",
    "spawns": [
      {
        "pokemonId": 605,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.125
      },
      {
        "pokemonId": 606,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.125
      },
      {
        "pokemonId": 786,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.125
      },
      {
        "pokemonId": 789,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.125
      },
      {
        "pokemonId": 790,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.125
      },
      {
        "pokemonId": 791,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.125
      },
      {
        "pokemonId": 792,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.125
      },
      {
        "pokemonId": 800,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.125
      }
    ]
  },
  {
    "name": "Alola Crag W34",
    "spawns": [
      {
        "pokemonId": 74,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 76,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 138,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 139,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 140,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 141,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 142,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.142
      }
    ]
  },
  {
    "name": "Alola Crag W35",
    "spawns": [
      {
        "pokemonId": 185,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 246,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 247,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 248,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 299,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 345,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 346,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.142
      }
    ]
  },
  {
    "name": "Alola Crag W36",
    "spawns": [
      {
        "pokemonId": 347,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 348,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 408,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 409,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 410,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 411,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 438,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.142
      }
    ]
  },
  {
    "name": "Alola Crag W37",
    "spawns": [
      {
        "pokemonId": 476,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 524,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 525,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 526,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 566,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 567,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 696,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.142
      }
    ]
  },
  {
    "name": "Alola Crag W38",
    "spawns": [
      {
        "pokemonId": 697,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.111
      },
      {
        "pokemonId": 698,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.111
      },
      {
        "pokemonId": 699,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.111
      },
      {
        "pokemonId": 703,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.111
      },
      {
        "pokemonId": 744,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.111
      },
      {
        "pokemonId": 745,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.111
      },
      {
        "pokemonId": 774,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.111
      },
      {
        "pokemonId": 793,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.111
      },
      {
        "pokemonId": 805,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.112
      }
    ]
  },
  {
    "name": "Alola Graveyard W39",
    "spawns": [
      {
        "pokemonId": 92,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 94,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 200,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 353,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 354,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 425,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 426,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.142
      }
    ]
  },
  {
    "name": "Alola Graveyard W40",
    "spawns": [
      {
        "pokemonId": 429,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 708,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 709,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 769,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 770,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 778,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 781,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.142
      }
    ]
  },
  {
    "name": "Alola Jungle W41",
    "spawns": [
      {
        "pokemonId": 102,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 357,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 470,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 546,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 547,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 548,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 549,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.142
      }
    ]
  },
  {
    "name": "Alola Jungle W42",
    "spawns": [
      {
        "pokemonId": 722,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 723,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 724,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 753,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 754,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 755,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 756,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.142
      }
    ]
  },
  {
    "name": "Alola Jungle W43",
    "spawns": [
      {
        "pokemonId": 761,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.2
      },
      {
        "pokemonId": 762,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.2
      },
      {
        "pokemonId": 763,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.2
      },
      {
        "pokemonId": 787,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.2
      },
      {
        "pokemonId": 798,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.2
      }
    ]
  },
  {
    "name": "Alola Den W44",
    "spawns": [
      {
        "pokemonId": 147,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 148,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 149,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 371,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 372,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 373,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 443,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.142
      }
    ]
  },
  {
    "name": "Alola Den W45",
    "spawns": [
      {
        "pokemonId": 444,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 445,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 621,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 704,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 705,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 706,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 718,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.142
      }
    ]
  },
  {
    "name": "Alola Den W46",
    "spawns": [
      {
        "pokemonId": 782,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.333
      },
      {
        "pokemonId": 783,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.333
      },
      {
        "pokemonId": 784,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.334
      }
    ]
  },
  {
    "name": "Alola Shadow W47",
    "spawns": [
      {
        "pokemonId": 197,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 198,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 215,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 228,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 229,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 302,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 359,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.142
      }
    ]
  },
  {
    "name": "Alola Shadow W48",
    "spawns": [
      {
        "pokemonId": 430,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 461,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 559,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 560,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 570,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 571,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.143
      },
      {
        "pokemonId": 624,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.142
      }
    ]
  },
  {
    "name": "Alola Shadow W49",
    "spawns": [
      {
        "pokemonId": 625,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.167
      },
      {
        "pokemonId": 629,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.167
      },
      {
        "pokemonId": 630,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.167
      },
      {
        "pokemonId": 686,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.167
      },
      {
        "pokemonId": 687,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.167
      },
      {
        "pokemonId": 799,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.165
      }
    ]
  },
  {
    "name": "Alola Glacier W50",
    "spawns": [
      {
        "pokemonId": 225,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.111
      },
      {
        "pokemonId": 238,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.111
      },
      {
        "pokemonId": 361,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.111
      },
      {
        "pokemonId": 362,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.111
      },
      {
        "pokemonId": 471,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.111
      },
      {
        "pokemonId": 478,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.111
      },
      {
        "pokemonId": 582,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.111
      },
      {
        "pokemonId": 583,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.111
      },
      {
        "pokemonId": 584,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.112
      }
    ]
  },
  {
    "name": "Alola Factory W51",
    "spawns": [
      {
        "pokemonId": 227,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.125
      },
      {
        "pokemonId": 303,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.125
      },
      {
        "pokemonId": 374,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.125
      },
      {
        "pokemonId": 375,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.125
      },
      {
        "pokemonId": 376,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.125
      },
      {
        "pokemonId": 707,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.125
      },
      {
        "pokemonId": 797,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.125
      },
      {
        "pokemonId": 801,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.125
      }
    ]
  },
  {
    "name": "Alola Sky W52",
    "spawns": [
      {
        "pokemonId": 714,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.5
      },
      {
        "pokemonId": 715,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.5
      }
    ]
  },
  {
    "name": "Route 3",
    "spawns": [],
    "challengeName": "Extra Challenge A 01",
    "areaId": "Route 3",
    "unlocks": [
      "Route 6"
    ],
    "requirements": {
      "defeatCountRoute": {
        "route": "Route 3",
        "count": 300
      }
    }
  },
  {
    "name": "Route 6",
    "spawns": [
      {
        "pokemonId": 701,
        "minLevel": 86,
        "maxLevel": 94,
        "chance": 0.13
      },
      {
        "pokemonId": 206,
        "minLevel": 84,
        "maxLevel": 92,
        "chance": 0.16
      },
      {
        "pokemonId": 587,
        "minLevel": 84,
        "maxLevel": 92,
        "chance": 0.15
      },
      {
        "pokemonId": 118,
        "minLevel": 83,
        "maxLevel": 91,
        "chance": 0.2
      },
      {
        "pokemonId": 186,
        "minLevel": 86,
        "maxLevel": 94,
        "chance": 0.04
      },
      {
        "pokemonId": 174,
        "minLevel": 80,
        "maxLevel": 88,
        "chance": 0.31
      }
    ],
    "challengeName": "Extra Challenge A 02",
    "areaId": "Route 6",
    "unlocks": [
      "Melemele Meadow"
    ],
    "requirements": {
      "defeatCountRoute": {
        "route": "Route 6",
        "count": 10
      }
    }
  },
  {
    "name": "Melemele Meadow",
    "spawns": [
      {
        "pokemonId": 10,
        "minLevel": 87,
        "maxLevel": 95,
        "chance": 0.2
      },
      {
        "pokemonId": 11,
        "minLevel": 87,
        "maxLevel": 95,
        "chance": 0.1
      },
      {
        "pokemonId": 742,
        "minLevel": 88,
        "maxLevel": 96,
        "chance": 0.13
      },
      {
        "pokemonId": 12,
        "minLevel": 90,
        "maxLevel": 98,
        "chance": 0.03
      },
      {
        "pokemonId": 669,
        "minLevel": 88,
        "maxLevel": 96,
        "chance": 0.13
      },
      {
        "pokemonId": 548,
        "minLevel": 88,
        "maxLevel": 96,
        "chance": 0.14
      },
      {
        "pokemonId": 546,
        "minLevel": 88,
        "maxLevel": 96,
        "chance": 0.14
      },
      {
        "pokemonId": 708,
        "minLevel": 88,
        "maxLevel": 96,
        "chance": 0.13
      }
    ],
    "challengeName": "Extra Challenge A 03",
    "areaId": "Melemele Meadow",
    "unlocks": [
      "Kala'e Bay"
    ],
    "requirements": {
      "catchSpeciesUniqueCount": 2
    }
  },
  {
    "name": "Kala'e Bay",
    "spawns": [
      {
        "pokemonId": 458,
        "minLevel": 92,
        "maxLevel": 100,
        "chance": 0.15
      },
      {
        "pokemonId": 223,
        "minLevel": 92,
        "maxLevel": 100,
        "chance": 0.17
      },
      {
        "pokemonId": 371,
        "minLevel": 92,
        "maxLevel": 100,
        "chance": 0.17
      },
      {
        "pokemonId": 90,
        "minLevel": 92,
        "maxLevel": 100,
        "chance": 0.17
      },
      {
        "pokemonId": 79,
        "minLevel": 92,
        "maxLevel": 100,
        "chance": 0.17
      },
      {
        "pokemonId": 456,
        "minLevel": 92,
        "maxLevel": 100,
        "chance": 0.16
      }
    ],
    "challengeName": "Extra Challenge A 04",
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
        "minLevel": 96,
        "maxLevel": 104,
        "chance": 0.25
      },
      {
        "pokemonId": 786,
        "minLevel": 96,
        "maxLevel": 104,
        "chance": 0.25
      },
      {
        "pokemonId": 787,
        "minLevel": 96,
        "maxLevel": 104,
        "chance": 0.25
      },
      {
        "pokemonId": 788,
        "minLevel": 96,
        "maxLevel": 104,
        "chance": 0.25
      }
    ],
    "challengeName": "Extra Challenge A 05",
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
    }
  },
  {
    "name": "Poni Grove",
    "spawns": [],
    "challengeName": "Extra Challenge B 01",
    "areaId": "Poni Grove",
    "unlocks": [
      "Poni Plains"
    ],
    "requirements": {
      "defeatCountRoute": {
        "route": "Poni Grove",
        "count": 300
      }
    }
  },
  {
    "name": "Poni Plains",
    "spawns": [
      {
        "pokemonId": 190,
        "minLevel": 82,
        "maxLevel": 90,
        "chance": 0.51
      },
      {
        "pokemonId": 123,
        "minLevel": 84,
        "maxLevel": 92,
        "chance": 0.37
      },
      {
        "pokemonId": 242,
        "minLevel": 85,
        "maxLevel": 93,
        "chance": 0.11
      }
    ],
    "challengeName": "Extra Challenge B 02",
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
    "name": "Poni Coast",
    "spawns": [
      {
        "pokemonId": 51,
        "minLevel": 88,
        "maxLevel": 96,
        "chance": 0.22
      },
      {
        "pokemonId": 423,
        "minLevel": 89,
        "maxLevel": 97,
        "chance": 0.2
      },
      {
        "pokemonId": 102,
        "minLevel": 87,
        "maxLevel": 95,
        "chance": 0.58
      }
    ],
    "challengeName": "Extra Challenge B 03",
    "areaId": "Poni Coast",
    "unlocks": [
      "Route 16"
    ],
    "requirements": {
      "catchByType": {
        "type": "Normal",
        "count": 3
      }
    }
  },
  {
    "name": "Route 16",
    "spawns": [
      {
        "pokemonId": 214,
        "minLevel": 93,
        "maxLevel": 101,
        "chance": 0.2
      },
      {
        "pokemonId": 559,
        "minLevel": 91,
        "maxLevel": 99,
        "chance": 0.29
      },
      {
        "pokemonId": 149,
        "minLevel": 96,
        "maxLevel": 104,
        "chance": 0.06
      },
      {
        "pokemonId": 61,
        "minLevel": 92,
        "maxLevel": 100,
        "chance": 0.13
      },
      {
        "pokemonId": 60,
        "minLevel": 90,
        "maxLevel": 98,
        "chance": 0.33
      }
    ],
    "challengeName": "Extra Challenge B 04",
    "areaId": "Route 16",
    "unlocks": [
      "Lake of the Sunne"
    ],
    "requirements": {
      "defeatCountRoute": {
        "route": "Route 16",
        "count": 10
      }
    }
  },
  {
    "name": "Lake of the Sunne",
    "spawns": [
      {
        "pokemonId": 42,
        "minLevel": 97,
        "maxLevel": 105,
        "chance": 0.2
      },
      {
        "pokemonId": 92,
        "minLevel": 95,
        "maxLevel": 103,
        "chance": 0.58
      },
      {
        "pokemonId": 93,
        "minLevel": 96,
        "maxLevel": 104,
        "chance": 0.22
      }
    ],
    "challengeName": "Extra Challenge B 05",
    "areaId": "Lake of the Sunne",
    "unlocks": [],
    "requirements": {
      "catchByQuality": {
        "quality": "Epic+",
        "count": 1
      }
    }
  },
  {
    "name": "Route 10",
    "spawns": [],
    "challengeName": "Extra Challenge C 01",
    "areaId": "Route 10",
    "unlocks": [
      "Ula'ula Meadow"
    ],
    "requirements": {
      "defeatCountRoute": {
        "route": "Route 10",
        "count": 300
      }
    }
  },
  {
    "name": "Ula'ula Meadow",
    "spawns": [
      {
        "pokemonId": 166,
        "minLevel": 85,
        "maxLevel": 93,
        "chance": 0.19
      },
      {
        "pokemonId": 168,
        "minLevel": 85,
        "maxLevel": 93,
        "chance": 0.19
      },
      {
        "pokemonId": 741,
        "minLevel": 85,
        "maxLevel": 93,
        "chance": 0.31
      },
      {
        "pokemonId": 775,
        "minLevel": 85,
        "maxLevel": 93,
        "chance": 0.31
      }
    ],
    "challengeName": "Extra Challenge C 02",
    "areaId": "Ula'ula Meadow",
    "unlocks": [
      "Blush Mountain"
    ],
    "requirements": {
      "defeatCountRoute": {
        "route": "Ula'ula Meadow",
        "count": 10
      }
    }
  },
  {
    "name": "Blush Mountain",
    "spawns": [
      {
        "pokemonId": 749,
        "minLevel": 90,
        "maxLevel": 98,
        "chance": 0.13
      },
      {
        "pokemonId": 324,
        "minLevel": 91,
        "maxLevel": 99,
        "chance": 0.11
      },
      {
        "pokemonId": 777,
        "minLevel": 90,
        "maxLevel": 98,
        "chance": 0.11
      },
      {
        "pokemonId": 239,
        "minLevel": 90,
        "maxLevel": 98,
        "chance": 0.14
      },
      {
        "pokemonId": 74,
        "minLevel": 88,
        "maxLevel": 96,
        "chance": 0.17
      },
      {
        "pokemonId": 75,
        "minLevel": 90,
        "maxLevel": 98,
        "chance": 0.06
      },
      {
        "pokemonId": 737,
        "minLevel": 90,
        "maxLevel": 98,
        "chance": 0.06
      },
      {
        "pokemonId": 776,
        "minLevel": 91,
        "maxLevel": 99,
        "chance": 0.1
      },
      {
        "pokemonId": 702,
        "minLevel": 90,
        "maxLevel": 98,
        "chance": 0.12
      }
    ],
    "challengeName": "Extra Challenge C 03",
    "areaId": "Blush Mountain",
    "unlocks": [
      "The Zenith Anomaly"
    ],
    "requirements": {
      "catchCountRoute": {
        "route": "Blush Mountain",
        "count": 10
      }
    }
  },
  {
    "name": "The Zenith Anomaly",
    "spawns": [
      {
        "pokemonId": 801,
        "minLevel": 95,
        "maxLevel": 103,
        "chance": 0.3333
      },
      {
        "pokemonId": 802,
        "minLevel": 95,
        "maxLevel": 103,
        "chance": 0.3333
      },
      {
        "pokemonId": 807,
        "minLevel": 95,
        "maxLevel": 103,
        "chance": 0.3334
      }
    ],
    "challengeName": "Extra Challenge C 04",
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
    }
  },
  {
    "name": "Aether Base",
    "spawns": [],
    "challengeName": "Extra Challenge D 01",
    "areaId": "Aether Base",
    "unlocks": [
      "Aether Paradise Labs"
    ],
    "requirements": {
      "defeatCountRoute": {
        "route": "Aether Base",
        "count": 300
      }
    }
  },
  {
    "name": "Aether Paradise Labs",
    "spawns": [
      {
        "pokemonId": 772,
        "minLevel": 85,
        "maxLevel": 93,
        "chance": 0.24
      },
      {
        "pokemonId": 137,
        "minLevel": 83,
        "maxLevel": 91,
        "chance": 0.33
      },
      {
        "pokemonId": 808,
        "minLevel": 81,
        "maxLevel": 89,
        "chance": 0.43
      }
    ],
    "challengeName": "Extra Challenge D 02",
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
        "minLevel": 87,
        "maxLevel": 95,
        "chance": 1
      }
    ],
    "challengeName": "Extra Challenge D 03",
    "areaId": "Aether Paradise Secret Lab",
    "unlocks": [
      "The Interdimensional Rift"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 2
      }
    }
  },
  {
    "name": "The Interdimensional Rift",
    "spawns": [
      {
        "pokemonId": 793,
        "minLevel": 90,
        "maxLevel": 98,
        "chance": 0.1
      },
      {
        "pokemonId": 794,
        "minLevel": 90,
        "maxLevel": 98,
        "chance": 0.1
      },
      {
        "pokemonId": 795,
        "minLevel": 90,
        "maxLevel": 98,
        "chance": 0.1
      },
      {
        "pokemonId": 796,
        "minLevel": 90,
        "maxLevel": 98,
        "chance": 0.1
      },
      {
        "pokemonId": 797,
        "minLevel": 90,
        "maxLevel": 98,
        "chance": 0.1
      },
      {
        "pokemonId": 798,
        "minLevel": 90,
        "maxLevel": 98,
        "chance": 0.1
      },
      {
        "pokemonId": 799,
        "minLevel": 90,
        "maxLevel": 98,
        "chance": 0.1
      },
      {
        "pokemonId": 803,
        "minLevel": 88,
        "maxLevel": 96,
        "chance": 0.1
      },
      {
        "pokemonId": 805,
        "minLevel": 90,
        "maxLevel": 98,
        "chance": 0.1
      },
      {
        "pokemonId": 806,
        "minLevel": 90,
        "maxLevel": 98,
        "chance": 0.1
      }
    ],
    "challengeName": "Extra Challenge D 04",
    "areaId": "The Interdimensional Rift",
    "unlocks": [
      "Obsidian Sphere"
    ],
    "requirements": {
      "defeatCountRoute": {
        "route": "The Interdimensional Rift",
        "count": 100
      }
    }
  },
  {
    "name": "Obsidian Sphere",
    "spawns": [
      {
        "pokemonId": 789,
        "minLevel": 92,
        "maxLevel": 100,
        "chance": 0.8
      },
      {
        "pokemonId": 790,
        "minLevel": 95,
        "maxLevel": 103,
        "chance": 0.2
      }
    ],
    "challengeName": "Extra Challenge D 05",
    "areaId": "Obsidian Sphere",
    "unlocks": [
      "Obsidian Tesseract"
    ],
    "requirements": {
      "defeatCountRoute": {
        "route": "Obsidian Sphere",
        "count": 10
      }
    }
  },
  {
    "name": "Obsidian Tesseract",
    "spawns": [
      {
        "pokemonId": 791,
        "minLevel": 97,
        "maxLevel": 105,
        "chance": 0.19
      },
      {
        "pokemonId": 792,
        "minLevel": 97,
        "maxLevel": 105,
        "chance": 0.19
      },
      {
        "pokemonId": 800,
        "minLevel": 96,
        "maxLevel": 104,
        "chance": 0.63
      }
    ],
    "challengeName": "Extra Challenge D 06",
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
    }
  },
  {
    "name": "Route 9",
    "spawns": [],
    "challengeName": "Extra Challenge E 01",
    "areaId": "Route 9",
    "unlocks": [
      "Route 8 Fossil Restoration Center Part 2"
    ],
    "requirements": {
      "defeatCountRoute": {
        "route": "Route 9",
        "count": 300
      }
    }
  },
  {
    "name": "Route 8 Fossil Restoration Center Part 2",
    "spawns": [
      {
        "pokemonId": 410,
        "minLevel": 84,
        "maxLevel": 92,
        "chance": 0.2
      },
      {
        "pokemonId": 566,
        "minLevel": 84,
        "maxLevel": 92,
        "chance": 0.2
      },
      {
        "pokemonId": 564,
        "minLevel": 84,
        "maxLevel": 92,
        "chance": 0.2
      },
      {
        "pokemonId": 696,
        "minLevel": 84,
        "maxLevel": 92,
        "chance": 0.2
      },
      {
        "pokemonId": 698,
        "minLevel": 84,
        "maxLevel": 92,
        "chance": 0.2
      }
    ],
    "challengeName": "Extra Challenge E 02",
    "areaId": "Route 8 Fossil Restoration Center Part 2",
    "unlocks": [
      "Royal Avenue"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Uncommon+",
        "count": 5
      }
    }
  },
  {
    "name": "Royal Avenue",
    "spawns": [
      {
        "pokemonId": 741,
        "minLevel": 88,
        "maxLevel": 96,
        "chance": 0.46
      },
      {
        "pokemonId": 732,
        "minLevel": 87,
        "maxLevel": 95,
        "chance": 0.31
      },
      {
        "pokemonId": 743,
        "minLevel": 88,
        "maxLevel": 96,
        "chance": 0.23
      }
    ],
    "challengeName": "Extra Challenge E 03",
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
        "minLevel": 92,
        "maxLevel": 100,
        "chance": 0.15
      },
      {
        "pokemonId": 26,
        "minLevel": 96,
        "maxLevel": 104,
        "chance": 0.07
      },
      {
        "pokemonId": 172,
        "minLevel": 90,
        "maxLevel": 98,
        "chance": 0.48
      },
      {
        "pokemonId": 81,
        "minLevel": 92,
        "maxLevel": 100,
        "chance": 0.3
      }
    ],
    "challengeName": "Extra Challenge E 04",
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
        "minLevel": 95,
        "maxLevel": 103,
        "chance": 0.24
      },
      {
        "pokemonId": 723,
        "minLevel": 97,
        "maxLevel": 105,
        "chance": 0.09
      },
      {
        "pokemonId": 725,
        "minLevel": 95,
        "maxLevel": 103,
        "chance": 0.24
      },
      {
        "pokemonId": 726,
        "minLevel": 97,
        "maxLevel": 105,
        "chance": 0.09
      },
      {
        "pokemonId": 728,
        "minLevel": 95,
        "maxLevel": 103,
        "chance": 0.24
      },
      {
        "pokemonId": 729,
        "minLevel": 97,
        "maxLevel": 105,
        "chance": 0.09
      }
    ],
    "challengeName": "Extra Challenge E 05",
    "areaId": "Starter Depot",
    "unlocks": [
      "Crystal Depths"
    ],
    "requirements": {
      "defeatCountRoute": {
        "route": "Starter Depot",
        "count": 10
      }
    }
  }
];

export const alolaUnlocks = [
  {
    "challengeName": "Challenge 01",
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
    "challengeName": "Challenge 02",
    "areaId": "Route 1 Hau'oli Outskirts",
    "unlocks": [
      "Hau'oli Cemetery"
    ],
    "requirements": {
      "catchByType": {
        "type": "Dark",
        "count": 3
      }
    }
  },
  {
    "challengeName": "Challenge 03",
    "areaId": "Hau'oli Cemetery",
    "unlocks": [
      "Route 2 North"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 2
      }
    }
  },
  {
    "challengeName": "Challenge 04",
    "areaId": "Route 2 North",
    "unlocks": [
      "Captain Ilima Boss Battle"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Uncommon+",
        "count": 5
      }
    }
  },
  {
    "challengeName": "Challenge 05",
    "areaId": "Captain Ilima Boss Battle",
    "unlocks": [
      "Seaward Cave"
    ],
    "requirements": {
      "defeatBoss": "Captain Ilima"
    }
  },
  {
    "challengeName": "Challenge 06",
    "areaId": "Seaward Cave",
    "unlocks": [
      "Kahuna Hala Boss Battle"
    ],
    "requirements": {}
  },
  {
    "challengeName": "Challenge 07",
    "areaId": "Kahuna Hala Boss Battle",
    "unlocks": [
      "Ten Carat Hill Farthest Hollow"
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
    "challengeName": "Challenge 08",
    "areaId": "Ten Carat Hill Farthest Hollow",
    "unlocks": [
      "Paniola Ranch"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Epic+",
        "count": 1
      }
    }
  },
  {
    "challengeName": "Challenge 09",
    "areaId": "Paniola Ranch",
    "unlocks": [
      "Route 5"
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
    "areaId": "Route 5",
    "unlocks": [
      "Captain Lana Boss Battle"
    ],
    "requirements": {
      "catchSpeciesUniqueCount": 2
    }
  },
  {
    "challengeName": "Challenge 11",
    "areaId": "Captain Lana Boss Battle",
    "unlocks": [
      "Wela Volcano Park"
    ],
    "requirements": {
      "defeatBoss": "Captain Lana"
    }
  },
  {
    "challengeName": "Challenge 12",
    "areaId": "Wela Volcano Park",
    "unlocks": [
      "Captain Kiawe Boss Battle"
    ],
    "requirements": {
      "defeatCountRoute": {
        "route": "Wela Volcano Park",
        "count": 15
      }
    }
  },
  {
    "challengeName": "Challenge 13",
    "areaId": "Captain Kiawe Boss Battle",
    "unlocks": [
      "Route 7"
    ],
    "requirements": {
      "defeatBoss": "Captain Kiawe"
    }
  },
  {
    "challengeName": "Challenge 14",
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
    "challengeName": "Challenge 15",
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
    "challengeName": "Challenge 16",
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
    "challengeName": "Challenge 17",
    "areaId": "Lush Jungle East Cave",
    "unlocks": [
      "Captain Mallow Boss Battle"
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
    "challengeName": "Challenge 18",
    "areaId": "Captain Mallow Boss Battle",
    "unlocks": [
      "Diglett's Tunnel"
    ],
    "requirements": {}
  },
  {
    "challengeName": "Challenge 19",
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
    "challengeName": "Challenge 20",
    "areaId": "Akala Outskirts",
    "unlocks": [
      "Kahuna Olivia Boss Battle"
    ],
    "requirements": {
      "catchSpeciesUniqueCount": 2
    }
  },
  {
    "challengeName": "Challenge 21",
    "areaId": "Kahuna Olivia Boss Battle",
    "unlocks": [
      "Malie City"
    ],
    "requirements": {}
  },
  {
    "challengeName": "Challenge 22",
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
    "challengeName": "Challenge 23",
    "areaId": "Mount Hokulani East",
    "unlocks": [
      "Captain Sophocles Boss Battle"
    ],
    "requirements": {
      "catchByType": {
        "type": "Fairy",
        "count": 3
      }
    }
  },
  {
    "challengeName": "Challenge 24",
    "areaId": "Captain Sophocles Boss Battle",
    "unlocks": [
      "Tapu Village"
    ],
    "requirements": {}
  },
  {
    "challengeName": "Challenge 25",
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
    "challengeName": "Challenge 26",
    "areaId": "Thrifty Megamart",
    "unlocks": [
      "Captain Acerola Boss Battle"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Epic+",
        "count": 1
      }
    }
  },
  {
    "challengeName": "Challenge 27",
    "areaId": "Captain Acerola Boss Battle",
    "unlocks": [
      "Haina Desert"
    ],
    "requirements": {
      "defeatBoss": "Kahuna Nanu"
    }
  },
  {
    "challengeName": "Challenge 28",
    "areaId": "Haina Desert",
    "unlocks": [
      "Kahuna Nanu Boss Battle"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Uncommon+",
        "count": 5
      }
    }
  },
  {
    "challengeName": "Challenge 29",
    "areaId": "Kahuna Nanu Boss Battle",
    "unlocks": [
      "Seafolk Village"
    ],
    "requirements": {}
  },
  {
    "challengeName": "Challenge 30",
    "areaId": "Seafolk Village",
    "unlocks": [
      "Poni Wilds"
    ],
    "requirements": {}
  },
  {
    "challengeName": "Challenge 31",
    "areaId": "Poni Wilds",
    "unlocks": [
      "Poni Breaker Coast"
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
    "areaId": "Poni Breaker Coast",
    "unlocks": [
      "Exeggutor Island"
    ],
    "requirements": {
      "catchSpeciesUniqueCount": 2
    }
  },
  {
    "challengeName": "Challenge 33",
    "areaId": "Exeggutor Island",
    "unlocks": [
      "Kahuna Hapu Boss Battle"
    ],
    "requirements": {
      "defeatCountRoute": {
        "route": "Exeggutor Island",
        "count": 15
      }
    }
  },
  {
    "challengeName": "Challenge 34",
    "areaId": "Kahuna Hapu Boss Battle",
    "unlocks": [
      "Vast Poni Canyon Outside"
    ],
    "requirements": {}
  },
  {
    "challengeName": "Challenge 35",
    "areaId": "Vast Poni Canyon Outside",
    "unlocks": [
      "Captain Mina Boss Battle"
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
    "areaId": "Captain Mina Boss Battle",
    "unlocks": [
      "Captain Kommo-o Boss Battle"
    ],
    "requirements": {
      "defeatBoss": "Kahuna Hapu"
    }
  },
  {
    "challengeName": "Challenge 37",
    "areaId": "Captain Kommo-o Boss Battle",
    "unlocks": [
      "Mount Lanakila"
    ],
    "requirements": {
      "defeatBoss": "Captain Mina"
    }
  },
  {
    "challengeName": "Challenge 38",
    "areaId": "Mount Lanakila",
    "unlocks": [
      "Alola Pokemon League Boss Battle"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Uncommon+",
        "count": 5
      }
    }
  },
  {
    "challengeName": "Challenge 39",
    "areaId": "Alola Pokemon League Boss Battle",
    "unlocks": [
      "Champion Hau Boss Battle"
    ],
    "requirements": {
      "defeatBoss": "Captain Lana"
    }
  },
  {
    "challengeName": "Challenge 40",
    "areaId": "Champion Hau Boss Battle",
    "unlocks": [
      "Route 3",
      "Poni Grove",
      "Route 10",
      "Aether Base",
      "Route 9"
    ],
    "requirements": {
      "defeatCountRoute": {
        "route": "Champion Hau Boss Battle",
        "count": 250
      }
    }
  },
  {
    "challengeName": "Extra Challenge Z 01",
    "areaId": "Crystal Depths",
    "unlocks": [
      "Dragon's Peak"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Uncommon+",
        "count": 5
      }
    }
  },
  {
    "challengeName": "Extra Challenge Z 02",
    "areaId": "Dragon's Peak",
    "unlocks": [
      "Serene Meadows"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Uncommon+",
        "count": 5
      }
    }
  },
  {
    "challengeName": "Extra Challenge Z 03",
    "areaId": "Serene Meadows",
    "unlocks": [
      "Shadow Forge"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Uncommon+",
        "count": 5
      }
    }
  },
  {
    "challengeName": "Extra Challenge Z 04",
    "areaId": "Shadow Forge",
    "unlocks": [
      "Mystic Grotto"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Uncommon+",
        "count": 5
      }
    }
  },
  {
    "challengeName": "Extra Challenge Z 05",
    "areaId": "Mystic Grotto",
    "unlocks": [
      "Alola Forest W01",
      "Alola Forest W02",
      "Alola Forest W03"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Uncommon+",
        "count": 5
      }
    }
  },
  {
    "challengeName": "Extra Challenge W 01",
    "areaId": "Alola Forest W03",
    "unlocks": [
      "Alola Forest W04",
      "Alola Plain W05",
      "Alola Plain W06"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "challengeName": "Extra Challenge W 02",
    "areaId": "Alola Plain W06",
    "unlocks": [
      "Alola Plain W07",
      "Alola Plain W08",
      "Alola Plain W09"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "challengeName": "Extra Challenge W 03",
    "areaId": "Alola Plain W09",
    "unlocks": [
      "Alola Plain W10",
      "Alola Plain W11",
      "Alola Swamp W12"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "challengeName": "Extra Challenge W 04",
    "areaId": "Alola Swamp W12",
    "unlocks": [
      "Alola Swamp W13",
      "Alola Power Plant W14",
      "Alola Power Plant W15"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "challengeName": "Extra Challenge W 05",
    "areaId": "Alola Power Plant W15",
    "unlocks": [
      "Alola Power Plant W16",
      "Alola Desert W17",
      "Alola Desert W18"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "challengeName": "Extra Challenge W 06",
    "areaId": "Alola Desert W18",
    "unlocks": [
      "Alola Meadow W19",
      "Alola Volcano W20",
      "Alola Volcano W21"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "challengeName": "Extra Challenge W 07",
    "areaId": "Alola Volcano W21",
    "unlocks": [
      "Alola Ocean W22",
      "Alola Ocean W23",
      "Alola Ocean W24"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "challengeName": "Extra Challenge W 08",
    "areaId": "Alola Ocean W24",
    "unlocks": [
      "Alola Ocean W25",
      "Alola Ocean W26",
      "Alola Ocean W27"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "challengeName": "Extra Challenge W 09",
    "areaId": "Alola Ocean W27",
    "unlocks": [
      "Alola Ocean W28",
      "Alola Ocean W29",
      "Alola Dojo W30"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "challengeName": "Extra Challenge W 10",
    "areaId": "Alola Dojo W30",
    "unlocks": [
      "Alola Dojo W31",
      "Alola Mind W32",
      "Alola Mind W33"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "challengeName": "Extra Challenge W 11",
    "areaId": "Alola Mind W33",
    "unlocks": [
      "Alola Crag W34",
      "Alola Crag W35",
      "Alola Crag W36"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "challengeName": "Extra Challenge W 12",
    "areaId": "Alola Crag W36",
    "unlocks": [
      "Alola Crag W37",
      "Alola Crag W38",
      "Alola Graveyard W39"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "challengeName": "Extra Challenge W 13",
    "areaId": "Alola Graveyard W39",
    "unlocks": [
      "Alola Graveyard W40",
      "Alola Jungle W41",
      "Alola Jungle W42"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "challengeName": "Extra Challenge W 14",
    "areaId": "Alola Jungle W42",
    "unlocks": [
      "Alola Jungle W43",
      "Alola Den W44",
      "Alola Den W45"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "challengeName": "Extra Challenge W 15",
    "areaId": "Alola Den W45",
    "unlocks": [
      "Alola Den W46",
      "Alola Shadow W47",
      "Alola Shadow W48"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "challengeName": "Extra Challenge W 16",
    "areaId": "Alola Shadow W48",
    "unlocks": [
      "Alola Shadow W49",
      "Alola Glacier W50",
      "Alola Factory W51"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "challengeName": "Extra Challenge W 17",
    "areaId": "Alola Factory W51",
    "unlocks": [
      "Alola Sky W52"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "challengeName": "Extra Challenge W 18",
    "areaId": "Alola Sky W52",
    "unlocks": [],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "challengeName": "Extra Challenge A 01",
    "areaId": "Route 3",
    "unlocks": [
      "Route 6"
    ],
    "requirements": {
      "defeatCountRoute": {
        "route": "Route 3",
        "count": 300
      }
    }
  },
  {
    "challengeName": "Extra Challenge A 02",
    "areaId": "Route 6",
    "unlocks": [
      "Melemele Meadow"
    ],
    "requirements": {
      "defeatCountRoute": {
        "route": "Route 6",
        "count": 10
      }
    }
  },
  {
    "challengeName": "Extra Challenge A 03",
    "areaId": "Melemele Meadow",
    "unlocks": [
      "Kala'e Bay"
    ],
    "requirements": {
      "catchSpeciesUniqueCount": 2
    }
  },
  {
    "challengeName": "Extra Challenge A 04",
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
    "challengeName": "Extra Challenge A 05",
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
    }
  },
  {
    "challengeName": "Extra Challenge B 01",
    "areaId": "Poni Grove",
    "unlocks": [
      "Poni Plains"
    ],
    "requirements": {
      "defeatCountRoute": {
        "route": "Poni Grove",
        "count": 300
      }
    }
  },
  {
    "challengeName": "Extra Challenge B 02",
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
    "challengeName": "Extra Challenge B 03",
    "areaId": "Poni Coast",
    "unlocks": [
      "Route 16"
    ],
    "requirements": {
      "catchByType": {
        "type": "Normal",
        "count": 3
      }
    }
  },
  {
    "challengeName": "Extra Challenge B 04",
    "areaId": "Route 16",
    "unlocks": [
      "Lake of the Sunne"
    ],
    "requirements": {
      "defeatCountRoute": {
        "route": "Route 16",
        "count": 10
      }
    }
  },
  {
    "challengeName": "Extra Challenge B 05",
    "areaId": "Lake of the Sunne",
    "unlocks": [],
    "requirements": {
      "catchByQuality": {
        "quality": "Epic+",
        "count": 1
      }
    }
  },
  {
    "challengeName": "Extra Challenge C 01",
    "areaId": "Route 10",
    "unlocks": [
      "Ula'ula Meadow"
    ],
    "requirements": {
      "defeatCountRoute": {
        "route": "Route 10",
        "count": 300
      }
    }
  },
  {
    "challengeName": "Extra Challenge C 02",
    "areaId": "Ula'ula Meadow",
    "unlocks": [
      "Blush Mountain"
    ],
    "requirements": {
      "defeatCountRoute": {
        "route": "Ula'ula Meadow",
        "count": 10
      }
    }
  },
  {
    "challengeName": "Extra Challenge C 03",
    "areaId": "Blush Mountain",
    "unlocks": [
      "The Zenith Anomaly"
    ],
    "requirements": {
      "catchCountRoute": {
        "route": "Blush Mountain",
        "count": 10
      }
    }
  },
  {
    "challengeName": "Extra Challenge C 04",
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
    }
  },
  {
    "challengeName": "Extra Challenge D 01",
    "areaId": "Aether Base",
    "unlocks": [
      "Aether Paradise Labs"
    ],
    "requirements": {
      "defeatCountRoute": {
        "route": "Aether Base",
        "count": 300
      }
    }
  },
  {
    "challengeName": "Extra Challenge D 02",
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
    "challengeName": "Extra Challenge D 03",
    "areaId": "Aether Paradise Secret Lab",
    "unlocks": [
      "The Interdimensional Rift"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 2
      }
    }
  },
  {
    "challengeName": "Extra Challenge D 04",
    "areaId": "The Interdimensional Rift",
    "unlocks": [
      "Obsidian Sphere"
    ],
    "requirements": {
      "defeatCountRoute": {
        "route": "The Interdimensional Rift",
        "count": 100
      }
    }
  },
  {
    "challengeName": "Extra Challenge D 05",
    "areaId": "Obsidian Sphere",
    "unlocks": [
      "Obsidian Tesseract"
    ],
    "requirements": {
      "defeatCountRoute": {
        "route": "Obsidian Sphere",
        "count": 10
      }
    }
  },
  {
    "challengeName": "Extra Challenge D 06",
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
    }
  },
  {
    "challengeName": "Extra Challenge E 01",
    "areaId": "Route 9",
    "unlocks": [
      "Route 8 Fossil Restoration Center Part 2"
    ],
    "requirements": {
      "defeatCountRoute": {
        "route": "Route 9",
        "count": 300
      }
    }
  },
  {
    "challengeName": "Extra Challenge E 02",
    "areaId": "Route 8 Fossil Restoration Center Part 2",
    "unlocks": [
      "Royal Avenue"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Uncommon+",
        "count": 5
      }
    }
  },
  {
    "challengeName": "Extra Challenge E 03",
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
    "challengeName": "Extra Challenge E 04",
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
    "challengeName": "Extra Challenge E 05",
    "areaId": "Starter Depot",
    "unlocks": [
      "Crystal Depths"
    ],
    "requirements": {
      "defeatCountRoute": {
        "route": "Starter Depot",
        "count": 10
      }
    }
  }
];
