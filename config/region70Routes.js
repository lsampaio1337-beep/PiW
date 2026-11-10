export const region70Routes = [
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
        "chance": 0.1818
      },
      {
        "pokemonId": 703,
        "minLevel": 16,
        "maxLevel": 21,
        "chance": 0.1818
      },
      {
        "pokemonId": 327,
        "minLevel": 16,
        "maxLevel": 21,
        "chance": 0.1818
      },
      {
        "pokemonId": 303,
        "minLevel": 16,
        "maxLevel": 21,
        "chance": 0.1818
      },
      {
        "pokemonId": 745,
        "minLevel": 16,
        "maxLevel": 21,
        "chance": 0.1818
      },
      {
        "pokemonId": 744,
        "minLevel": 16,
        "maxLevel": 21,
        "chance": 0.0909
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
        "chance": 0.2273
      },
      {
        "pokemonId": 707,
        "minLevel": 60,
        "maxLevel": 65,
        "chance": 0.2273
      },
      {
        "pokemonId": 353,
        "minLevel": 60,
        "maxLevel": 65,
        "chance": 0.2273
      },
      {
        "pokemonId": 525,
        "minLevel": 60,
        "maxLevel": 65,
        "chance": 0.2273
      },
      {
        "pokemonId": 778,
        "minLevel": 60,
        "maxLevel": 65,
        "chance": 0.0909
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
        "pokemonId": 349,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1112
      },
      {
        "pokemonId": 341,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1111
      },
      {
        "pokemonId": 370,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1111
      },
      {
        "pokemonId": 692,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1111
      },
      {
        "pokemonId": 592,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1111
      },
      {
        "pokemonId": 366,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1111
      },
      {
        "pokemonId": 550,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1111
      },
      {
        "pokemonId": 594,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1111
      },
      {
        "pokemonId": 368,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1111
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
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1112
      },
      {
        "pokemonId": 443,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1111
      },
      {
        "pokemonId": 663,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1111
      },
      {
        "pokemonId": 330,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1111
      },
      {
        "pokemonId": 467,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1111
      },
      {
        "pokemonId": 373,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1111
      },
      {
        "pokemonId": 445,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1111
      },
      {
        "pokemonId": 706,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1111
      },
      {
        "pokemonId": 718,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1111
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
        "pokemonId": 439,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.125
      },
      {
        "pokemonId": 627,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.125
      },
      {
        "pokemonId": 667,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.125
      },
      {
        "pokemonId": 108,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.125
      },
      {
        "pokemonId": 446,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.125
      },
      {
        "pokemonId": 40,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.125
      },
      {
        "pokemonId": 36,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.125
      },
      {
        "pokemonId": 508,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.125
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
        "pokemonId": 309,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.125
      },
      {
        "pokemonId": 570,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.125
      },
      {
        "pokemonId": 624,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.125
      },
      {
        "pokemonId": 629,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.125
      },
      {
        "pokemonId": 181,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.125
      },
      {
        "pokemonId": 462,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.125
      },
      {
        "pokemonId": 466,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.125
      },
      {
        "pokemonId": 248,
        "minLevel": 100,
        "maxLevel": 110,
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
        "pokemonId": 447,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1665
      },
      {
        "pokemonId": 690,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1667
      },
      {
        "pokemonId": 302,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1667
      },
      {
        "pokemonId": 65,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1667
      },
      {
        "pokemonId": 671,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1667
      },
      {
        "pokemonId": 376,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1667
      }
    ],
    "challengeName": "Extra Challenge Z 05",
    "areaId": "Mystic Grotto",
    "unlocks": [
      "Alola Forest Weak"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Uncommon+",
        "count": 5
      }
    }
  },
  {
    "name": "Alola Forest Weak",
    "spawns": [
      {
        "pokemonId": 10,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1112
      },
      {
        "pokemonId": 283,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1111
      },
      {
        "pokemonId": 742,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1111
      },
      {
        "pokemonId": 166,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1111
      },
      {
        "pokemonId": 12,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1111
      },
      {
        "pokemonId": 168,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1111
      },
      {
        "pokemonId": 737,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1111
      },
      {
        "pokemonId": 743,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1111
      },
      {
        "pokemonId": 205,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1111
      }
    ],
    "challengeName": "Extra Challenge M 01",
    "areaId": "Alola Forest Weak",
    "unlocks": [
      "Alola Forest Strong"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "name": "Alola Forest Strong",
    "spawns": [
      {
        "pokemonId": 123,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.125
      },
      {
        "pokemonId": 212,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.125
      },
      {
        "pokemonId": 214,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.125
      },
      {
        "pokemonId": 738,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.125
      },
      {
        "pokemonId": 768,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.125
      },
      {
        "pokemonId": 637,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.125
      },
      {
        "pokemonId": 794,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.125
      },
      {
        "pokemonId": 795,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.125
      }
    ],
    "challengeName": "Extra Challenge M 02",
    "areaId": "Alola Forest Strong",
    "unlocks": [
      "Alola Plain Weak"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "name": "Alola Plain Weak",
    "spawns": [
      {
        "pokemonId": 174,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1426
      },
      {
        "pokemonId": 627,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1429
      },
      {
        "pokemonId": 190,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1429
      },
      {
        "pokemonId": 507,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1429
      },
      {
        "pokemonId": 108,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1429
      },
      {
        "pokemonId": 446,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1429
      },
      {
        "pokemonId": 206,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1429
      }
    ],
    "challengeName": "Extra Challenge M 03",
    "areaId": "Alola Plain Weak",
    "unlocks": [
      "Alola Plain Regular"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "name": "Alola Plain Regular",
    "spawns": [
      {
        "pokemonId": 40,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1112
      },
      {
        "pokemonId": 164,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1111
      },
      {
        "pokemonId": 573,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1111
      },
      {
        "pokemonId": 428,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1111
      },
      {
        "pokemonId": 775,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1111
      },
      {
        "pokemonId": 424,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1111
      },
      {
        "pokemonId": 733,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1111
      },
      {
        "pokemonId": 508,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1111
      },
      {
        "pokemonId": 760,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1111
      }
    ],
    "challengeName": "Extra Challenge M 04",
    "areaId": "Alola Plain Regular",
    "unlocks": [
      "Alola Plain Strong"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "name": "Alola Plain Strong",
    "spawns": [
      {
        "pokemonId": 628,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.2
      },
      {
        "pokemonId": 463,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.2
      },
      {
        "pokemonId": 143,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.2
      },
      {
        "pokemonId": 242,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.2
      },
      {
        "pokemonId": 773,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.2
      }
    ],
    "challengeName": "Extra Challenge M 05",
    "areaId": "Alola Plain Strong",
    "unlocks": [
      "Alola Swamp"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "name": "Alola Swamp",
    "spawns": [
      {
        "pokemonId": 690,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.125
      },
      {
        "pokemonId": 803,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.125
      },
      {
        "pokemonId": 569,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.125
      },
      {
        "pokemonId": 758,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.125
      },
      {
        "pokemonId": 691,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.125
      },
      {
        "pokemonId": 748,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.125
      },
      {
        "pokemonId": 169,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.125
      },
      {
        "pokemonId": 804,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.125
      }
    ],
    "challengeName": "Extra Challenge M 06",
    "areaId": "Alola Swamp",
    "unlocks": [
      "Alola Power Plant Weak"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "name": "Alola Power Plant Weak",
    "spawns": [
      {
        "pokemonId": 309,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.125
      },
      {
        "pokemonId": 239,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.125
      },
      {
        "pokemonId": 180,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.125
      },
      {
        "pokemonId": 587,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.125
      },
      {
        "pokemonId": 702,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.125
      },
      {
        "pokemonId": 777,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.125
      },
      {
        "pokemonId": 310,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.125
      },
      {
        "pokemonId": 26,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.125
      }
    ],
    "challengeName": "Extra Challenge M 07",
    "areaId": "Alola Power Plant Weak",
    "unlocks": [
      "Alola Power Plant Strong"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "name": "Alola Power Plant Strong",
    "spawns": [
      {
        "pokemonId": 181,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1426
      },
      {
        "pokemonId": 135,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1429
      },
      {
        "pokemonId": 462,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1429
      },
      {
        "pokemonId": 466,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1429
      },
      {
        "pokemonId": 785,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1429
      },
      {
        "pokemonId": 796,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1429
      },
      {
        "pokemonId": 807,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1429
      }
    ],
    "challengeName": "Extra Challenge M 08",
    "areaId": "Alola Power Plant Strong",
    "unlocks": [
      "Alola Desert"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "name": "Alola Desert",
    "spawns": [
      {
        "pokemonId": 329,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1426
      },
      {
        "pokemonId": 749,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1429
      },
      {
        "pokemonId": 623,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1429
      },
      {
        "pokemonId": 344,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1429
      },
      {
        "pokemonId": 750,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1429
      },
      {
        "pokemonId": 553,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1429
      },
      {
        "pokemonId": 330,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1429
      }
    ],
    "challengeName": "Extra Challenge M 09",
    "areaId": "Alola Desert",
    "unlocks": [
      "Meadow"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "name": "Meadow",
    "spawns": [
      {
        "pokemonId": 669,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1665
      },
      {
        "pokemonId": 670,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1667
      },
      {
        "pokemonId": 210,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1667
      },
      {
        "pokemonId": 36,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1667
      },
      {
        "pokemonId": 700,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1667
      },
      {
        "pokemonId": 671,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1667
      }
    ],
    "challengeName": "Extra Challenge M 10",
    "areaId": "Meadow",
    "unlocks": [
      "Volcano Base"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "name": "Volcano Base",
    "spawns": [
      {
        "pokemonId": 725,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.125
      },
      {
        "pokemonId": 667,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.125
      },
      {
        "pokemonId": 662,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.125
      },
      {
        "pokemonId": 726,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.125
      },
      {
        "pokemonId": 324,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.125
      },
      {
        "pokemonId": 741,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.125
      },
      {
        "pokemonId": 776,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.125
      },
      {
        "pokemonId": 663,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.125
      }
    ],
    "challengeName": "Extra Challenge M 11",
    "areaId": "Volcano Base",
    "unlocks": [
      "Volcano Peak"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "name": "Volcano Peak",
    "spawns": [
      {
        "pokemonId": 668,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.2
      },
      {
        "pokemonId": 136,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.2
      },
      {
        "pokemonId": 727,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.2
      },
      {
        "pokemonId": 467,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.2
      },
      {
        "pokemonId": 806,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.2
      }
    ],
    "challengeName": "Extra Challenge M 12",
    "areaId": "Volcano Peak",
    "unlocks": [
      "Ocean 1"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "name": "Ocean 1",
    "spawns": [
      {
        "pokemonId": 349,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.0837
      },
      {
        "pokemonId": 223,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.0833
      },
      {
        "pokemonId": 90,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.0833
      },
      {
        "pokemonId": 341,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.0833
      },
      {
        "pokemonId": 118,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.0833
      },
      {
        "pokemonId": 728,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.0833
      },
      {
        "pokemonId": 370,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.0833
      },
      {
        "pokemonId": 692,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.0833
      },
      {
        "pokemonId": 592,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.0833
      },
      {
        "pokemonId": 366,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.0833
      },
      {
        "pokemonId": 458,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.0833
      },
      {
        "pokemonId": 564,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.0833
      }
    ],
    "challengeName": "Extra Challenge M 13",
    "areaId": "Ocean 1",
    "unlocks": [
      "Ocean 2"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "name": "Ocean 2",
    "spawns": [
      {
        "pokemonId": 729,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.0718
      },
      {
        "pokemonId": 752,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.0714
      },
      {
        "pokemonId": 171,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.0714
      },
      {
        "pokemonId": 550,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.0714
      },
      {
        "pokemonId": 340,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.0714
      },
      {
        "pokemonId": 342,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.0714
      },
      {
        "pokemonId": 594,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.0714
      },
      {
        "pokemonId": 224,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.0714
      },
      {
        "pokemonId": 593,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.0714
      },
      {
        "pokemonId": 226,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.0714
      },
      {
        "pokemonId": 367,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.0714
      },
      {
        "pokemonId": 368,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.0714
      },
      {
        "pokemonId": 199,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.0714
      },
      {
        "pokemonId": 565,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.0714
      }
    ],
    "challengeName": "Extra Challenge M 14",
    "areaId": "Ocean 2",
    "unlocks": [
      "Ocean 3"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "name": "Ocean 3",
    "spawns": [
      {
        "pokemonId": 186,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1426
      },
      {
        "pokemonId": 321,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1429
      },
      {
        "pokemonId": 693,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1429
      },
      {
        "pokemonId": 134,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1429
      },
      {
        "pokemonId": 730,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1429
      },
      {
        "pokemonId": 350,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1429
      },
      {
        "pokemonId": 788,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1429
      }
    ],
    "challengeName": "Extra Challenge M 15",
    "areaId": "Ocean 3",
    "unlocks": [
      "Dojo"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "name": "Dojo",
    "spawns": [
      {
        "pokemonId": 447,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1112
      },
      {
        "pokemonId": 66,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1111
      },
      {
        "pokemonId": 297,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1111
      },
      {
        "pokemonId": 675,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1111
      },
      {
        "pokemonId": 701,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1111
      },
      {
        "pokemonId": 68,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1111
      },
      {
        "pokemonId": 620,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1111
      },
      {
        "pokemonId": 448,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1111
      },
      {
        "pokemonId": 802,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1111
      }
    ],
    "challengeName": "Extra Challenge M 16",
    "areaId": "Dojo",
    "unlocks": [
      "Mind"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "name": "Mind",
    "spawns": [
      {
        "pokemonId": 439,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.2
      },
      {
        "pokemonId": 178,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.2
      },
      {
        "pokemonId": 606,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.2
      },
      {
        "pokemonId": 65,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.2
      },
      {
        "pokemonId": 196,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.2
      }
    ],
    "challengeName": "Extra Challenge M 17",
    "areaId": "Mind",
    "unlocks": [
      "Crag Weak"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "name": "Crag Weak",
    "spawns": [
      {
        "pokemonId": 74,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1426
      },
      {
        "pokemonId": 410,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1429
      },
      {
        "pokemonId": 696,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1429
      },
      {
        "pokemonId": 698,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1429
      },
      {
        "pokemonId": 566,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1429
      },
      {
        "pokemonId": 185,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1429
      },
      {
        "pokemonId": 247,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1429
      }
    ],
    "challengeName": "Extra Challenge M 18",
    "areaId": "Crag Weak",
    "unlocks": [
      "Crag Regular"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "name": "Crag Regular",
    "spawns": [
      {
        "pokemonId": 76,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1426
      },
      {
        "pokemonId": 139,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1429
      },
      {
        "pokemonId": 141,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1429
      },
      {
        "pokemonId": 346,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1429
      },
      {
        "pokemonId": 348,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1429
      },
      {
        "pokemonId": 409,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1429
      },
      {
        "pokemonId": 411,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1429
      }
    ],
    "challengeName": "Extra Challenge M 19",
    "areaId": "Crag Regular",
    "unlocks": [
      "Crag Strong"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "name": "Crag Strong",
    "spawns": [
      {
        "pokemonId": 526,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.125
      },
      {
        "pokemonId": 697,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.125
      },
      {
        "pokemonId": 699,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.125
      },
      {
        "pokemonId": 476,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.125
      },
      {
        "pokemonId": 567,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.125
      },
      {
        "pokemonId": 793,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.125
      },
      {
        "pokemonId": 805,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.125
      },
      {
        "pokemonId": 248,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.125
      }
    ],
    "challengeName": "Extra Challenge M 20",
    "areaId": "Crag Strong",
    "unlocks": [
      "Graveyard"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "name": "Graveyard",
    "spawns": [
      {
        "pokemonId": 708,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1426
      },
      {
        "pokemonId": 354,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1429
      },
      {
        "pokemonId": 709,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1429
      },
      {
        "pokemonId": 770,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1429
      },
      {
        "pokemonId": 429,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1429
      },
      {
        "pokemonId": 426,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1429
      },
      {
        "pokemonId": 94,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1429
      }
    ],
    "challengeName": "Extra Challenge M 21",
    "areaId": "Graveyard",
    "unlocks": [
      "Jungle Weak"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "name": "Jungle Weak",
    "spawns": [
      {
        "pokemonId": 546,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.125
      },
      {
        "pokemonId": 548,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.125
      },
      {
        "pokemonId": 722,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.125
      },
      {
        "pokemonId": 756,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.125
      },
      {
        "pokemonId": 723,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.125
      },
      {
        "pokemonId": 547,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.125
      },
      {
        "pokemonId": 549,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.125
      },
      {
        "pokemonId": 754,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.125
      }
    ],
    "challengeName": "Extra Challenge M 22",
    "areaId": "Jungle Weak",
    "unlocks": [
      "Alola Jungle Strong"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "name": "Alola Jungle Strong",
    "spawns": [
      {
        "pokemonId": 763,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.2
      },
      {
        "pokemonId": 470,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.2
      },
      {
        "pokemonId": 724,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.2
      },
      {
        "pokemonId": 787,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.2
      },
      {
        "pokemonId": 798,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.2
      }
    ],
    "challengeName": "Extra Challenge M 23",
    "areaId": "Alola Jungle Strong",
    "unlocks": [
      "Outer Dragon Den"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "name": "Outer Dragon Den",
    "spawns": [
      {
        "pokemonId": 147,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1426
      },
      {
        "pokemonId": 371,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1429
      },
      {
        "pokemonId": 443,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1429
      },
      {
        "pokemonId": 444,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1429
      },
      {
        "pokemonId": 148,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1429
      },
      {
        "pokemonId": 372,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1429
      },
      {
        "pokemonId": 705,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1429
      }
    ],
    "challengeName": "Extra Challenge M 24",
    "areaId": "Outer Dragon Den",
    "unlocks": [
      "Dragon Den Core"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "name": "Dragon Den Core",
    "spawns": [
      {
        "pokemonId": 149,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1665
      },
      {
        "pokemonId": 373,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1667
      },
      {
        "pokemonId": 445,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1667
      },
      {
        "pokemonId": 706,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1667
      },
      {
        "pokemonId": 718,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1667
      },
      {
        "pokemonId": 784,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1667
      }
    ],
    "challengeName": "Extra Challenge M 25",
    "areaId": "Dragon Den Core",
    "unlocks": [
      "Shadow Weak"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "name": "Shadow Weak",
    "spawns": [
      {
        "pokemonId": 570,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.125
      },
      {
        "pokemonId": 624,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.125
      },
      {
        "pokemonId": 559,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.125
      },
      {
        "pokemonId": 629,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.125
      },
      {
        "pokemonId": 302,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.125
      },
      {
        "pokemonId": 687,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.125
      },
      {
        "pokemonId": 560,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.125
      },
      {
        "pokemonId": 625,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.125
      }
    ],
    "challengeName": "Extra Challenge M 26",
    "areaId": "Shadow Weak",
    "unlocks": [
      "Shadow Strong"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "name": "Shadow Strong",
    "spawns": [
      {
        "pokemonId": 229,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1426
      },
      {
        "pokemonId": 430,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1429
      },
      {
        "pokemonId": 461,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1429
      },
      {
        "pokemonId": 571,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1429
      },
      {
        "pokemonId": 630,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1429
      },
      {
        "pokemonId": 197,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1429
      },
      {
        "pokemonId": 799,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.1429
      }
    ],
    "challengeName": "Extra Challenge M 27",
    "areaId": "Shadow Strong",
    "unlocks": [
      "Glacier"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "name": "Glacier",
    "spawns": [
      {
        "pokemonId": 583,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.3334
      },
      {
        "pokemonId": 478,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.3333
      },
      {
        "pokemonId": 471,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.3333
      }
    ],
    "challengeName": "Extra Challenge M 28",
    "areaId": "Glacier",
    "unlocks": [
      "Factory"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "name": "Factory",
    "spawns": [
      {
        "pokemonId": 375,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.25
      },
      {
        "pokemonId": 797,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.25
      },
      {
        "pokemonId": 376,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.25
      },
      {
        "pokemonId": 801,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.25
      }
    ],
    "challengeName": "Extra Challenge M 29",
    "areaId": "Factory",
    "unlocks": [
      "Alola Forest W"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "name": "Alola Forest W",
    "spawns": [
      {
        "pokemonId": 46,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.1064
      },
      {
        "pokemonId": 127,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.1064
      },
      {
        "pokemonId": 165,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.1064
      },
      {
        "pokemonId": 167,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.1064
      },
      {
        "pokemonId": 204,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.1064
      },
      {
        "pokemonId": 284,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.1064
      },
      {
        "pokemonId": 636,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.1064
      },
      {
        "pokemonId": 736,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.1064
      },
      {
        "pokemonId": 767,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.1486
      }
    ]
  },
  {
    "name": "Alola Plain W",
    "spawns": [
      {
        "pokemonId": 19,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.039
      },
      {
        "pokemonId": 21,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.0379
      },
      {
        "pokemonId": 52,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.0379
      },
      {
        "pokemonId": 115,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.0379
      },
      {
        "pokemonId": 128,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.0377
      },
      {
        "pokemonId": 132,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.0379
      },
      {
        "pokemonId": 137,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.0379
      },
      {
        "pokemonId": 163,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.0379
      },
      {
        "pokemonId": 235,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.0379
      },
      {
        "pokemonId": 241,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.0379
      },
      {
        "pokemonId": 327,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.0379
      },
      {
        "pokemonId": 351,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.0377
      },
      {
        "pokemonId": 352,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.0379
      },
      {
        "pokemonId": 427,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.0379
      },
      {
        "pokemonId": 440,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.0379
      },
      {
        "pokemonId": 506,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.0379
      },
      {
        "pokemonId": 572,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.0379
      },
      {
        "pokemonId": 661,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.0379
      },
      {
        "pokemonId": 676,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.0379
      },
      {
        "pokemonId": 731,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.0379
      },
      {
        "pokemonId": 732,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.0379
      },
      {
        "pokemonId": 734,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.0377
      },
      {
        "pokemonId": 735,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.0332
      },
      {
        "pokemonId": 759,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.0332
      },
      {
        "pokemonId": 765,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.0332
      },
      {
        "pokemonId": 772,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.0332
      },
      {
        "pokemonId": 780,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.0332
      }
    ]
  },
  {
    "name": "Alola Swamp W",
    "spawns": [
      {
        "pokemonId": 23,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.1667
      },
      {
        "pokemonId": 41,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.1667
      },
      {
        "pokemonId": 88,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.1667
      },
      {
        "pokemonId": 568,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.1667
      },
      {
        "pokemonId": 747,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.1667
      },
      {
        "pokemonId": 757,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.1667
      }
    ]
  },
  {
    "name": "Alola Power Plant W",
    "spawns": [
      {
        "pokemonId": 81,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.3333
      },
      {
        "pokemonId": 172,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.3333
      },
      {
        "pokemonId": 179,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.3333
      }
    ]
  },
  {
    "name": "Alola Desert W",
    "spawns": [
      {
        "pokemonId": 27,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.1313
      },
      {
        "pokemonId": 50,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.1313
      },
      {
        "pokemonId": 104,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.1313
      },
      {
        "pokemonId": 328,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.1313
      },
      {
        "pokemonId": 343,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.1304
      },
      {
        "pokemonId": 551,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.1148
      },
      {
        "pokemonId": 552,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.1148
      },
      {
        "pokemonId": 622,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.1148
      }
    ]
  },
  {
    "name": "Alola Meadow W",
    "spawns": [
      {
        "pokemonId": 173,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.3323
      },
      {
        "pokemonId": 209,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.3323
      },
      {
        "pokemonId": 764,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.3353
      }
    ]
  },
  {
    "name": "Alola Volcano W",
    "spawns": [
      {
        "pokemonId": 37,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.3333
      },
      {
        "pokemonId": 58,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.3333
      },
      {
        "pokemonId": 240,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.3333
      }
    ]
  },
  {
    "name": "Alola Ocean W",
    "spawns": [
      {
        "pokemonId": 54,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.0399
      },
      {
        "pokemonId": 72,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.0427
      },
      {
        "pokemonId": 79,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.0427
      },
      {
        "pokemonId": 86,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.0427
      },
      {
        "pokemonId": 120,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.0425
      },
      {
        "pokemonId": 129,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.0427
      },
      {
        "pokemonId": 131,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.0427
      },
      {
        "pokemonId": 170,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.0427
      },
      {
        "pokemonId": 222,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.0427
      },
      {
        "pokemonId": 278,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.0427
      },
      {
        "pokemonId": 279,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.0427
      },
      {
        "pokemonId": 318,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.0425
      },
      {
        "pokemonId": 319,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.0427
      },
      {
        "pokemonId": 320,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.0427
      },
      {
        "pokemonId": 339,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.0427
      },
      {
        "pokemonId": 369,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.0427
      },
      {
        "pokemonId": 422,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.0427
      },
      {
        "pokemonId": 423,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.0427
      },
      {
        "pokemonId": 456,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.0427
      },
      {
        "pokemonId": 457,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.0427
      },
      {
        "pokemonId": 746,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.0372
      },
      {
        "pokemonId": 751,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.0372
      },
      {
        "pokemonId": 771,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.0372
      },
      {
        "pokemonId": 779,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.0372
      }
    ]
  },
  {
    "name": "Alola Dojo W",
    "spawns": [
      {
        "pokemonId": 56,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.17
      },
      {
        "pokemonId": 296,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.17
      },
      {
        "pokemonId": 619,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.132
      },
      {
        "pokemonId": 674,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.132
      },
      {
        "pokemonId": 739,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.132
      },
      {
        "pokemonId": 740,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.132
      },
      {
        "pokemonId": 766,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.132
      }
    ]
  },
  {
    "name": "Alola Mind W",
    "spawns": [
      {
        "pokemonId": 63,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.2581
      },
      {
        "pokemonId": 96,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.2581
      },
      {
        "pokemonId": 177,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.2581
      },
      {
        "pokemonId": 605,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.2256
      }
    ]
  },
  {
    "name": "Alola Crag W",
    "spawns": [
      {
        "pokemonId": 138,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.0763
      },
      {
        "pokemonId": 140,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.0763
      },
      {
        "pokemonId": 246,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.0763
      },
      {
        "pokemonId": 299,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.0763
      },
      {
        "pokemonId": 345,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.0763
      },
      {
        "pokemonId": 347,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.0763
      },
      {
        "pokemonId": 408,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.0763
      },
      {
        "pokemonId": 438,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.0758
      },
      {
        "pokemonId": 524,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.0763
      },
      {
        "pokemonId": 525,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.0763
      },
      {
        "pokemonId": 703,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.0593
      },
      {
        "pokemonId": 744,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.0593
      },
      {
        "pokemonId": 745,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.0593
      },
      {
        "pokemonId": 774,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.0593
      }
    ]
  },
  {
    "name": "Alola Graveyard W",
    "spawns": [
      {
        "pokemonId": 92,
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
        "pokemonId": 425,
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
    "name": "Alola Jungle W",
    "spawns": [
      {
        "pokemonId": 102,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.1458
      },
      {
        "pokemonId": 357,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.1474
      },
      {
        "pokemonId": 753,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.1474
      },
      {
        "pokemonId": 755,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.1474
      },
      {
        "pokemonId": 761,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.2061
      },
      {
        "pokemonId": 762,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.2061
      }
    ]
  },
  {
    "name": "Alola Den W",
    "spawns": [
      {
        "pokemonId": 621,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.1503
      },
      {
        "pokemonId": 704,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.1503
      },
      {
        "pokemonId": 782,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.3497
      },
      {
        "pokemonId": 783,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.3497
      }
    ]
  },
  {
    "name": "Alola Shadow W",
    "spawns": [
      {
        "pokemonId": 198,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.1938
      },
      {
        "pokemonId": 215,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.1938
      },
      {
        "pokemonId": 228,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.1938
      },
      {
        "pokemonId": 359,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.1922
      },
      {
        "pokemonId": 686,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.2263
      }
    ]
  },
  {
    "name": "Alola Glacier W",
    "spawns": [
      {
        "pokemonId": 225,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.1664
      },
      {
        "pokemonId": 238,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.1664
      },
      {
        "pokemonId": 361,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.1664
      },
      {
        "pokemonId": 362,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.1664
      },
      {
        "pokemonId": 582,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.1664
      },
      {
        "pokemonId": 584,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.1679
      }
    ]
  },
  {
    "name": "Alola Factory W",
    "spawns": [
      {
        "pokemonId": 227,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.25
      },
      {
        "pokemonId": 303,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.25
      },
      {
        "pokemonId": 374,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.25
      },
      {
        "pokemonId": 707,
        "minLevel": 100,
        "maxLevel": 100,
        "chance": 0.25
      }
    ]
  },
  {
    "name": "Alola Sky W",
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
        "pokemonId": 10,
        "minLevel": 10,
        "maxLevel": 20,
        "chance": 0.5
      },
      {
        "pokemonId": 13,
        "minLevel": 10,
        "maxLevel": 20,
        "chance": 0.5
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
        "pokemonId": 11,
        "minLevel": 87,
        "maxLevel": 95,
        "chance": 1
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
        "pokemonId": 79,
        "minLevel": 92,
        "maxLevel": 100,
        "chance": 0.5152
      },
      {
        "pokemonId": 456,
        "minLevel": 92,
        "maxLevel": 100,
        "chance": 0.4848
      }
    ],
    "challengeName": "Extra Challenge A 04",
    "areaId": "Kala'e Bay",
    "unlocks": [],
    "requirements": {
      "defeatCountRoute": {
        "route": "Kala'e Bay",
        "count": 15
      }
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
    "spawns": [],
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
        "pokemonId": 61,
        "minLevel": 92,
        "maxLevel": 100,
        "chance": 0.2826
      },
      {
        "pokemonId": 60,
        "minLevel": 90,
        "maxLevel": 98,
        "chance": 0.7174
      }
    ],
    "challengeName": "Extra Challenge B 04",
    "areaId": "Route 16",
    "unlocks": [],
    "requirements": {
      "defeatCountRoute": {
        "route": "Route 16",
        "count": 10
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
        "pokemonId": 10,
        "minLevel": 10,
        "maxLevel": 20,
        "chance": 0.5
      },
      {
        "pokemonId": 13,
        "minLevel": 10,
        "maxLevel": 20,
        "chance": 0.5
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
        "pokemonId": 75,
        "minLevel": 90,
        "maxLevel": 98,
        "chance": 1
      }
    ],
    "challengeName": "Extra Challenge C 03",
    "areaId": "Blush Mountain",
    "unlocks": [],
    "requirements": {
      "catchCountRoute": {
        "route": "Blush Mountain",
        "count": 10
      }
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
        "chance": 0.2
      },
      {
        "pokemonId": 137,
        "minLevel": 83,
        "maxLevel": 91,
        "chance": 0.275
      },
      {
        "pokemonId": 808,
        "minLevel": 81,
        "maxLevel": 89,
        "chance": 0.3583
      },
      {
        "pokemonId": 233,
        "minLevel": 85,
        "maxLevel": 90,
        "chance": 0.0833
      },
      {
        "pokemonId": 474,
        "minLevel": 85,
        "maxLevel": 90,
        "chance": 0.0833
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
        "pokemonId": 10,
        "minLevel": 10,
        "maxLevel": 20,
        "chance": 0.5
      },
      {
        "pokemonId": 13,
        "minLevel": 10,
        "maxLevel": 20,
        "chance": 0.5
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
        "pokemonId": 10,
        "minLevel": 10,
        "maxLevel": 20,
        "chance": 0.5
      },
      {
        "pokemonId": 13,
        "minLevel": 10,
        "maxLevel": 20,
        "chance": 0.5
      }
    ],
    "challengeName": "Extra Challenge D 04",
    "areaId": "The Interdimensional Rift",
    "unlocks": [],
    "requirements": {
      "defeatCountRoute": {
        "route": "The Interdimensional Rift",
        "count": 100
      }
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
        "pokemonId": 142,
        "minLevel": 80,
        "maxLevel": 85,
        "chance": 1
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
        "pokemonId": 732,
        "minLevel": 87,
        "maxLevel": 95,
        "chance": 1
      }
    ],
    "challengeName": "Extra Challenge E 03",
    "areaId": "Royal Avenue",
    "unlocks": [
      "Starter Depot"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 2
      }
    }
  },
  {
    "name": "Starter Depot",
    "spawns": [
      {
        "pokemonId": 722,
        "minLevel": 90,
        "maxLevel": 95,
        "chance": 0.33
      },
      {
        "pokemonId": 725,
        "minLevel": 90,
        "maxLevel": 95,
        "chance": 0.33
      },
      {
        "pokemonId": 728,
        "minLevel": 90,
        "maxLevel": 95,
        "chance": 0.34
      }
    ],
    "challengeName": "Extra Challenge E 05",
    "areaId": "Starter Depot",
    "unlocks": [
      "Evolved Starter Depot"
    ],
    "requirements": {
      "defeatCountRoute": {
        "route": "Starter Depot",
        "count": 10
      }
    }
  },
  {
    "name": "Evolved Starter Depot",
    "spawns": [
      {
        "pokemonId": 724,
        "minLevel": 95,
        "maxLevel": 100,
        "chance": 0.3333
      },
      {
        "pokemonId": 727,
        "minLevel": 95,
        "maxLevel": 100,
        "chance": 0.3333
      },
      {
        "pokemonId": 730,
        "minLevel": 95,
        "maxLevel": 100,
        "chance": 0.3334
      }
    ],
    "challengeName": "Extra Challenge E 06",
    "areaId": "Evolved Starter Depot",
    "unlocks": [
      "Crystal Depths"
    ],
    "requirements": {
      "defeatCountRoute": {
        "route": "Evolved Starter Depot",
        "count": 10
      }
    }
  },
  {
    "name": "Sacred Shrine",
    "spawns": [
      {
        "pokemonId": 785,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.25
      },
      {
        "pokemonId": 786,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.25
      },
      {
        "pokemonId": 787,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.25
      },
      {
        "pokemonId": 788,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.25
      }
    ],
    "challengeName": "Special Challenge Rift 0",
    "areaId": "Sacred Shrine",
    "unlocks": [
      "Weak Wormhole Protectors"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "name": "Weak Wormhole Protectors",
    "spawns": [
      {
        "pokemonId": 1221,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.5
      },
      {
        "pokemonId": 1220,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.5
      }
    ],
    "challengeName": "Special Challenge Rift 1",
    "areaId": "Weak Wormhole Protectors",
    "unlocks": [
      "Ultra Beasts"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "name": "Ultra Beasts",
    "spawns": [
      {
        "pokemonId": 793,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.091
      },
      {
        "pokemonId": 794,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.0909
      },
      {
        "pokemonId": 795,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.0909
      },
      {
        "pokemonId": 796,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.0909
      },
      {
        "pokemonId": 797,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.0909
      },
      {
        "pokemonId": 798,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.0909
      },
      {
        "pokemonId": 799,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.0909
      },
      {
        "pokemonId": 803,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.0909
      },
      {
        "pokemonId": 804,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.0909
      },
      {
        "pokemonId": 806,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.0909
      },
      {
        "pokemonId": 805,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.0909
      }
    ],
    "challengeName": "Special Challenge Rift 2",
    "areaId": "Ultra Beasts",
    "unlocks": [
      "Strong Wormhole Protectors"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "name": "Strong Wormhole Protectors",
    "spawns": [
      {
        "pokemonId": 1221,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.3334
      },
      {
        "pokemonId": 1220,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.3333
      },
      {
        "pokemonId": 1222,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.3333
      }
    ],
    "challengeName": "Special Challenge Rift 3",
    "areaId": "Strong Wormhole Protectors",
    "unlocks": [
      "The Zenith Anomaly"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "name": "The Zenith Anomaly",
    "spawns": [
      {
        "pokemonId": 801,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.3334
      },
      {
        "pokemonId": 802,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.3333
      },
      {
        "pokemonId": 807,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.3333
      }
    ],
    "challengeName": "Special Challenge Rift 4",
    "areaId": "The Zenith Anomaly",
    "unlocks": [
      "Obsidian Sphere"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "name": "Obsidian Sphere",
    "spawns": [
      {
        "pokemonId": 789,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.5
      },
      {
        "pokemonId": 790,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.5
      }
    ],
    "challengeName": "Special Challenge Rift 5",
    "areaId": "Obsidian Sphere",
    "unlocks": [
      "Obsidian Tesseract"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "name": "Obsidian Tesseract",
    "spawns": [
      {
        "pokemonId": 791,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.3334
      },
      {
        "pokemonId": 792,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.3333
      },
      {
        "pokemonId": 800,
        "minLevel": 100,
        "maxLevel": 110,
        "chance": 0.3333
      }
    ],
    "challengeName": "Special Challenge Rift 6",
    "areaId": "Obsidian Tesseract",
    "unlocks": [],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  }
];

export const region70Unlocks = [
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
      "Alola Forest Weak"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Uncommon+",
        "count": 5
      }
    }
  },
  {
    "challengeName": "Extra Challenge M 01",
    "areaId": "Alola Forest Weak",
    "unlocks": [
      "Alola Forest Strong"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "challengeName": "Extra Challenge M 02",
    "areaId": "Alola Forest Strong",
    "unlocks": [
      "Alola Plain Weak"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "challengeName": "Extra Challenge M 03",
    "areaId": "Alola Plain Weak",
    "unlocks": [
      "Alola Plain Regular"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "challengeName": "Extra Challenge M 04",
    "areaId": "Alola Plain Regular",
    "unlocks": [
      "Alola Plain Strong"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "challengeName": "Extra Challenge M 05",
    "areaId": "Alola Plain Strong",
    "unlocks": [
      "Alola Swamp"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "challengeName": "Extra Challenge M 06",
    "areaId": "Alola Swamp",
    "unlocks": [
      "Alola Power Plant Weak"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "challengeName": "Extra Challenge M 07",
    "areaId": "Alola Power Plant Weak",
    "unlocks": [
      "Alola Power Plant Strong"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "challengeName": "Extra Challenge M 08",
    "areaId": "Alola Power Plant Strong",
    "unlocks": [
      "Alola Desert"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "challengeName": "Extra Challenge M 09",
    "areaId": "Alola Desert",
    "unlocks": [
      "Meadow"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "challengeName": "Extra Challenge M 10",
    "areaId": "Meadow",
    "unlocks": [
      "Volcano Base"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "challengeName": "Extra Challenge M 11",
    "areaId": "Volcano Base",
    "unlocks": [
      "Volcano Peak"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "challengeName": "Extra Challenge M 12",
    "areaId": "Volcano Peak",
    "unlocks": [
      "Ocean 1"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "challengeName": "Extra Challenge M 13",
    "areaId": "Ocean 1",
    "unlocks": [
      "Ocean 2"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "challengeName": "Extra Challenge M 14",
    "areaId": "Ocean 2",
    "unlocks": [
      "Ocean 3"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "challengeName": "Extra Challenge M 15",
    "areaId": "Ocean 3",
    "unlocks": [
      "Dojo"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "challengeName": "Extra Challenge M 16",
    "areaId": "Dojo",
    "unlocks": [
      "Mind"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "challengeName": "Extra Challenge M 17",
    "areaId": "Mind",
    "unlocks": [
      "Crag Weak"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "challengeName": "Extra Challenge M 18",
    "areaId": "Crag Weak",
    "unlocks": [
      "Crag Regular"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "challengeName": "Extra Challenge M 19",
    "areaId": "Crag Regular",
    "unlocks": [
      "Crag Strong"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "challengeName": "Extra Challenge M 20",
    "areaId": "Crag Strong",
    "unlocks": [
      "Graveyard"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "challengeName": "Extra Challenge M 21",
    "areaId": "Graveyard",
    "unlocks": [
      "Jungle Weak"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "challengeName": "Extra Challenge M 22",
    "areaId": "Jungle Weak",
    "unlocks": [
      "Alola Jungle Strong"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "challengeName": "Extra Challenge M 23",
    "areaId": "Alola Jungle Strong",
    "unlocks": [
      "Outer Dragon Den"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "challengeName": "Extra Challenge M 24",
    "areaId": "Outer Dragon Den",
    "unlocks": [
      "Dragon Den Core"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "challengeName": "Extra Challenge M 25",
    "areaId": "Dragon Den Core",
    "unlocks": [
      "Shadow Weak"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "challengeName": "Extra Challenge M 26",
    "areaId": "Shadow Weak",
    "unlocks": [
      "Shadow Strong"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "challengeName": "Extra Challenge M 27",
    "areaId": "Shadow Strong",
    "unlocks": [
      "Glacier"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "challengeName": "Extra Challenge M 28",
    "areaId": "Glacier",
    "unlocks": [
      "Factory"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "challengeName": "Extra Challenge M 29",
    "areaId": "Factory",
    "unlocks": [
      "Alola Forest W"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "challengeName": "Extra Challenge W 01",
    "areaId": "Alola Forest W",
    "unlocks": [
      "Alola Plain W"
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
    "areaId": "Alola Plain W",
    "unlocks": [
      "Alola Swamp W"
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
    "areaId": "Alola Swamp W",
    "unlocks": [
      "Alola Power Plant W"
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
    "areaId": "Alola Power Plant W",
    "unlocks": [
      "Alola Desert W"
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
    "areaId": "Alola Desert W",
    "unlocks": [
      "Alola Meadow W"
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
    "areaId": "Alola Meadow W",
    "unlocks": [
      "Alola Volcano W"
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
    "areaId": "Alola Volcano W",
    "unlocks": [
      "Alola Ocean W"
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
    "areaId": "Alola Ocean W",
    "unlocks": [
      "Alola Dojo W"
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
    "areaId": "Alola Dojo W",
    "unlocks": [
      "Alola Mind W"
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
    "areaId": "Alola Mind W",
    "unlocks": [
      "Alola Crag W"
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
    "areaId": "Alola Crag W",
    "unlocks": [
      "Alola Graveyard W"
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
    "areaId": "Alola Graveyard W",
    "unlocks": [
      "Alola Jungle W"
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
    "areaId": "Alola Jungle W",
    "unlocks": [
      "Alola Den W"
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
    "areaId": "Alola Den W",
    "unlocks": [
      "Alola Shadow W"
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
    "areaId": "Alola Shadow W",
    "unlocks": [
      "Alola Glacier W"
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
    "areaId": "Alola Glacier W",
    "unlocks": [
      "Alola Factory W"
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
    "areaId": "Alola Factory W",
    "unlocks": [
      "Alola Sky W"
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
    "areaId": "Alola Sky W",
    "unlocks": [
      "Sacred Shrine"
    ],
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
    "unlocks": [],
    "requirements": {
      "defeatCountRoute": {
        "route": "Kala'e Bay",
        "count": 15
      }
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
    "unlocks": [],
    "requirements": {
      "defeatCountRoute": {
        "route": "Route 16",
        "count": 10
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
    "unlocks": [],
    "requirements": {
      "catchCountRoute": {
        "route": "Blush Mountain",
        "count": 10
      }
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
    "unlocks": [],
    "requirements": {
      "defeatCountRoute": {
        "route": "The Interdimensional Rift",
        "count": 100
      }
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
      "Starter Depot"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 2
      }
    }
  },
  {
    "challengeName": "Extra Challenge E 05",
    "areaId": "Starter Depot",
    "unlocks": [
      "Evolved Starter Depot"
    ],
    "requirements": {
      "defeatCountRoute": {
        "route": "Starter Depot",
        "count": 10
      }
    }
  },
  {
    "challengeName": "Extra Challenge E 06",
    "areaId": "Evolved Starter Depot",
    "unlocks": [
      "Crystal Depths"
    ],
    "requirements": {
      "defeatCountRoute": {
        "route": "Evolved Starter Depot",
        "count": 10
      }
    }
  },
  {
    "challengeName": "Special Challenge Rift 0",
    "areaId": "Sacred Shrine",
    "unlocks": [
      "Weak Wormhole Protectors"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "challengeName": "Special Challenge Rift 1",
    "areaId": "Weak Wormhole Protectors",
    "unlocks": [
      "Ultra Beasts"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "challengeName": "Special Challenge Rift 2",
    "areaId": "Ultra Beasts",
    "unlocks": [
      "Strong Wormhole Protectors"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "challengeName": "Special Challenge Rift 3",
    "areaId": "Strong Wormhole Protectors",
    "unlocks": [
      "The Zenith Anomaly"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "challengeName": "Special Challenge Rift 4",
    "areaId": "The Zenith Anomaly",
    "unlocks": [
      "Obsidian Sphere"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "challengeName": "Special Challenge Rift 5",
    "areaId": "Obsidian Sphere",
    "unlocks": [
      "Obsidian Tesseract"
    ],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  },
  {
    "challengeName": "Special Challenge Rift 6",
    "areaId": "Obsidian Tesseract",
    "unlocks": [],
    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 3
      }
    }
  }
];
