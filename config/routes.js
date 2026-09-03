const routes = [
    {
      "name": "Route 1",
      "spawns": [
        {"pokemonId": 16, "minLevel": 1, "maxLevel": 2, "chance": 0.5},
        {"pokemonId": 19, "minLevel": 1, "maxLevel": 2, "chance": 0.5}
      ]
    },
    {
      "name": "Route 2",
      "spawns": [
        {"pokemonId": 16, "minLevel": 3, "maxLevel": 4, "chance": 0.4},
        {"pokemonId": 19, "minLevel": 3, "maxLevel": 4, "chance": 0.4},
        {"pokemonId": 10, "minLevel": 3, "maxLevel": 4, "chance": 0.05},
        {"pokemonId": 13, "minLevel": 3, "maxLevel": 4, "chance": 0.05},
        {"pokemonId": 29, "minLevel": 3, "maxLevel": 4, "chance": 0.05},
        {"pokemonId": 32, "minLevel": 3, "maxLevel": 4, "chance": 0.05}
      ]
    },
    {
      "name": "Viridian Forest",
      "spawns": [
        {"pokemonId": 10, "minLevel": 5, "maxLevel": 6, "chance": 0.3},
        {"pokemonId": 13, "minLevel": 5, "maxLevel": 6, "chance": 0.3},
        {"pokemonId": 11, "minLevel": 5, "maxLevel": 6, "chance": 0.15},
        {"pokemonId": 14, "minLevel": 5, "maxLevel": 6, "chance": 0.15},
        {"pokemonId": 16, "minLevel": 5, "maxLevel": 6, "chance": 0.09},
        {"pokemonId": 25, "minLevel": 5, "maxLevel": 6, "chance": 0.01}
      ]
    },
    {
      "name": "Route 3",
      "spawns": [
        {"pokemonId": 16, "minLevel": 7, "maxLevel": 8, "chance": 0.3},
        {"pokemonId": 21, "minLevel": 7, "maxLevel": 8, "chance": 0.3},
        {"pokemonId": 19, "minLevel": 7, "maxLevel": 8, "chance": 0.15},
        {"pokemonId": 39, "minLevel": 7, "maxLevel": 8, "chance": 0.1},
        {"pokemonId": 23, "minLevel": 7, "maxLevel": 8, "chance": 0.075},
        {"pokemonId": 27, "minLevel": 7, "maxLevel": 8, "chance": 0.075}
      ]
    },
    {
      "name": "Mount Moon",
      "spawns": [
        {"pokemonId": 41, "minLevel": 9, "maxLevel": 11, "chance": 0.55},
        {"pokemonId": 74, "minLevel": 9, "maxLevel": 11, "chance": 0.25},
        {"pokemonId": 46, "minLevel": 9, "maxLevel": 11, "chance": 0.15},
        {"pokemonId": 35, "minLevel": 9, "maxLevel": 11, "chance": 0.05}
      ]
    },
    {
      "name": "Route 4",
      "spawns": [
        {"pokemonId": 19, "minLevel": 12, "maxLevel": 14, "chance": 0.35},
        {"pokemonId": 21, "minLevel": 12, "maxLevel": 14, "chance": 0.35},
        {"pokemonId": 23, "minLevel": 12, "maxLevel": 14, "chance": 0.125},
        {"pokemonId": 27, "minLevel": 12, "maxLevel": 14, "chance": 0.125},
        {"pokemonId": 56, "minLevel": 12, "maxLevel": 14, "chance": 0.05}
      ]
    },
    {
      "name": "Route 24",
      "spawns": [
        {"pokemonId": 69, "minLevel": 15, "maxLevel": 17, "chance": 0.175},
        {"pokemonId": 43, "minLevel": 15, "maxLevel": 17, "chance": 0.175},
        {"pokemonId": 16, "minLevel": 15, "maxLevel": 17, "chance": 0.25},
        {"pokemonId": 10, "minLevel": 15, "maxLevel": 17, "chance": 0.1},
        {"pokemonId": 13, "minLevel": 15, "maxLevel": 17, "chance": 0.1},
        {"pokemonId": 11, "minLevel": 15, "maxLevel": 17, "chance": 0.05},
        {"pokemonId": 14, "minLevel": 15, "maxLevel": 17, "chance": 0.05},
        {"pokemonId": 63, "minLevel": 15, "maxLevel": 17, "chance": 0.1}
      ]
    },
    {
      "name": "Route 25",
      "spawns": [
        {"pokemonId": 69, "minLevel": 18, "maxLevel": 20, "chance": 0.175},
        {"pokemonId": 43, "minLevel": 18, "maxLevel": 20, "chance": 0.175},
        {"pokemonId": 16, "minLevel": 18, "maxLevel": 20, "chance": 0.3},
        {"pokemonId": 10, "minLevel": 18, "maxLevel": 20, "chance": 0.075},
        {"pokemonId": 13, "minLevel": 18, "maxLevel": 20, "chance": 0.075},
        {"pokemonId": 48, "minLevel": 18, "maxLevel": 20, "chance": 0.1},
        {"pokemonId": 63, "minLevel": 18, "maxLevel": 20, "chance": 0.1}
      ]
    },
    {
      "name": "Route 5",
      "spawns": [
        {"pokemonId": 69, "minLevel": 21, "maxLevel": 23, "chance": 0.175},
        {"pokemonId": 43, "minLevel": 21, "maxLevel": 23, "chance": 0.175},
        {"pokemonId": 16, "minLevel": 21, "maxLevel": 23, "chance": 0.35},
        {"pokemonId": 52, "minLevel": 21, "maxLevel": 23, "chance": 0.125},
        {"pokemonId": 56, "minLevel": 21, "maxLevel": 23, "chance": 0.125},
        {"pokemonId": 63, "minLevel": 21, "maxLevel": 23, "chance": 0.05}
      ]
    },
    {
      "name": "Route 6",
      "spawns": [
        {"pokemonId": 69, "minLevel": 24, "maxLevel": 26, "chance": 0.175},
        {"pokemonId": 43, "minLevel": 24, "maxLevel": 26, "chance": 0.175},
        {"pokemonId": 16, "minLevel": 24, "maxLevel": 26, "chance": 0.35},
        {"pokemonId": 52, "minLevel": 24, "maxLevel": 26, "chance": 0.125},
        {"pokemonId": 56, "minLevel": 24, "maxLevel": 26, "chance": 0.125},
        {"pokemonId": 54, "minLevel": 24, "maxLevel": 26, "chance": 0.025},
        {"pokemonId": 118, "minLevel": 24, "maxLevel": 26, "chance": 0.025}
      ]
    },
    {
      "name": "Route 11",
      "spawns": [
        {"pokemonId": 96, "minLevel": 27, "maxLevel": 29, "chance": 0.4},
        {"pokemonId": 21, "minLevel": 27, "maxLevel": 29, "chance": 0.3},
        {"pokemonId": 23, "minLevel": 27, "maxLevel": 29, "chance": 0.125},
        {"pokemonId": 27, "minLevel": 27, "maxLevel": 29, "chance": 0.125},
        {"pokemonId": 20, "minLevel": 27, "maxLevel": 29, "chance": 0.05}
      ]
    },
    {
      "name": "Diglett's Cave",
      "spawns": [
        {"pokemonId": 50, "minLevel": 30, "maxLevel": 33, "chance": 0.90},
        {"pokemonId": 51, "minLevel": 30, "maxLevel": 33, "chance": 0.10}
      ]
    },
    {
      "name": "Route 9",
      "spawns": [
        {"pokemonId": 19, "minLevel": 34, "maxLevel": 37, "chance": 0.35},
        {"pokemonId": 21, "minLevel": 34, "maxLevel": 37, "chance": 0.35},
        {"pokemonId": 23, "minLevel": 34, "maxLevel": 37, "chance": 0.11},
        {"pokemonId": 27, "minLevel": 34, "maxLevel": 37, "chance": 0.11},
        {"pokemonId": 20, "minLevel": 34, "maxLevel": 37, "chance": 0.04},
        {"pokemonId": 22, "minLevel": 34, "maxLevel": 37, "chance": 0.04}
      ]
    },
    {
      "name": "Route 10",
      "spawns": [
        {"pokemonId": 21, "minLevel": 38, "maxLevel": 41, "chance": 0.35},
        {"pokemonId": 100, "minLevel": 38, "maxLevel": 41, "chance": 0.3},
        {"pokemonId": 23, "minLevel": 38, "maxLevel": 41, "chance": 0.125},
        {"pokemonId": 27, "minLevel": 38, "maxLevel": 41, "chance": 0.125},
        {"pokemonId": 81, "minLevel": 38, "maxLevel": 41, "chance": 0.1}
      ]
    },
    {
      "name": "Rock Tunnel",
      "spawns": [
        {"pokemonId": 41, "minLevel": 42, "maxLevel": 46, "chance": 0.4},
        {"pokemonId": 74, "minLevel": 42, "maxLevel": 46, "chance": 0.3},
        {"pokemonId": 66, "minLevel": 42, "maxLevel": 46, "chance": 0.2},
        {"pokemonId": 95, "minLevel": 42, "maxLevel": 46, "chance": 0.1}
      ]
    },
    {
      "name": "Route 8",
      "spawns": [
        {"pokemonId": 16, "minLevel": 47, "maxLevel": 51, "chance": 0.15},
        {"pokemonId": 17, "minLevel": 47, "maxLevel": 51, "chance": 0.15},
        {"pokemonId": 52, "minLevel": 47, "maxLevel": 51, "chance": 0.15},
        {"pokemonId": 56, "minLevel": 47, "maxLevel": 51, "chance": 0.15},
        {"pokemonId": 69, "minLevel": 47, "maxLevel": 51, "chance": 0.1},
        {"pokemonId": 43, "minLevel": 47, "maxLevel": 51, "chance": 0.1},
        {"pokemonId": 58, "minLevel": 47, "maxLevel": 51, "chance": 0.075},
        {"pokemonId": 37, "minLevel": 47, "maxLevel": 51, "chance": 0.075},
        {"pokemonId": 64, "minLevel": 47, "maxLevel": 51, "chance": 0.05}
      ]
    },
    {
      "name": "Route 7",
      "spawns": [
        {"pokemonId": 16, "minLevel": 52, "maxLevel": 57, "chance": 0.15},
        {"pokemonId": 17, "minLevel": 52, "maxLevel": 57, "chance": 0.15},
        {"pokemonId": 52, "minLevel": 52, "maxLevel": 57, "chance": 0.15},
        {"pokemonId": 56, "minLevel": 52, "maxLevel": 57, "chance": 0.15},
        {"pokemonId": 69, "minLevel": 52, "maxLevel": 57, "chance": 0.1},
        {"pokemonId": 43, "minLevel": 52, "maxLevel": 57, "chance": 0.1},
        {"pokemonId": 58, "minLevel": 52, "maxLevel": 57, "chance": 0.1},
        {"pokemonId": 37, "minLevel": 52, "maxLevel": 57, "chance": 0.1}
      ]
    },
    {
      "name": "Casino - Starter Troupe",
      "spawns": [
        { "pokemonId": 1, "minLevel": 45, "maxLevel": 45, "chance": 0.333 },
        { "pokemonId": 4, "minLevel": 45, "maxLevel": 45, "chance": 0.333 },
        { "pokemonId": 7, "minLevel": 45, "maxLevel": 45, "chance": 0.334 }
      ]
    },
    {
      "name": "Casino - Mid Troupe",
      "spawns": [
        { "pokemonId": 2, "minLevel": 50, "maxLevel": 50, "chance": 0.333 },
        { "pokemonId": 5, "minLevel": 50, "maxLevel": 50, "chance": 0.333 },
        { "pokemonId": 8, "minLevel": 50, "maxLevel": 50, "chance": 0.334 }
      ]
    },
    {
      "name": "Casino - Late Troupe",
      "spawns": [
        { "pokemonId": 3, "minLevel": 55, "maxLevel": 55, "chance": 0.333 },
        { "pokemonId": 6, "minLevel": 55, "maxLevel": 55, "chance": 0.333 },
        { "pokemonId": 9, "minLevel": 55, "maxLevel": 55, "chance": 0.334 }
      ]
    },
    {
      "name": "Casino - Eeveelutions",
      "spawns": [
        { "pokemonId": 133, "minLevel": 50, "maxLevel": 50, "chance": 0.25 },
        { "pokemonId": 134, "minLevel": 50, "maxLevel": 50, "chance": 0.25 },
        { "pokemonId": 135, "minLevel": 50, "maxLevel": 50, "chance": 0.25 },
        { "pokemonId": 136, "minLevel": 50, "maxLevel": 50, "chance": 0.25 }
      ]
    },
    {
      "name": "Casino - Special Spot",
      "spawns": [
        { "pokemonId": 131, "minLevel": 52, "maxLevel": 52, "chance": 0.333 },
        { "pokemonId": 137, "minLevel": 52, "maxLevel": 52, "chance": 0.333 },
        { "pokemonId": 108, "minLevel": 52, "maxLevel": 52, "chance": 0.334 }
      ]
    },
    {
      "name": "Pokémon Tower",
      "spawns": [
        {"pokemonId": 92, "minLevel": 58, "maxLevel": 63, "chance": 0.85},
        {"pokemonId": 93, "minLevel": 58, "maxLevel": 63, "chance": 0.1},
        {"pokemonId": 104, "minLevel": 58, "maxLevel": 63, "chance": 0.05}
      ]
    },
    {
      "name": "Route 12",
      "spawns": [
        {"pokemonId": 69, "minLevel": 64, "maxLevel": 69, "chance": 0.15},
        {"pokemonId": 43, "minLevel": 64, "maxLevel": 69, "chance": 0.15},
        {"pokemonId": 17, "minLevel": 64, "maxLevel": 69, "chance": 0.3},
        {"pokemonId": 48, "minLevel": 64, "maxLevel": 69, "chance": 0.2},
        {"pokemonId": 70, "minLevel": 64, "maxLevel": 69, "chance": 0.075},
        {"pokemonId": 44, "minLevel": 64, "maxLevel": 69, "chance": 0.075},
        {"pokemonId": 83, "minLevel": 64, "maxLevel": 69, "chance": 0.05}
      ]
    },
    {
      "name": "Route 13",
      "spawns": [
        {"pokemonId": 44, "minLevel": 70, "maxLevel": 75, "chance": 0.3},
        {"pokemonId": 70, "minLevel": 70, "maxLevel": 75, "chance": 0.3},
        {"pokemonId": 45, "minLevel": 70, "maxLevel": 75, "chance": 0.2},
        {"pokemonId": 71, "minLevel": 70, "maxLevel": 75, "chance": 0.2}
      ]
    },
    {
      "name": "Route 14",
      "spawns": [
        {"pokemonId": 48, "minLevel": 70, "maxLevel": 75, "chance": 0.7},
        {"pokemonId": 49, "minLevel": 70, "maxLevel": 75, "chance": 0.15},
        {"pokemonId": 132, "minLevel": 70, "maxLevel": 75, "chance": 0.15}
      ]
    },
    {
      "name": "Route 15",
      "spawns": [
        {"pokemonId": 16, "minLevel": 70, "maxLevel": 75, "chance": 0.35},
        {"pokemonId": 17, "minLevel": 70, "maxLevel": 75, "chance": 0.3},
        {"pokemonId": 18, "minLevel": 70, "maxLevel": 75, "chance": 0.2},
        {"pokemonId": 132, "minLevel": 70, "maxLevel": 75, "chance": 0.15}
      ]
    },
    {
      "name": "Cycling Road",
      "spawns": [
        {"pokemonId": 21, "minLevel": 73, "maxLevel": 78, "chance": 0.2},
        {"pokemonId": 22, "minLevel": 73, "maxLevel": 78, "chance": 0.15},
        {"pokemonId": 20, "minLevel": 73, "maxLevel": 78, "chance": 0.3},
        {"pokemonId": 84, "minLevel": 73, "maxLevel": 78, "chance": 0.25},
        {"pokemonId": 85, "minLevel": 73, "maxLevel": 78, "chance": 0.1}
      ]
    },
    {
      "name": "Safari Zone",
      "spawns": [
        {"pokemonId": 33, "minLevel": 76, "maxLevel": 81, "chance": 0.125},
        {"pokemonId": 30, "minLevel": 76, "maxLevel": 81, "chance": 0.125},
        {"pokemonId": 111, "minLevel": 76, "maxLevel": 81, "chance": 0.2},
        {"pokemonId": 102, "minLevel": 76, "maxLevel": 81, "chance": 0.2},
        {"pokemonId": 47, "minLevel": 76, "maxLevel": 81, "chance": 0.15},
        {"pokemonId": 123, "minLevel": 76, "maxLevel": 81, "chance": 0.04},
        {"pokemonId": 127, "minLevel": 76, "maxLevel": 81, "chance": 0.04},
        {"pokemonId": 115, "minLevel": 76, "maxLevel": 81, "chance": 0.05},
        {"pokemonId": 128, "minLevel": 76, "maxLevel": 81, "chance": 0.04},
        {"pokemonId": 113, "minLevel": 76, "maxLevel": 81, "chance": 0.03}
      ]
    },
    {
      "name": "Sea Routes",
      "spawns": [
        {"pokemonId": 72, "minLevel": 78, "maxLevel": 83, "chance": 0.6},
        {"pokemonId": 73, "minLevel": 78, "maxLevel": 83, "chance": 0.15},
        {"pokemonId": 114, "minLevel": 78, "maxLevel": 83, "chance": 0.15},
        {"pokemonId": 120, "minLevel": 78, "maxLevel": 83, "chance": 0.05},
        {"pokemonId": 90, "minLevel": 78, "maxLevel": 83, "chance": 0.05}
      ]
    },
    {
      "name": "Seafoam Islands",
      "spawns": [
        {"pokemonId": 41, "minLevel": 80, "maxLevel": 85, "chance": 0.15},
        {"pokemonId": 42, "minLevel": 80, "maxLevel": 85, "chance": 0.15},
        {"pokemonId": 54, "minLevel": 80, "maxLevel": 85, "chance": 0.125},
        {"pokemonId": 79, "minLevel": 80, "maxLevel": 85, "chance": 0.125},
        {"pokemonId": 55, "minLevel": 80, "maxLevel": 85, "chance": 0.07},
        {"pokemonId": 80, "minLevel": 80, "maxLevel": 85, "chance": 0.07},
        {"pokemonId": 86, "minLevel": 80, "maxLevel": 85, "chance": 0.1},
        {"pokemonId": 87, "minLevel": 80, "maxLevel": 85, "chance": 0.1},
        {"pokemonId": 124, "minLevel": 80, "maxLevel": 85, "chance": 0.1},
        {"pokemonId": 144, "minLevel": 85, "maxLevel": 85, "chance": 0.01}
      ]
    },
    {
      "name": "Pokémon Mansion",
      "spawns": [
        {"pokemonId": 109, "minLevel": 82, "maxLevel": 87, "chance": 0.2},
        {"pokemonId": 88, "minLevel": 82, "maxLevel": 87, "chance": 0.15},
        {"pokemonId": 110, "minLevel": 82, "maxLevel": 87, "chance": 0.1},
        {"pokemonId": 89, "minLevel": 82, "maxLevel": 87, "chance": 0.1},
        {"pokemonId": 77, "minLevel": 82, "maxLevel": 87, "chance": 0.15},
        {"pokemonId": 37, "minLevel": 82, "maxLevel": 87, "chance": 0.05},
        {"pokemonId": 58, "minLevel": 82, "maxLevel": 87, "chance": 0.05},
        {"pokemonId": 78, "minLevel": 82, "maxLevel": 87, "chance": 0.1},
        {"pokemonId": 126, "minLevel": 82, "maxLevel": 87, "chance": 0.1}
      ]
    },
    {
      "name": "Power Plant",
      "spawns": [
        {"pokemonId": 100, "minLevel": 84, "maxLevel": 89, "chance": 0.2},
        {"pokemonId": 101, "minLevel": 84, "maxLevel": 89, "chance": 0.14},
        {"pokemonId": 81, "minLevel": 84, "maxLevel": 89, "chance": 0.2},
        {"pokemonId": 82, "minLevel": 84, "maxLevel": 89, "chance": 0.1},
        {"pokemonId": 25, "minLevel": 84, "maxLevel": 89, "chance": 0.15},
        {"pokemonId": 26, "minLevel": 84, "maxLevel": 89, "chance": 0.05},
        {"pokemonId": 125, "minLevel": 84, "maxLevel": 89, "chance": 0.15},
        {"pokemonId": 145, "minLevel": 89, "maxLevel": 89, "chance": 0.01}
      ]
    },
    {
      "name": "Route 22",
      "spawns": [
        {"pokemonId": 21, "minLevel": 85, "maxLevel": 90, "chance": 0.175},
        {"pokemonId": 22, "minLevel": 85, "maxLevel": 90, "chance": 0.175},
        {"pokemonId": 33, "minLevel": 85, "maxLevel": 90, "chance": 0.15},
        {"pokemonId": 30, "minLevel": 85, "maxLevel": 90, "chance": 0.15},
        {"pokemonId": 57, "minLevel": 85, "maxLevel": 90, "chance": 0.1},
        {"pokemonId": 24, "minLevel": 85, "maxLevel": 90, "chance": 0.075},
        {"pokemonId": 28, "minLevel": 85, "maxLevel": 90, "chance": 0.075},
        {"pokemonId": 132, "minLevel": 85, "maxLevel": 90, "chance": 0.1}
      ]
    },
    {
      "name": "Route 23",
      "spawns": [
        {"pokemonId": 12, "minLevel": 85, "maxLevel": 90, "chance": 0.25},
        {"pokemonId": 15, "minLevel": 85, "maxLevel": 90, "chance": 0.25},
        {"pokemonId": 31, "minLevel": 85, "maxLevel": 90, "chance": 0.07},
        {"pokemonId": 34, "minLevel": 85, "maxLevel": 90, "chance": 0.07},
        {"pokemonId": 36, "minLevel": 85, "maxLevel": 90, "chance": 0.07},
        {"pokemonId": 38, "minLevel": 85, "maxLevel": 90, "chance": 0.07},
        {"pokemonId": 59, "minLevel": 85, "maxLevel": 90, "chance": 0.07},
        {"pokemonId": 103, "minLevel": 85, "maxLevel": 90, "chance": 0.15}
      ]
    },
    {
      "name": "Victory Road",
      "spawns": [
        {"pokemonId": 67, "minLevel": 86, "maxLevel": 90, "chance": 0.25},
        {"pokemonId": 42, "minLevel": 86, "maxLevel": 90, "chance": 0.24},
        {"pokemonId": 75, "minLevel": 86, "maxLevel": 90, "chance": 0.2},
        {"pokemonId": 95, "minLevel": 86, "maxLevel": 90, "chance": 0.15},
        {"pokemonId": 105, "minLevel": 86, "maxLevel": 90, "chance": 0.15},
        {"pokemonId": 146, "minLevel": 90, "maxLevel": 90, "chance": 0.01}
      ]
    },
    {
      "name": "Cerulean Cave",
      "spawns": [
        {"pokemonId": 42, "minLevel": 88, "maxLevel": 90, "chance": 0.2},
        {"pokemonId": 82, "minLevel": 88, "maxLevel": 90, "chance": 0.1},
        {"pokemonId": 97, "minLevel": 88, "maxLevel": 90, "chance": 0.1},
        {"pokemonId": 64, "minLevel": 88, "maxLevel": 90, "chance": 0.1},
        {"pokemonId": 112, "minLevel": 88, "maxLevel": 90, "chance": 0.1},
        {"pokemonId": 105, "minLevel": 88, "maxLevel": 90, "chance": 0.1},
        {"pokemonId": 47, "minLevel": 88, "maxLevel": 90, "chance": 0.05},
        {"pokemonId": 49, "minLevel": 88, "maxLevel": 90, "chance": 0.05},
        {"pokemonId": 113, "minLevel": 88, "maxLevel": 90, "chance": 0.05},
        {"pokemonId": 143, "minLevel": 88, "maxLevel": 90, "chance": 0.05},
        {"pokemonId": 132, "minLevel": 88, "maxLevel": 90, "chance": 0.05},
        {"pokemonId": 26, "minLevel": 88, "maxLevel": 90, "chance": 0.02},
        {"pokemonId": 40, "minLevel": 88, "maxLevel": 90, "chance": 0.02},
        {"pokemonId": 150, "minLevel": 95, "maxLevel": 95, "chance": 0.01}
      ]
    },
    {
      "name": "Small Fishing Spot",
      "spawns": [
        {"pokemonId": 129, "minLevel": 58, "maxLevel": 64, "chance": 0.3},
        {"pokemonId": 60, "minLevel": 58, "maxLevel": 64, "chance": 0.2},
        {"pokemonId": 61, "minLevel": 58, "maxLevel": 64, "chance": 0.1},
        {"pokemonId": 118, "minLevel": 58, "maxLevel": 64, "chance": 0.1},
        {"pokemonId": 98, "minLevel": 58, "maxLevel": 64, "chance": 0.1},
        {"pokemonId": 116, "minLevel": 58, "maxLevel": 64, "chance": 0.1},
        {"pokemonId": 90, "minLevel": 58, "maxLevel": 64, "chance": 0.1}
      ]
    },
    {
      "name": "Big Fishing Spot",
      "spawns": [
        {"pokemonId": 130, "minLevel": 80, "maxLevel": 85, "chance": 0.1},
        {"pokemonId": 62, "minLevel": 80, "maxLevel": 85, "chance": 0.15},
        {"pokemonId": 119, "minLevel": 80, "maxLevel": 85, "chance": 0.15},
        {"pokemonId": 99, "minLevel": 80, "maxLevel": 85, "chance": 0.15},
        {"pokemonId": 117, "minLevel": 80, "maxLevel": 85, "chance": 0.15},
        {"pokemonId": 91, "minLevel": 80, "maxLevel": 85, "chance": 0.15},
        {"pokemonId": 147, "minLevel": 80, "maxLevel": 85, "chance": 0.09},
        {"pokemonId": 148, "minLevel": 80, "maxLevel": 85, "chance": 0.06},
        {"pokemonId": 149, "minLevel": 80, "maxLevel": 85, "chance": 0.05}
      ]
    },
    {
      "name": "Fossil Revival",
      "spawns": [
        {"pokemonId": 138, "minLevel": 82, "maxLevel": 87, "chance": 0.3},
        {"pokemonId": 140, "minLevel": 82, "maxLevel": 87, "chance": 0.3},
        {"pokemonId": 139, "minLevel": 82, "maxLevel": 87, "chance": 0.15},
        {"pokemonId": 141, "minLevel": 82, "maxLevel": 87, "chance": 0.15},
        {"pokemonId": 142, "minLevel": 82, "maxLevel": 87, "chance": 0.1}
      ]
    },
    {
      "name": "Fighting Dojo",
      "spawns": [
        {"pokemonId": 106, "minLevel": 70, "maxLevel": 75, "chance": 0.5},
        {"pokemonId": 107, "minLevel": 70, "maxLevel": 75, "chance": 0.5}
      ]
    },
    {
      "name": "Trade With a Friend",
      "spawns": [
        {"pokemonId": 65, "minLevel": 84, "maxLevel": 89, "chance": 0.25},
        {"pokemonId": 68, "minLevel": 84, "maxLevel": 89, "chance": 0.25},
        {"pokemonId": 94, "minLevel": 84, "maxLevel": 89, "chance": 0.25},
        {"pokemonId": 76, "minLevel": 84, "maxLevel": 89, "chance": 0.25}
      ]
    }
  ];
