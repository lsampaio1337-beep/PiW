import json
import re

pokemon_data_raw = [
    ["", "Route 29", "Pidgey", "2 – 5", 0.25],
    ["", "Route 29", "Sentret", "2 – 5", 0.2],
    ["", "Route 29", "Rattata", "2 – 4", 0.25],
    ["", "Route 29", "Hoothoot", "3 – 5", 0.1],
    ["", "Route 29", "Hoppip", "3 – 5", 0.1],
    ["", "Route 30", "Caterpie", "3 – 6", 0.3],
    ["", "Route 30", "Weedle", "3 – 6", 0.3],
    ["", "Route 30", "Ledyba", "4 – 7", 0.2],
    ["", "Route 30", "Spinarak", "4 – 7", 0.2],
    ["", "Route 31", "Bellsprout", "5 – 8", 0.5],
    ["", "Route 31", "Metapod", "5 – 8", 0.25],
    ["", "Route 31", "Kakuna", "5 – 8", 0.25],
    ["", "Route 32", "Wooper", "6 – 10", 0.2],
    ["", "Route 32", "Zubat", "6 – 10", 0.3],
    ["", "Route 32", "Ekans", "7 – 11", 0.2],
    ["", "Route 32", "Hoppip", "7 – 10", 0.3],
    ["", "Tiny Fishing Spot", "Magikarp", "8 – 12", 0.25],
    ["", "Tiny Fishing Spot", "Goldeen", "8 – 12", 0.15],
    ["", "Tiny Fishing Spot", "Poliwag", "8 – 12", 0.15],
    ["", "Tiny Fishing Spot", "Krabby", "8 – 12", 0.15],
    ["", "Tiny Fishing Spot", "Tentacool", "8 – 12", 0.1],
    ["", "Tiny Fishing Spot", "Staryu", "8 – 12", 0.1],
    ["", "Tiny Fishing Spot", "Shellder", "9 – 13", 0.1],
    ["", "Ruins of Alph", "Unown", "10 – 14", 0.7],
    ["", "Ruins of Alph", "Natu", "11 – 15", 0.2],
    ["", "Ruins of Alph", "Smeargle", "11 – 15", 0.1],
    ["", "Route 33", "Geodude", "10 – 14", 0.2],
    ["", "Route 33", "Spearow", "10 – 14", 0.3],
    ["", "Route 33", "Mareep", "11 – 15", 0.2],
    ["", "Route 33", "Hoothoot", "10 – 14", 0.3],
    ["", "Ilex Forest", "Paras", "13 – 17", 0.3],
    ["", "Ilex Forest", "Caterpie", "12 – 16", 0.2],
    ["", "Ilex Forest", "Weedle", "12 – 16", 0.2],
    ["", "Ilex Forest", "Metapod", "13 – 17", 0.15],
    ["", "Ilex Forest", "Kakuna", "13 – 17", 0.15],
    ["", "Route 34", "Drowzee", "15 – 19", 0.2],
    ["", "Route 34", "Snubbull", "15 – 19", 0.35],
    ["", "Route 34", "Jigglypuff", "14 – 18", 0.35],
    ["", "Route 34", "Ditto", "15 – 20", 0.1],
    ["", "Route 35", "Yanma", "20 – 25", 0.35],
    ["", "Route 35", "Growlithe", "20 – 25", 0.25],
    ["", "Route 35", "Nidoran♀", "19 – 24", 0.2],
    ["", "Route 35", "Nidoran♂", "19 – 24", 0.2],
    ["", "National Park", "Sunkern", "22 – 27", 0.3],
    ["", "National Park", "Caterpie", "20 – 25", 0.2],
    ["", "National Park", "Weedle", "20 – 25", 0.2],
    ["", "National Park", "Scyther", "24 – 28", 0.15],
    ["", "National Park", "Pinsir", "24 – 28", 0.15],
    ["", "Route 36", "Stantler", "24 – 29", 0.3],
    ["", "Route 36", "Vulpix", "24 – 29", 0.25],
    ["", "Route 36", "Growlithe", "24 – 29", 0.25],
    ["", "Route 36", "Gastly", "23 – 28", 0.1],
    ["", "Route 36", "Sudowoodo", "26 – 30", 0.1],
    ["", "Route 37", "Pidgeotto", "26 – 31", 0.3],
    ["", "Route 37", "Noctowl", "26 – 31", 0.3],
    ["", "Route 37", "Ledian", "27 – 32", 0.2],
    ["", "Route 37", "Ariados", "27 – 32", 0.2],
    ["", "Burned Tower", "Koffing", "28 – 33", 0.25],
    ["", "Burned Tower", "Zubat", "27 – 32", 0.25],
    ["", "Burned Tower", "Krabby", "27 – 32", 0.15],
    ["", "Burned Tower", "Shuckle", "28 – 33", 0.15],
    ["", "Burned Tower", "Weezing", "32 – 36", 0.1],
    ["", "Burned Tower", "Magmar", "32 – 37", 0.1],
    ["", "Route 38", "Raticate", "31 – 36", 0.3],
    ["", "Route 38", "Pidgeotto", "31 – 36", 0.25],
    ["", "Route 38", "Snubbull", "30 – 35", 0.15],
    ["", "Route 38", "Exeggcute", "31 – 36", 0.2],
    ["", "Route 38", "Tauros", "32 – 37", 0.1],
    ["", "Route 39", "Meowth", "33 – 38", 0.25],
    ["", "Route 39", "Magnemite", "34 – 39", 0.25],
    ["", "Route 39", "Miltank", "34 – 39", 0.15],
    ["", "Route 39", "Farfetch'd", "33 – 38", 0.15],
    ["", "Route 39", "Butterfree", "35 – 40", 0.1],
    ["", "Route 39", "Beedrill", "35 – 40", 0.1],
    ["", "Small Fishing Spot", "Psyduck", "36 – 41", 0.2],
    ["", "Small Fishing Spot", "Marill", "36 – 41", 0.15],
    ["", "Small Fishing Spot", "Chinchou", "36 – 41", 0.15],
    ["", "Small Fishing Spot", "Remoraid", "36 – 41", 0.15],
    ["", "Small Fishing Spot", "Corsola", "36 – 41", 0.15],
    ["", "Small Fishing Spot", "Qwilfish", "37 – 42", 0.1],
    ["", "Small Fishing Spot", "Dratini", "37 – 42", 0.1],
    ["", "Route 47", "Mankey", "38 – 43", 0.25],
    ["", "Route 47", "Fearow", "38 – 43", 0.25],
    ["", "Route 47", "Mareep", "38 – 43", 0.15],
    ["", "Route 47", "Flaaffy", "38 – 43", 0.15],
    ["", "Route 47", "Arbok", "38 – 43", 0.1],
    ["", "Route 47", "Golbat", "38 – 43", 0.1],
    ["", "Mount Mortar", "Geodude", "40 – 45", 0.2],
    ["", "Mount Mortar", "Machop", "40 – 45", 0.2],
    ["", "Mount Mortar", "Graveler", "42 – 47", 0.15],
    ["", "Mount Mortar", "Machoke", "42 – 47", 0.15],
    ["", "Mount Mortar", "Onix", "42 – 47", 0.1],
    ["", "Mount Mortar", "Tyrogue", "42 – 47", 0.1],
    ["", "Mount Mortar", "Misdreavus", "43 – 48", 0.1],
    ["", "Standard Fishing Spot", "Seaking", "48 – 54", 0.35],
    ["", "Standard Fishing Spot", "Kingler", "48 – 54", 0.3],
    ["", "Standard Fishing Spot", "Poliwhirl", "49 – 55", 0.25],
    ["", "Standard Fishing Spot", "Lanturn", "50 – 56", 0.1],
    ["", "Ice Path", "Swinub", "52 – 57", 0.25],
    ["", "Ice Path", "Zubat", "50 – 55", 0.25],
    ["", "Ice Path", "Delibird", "52 – 57", 0.15],
    ["", "Ice Path", "Golbat", "54 – 59", 0.15],
    ["", "Ice Path", "Sneasel", "53 – 58", 0.1],
    ["", "Ice Path", "Jynx", "54 – 60", 0.1],
    ["", "Route 45", "Graveler", "58 – 64", 0.25],
    ["", "Route 45", "Gligar", "58 – 64", 0.25],
    ["", "Route 45", "Phanpy", "57 – 63", 0.2],
    ["", "Route 45", "Pineco", "58 – 64", 0.3],
    ["", "Big Fishing Spot", "Golduck", "62 – 68", 0.3],
    ["", "Big Fishing Spot", "Tentacruel", "63 – 69", 0.25],
    ["", "Big Fishing Spot", "Quagsire", "62 – 68", 0.2],
    ["", "Big Fishing Spot", "Gyarados", "64 – 70", 0.1],
    ["", "Big Fishing Spot", "Mantine", "64 – 70", 0.1],
    ["", "Big Fishing Spot", "Dragonair", "65 – 71", 0.05],
    ["", "Dark Cave", "Graveler", "64 – 70", 0.25],
    ["", "Dark Cave", "Teddiursa", "63 – 69", 0.15],
    ["", "Dark Cave", "Shuckle", "64 – 70", 0.15],
    ["", "Dark Cave", "Ursaring", "68 – 74", 0.1],
    ["", "Dark Cave", "Wobbuffet", "65 – 71", 0.1],
    ["", "Dark Cave", "Dunsparce", "64 – 70", 0.25],
    ["", "Route 46", "Donphan", "68 – 74", 0.4],
    ["", "Route 46", "Teddiursa", "66 – 72", 0.35],
    ["", "Route 46", "Skarmory", "70 – 76", 0.25],
    ["Sidequest", "Goldenrod Game Corner", "Abra", "18 – 22", 0.25],
    ["Sidequest", "Goldenrod Game Corner", "Sandshrew", "18 – 22", 0.25],
    ["Sidequest", "Goldenrod Game Corner", "Machop", "18 – 22", 0.2],
    ["Sidequest", "Goldenrod Game Corner", "Cubone", "18 – 22", 0.15],
    ["Sidequest", "Goldenrod Game Corner", "Eevee", "20 – 24", 0.15],
    ["Sidequest", "Team Rocket HQ", "Voltorb", "33 – 38", 0.35],
    ["Sidequest", "Team Rocket HQ", "Geodude", "32 – 37", 0.25],
    ["Sidequest", "Team Rocket HQ", "Koffing", "33 – 38", 0.25],
    ["Sidequest", "Team Rocket HQ", "Electrode", "36 – 40", 0.15],
    ["Sidequest", "Lake of Rage", "Magikarp", "48 – 55", 0.95],
    ["Sidequest", "Lake of Rage", "Gyarados", "55 – 60", 0.05],
    ["Sidequest", "Mount Silver", "Donphan", "74 – 80", 0.25],
    ["Sidequest", "Mount Silver", "Quagsire", "74 – 80", 0.2],
    ["Sidequest", "Mount Silver", "Doduo", "73 – 79", 0.2],
    ["Sidequest", "Mount Silver", "Ponyta", "74 – 80", 0.15],
    ["Sidequest", "Mount Silver", "Parasect", "75 – 81", 0.1],
    ["Sidequest", "Mount Silver", "Larvitar", "75 – 82", 0.1],
    ["Sidequest", "Ilex Forest 2", "Butterfree", "80 – 86", 0.35],
    ["Sidequest", "Ilex Forest 2", "Beedrill", "80 – 86", 0.35],
    ["Sidequest", "Ilex Forest 2", "Parasect", "82 – 88", 0.25],
    ["Sidequest", "Ilex Forest 2", "Celebi", 90, 0.05],
    ["Sidequest", "Roaming", "Raikou", 50, 0.3333333333333333],
    ["Sidequest", "Roaming", "Entei", 50, 0.3333333333333333],
    ["Sidequest", "Roaming", "Suicune", 50, 0.3333333333333333],
    ["", "Viridian Forest", "Oddish", "72 – 76", 0.25],
    ["", "Viridian Forest", "Gloom", "72 – 76", 0.25],
    ["", "Viridian Forest", "Butterfree", "74 – 78", 0.15],
    ["", "Viridian Forest", "Beedrill", "74 – 78", 0.15],
    ["", "Viridian Forest", "Vileplume", "75 – 78", 0.1],
    ["", "Viridian Forest", "Bellossom", "75 – 78", 0.1],
    ["", "Mount Moon", "Geodude", "76 – 80", 0.25],
    ["", "Mount Moon", "Golbat", "76 – 81", 0.25],
    ["", "Mount Moon", "Graveler", "78 – 82", 0.2],
    ["", "Mount Moon", "Onix", "77 – 81", 0.15],
    ["", "Mount Moon", "Crobat", "78 – 82", 0.15],
    ["", "Rock Tunnel", "Golbat", "79 – 83", 0.3],
    ["", "Rock Tunnel", "Golem", "81 – 85", 0.25],
    ["", "Rock Tunnel", "Steelix", "81 – 85", 0.25],
    ["", "Rock Tunnel", "Crobat", "81 – 85", 0.2],
    ["", "Route 8", "Slowpoke", "82 – 86", 0.4],
    ["", "Route 8", "Kadabra", "83 – 87", 0.3],
    ["", "Route 8", "Mr. Mime", "83 – 87", 0.3],
    ["", "Route 12", "Grimer", "84 – 88", 0.25],
    ["", "Route 12", "Horsea", "84 – 88", 0.25],
    ["", "Route 12", "Hypno", "85 – 89", 0.2],
    ["", "Route 12", "Seadra", "86 – 89", 0.15],
    ["", "Route 12", "Slowking", "86 – 89", 0.1],
    ["", "Route 12", "Snorlax", "88 – 89", 0.05],
    ["", "Safari Zone", "Nidorino", "86 – 90", 0.15],
    ["", "Safari Zone", "Nidorina", "86 – 90", 0.15],
    ["", "Safari Zone", "Rhyhorn", "87 – 90", 0.15],
    ["", "Safari Zone", "Kangaskhan", "87 – 91", 0.15],
    ["", "Safari Zone", "Murkrow", "87 – 90", 0.1],
    ["", "Safari Zone", "Tauros", "88 – 91", 0.1],
    ["", "Safari Zone", "Chansey", "88 – 91", 0.1],
    ["", "Safari Zone", "Scizor", "89 – 91", 0.1],
    ["", "Cycling Road", "Doduo", "88 – 92", 0.25],
    ["", "Cycling Road", "Fearow", "88 – 92", 0.25],
    ["", "Cycling Road", "Dodrio", "90 – 93", 0.2],
    ["", "Cycling Road", "Pidgeot", "90 – 93", 0.2],
    ["", "Cycling Road", "Snorlax", "92 – 93", 0.1],
    ["", "Sea Routes", "Seel", "90 – 94", 0.25],
    ["", "Sea Routes", "Seaking", "90 – 94", 0.25],
    ["", "Sea Routes", "Dewgong", "91 – 94", 0.15],
    ["", "Sea Routes", "Tentacruel", "91 – 94", 0.15],
    ["", "Sea Routes", "Starmie", "92 – 94", 0.1],
    ["", "Sea Routes", "Kingdra", "92 – 94", 0.1],
    ["", "Fossil Revival", "Omanyte", "91 – 93", 0.3],
    ["", "Fossil Revival", "Kabuto", "91 – 93", 0.3],
    ["", "Fossil Revival", "Aerodactyl", "94 – 95", 0.1],
    ["", "Fossil Revival", "Omastar", "92 – 94", 0.15],
    ["", "Fossil Revival", "Kabutops", "92 – 94", 0.15],
    ["", "Pokémon Mansion", "Koffing", "91 – 95", 0.2],
    ["", "Pokémon Mansion", "Slugma", "91 – 95", 0.2],
    ["", "Pokémon Mansion", "Houndour", "91 – 95", 0.2],
    ["", "Pokémon Mansion", "Magmar", "92 – 95", 0.15],
    ["", "Pokémon Mansion", "Weezing", "93 – 95", 0.15],
    ["", "Pokémon Mansion", "Magcargo", "93 – 95", 0.05],
    ["", "Pokémon Mansion", "Houndoom", "93 – 95", 0.05],
    ["Sidequest", "Casino Starter Trupe", "Bulbasaur", "80 – 85", "16.67%"],
    ["Sidequest", "Casino Starter Trupe", "Charmander", "80 – 85", "16.67%"],
    ["Sidequest", "Casino Starter Trupe", "Squirtle", "80 – 85", "16.67%"],
    ["Sidequest", "Casino Starter Trupe", "Chikorita", "80 – 85", "16.67%"],
    ["Sidequest", "Casino Starter Trupe", "Cyndaquil", "80 – 85", "16.67%"],
    ["Sidequest", "Casino Starter Trupe", "Totodile", "80 – 85", "16.67%"],
    ["Sidequest", "Casino Babies", "Pichu", "84 – 89", 0.15],
    ["Sidequest", "Casino Babies", "Cleffa", "84 – 89", 0.15],
    ["Sidequest", "Casino Babies", "Igglybuff", "84 – 89", 0.15],
    ["Sidequest", "Casino Babies", "Togepi", "84 – 89", 0.15],
    ["Sidequest", "Casino Babies", "Elekid", "84 – 89", 0.1],
    ["Sidequest", "Casino Babies", "Magby", "84 – 89", 0.1],
    ["Sidequest", "Casino Babies", "Smoochum", "84 – 89", 0.1],
    ["Sidequest", "Casino Babies", "Blissey", "84 – 89", 0.1],
    ["Sidequest", "Casino Special Spot", "Lickitung", "84 – 89", 0.3],
    ["Sidequest", "Casino Special Spot", "Porygon", "84 – 89", 0.3],
    ["Sidequest", "Casino Special Spot", "Lapras", "84 – 89", 0.3],
    ["Sidequest", "Casino Special Spot", "Porygon2", "85 – 90", 0.1],
    ["Sidequest", "Casino Eeveelution", "Eevee", "85 – 90", 0.2],
    ["Sidequest", "Casino Eeveelution", "Vaporeon", "86 – 91", 0.1],
    ["Sidequest", "Casino Eeveelution", "Jolteon", "86 – 91", 0.1],
    ["Sidequest", "Casino Eeveelution", "Flareon", "86 – 91", 0.1],
    ["Sidequest", "Casino Eeveelution", "Espeon", "86 – 91", 0.1],
    ["Sidequest", "Casino Eeveelution", "Umbreon", "86 – 91", 0.1],
    ["Sidequest", "Casino Eeveelution", "Leafeon", "86 – 91", 0.1],
    ["Sidequest", "Casino Eeveelution", "Glaceon", "86 – 91", 0.1],
    ["Sidequest", "Casino Eeveelution", "Sylveon", "86 – 91", 0.1],
    ["Sidequest", "Dojo", "Tyrogue", "88 – 92", 0.4],
    ["Sidequest", "Dojo", "Hitmonlee", "89 – 93", 0.2],
    ["Sidequest", "Dojo", "Hitmonchan", "89 – 93", 0.2],
    ["Sidequest", "Dojo", "Hitmontop", "89 – 93", 0.2],
    ["Sidequest", "Casino Late Trupe", "Venusaur", "90 – 94", 0.17],
    ["Sidequest", "Casino Late Trupe", "Charizard", "90 – 94", 0.17],
    ["Sidequest", "Casino Late Trupe", "Blastoise", "90 – 94", 0.17],
    ["Sidequest", "Casino Late Trupe", "Meganium", "90 – 94", 0.17],
    ["Sidequest", "Casino Late Trupe", "Typhlosion", "90 – 94", 0.17],
    ["Sidequest", "Casino Late Trupe", "Feraligatr", "90 – 94", 0.17],
    ["Sidequest", "Legendaries Nest", "Articuno", 95, 0.2],
    ["Sidequest", "Legendaries Nest", "Zapdos", 95, 0.2],
    ["Sidequest", "Legendaries Nest", "Moltres", 95, 0.2],
    ["Sidequest", "Legendaries Nest", "Ho-Oh", 96, 0.2],
    ["Sidequest", "Legendaries Nest", "Lugia", 96, 0.2],
    ["Sidequest", "Mythical and Legendaries Spot", "Raikou", 97, 0.2],
    ["Sidequest", "Mythical and Legendaries Spot", "Entei", 97, 0.2],
    ["Sidequest", "Mythical and Legendaries Spot", "Suicune", 97, 0.2],
    ["Sidequest", "Mythical and Legendaries Spot", "Mew", 98, 0.13333333333333333],
    ["Sidequest", "Mythical and Legendaries Spot", "Mewtwo", 98, 0.13333333333333333],
    ["Sidequest", "Mythical and Legendaries Spot", "Celebi", 99, 0.13333333333333333]
]
challenges_data_raw = [
    ["Challenge 1", "Route 29", "Defeat 25 Pokémon on Route 29", "Route 30"],
    ["Challenge 2", "Route 30", "Catch 1 Ledyba and Catch 1 Spinarak", "Route 31"],
    ["Challenge 3", "Route 31", "Defeat 10 Bellsprout", "Violet Gym"],
    ["Challenge 4", "Violet Gym", "Earn Zephyr Badge (Badge 1)", "Route 32"],
    ["Challenge 5", "Route 32", "Catch 1 Rare+ Pokémon from Route 32", "Tiny Fishing Spot + 5 Ultraball"],
    ["Challenge 6", "Tiny Fishing Spot", "Catch 5 Water-type Pokémon", "Route 33"],
    ["Challenge 7", "Route 33", "Catch 2 Mareep", "Ruins of Alph"],
    ["Challenge 8", "Ruins of Alph", "Defeat 20 Unown", "Azalea Gym + Water Stones"],
    ["Challenge 9", "Azalea Gym", "Earn Hive Badge (Badge 2)", "Ilex Forest"],
    ["Challenge 10", "Ilex Forest", "Catch 1 Rare+ Paras", "Route 34 + 5 Greatball"],
    ["Challenge 11", "Route 34", "Catch 2 Ditto", "Goldenrod Gym + Goldenrod Game Corner"],
    ["Challenge 12", "Goldenrod Gym", "Earn Plain Badge (Badge 3)", "Route 35 + Extra Challenge (Roaming)"],
    ["Challenge 13", "Route 35", "Catch 1 Nidoran♀ and 1 Nidoran♂", "Small Fishing Spot"],
    ["Challenge 14", "Small Fishing Spot", "Catch 2 Dratini", "National Park + 2 Dragon Stones"],
    ["Challenge 15", "National Park", "Defeat 4 Scyther and Defeat 4 Pinsir", "Route 36 + 2 Bug Stones"],
    ["Challenge 16", "Route 36", "Defeat 5 Sudowoodo", "Route 37"],
    ["Challenge 17", "Route 37", "Catch 1 Ledian and Catch 1 Ariados", "Burned Tower"],
    ["Challenge 18", "Burned Tower", "Defeat 3 Magmar", "Ecruteak Gym + 2 Fire Stones"],
    ["Challenge 19", "Ecruteak Gym", "Earn Fog Badge (Badge 4)", "Route 38"],
    ["Challenge 20", "Route 38", "Catch 1 Tauros", "Route 39 + Normal Stone"],
    ["Challenge 21", "Route 39", "Catch 1 Farfetch'd", "Cianwood Gym"],
    ["Challenge 22", "Cianwood Gym", "Earn Storm Badge (Badge 5)", "Route 47"],
    ["Challenge 23", "Route 47", "Defeat 50 pokemons on Route 47", "Safari Zone"],
    ["Challenge 24", "Safari Zone", "Capture 1 Nidorino and Capture 1 Nidorina", "Mount Mortar + Fighting Stone"],
    ["Challenge 25", "Mount Mortar", "Catch 1 Ghost-type Pokémon", "Olivine Gym + Ghost Stone"],
    ["Challenge 26", "Olivine Gym", "Earn Mineral Badge (Badge 6)", "Standard Fishing Spot"],
    ["Challenge 27", "Standard Fishing Spot", "Catch 1 Lanturn", "Ice Path"],
    ["Challenge 28", "Ice Path", "Defeat 2 Jynx", "Mahogany Gym + 2 Ice Stones"],
    ["Challenge 29", "Mahogany Gym", "Earn Glacier Badge (Badge 7)", "Route 45"],
    ["Challenge 30", "Route 45", "Catch 1 Weak Pineco", "Blackthorn Gym + 10 Ultraball"],
    ["Challenge 31", "Blackthorn Gym", "Earn Rising Badge (Badge 8)", "Big Fishing Spot"],
    ["Challenge 32", "Big Fishing Spot", "Catch 1 Mantine", "Dark Cave"],
    ["Challenge 33", "Dark Cave", "Defeat 20 Dunsparce", "Route 46"],
    ["Challenge 34", "Route 46", "Defeat 10 Skarmory", "Pokemon League + Steel Stone"],
    ["Johto Final Challenge", "Pokemon League", "Defeat all Pokemon League and Defeat Champion", "Viridian Forest + 2 Masterball"],
    ["Challenge 35", "Viridian Forest", "Capture 2 Bellossom", "Pewter Gym + Fossil Revival"],
    ["Challenge 36", "Pewter Gym", "Badge 9", "Mount Moon + Badge 9"],
    ["Challenge 37", "Mount Moon", "Capture 1 Crobat", "Cerulean Gym + Rock Tunnel"],
    ["Challenge 38", "Cerulean Gym", "Badge 10", "Vermilion Gym + Badge 10"],
    ["Challenge 39", "Vermilion Gym", "Badge 11", "Route 8 + Badge 11"],
    ["Challenge 40", "Route 8", "Defeat 20 Slowpoke", "Celadon Gym  + Casino Starter Trupe"],
    ["Challenge 41", "Celadon Gym", "Badge 12", "Saffron Gym + Badge 12"],
    ["Challenge 42", "Saffron Gym", "Badge 13", "Route 12 + Badge 13"],
    ["Challenge 43", "Route 12", "Capture 1 Snorlax", "Fuschia Gym + Safari Zone"],
    ["Challenge 44", "Fuschia Gym", "Badge 14", "Cycling Road + Sea Routes + Badge 14"],
    ["Challenge 45", "Sea Routes", "Defeat 100 pokemons on Sea Routes", "Cinnabar Gym + Pokemansion"],
    ["Challenge 46", "Cinnabar Gym", "Badge 15", "Viridian Gym + Trade With Friends Hub + Badge 15"],
    ["Challenge 47", "Viridian Gym", "Badge 16", "Red + Badge 16 + 1 Masterball"],
    ["Final Challenge", "Red", "Defeat Red", "Travel to a new Region"],
    ["Johto Extra Challenge 1", "Goldenrod Game Corner", "Defeat 8 Eevee", "Team Rocket HQ + 1 Masterball"],
    ["Johto Extra Challenge 2", "Team Rocket HQ", "Defeat 10 Voltorb", "Lake of Rage + 1 Masterball"],
    ["Johto Extra Challenge 3", "Lake of Rage", "Catch 1 Red Gyarados", "Mount Silver + 1 Masterball"],
    ["Johto Extra Challenge 4", "Mount Silver", "Catch 5 Larvitar", "Ilex Forest 2 + 1 Masterball + 2 Dark Stones"],
    ["Johto Extra Challenge 5", "Ilex Forest 2", "Catch 1 Celebi", "Mythical and Legendaries Spot + 2 Masterball"],
    ["Extra Challenge (Roaming)", "Roaming", "Defeat 1 Raikou, Defeat 1 Entei, Defeat 1 Suicune", "Mythical and Legendaries Spot + 1 Masterball"],
    ["Kanto Extra Challenge 1", "Casino Starter Trupe", "Capture all 6 starters", "Casino Babies + 1 Grass Stone + 1 Fire Stone + 1 Water Stone"],
    ["Kanto Extra Challenge 2", "Casino Babies", "Evolve Pikachu into Raichu", "Casino Special Spot + 1 Masterball"],
    ["Kanto Extra Challenge 3", "Casino Special Spot", "Evolve Porygon into Porygon2", "Casino Eeveelution + Dojo + 1 Masterball"],
    ["Kanto Extra Challenge 4", "Dojo", "Capture 1 Hitmonlee Capture 1 Hitmonchan Capture 1 Hitmontop", "Casino Late Trupe + 2 Fighting Stones"],
    ["Kanto Extra Challenge 5", "Casino Late Trupe", "Catch 1 Venusaur Catch 1 Charizard Catch 1 Blastoise", "Legendaries Nest + 2 Grass Stones + 2 Fire Stones + 2 Water Stones + 1 Masterball"],
    ["Kanto Extra Challenge 6", "Legendaries Nest", "Get 1 Articuno Get 1 Zapdos Get 1 Moltres", "Mythical and Legendaries Spot + 2 Masterball"]
]

