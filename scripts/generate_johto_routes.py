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
    ["", "Route 42", "Mankey", "38 – 43", 0.25],
    ["", "Route 42", "Fearow", "38 – 43", 0.25],
    ["", "Route 42", "Mareep", "38 – 43", 0.15],
    ["", "Route 42", "Flaaffy", "38 – 43", 0.15],
    ["", "Route 42", "Arbok", "38 – 43", 0.1],
    ["", "Route 42", "Golbat", "38 – 43", 0.1],
    ["", "Mt. Mortar", "Geodude", "40 – 45", 0.2],
    ["", "Mt. Mortar", "Machop", "40 – 45", 0.2],
    ["", "Mt. Mortar", "Graveler", "42 – 47", 0.15],
    ["", "Mt. Mortar", "Machoke", "42 – 47", 0.15],
    ["", "Mt. Mortar", "Onix", "42 – 47", 0.1],
    ["", "Mt. Mortar", "Tyrogue", "42 – 47", 0.1],
    ["", "Mt. Mortar", "Misdreavus", "43 – 48", 0.1],
    ["", "Route 43", "Furret", "43 – 48", 0.3],
    ["", "Route 43", "Venonat", "43 – 48", 0.25],
    ["", "Route 43", "Aipom", "43 – 48", 0.2],
    ["", "Route 43", "Venomoth", "43 – 48", 0.15],
    ["", "Route 43", "Girafarig", "45 – 50", 0.1],
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
    ["", "Route 44", "Weepinbell", "55 – 61", 0.35],
    ["", "Route 44", "Tangela", "55 – 61", 0.3],
    ["", "Route 44", "Lickitung", "56 – 62", 0.2],
    ["", "Route 44", "Heracross", "57 – 63", 0.15],
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
    ["Sidequest", "Mt. Silver", "Donphan", "74 – 80", 0.25],
    ["Sidequest", "Mt. Silver", "Quagsire", "74 – 80", 0.2],
    ["Sidequest", "Mt. Silver", "Doduo", "73 – 79", 0.2],
    ["Sidequest", "Mt. Silver", "Ponyta", "74 – 80", 0.15],
    ["Sidequest", "Mt. Silver", "Parasect", "75 – 81", 0.1],
    ["Sidequest", "Mt. Silver", "Larvitar", "75 – 82", 0.1],
    ["Sidequest", "Ilex Forest 2", "Butterfree", "80 – 86", 0.35],
    ["Sidequest", "Ilex Forest 2", "Beedrill", "80 – 86", 0.35],
    ["Sidequest", "Ilex Forest 2", "Parasect", "82 – 88", 0.25],
    ["Sidequest", "Ilex Forest 2", "Celebi", 90, 0.05],
    ["Sidequest", "Roaming", "Raikou", 50, 0.3333333333333333],
    ["Sidequest", "Roaming", "Entei", 50, 0.3333333333333333],
    ["Sidequest", "Roaming", "Suicune", 50, 0.3333333333333333],
    ["", "Viridian Forest", "Oddish", "70 – 76", 0.25],
    ["", "Viridian Forest", "Gloom", "70 – 76", 0.25],
    ["", "Viridian Forest", "Butterfree", "71 – 77", 0.15],
    ["", "Viridian Forest", "Beedrill", "71 – 77", 0.15],
    ["", "Viridian Forest", "Vileplume", "72 – 78", 0.1],
    ["", "Viridian Forest", "Bellossom", "72 – 78", 0.1],
    ["", "Mount Moon", "Geodude", "74 – 81", 0.25],
    ["", "Mount Moon", "Gravler", "75 – 82", 0.2],
    ["", "Mount Moon", "Golbat", "74 – 81", 0.25],
    ["", "Mount Moon", "Onix", "75 – 82", 0.15],
    ["", "Mount Moon", "Crobat", "75 – 82", 0.15],
    ["", "Route 8", "Mr. Mime", "80 – 85", 0.2],
    ["", "Route 8", "Kadabra", "80 – 85", 0.2],
    ["", "Route 8", "Slowpoke", "80 – 85", 0.4],
    ["", "Rock Tunnel", "Golbat", "28 – 33", 0.3],
    ["", "Rock Tunnel", "Golem", "30 – 35", 0.25],
    ["", "Rock Tunnel", "Steelix", "30 – 35", 0.15],
    ["", "Rock Tunnel", "Crobat", "31 – 36", 0.3],
    ["", "Route 11", "Hypno", "40 – 46", 0.15],
    ["", "Route 11", "Snorlax", "45 – 48", 0.1],
    ["", "Route 11", "Grimer", "42 – 47", 0.25],
    ["", "Route 11", "Slowking", "46 – 50", 0.1],
    ["", "Route 11", "Horsea", "45 – 50", 0.25],
    ["", "Route 11", "Seadra", "47 – 53", 0.15],
    ["", "Cycling Road", "Doduo", "47 – 53", 0.25],
    ["", "Cycling Road", "Fearow", "49 – 55", 0.25],
    ["", "Cycling Road", "Dodrio", "51 – 56", 0.2],
    ["", "Cycling Road", "Pidgeot", "51 – 57", 0.2],
    ["", "Cycling Road", "Snorlax", "50 – 55", 0.1],
    ["", "Fossil Revival", "Omanyte", "48 – 54", 0.3],
    ["", "Fossil Revival", "Kabuto", "48 – 54", 0.3],
    ["", "Fossil Revival", "Aerodactyl", "52 – 58", 0.1],
    ["", "Fossil Revival", "Omastar", "52 – 58", 0.15],
    ["", "Fossil Revival", "Kabutops", "52 – 58", 0.15],
    ["", "Safari Zone", "Nidorino", "51 – 56", 0.15],
    ["", "Safari Zone", "Nidorina", "51 – 56", 0.15],
    ["", "Safari Zone", "Rhyhorn", "52 – 57", 0.15],
    ["", "Safari Zone", "Murkrow", "52 – 57", 0.1],
    ["", "Safari Zone", "Tauros", "53 – 58", 0.1],
    ["", "Safari Zone", "Kangaskhan", "53 – 58", 0.15],
    ["", "Safari Zone", "Chansey", "55 – 60", 0.1],
    ["", "Safari Zone", "Scizor", "56 – 61", 0.1],
    ["", "Sea Routes", "Seel", "56 – 62", 0.25],
    ["", "Sea Routes", "Seaking", "57 – 63", 0.25],
    ["", "Sea Routes", "Dewgong", "61 – 67", 0.15],
    ["", "Sea Routes", "Tentacruel", "61 – 67", 0.15],
    ["", "Sea Routes", "Starmie", "62 – 68", 0.1],
    ["", "Sea Routes", "Kingdra", "63 – 69", 0.1],
    ["", "Pokemansion", "Koffing", "62 – 67", 0.2],
    ["", "Pokemansion", "Slugma", "62 – 67", 0.2],
    ["", "Pokemansion", "Houndour", "63 – 68", 0.2],
    ["", "Pokemansion", "Magmar", "65 – 70", 0.15],
    ["", "Pokemansion", "Weezing", "67 – 72", 0.15],
    ["", "Pokemansion", "Magcargo", "66 – 71", 0.05],
    ["", "Pokemansion", "Houndoom", "67 – 72", 0.05],
    ["Sidequest", "Casino Starter Trupe", "Bulbasaur", "35 – 40", "16.67%"],
    ["Sidequest", "Casino Starter Trupe", "Charmander", "35 – 40", "16.67%"],
    ["Sidequest", "Casino Starter Trupe", "Squirtle", "35 – 40", "16.67%"],
    ["Sidequest", "Casino Starter Trupe", "Chikorita", "35 – 40", "16.67%"],
    ["Sidequest", "Casino Starter Trupe", "Cyndaquil", "35 – 40", "16.67%"],
    ["Sidequest", "Casino Starter Trupe", "Totodile", "35 – 40", "16.67%"],
    ["Sidequest", "Casino Babies", "Pichu", "84 – 89", 0.15],
    ["Sidequest", "Casino Babies", "Cleffa", "84 – 89", 0.15],
    ["Sidequest", "Casino Babies", "Igglybuff", "84 – 89", 0.15],
    ["Sidequest", "Casino Babies", "Togepi", "84 – 89", 0.15],
    ["Sidequest", "Casino Babies", "Elekid", "84 – 89", 0.1],
    ["Sidequest", "Casino Babies", "Magby", "84 – 89", 0.1],
    ["Sidequest", "Casino Babies", "Smoochum", "84 – 89", 0.1],
    ["Sidequest", "Casino Babies", "Blissey", "84 – 89", 0.1],
    ["Sidequest", "Cassino Special Spot", "Lickitung", "50 – 55", 0.3],
    ["Sidequest", "Cassino Special Spot", "Porygon", "50 – 55", 0.3],
    ["Sidequest", "Cassino Special Spot", "Lapras", "50 – 55", 0.3],
    ["Sidequest", "Cassino Special Spot", "Porygon2", "52 – 56", 0.1],
    ["Sidequest", "Dojo", "Tyrogue", "38 – 44", 0.4],
    ["Sidequest", "Dojo", "Hitmonlee", "40 – 45", 0.2],
    ["Sidequest", "Dojo", "Hitmonchan", "40 – 45", 0.2],
    ["Sidequest", "Dojo", "Hitmontop", "40 – 45", 0.2],
    ["Sidequest", "Legendaries Nest", "Articuno", 85, 0.2],
    ["Sidequest", "Legendaries Nest", "Zapdos", 85, 0.2],
    ["Sidequest", "Legendaries Nest", "Moltres", 85, 0.2],
    ["Sidequest", "Legendaries Nest", "Ho-Oh", 90, 0.2],
    ["Sidequest", "Legendaries Nest", "Lugia", 90, 0.2],
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
    ["Challenge 3", "Route 31", "Defeat 10 Bellsprout", "Violet City"],
    ["Challenge 4", "Violet City", "Earn Zephyr Badge (Badge 1)", "Route 32"],
    ["Challenge 5", "Route 32", "Catch 1 Rare+ Pokémon from Route 32", "Tiny Fishing Spot + 5 Ultraball"],
    ["Challenge 6", "Tiny Fishing Spot", "Catch 5 Water-type Pokémon", "Route 33"],
    ["Challenge 7", "Route 33", "Catch 2 Mareep", "Ruins of Alph"],
    ["Challenge 8", "Ruins of Alph", "Defeat 20 Unown", "Azalea Town + Water Stones"],
    ["Challenge 9", "Azalea Town", "Earn Hive Badge (Badge 2)", "Ilex Forest"],
    ["Challenge 10", "Ilex Forest", "Catch 1 Rare+ Paras", "Route 34 + 5 Greatball"],
    ["Challenge 11", "Route 34", "Catch 2 Ditto", "Goldenrod City + Goldenrod Game Corner"],
    ["Challenge 12", "Goldenrod City", "Earn Plain Badge (Badge 3)", "Route 35"],
    ["Challenge 13", "Route 35", "Catch 1 Nidoran♀ and 1 Nidoran♂", "Small Fishing Spot"],
    ["Challenge 14", "Small Fishing Spot", "Catch 2 Dratini", "National Park + 2 Dragon Stones"],
    ["Challenge 15", "National Park", "Defeat 4 Scyther and Defeat 4 Pinsir", "Route 36 + 2 Bug Stones"],
    ["Challenge 16", "Route 36", "Defeat 5 Sudowoodo", "Route 37"],
    ["Challenge 17", "Route 37", "Catch 1 Ledian and Catch 1 Ariados", "Burned Tower"],
    ["Challenge 18", "Burned Tower", "Defeat 3 Magmar", "Ecruteak City + 2 Fire Stones"],
    ["Challenge 19", "Ecruteak City", "Earn Fog Badge (Badge 4)", "Route 38"],
    ["Challenge 20", "Route 38", "Catch 1 Tauros", "Route 39 + Normal Stone"],
    ["Challenge 21", "Route 39", "Catch 1 Farfetch'd", "Cianwood City"],
    ["Challenge 22", "Cianwood City", "Earn Storm Badge (Badge 5)", "Route 42"],
    ["Challenge 23", "Route 42", "Defeat 10 Mankey", "Mt. Mortar + Fighting Stone"],
    ["Challenge 24", "Mt. Mortar", "Catch 1 Ghost-type Pokémon", "Route 43 + Ghost Stone"],
    ["Challenge 25", "Route 43", "Catch 1 Rare+ Girafarig", "Olivine City"],
    ["Challenge 26", "Olivine City", "Earn Mineral Badge (Badge 6)", "Standard Fishing Spot"],
    ["Challenge 27", "Standard Fishing Spot", "Catch 1 Lanturn", "Ice Path"],
    ["Challenge 28", "Ice Path", "Defeat 2 Jynx", "Mahogany Town + 2 Ice Stones"],
    ["Challenge 29", "Mahogany Town", "Earn Glacier Badge (Badge 7)", "Route 44"],
    ["Challenge 30", "Route 44", "Defeat 100 Pokémon on Route 44", "Route 45"],
    ["Challenge 31", "Route 45", "Catch 1 Weak Pineco", "Blackthorn City + 10 Ultraball"],
    ["Challenge 32", "Blackthorn City", "Earn Rising Badge (Badge 8)", "Big Fishing Spot"],
    ["Challenge 33", "Big Fishing Spot", "Catch 1 Mantine", "Dark Cave"],
    ["Challenge 34", "Dark Cave", "Defeat 20 Dunsparce", "Route 46"],
    ["Challenge 35", "Route 46", "Defeat 10 Skarmory", "Viridian City + Steel Stone"],
    ["Challenge 36", "Viridian Forest", "Capture 2 Bellossom", "Pewter City + Fossil Revival"],
    ["Challenge 37", "Pewter City", "Badge 9", "Mount Moon + Badge 9"],
    ["Challenge 38", "Mount Moon", "Capture 1 Crobat", "Cerulean City + Rock Tunnel"],
    ["Challenge 39", "Cerulean City", "Badge 10", "Vermilion City + Diglet Cave + Badge 10"],
    ["Challenge 40", "Vermilion City", "Badge 11", "Route 8 + Badge 11"],
    ["Challenge 41", "Route 8", "Defeat 20 Slowpoke", "Celadon City  + Casino Starter Trupe"],
    ["Challenge 42", "Celadon City", "Badge 12", "Saffron City + Badge 12"],
    ["Challenge 43", "Saffron City", "Badge 13", "Route 12 + Badge 13"],
    ["Challenge 44", "Route 12", "Capture 1 Snorlax", "Fuschia  City + Safari Zone"],
    ["Challenge 45", "Fuschia City", "Badge 14", "Cycling Road + Sea Routes + Badge 14"],
    ["Challenge 46", "Sea Routes", "Defeat 100 pokemons on Sea Routes", "Cinnabar Island + Pokemansion"],
    ["Challenge 47", "Cinnabar Island", "Badge 15", "Viridian City + Trade With Friends Hub + Badge 15"],
    ["Challenge 48", "Viridian City", "Badge 16", "Indigo Plateau + Badge 16 + 1 Masterball"],
    ["Johto Extra Challenge 1", "Goldenrod Game Corner", "Catch 8 Eevee", "Team Rocket HQ + Roaming Legendaries + 1 Masterball"],
    ["Johto Extra Challenge 2", "Team Rocket HQ", "Defeat 10 Voltorb", "Lake of Rage + 1 Masterball"],
    ["Johto Extra Challenge 3", "Lake of Rage", "Catch 1 Red Gyarados", "Mt. Silver + 1 Masterball"],
    ["Johto Extra Challenge 4", "Mt. Silver", "Catch 5 Larvitar", "Ilex Forest 2 + 1 Masterball"],
    ["Johto Extra Challenge 5", "Ilex Forest 2", "Catch 1 Celebi", "Mythical and Legendaries Spot + 2 Masterball"],
    ["Extra Challenge (Roaming)", "Roaming", "Defeat 1 Raikou, Defeat 1 Entei, Defeat 1 Suicune", "Mythical and Legendaries Spot + 1 Masterball"],
    ["Kanto Extra Challenge 1", "Casino Starter Trupe", "Capture all 6 starters", "Cassino Babies + 4 Grass Stones + 4Fire Stones + 4 Water Stones"],
    ["Kanto Extra Challenge 2", "Casino Babies", "Evolve Pikachu into Raichu", "Casino Special Spot + 1 Masterball"],
    ["Kanto Extra Challenge 3", "Cassino Special Spot", "Evolve Porygon into Porygon2", "Dojo + 1 Masterball"],
    ["Kanto Extra Challenge 4", "Dojo", "Capture 1 Hitmonlee Capture 1 Hitmonchan Capture 1 Hitmontop", "Legendaries Nest + 2 Fighting Stones + 1 Masterball"],
    ["Kanto Extra Challenge 5", "Legendaries Nest", "Get 1 Articuno Get 1 Zapdos Get 1 Moltres", "Mythical and Legendaries Spot + 2 Masterball"],
    ["Final Challenge", "Indigo Plateau", "Defeat all Elite 4 and Defeat Champion", "Prestige / Region Reset"]
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

    return parsed_gifts[0] if parsed_gifts else None

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
            reqs["earnBadge"] = {"name": match.group(1), "leader": "Unknown", "badgeCount": int(match.group(2))}
    elif "Badge" in req_str and "Earn" not in req_str and len(req_str.split()) <= 2:
        match = re.search(r'Badge (\d+)', req_str)
        if match:
             reqs["earnBadge"] = {"name": f"Badge {match.group(1)}", "leader": "Unknown", "badgeCount": int(match.group(1))}
    elif "Defeat all Elite 4" in req_str:
        reqs["defeatEliteFourAndChampion"] = True
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
        # "Get 1 Articuno Get 1 Zapdos Get 1 Moltres"
        req_str_fixed = req_str.replace("Get 1 Articuno Get 1 Zapdos Get 1 Moltres", "Get 1 Articuno, Get 1 Zapdos, Get 1 Moltres")
        req_str_fixed = req_str_fixed.replace("Capture 1 Hitmonlee Capture 1 Hitmonchan Capture 1 Hitmontop", "Capture 1 Hitmonlee, Capture 1 Hitmonchan, Capture 1 Hitmontop")
        req_str_fixed = req_str_fixed.replace("Defeat 1 Raikou, Defeat 1 Entei, Defeat 1 Suicune", "Defeat 1 Raikou, Defeat 1 Entei, Defeat 1 Suicune") # already correct

        parts = req_str_fixed.replace(" and ", ",").split(",")
        for part in parts:
            part = part.strip()
            if part.startswith("Catch") or part.startswith("Capture") or part.startswith("Get"):
                match = re.search(r'(?:Catch|Capture|Get) (\d+) (.+)', part)
                if match:
                    count = int(match.group(1))
                    spec = match.group(2)
                    if spec == "Water-type Pokémon":
                        reqs["catchByType"] = {"type": "Water", "count": count}
                    elif spec == "Ghost-type Pokémon":
                        reqs["catchByType"] = {"type": "Ghost", "count": count}
                    elif "Rare+" in spec:
                        clean_spec = spec.replace("Rare+ Pokémon from Route 32", "Any").replace("Rare+ ", "").strip()
                        if clean_spec == "Any":
                            reqs["catchByRarity"] = {"rarity": "Rare", "count": count}
                        else:
                            catch_rare.append({"species": clean_spec, "rarity": "Rare", "count": count})
                    elif "Red Gyarados" in spec:
                         catch_species.append({"species": "Gyarados", "count": count})
                    elif spec == "all 6 starters":
                         catch_species = [{"species": s, "count": 1} for s in ["Bulbasaur", "Charmander", "Squirtle", "Chikorita", "Cyndaquil", "Totodile"]]
                    else:
                        catch_species.append({"species": spec, "count": count})
            elif part.startswith("Defeat"):
                match = re.search(r'Defeat (\d+) (.+)', part)
                if match:
                    count = int(match.group(1))
                    spec = match.group(2)
                    defeat_specific.append({"name": spec, "count": count})

        if catch_species:
            reqs["catchSpecies"] = catch_species
        if defeat_specific:
            if len(defeat_specific) == 1:
                reqs["defeatSpecific"] = defeat_specific[0]
            else:
                 reqs["defeatMultipleSpecific"] = defeat_specific
        if catch_rare:
            reqs["catchSpeciesByRarity"] = catch_rare

    return reqs

unlocks = []
for entry in challenges_data_raw:
    name, area, req_str, unlocks_str = entry

    unlocks_list = []
    gifts = []

    parts = unlocks_str.split('+')
    for i, p in enumerate(parts):
        p = p.strip()
        if "Stone" in p or "ball" in p:
             gifts.append(p)
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
        unlock["gift"] = gift_obj

    unlocks.append(unlock)

with open('config/johtoRoutes.js', 'w') as f:
    f.write(f"export const johtoRoutes = {json.dumps(routes, indent=2)};\n\n")
    f.write(f"export const johtoUnlocks = {json.dumps(unlocks, indent=2)};\n")