export { routes };



export const unlocks = [
  {
    "areaId": "Route 1",
    "unlocks": [
      "Route 2"
    ],
    "requirements": {
      "defeatCountRoute": {
        "route": "Route 1",
        "count": 25
      }
    }
  },
  {
    "areaId": "Route 2",
    "unlocks": [
      "Viridian Forest"
    ],
    "requirements": {
      "catchSpecies": [
        {
          "species": "NidoranF",
          "count": 1
        },
        {
          "species": "NidoranM",
          "count": 1
        }
      ]
    }
  },
  {
    "areaId": "Viridian Forest",
    "unlocks": [
      "Pewter Gym"
    ],
    "requirements": {
      "catchByRarityAndType": {
        "type": "Bug",
        "rarity": "Epic",
        "count": 10
      }
    }
  },
  {
    "areaId": "Pewter Gym",
    "unlocks": [
      "Route 3"
    ],
    "requirements": {
      "earnBadge": {
        "name": "Boulder Badge",
        "leader": "Brock",
        "badgeCount": 1
      }
    }
  },
  {
    "areaId": "Route 3",
    "unlocks": [
      "Mount Moon"
    ],
    "requirements": {
      "catchSpecies": [
        {
          "species": "Ekans",
          "count": 1
        },
        {
          "species": "Sandshrew",
          "count": 1
        }
      ]
    }
  },
  {
    "areaId": "Mount Moon",
    "unlocks": [
      "Route 4"
    ],
    "requirements": {
      "catchSpecies": [
        {
          "species": "Clefairy",
          "count": 1
        }
      ],
      "catchSpeciesByRarity": [
        {
          "species": "Zubat",
          "rarity": "Epic",
          "count": 1
        }
      ]
    }
  },
  {
    "areaId": "Route 4",
    "unlocks": [
      "Cerulean Gym"
    ],
    "requirements": {
      "catchSpecies": [
        {
          "species": "Mankey",
          "count": 2
        }
      ]
    }
  },
  {
    "areaId": "Cerulean Gym",
    "unlocks": [
      "Route 24 & 25"
    ],
    "requirements": {
      "earnBadge": {
        "name": "Cascade Badge",
        "leader": "Misty",
        "badgeCount": 2
      }
    }
  },
  {
    "areaId": "Route 24 & 25",
    "unlocks": [
      "Route 5"
    ],
    "requirements": {
      "catchSpecies": [
        {
          "species": "Abra",
          "count": 5
        }
      ]
    }
  },
  {
    "areaId": "Route 5",
    "unlocks": [
      "Route 6"
    ],
    "requirements": {
      "defeatCountRoute": {
        "route": "Route 5",
        "count": 200
      }
    }
  },
  {
    "areaId": "Route 6",
    "unlocks": [
      "Vermilion Gym"
    ],
    "requirements": {
      "catchSpeciesAnyOf": [
        {
          "species": [
            "Psyduck",
            "Goldeen"
          ],
          "count": 1
        }
      ]
    }
  },
  {
    "areaId": "Vermilion Gym",
    "unlocks": [
      "Route 11"
    ],
    "requirements": {
      "earnBadge": {
        "name": "Thunder Badge",
        "leader": "Lt. Surge",
        "badgeCount": 3
      }
    }
  },
  {
    "areaId": "Route 11",
    "unlocks": [
      "Diglett's Cave"
    ],
    "requirements": {
      "catchSpecies": [
        {
          "species": "Drowzee",
          "count": 10
        },
        {
          "species": "Raticate",
          "count": 1
        }
      ]
    }
  },
  {
    "areaId": "Diglett's Cave",
    "unlocks": [
      "Route 9"
    ],
    "requirements": {
      "catchSpecies": [
        {
          "species": "Dugtrio",
          "count": 2
        }
      ]
    }
  },
  {
    "areaId": "Route 9",
    "unlocks": [
      "Route 10"
    ],
    "requirements": {
      "catchSpecies": [
        {
          "species": "Fearow",
          "count": 2
        }
      ]
    }
  },
  {
    "areaId": "Route 10",
    "unlocks": [
      "Rock Tunnel"
    ],
    "requirements": {
      "defeatCountRoute": {
        "route": "Route 10",
        "count": 250
      }
    }
  },
  {
    "areaId": "Rock Tunnel",
    "unlocks": [
      "Route 8"
    ],
    "requirements": {
      "catchSpecies": [
        {
          "species": "Onix",
          "count": 2
        },
        {
          "species": "Machop",
          "count": 4
        }
      ]
    }
  },
  {
    "areaId": "Route 8",
    "unlocks": [
      "Celadon Gym",
      "Casino"
    ],
    "requirements": {
      "catchSpecies": [
        {
          "species": "Kadabra",
          "count": 2
        }
      ],
      "catchByType": {
        "type": "Fire",
        "count": 10
      }
    }
  },
  {
    "areaId": "Celadon Gym",
    "unlocks": [
      "Route 7"
    ],
    "requirements": {
      "earnBadge": {
        "name": "Rainbow Badge",
        "leader": "Erika",
        "badgeCount": 4
      }
    }
  },
  {
    "areaId": "Route 7",
    "unlocks": [
      "Pokémon Tower"
    ],
    "requirements": {
      "defeatCountRoute": {
        "route": "Route 7",
        "count": 300
      }
    }
  },
  {
    "areaId": "Pokémon Tower",
    "unlocks": [
      "Route 12",
      "Small Fishing Spot"
    ],
    "requirements": {
      "catchSpecies": [
        {
          "species": "Haunter",
          "count": 2
        },
        {
          "species": "Cubone",
          "count": 1
        }
      ]
    }
  },
  {
    "areaId": "Route 12",
    "unlocks": [
      "Route 13",
      "Fighting Dojo"
    ],
    "requirements": {
      "catchSpecies": [
        {
          "species": "Farfetch'd",
          "count": 1
        }
      ]
    }
  },
  {
    "areaId": "Route 13",
    "unlocks": ["Route 14", "Route 15"],
    "requirements": {
      "catchSpecies": [
        {
          "species": "Victreebel",
          "count": 2
        },
        {
          "species": "Vileplume",
          "count": 2
        }
      ]
    }
  },
  {
    "areaId": "Route 14",
    "unlocks": [
      "Fuchsia Gym"
    ],
    "requirements": {
      "catchSpecies": [
        {
          "species": "Ditto",
          "count": 10
        }
      ]
    }
  },

  {
    "areaId": "Fuchsia Gym",
    "unlocks": [
      "Cycling Road"
    ],
    "requirements": {
      "earnBadge": {
        "name": "Soul Badge",
        "leader": "Koga",
        "badgeCount": 5
      }
    }
  },
  {
    "areaId": "Cycling Road",
    "unlocks": [
      "Safari Zone"
    ],
    "requirements": {
      "catchSpecies": [
        {
          "species": "Dodrio",
          "count": 2
        }
      ]
    }
  },
  {
    "areaId": "Safari Zone",
    "unlocks": [
      "Saffron Gym"
    ],
    "requirements": {
      "defeatCountRoute": {
        "route": "Safari Zone",
        "count": 1000
      }
    }
  },
  {
    "areaId": "Saffron Gym",
    "unlocks": [
      "Sea Routes"
    ],
    "requirements": {
      "earnBadge": {
        "name": "Marsh Badge",
        "leader": "Sabrina",
        "badgeCount": 6
      }
    }
  },
  {
    "areaId": "Sea Routes",
    "unlocks": [
      "Seafoam Islands"
    ],
    "requirements": {
      "defeatCountRoute": {
        "route": "Sea Routes",
        "count": 500
      }
    }
  },
  {
    "areaId": "Seafoam Islands",
    "unlocks": [
      "Pokémon Mansion",
      "Big Fishing Spot"
    ],
    "requirements": {
      "defeatSpecific": {
        "name": "Articuno",
        "count": 3
      }
    }
  },
  {
    "areaId": "Pokémon Mansion",
    "unlocks": [
      "Cinnabar Gym",
      "Fossil Revival Lab"
    ],
    "requirements": {
      "catchSpeciesByRarity": [
        {
          "species": "Magmar",
          "rarity": "Epic",
          "count": 1
        }
      ]
    }
  },
  {
    "areaId": "Cinnabar Gym",
    "unlocks": [
      "Power Plant",
      "Trade With Friends Hub"
    ],
    "requirements": {
      "earnBadge": {
        "name": "Volcano Badge",
        "leader": "Blaine",
        "badgeCount": 7
      }
    }
  },
  {
    "areaId": "Power Plant",
    "unlocks": [
      "Viridian Gym"
    ],
    "requirements": {
      "defeatSpecific": {
        "name": "Zapdos",
        "count": 3
      }
    }
  },
  {
    "areaId": "Viridian Gym",
    "unlocks": [
      "Route 22"
    ],
    "requirements": {
      "earnBadge": {
        "name": "Earth Badge",
        "leader": "Giovanni",
        "badgeCount": 8
      }
    }
  },
  {
    "areaId": "Route 22",
    "unlocks": [
      "Route 23"
    ],
    "requirements": {
      "defeatCountRoute": {
        "route": "Route 22",
        "count": 750
      }
    }
  },
  {
    "areaId": "Route 23",
    "unlocks": [
      "Victory Road"
    ],
    "requirements": {
      "catchSpeciesAnyOfByRarity": [
        {
          "species": [
            "Nidoking",
            "Nidoqueen"
          ],
          "rarity": "Epic",
          "count": 1
        }
      ]
    }
  },
  {
    "areaId": "Victory Road",
    "unlocks": [
      "Cerulean Cave"
    ],
    "requirements": {
      "defeatSpecific": {
        "name": "Moltres",
        "count": 3
      }
    }
  },
  {
    "areaId": "Cerulean Cave",
    "unlocks": [
      "Elite 4"
    ],
    "requirements": {
      "defeatSpecific": {
        "name": "Mewtwo",
        "count": 5
      }
    }
  },
  {
    "areaId": "Elite 4",
    "unlocks": [
      "Prestige / Region Reset"
    ],
    "requirements": {
      "defeatEliteFourAndChampion": true
    }
  }
];