# Load pokemon data
with open('data/pokemon.json') as f:
    pokemon_json = json.load(f)

pokemon_name_to_id = {p['name']: p['id'] for p in pokemon_json}

routes_dict = {}
for entry in pokemon_data_raw:
    side, area, pkmn, lvl, rate = entry
    # Normalize rate
    if isinstance(rate, str) and rate.endswith('%'):
        rate = float(rate[:-1]) / 100

    if area not in routes_dict:
        routes_dict[area] = []

    # parse level
    if isinstance(lvl, (int, float)):
        min_lvl = int(lvl)
        max_lvl = int(lvl)
    else:
        parts = str(lvl).replace(' ', '').split('–')
        if len(parts) == 2:
            min_lvl = int(parts[0])
            max_lvl = int(parts[1])
        else:
            min_lvl = int(parts[0])
            max_lvl = int(parts[0])

    # Lookup Pokemon ID
    # Handle typos
    pkmn_lookup = pkmn
    if pkmn == "Gravler": pkmn_lookup = "Graveler"
    if pkmn == "Ho-Oh": pkmn_lookup = "Ho-oh"
    if pkmn == "Casino Special Spot": pkmn_lookup = "Casino Special Spot"

    pkmn_id = pokemon_name_to_id.get(pkmn_lookup)
    if not pkmn_id:
        print(f"Warning: pokemon {pkmn_lookup} not found")
        continue

    routes_dict[area].append({
        "pokemonId": pkmn_id,
        "minLevel": min_lvl,
        "maxLevel": max_lvl,
        "chance": float(rate)
    })

routes = [{"name": name, "spawns": spawns} for name, spawns in routes_dict.items()]

# Add an empty "Spot" route that map.js looks for in some cases (e.g. initial setup)
if "Spot" not in routes_dict:
     routes.insert(0, {"name": "Spot", "spawns": []})

def parse_gift(gift_str):
    if not gift_str: return None
    gifts = gift_str.split('+')
    gifts = [g.strip() for g in gifts if g.strip()]
    if not gifts: return None
    parsed_gifts = []
    for g in gifts:
        match = re.match(r'^(\d+)\s+(.+)$', g)
        if match:
            count = int(match.group(1))
            item = match.group(2)
            if item.endswith('s') and item not in ['Stones', 'Water Stones', 'Fire Stones', 'Leaf Stones']: # handle plurals loosely
                item = item[:-1]
            if "Stones" in item:
                 item = item.replace("Stones", "Stone")
            parsed_gifts.append({"item": item, "count": count})
        else:
            item = g
            if "Stones" in item:
                item = item.replace("Stones", "Stone")
            parsed_gifts.append({"item": item, "count": 1})

    return parsed_gifts if parsed_gifts else None

leader_mapping = {
        "Zephyr Badge": "Falkner",
        "Hive Badge": "Bugsy",
        "Plain Badge": "Whitney",
        "Fog Badge": "Morty",
        "Storm Badge": "Chuck",
        "Mineral Badge": "Jasmine",
        "Glacier Badge": "Pryce",
        "Rising Badge": "Clair",
        "Badge 9": "Brock",
        "Badge 10": "Misty",
        "Badge 11": "Lt. Surge",
        "Badge 12": "Erika",
        "Badge 13": "Sabrina",
        "Badge 14": "Koga",
        "Badge 15": "Blaine",
        "Badge 16": "Giovanni"
}

def parse_requirements(req_str, area_id):
    reqs = {}
    if "Defeat" in req_str and "Pokémon on" in req_str:
        match = re.search(r'Defeat (\d+) Pokémon', req_str)
        if match:
            reqs["defeatCountRoute"] = {"route": area_id, "count": int(match.group(1))}
    elif "Defeat" in req_str and "pokemons on" in req_str:
        match = re.search(r'Defeat (\d+) pokemons', req_str)
        if match:
            reqs["defeatCountRoute"] = {"route": area_id, "count": int(match.group(1))}
    elif "Earn" in req_str and "Badge" in req_str:
        match = re.search(r'Earn (.+? Badge) \(Badge (\d+)\)', req_str)
        if match:
            reqs["earnBadge"] = {"name": match.group(1), "leader": leader_mapping.get(match.group(1), "Unknown"), "badgeCount": int(match.group(2))}
    elif "Badge" in req_str and "Earn" not in req_str and len(req_str.split()) <= 2:
        match = re.search(r'Badge (\d+)', req_str)
        if match:
             reqs["earnBadge"] = {"name": f"Badge {match.group(1)}", "leader": leader_mapping.get(f"Badge {match.group(1)}", "Unknown"), "badgeCount": int(match.group(1))}
    elif "Defeat all Pokemon League" in req_str:
        reqs["defeatEliteFourAndChampion"] = True
    elif req_str == "Defeat Red":
        reqs["defeatRed"] = True
    elif "Catch 1 Weak Pineco" in req_str:
        reqs["catchSpeciesByQuality"] = [{"species": "Pineco", "quality": "Weak", "count": 1}]
    elif "Evolve" in req_str:
        match = re.search(r'Evolve (.+?) into (.+)', req_str)
        if match:
             reqs["catchSpecies"] = [{"species": match.group(2).strip(), "count": 1}]
    else:
        catch_species = []
        defeat_specific = []
        catch_rare = []

        # We need to split by "and" or "," but first fix specific edge cases
        # Specific replacement for starters
        req_str_fixed = req_str.replace("Capture all 6 starters", "Catch 1 Bulbasaur, Catch 1 Charmander, Catch 1 Squirtle, Catch 1 Chikorita, Catch 1 Cyndaquil, Catch 1 Totodile")

        # Replace " and " with ", "
        req_str_fixed = req_str_fixed.replace(" and ", ", ")

        # Insert a comma before action verbs if missing, avoiding double commas
        req_str_fixed = re.sub(r'(?<!^)(?<!,\s)(?<!,)\s*\b(Catch|Capture|Get|Defeat)\b', r', \1', req_str_fixed)

        parts = [p.strip() for p in req_str_fixed.split(",")]
        current_verb = "Catch" # Default fallback

        for part in parts:
            if not part:
                continue

            # Match Verb (optional), Count, Subject
            match = re.match(r'^(?:(Catch|Capture|Get|Defeat)\s+)?(\d+)\s+(.+)$', part, re.IGNORECASE)
            if match:
                verb = match.group(1)
                if verb:
                    current_verb = verb.capitalize()

                count = int(match.group(2))
                spec = match.group(3).strip()

                if current_verb in ["Catch", "Capture", "Get"]:
                    if spec == "Water-type Pokémon":
                        reqs["catchByType"] = {"type": "Water", "count": count}
                    elif spec == "Ghost-type Pokémon":
                        reqs["catchByType"] = {"type": "Ghost", "count": count}
                    elif "Rare+" in spec:
                        clean_spec = spec.replace("Rare+ Pokémon from Route 32", "Any").replace("Rare+ ", "").strip()
                        if clean_spec == "Any":
                            reqs["catchByQuality"] = {"quality": "Rare", "count": count}
                        else:
                            catch_rare.append({"species": clean_spec, "quality": "Rare", "count": count})
                    elif "Red Gyarados" in spec:
                         catch_species.append({"species": "Gyarados", "count": count})
                    elif spec == "all 6 starters":
                        for s in ["Bulbasaur", "Charmander", "Squirtle", "Chikorita", "Cyndaquil", "Totodile"]:
                            catch_species.append({"species": s, "count": 1})
                    else:
                        catch_species.append({"species": spec, "count": count})
                elif current_verb == "Defeat":
                    defeat_specific.append({"name": spec, "count": count})

        if catch_species:
            reqs["catchSpecies"] = catch_species
        if defeat_specific:
            if len(defeat_specific) == 1:
                reqs["defeatSpecific"] = defeat_specific[0]
            else:
                 reqs["defeatMultipleSpecific"] = defeat_specific
        if catch_rare:
            reqs["catchSpeciesByQuality"] = catch_rare

    return reqs

unlocks = []
for entry in challenges_data_raw:
    name, area, req_str, unlocks_str = entry

    unlocks_list = []
    gifts = []

    parts = unlocks_str.split('+')
    for i, p in enumerate(parts):
        p = p.strip()
        if "Stone" in p or "ball" in p or "Masterball" in p:
             if "Stone" in p or "ball" in p or "Masterball" in p:
                  gifts.append(p)
             else:
                  unlocks_list.append(p)
        elif "Badge" in p and "Badge 9" not in unlocks_str and "Badge 10" not in unlocks_str and "Badge 11" not in unlocks_str and "Badge 12" not in unlocks_str and "Badge 13" not in unlocks_str and "Badge 14" not in unlocks_str and "Badge 15" not in unlocks_str and "Badge 16" not in unlocks_str:
             pass
        else:
             if not p.startswith("Badge"):
                  unlocks_list.append(p)

    gift_obj = parse_gift(" + ".join(gifts))
    reqs_obj = parse_requirements(req_str, area)

    unlock = {
        "challengeName": name,
        "areaId": area,
        "unlocks": unlocks_list,
        "requirements": reqs_obj
    }
    if gift_obj:
        unlock["gifts"] = gift_obj

    unlocks.append(unlock)

with open('config/johtoRoutes.js', 'w') as f:
    f.write(f"export const johtoRoutes = {json.dumps(routes, indent=2)};\n\n")
    f.write(f"export const johtoUnlocks = {json.dumps(unlocks, indent=2)};\n")
