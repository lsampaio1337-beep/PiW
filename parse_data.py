import pandas as pd
import json

raw_data = """Route / Place	Pokemon Name
Axew's Eye	Snover
Axew's Eye	Klink
Axew's Eye	Delibird
Axew's Eye	Greedent
Axew's Eye	Bronzong
Axew's Eye	Diggersby
Axew's Eye	Bewear
Axew's Eye	Vanillish
Brawlers' Cave	Woobat
Brawlers' Cave	Lickitung
Brawlers' Cave	Chansey
Brawlers' Cave	Whismur
Brawlers' Cave	Psyduck
Brawlers' Cave	Azurill
Bridge Field	Sneasel
Bridge Field	Cubchoo
Bridge Field	Mawile
Bridge Field	Palpitoad
Bridge Field	Cufant
Bridge Field	Poliwag
Bridge Field	Drednaw
Bridge Field	Lanturn
Bridge Field	Qwilfish
Bridge Field	Inkay
Challenge Beach	Psyduck
Challenge Beach	Buneary
Challenge Beach	Morpeko
Challenge Beach	Chansey
Challenge Beach	Magnemite
Challenge Beach	Dedenne
Challenge Road	Roggenrola
Challenge Road	Blipbug
Challenge Road	Salandit
Challenge Road	Happiny
Challenge Road	Chansey
Challenge Road	Mienfoo
Challenge Road	Skarmory
Challenge Road	Rockruff
Challenge Road	Dwebble
Dappled Grove	Delibird
Dappled Grove	Snorunt
Dappled Grove	Vanillite
Dappled Grove	Bunnelby
Dappled Grove	Klink
Dappled Grove	Lombre
Dappled Grove	Nuzleaf
Dusty Bowl	Snover
Dusty Bowl	Bronzong
Dusty Bowl	Swinub
Dusty Bowl	Mawile
Dusty Bowl	Cubchoo
Dusty Bowl	Klang
Dusty Bowl	Hattrem
Dusty Bowl	Ferrothorn
East Lake Axewell	Snover
East Lake Axewell	Minccino
East Lake Axewell	Pancham
East Lake Axewell	Stufful
East Lake Axewell	Magikarp
East Lake Axewell	Vanillite
East Lake Axewell	Shellder
East Lake Axewell	Wishiwashi
East Lake Axewell	Wingull
Fields of Honor	Blipbug
Fields of Honor	Buneary
Fields of Honor	Jigglypuff
Fields of Honor	Happiny
Fields of Honor	Abra
Fields of Honor	Klefki
Fields of Honor	Chansey
Forest of Focus	Karrablast
Forest of Focus	Pikachu
Forest of Focus	Oranguru
Forest of Focus	Passimian
Forest of Focus	Chansey
Forest of Focus	Emolga
Forest of Focus	Venipede
Forest of Focus	Foongus
Forest of Focus	Beldum
Forest of Focus	Tangela
Frigid Sea	Gyarados
Frigid Sea	Dhelmise
Frigid Sea	Vanillish
Frigid Sea	Cryogonal
Frigid Sea	Eiscue
Frigid Sea	Avalugg
Frigid Sea	Tirtouga
Frigid Sea	Lapras
Galar Mine	Rolycoly
Galar Mine	Roggenrola
Galar Mine	Timburr
Galar Mine	Diglett
Galar Mine	Woobat
Galar Mine	Drilbur
Galar Mine No. 2	Chewtle
Galar Mine No. 2	Stunfisk
Galar Mine No. 2	Wimpod
Galar Mine No. 2	Shellos
Galar Mine No. 2	Croagunk
Galar Mine No. 2	Scraggy
Galar Mine No. 2	Noibat
Galar Mine No. 2	Binacle
Galar Mine No. 2	Shuckle
Giant's Cap	Sneasel
Giant's Cap	Pawniard
Giant's Cap	Delibird
Giant's Cap	Dottler
Giant's Cap	Linoone
Giant's Cap	Riolu
Giant's Foot	Copperajah
Giant's Foot	Stonjourner
Giant's Foot	Bronzong
Giant's Foot	Claydol
Giant's Foot	Cryogonal
Giant's Foot	Absol
Giant's Foot	Audino
Giant's Foot	Archen
Glimwood Tangle	Hattrem
Glimwood Tangle	Spritzee
Glimwood Tangle	Swirlix
Glimwood Tangle	Morgrem
Glimwood Tangle	Shiinotic
Glimwood Tangle	Ponyta
Glimwood Tangle	Phantump
Glimwood Tangle	Sinistea
Glimwood Tangle	Oranguru
Glimwood Tangle	Passimian
Glimwood Tangle	Indeedee
Hammerlocke Hills	Natu
Hammerlocke Hills	Sneasel
Hammerlocke Hills	Snorunt
Hammerlocke Hills	Vanillite
Hammerlocke Hills	Wobbuffet
Hammerlocke Hills	Klink
Hammerlocke Hills	Pumpkaboo
Hammerlocke Hills	Honedge
Hammerlocke Hills	Machoke
Honeycalm Island	Blipbug
Honeycalm Island	Happiny
Honeycalm Island	Chansey
Honeycalm Island	Combee
Honeycalm Island	Petilil
Hulbury	Arrokuda
Hulbury	Chewtle
Hulbury	Wishiwashi
Hulbury	Chinchou
Hulbury	Basculin
Lake of Outrage	Corviknight
Lake of Outrage	Perrserker
Lake of Outrage	Klinklang
Lake of Outrage	Bisharp
Lake of Outrage	Doublade
Lake of Outrage	Vanilluxe
Lake of Outrage	Golurk
Lake of Outrage	Togedemaru
Lake of Outrage	Ditto
Lake of Outrage	Eiscue
Lake of Outrage	Copperajah
Lake of Outrage	Duraludon
Lakeside Cave	Zubat
Lakeside Cave	Carbink
Lakeside Cave	Mawile
Lakeside Cave	Ferroseed
Lakeside Cave	Audino
Lakeside Cave	Aron
Lakeside Cave	Carkol
Lakeside Cave	Sableye
Lakeside Cave	Noivern
Motostoke Outskirts	Sudowoodo
Motostoke Outskirts	Pawniard
Motostoke Outskirts	Hatenna
Motostoke Outskirts	Throh
Motostoke Outskirts	Sawk
Motostoke Outskirts	Salandit
Motostoke Outskirts	Impidimp
Motostoke Riverbank	Vanillite
Motostoke Riverbank	Ferroseed
Motostoke Riverbank	Cutiefly
Motostoke Riverbank	Sneasel
Motostoke Riverbank	Sigilyph
Motostoke Riverbank	Basculin
Motostoke Riverbank	Barraskewda
Motostoke Riverbank	Basculin
Motostoke Riverbank	Mareanie
Motostoke Riverbank	Mantyke
North Lake Miloch	Chewtle
North Lake Miloch	Roggenrola
North Lake Miloch	Croagunk
North Lake Miloch	Noctowl
North Lake Miloch	Corvisquire
North Lake Miloch	Pawniard
North Lake Miloch	Scraggy
North Lake Miloch	Koffing
Old Cemetery	Sinistea
Old Cemetery	Nidoran♀
Old Cemetery	Nidoran♂
Old Cemetery	Vanillite
Old Cemetery	Mime Jr.
Old Cemetery	Karrablast
Old Cemetery	Vanillish
Old Cemetery	Cryogonal
Old Cemetery	Absol
Old Cemetery	Audino
Old Cemetery	Drakloak
Path to the Peak	Snom
Path to the Peak	Absol
Path to the Peak	Audino
Path to the Peak	Frosmoth
Roaring-Sea Caves	Zubat
Roaring-Sea Caves	Carbink
Roaring-Sea Caves	Piloswine
Roaring-Sea Caves	Audino
Roaring-Sea Caves	Larvitar
Roaring-Sea Caves	Spheal
Roaring-Sea Caves	Deino
Roaring-Sea Caves	Basculin
Roaring-Sea Caves	Vanillish
Roaring-Sea Caves	Omanyte
Roaring-Sea Caves	Kabuto
Roaring-Sea Caves	Feebas
Rolling Fields	Delibird
Rolling Fields	Swinub
Rolling Fields	Vanillite
Rolling Fields	Snorunt
Rolling Fields	Metapod
Rolling Fields	Tyrogue
Rolling Fields	Bunnelby
Route 1	Skwovet
Route 1	Rookidee
Route 1	Blipbug
Route 1	Grubbin
Route 1	Hoothoot
Route 1	Caterpie
Route 1	Wooloo
Route 1	Nickit
Route 10	Snover
Route 10	Vanillish
Route 10	Cubchoo
Route 10	Sneasel
Route 10	Eiscue
Route 10	Duraludon
Route 10	Mr. Mime
Route 10	Abomasnow
Route 10	Beartic
Route 10	Snom
Route 10	Darumaka
Route 10	Stonjourner
Route 2	Nickit
Route 2	Chewtle
Route 2	Hoothoot
Route 2	Lotad
Route 2	Seedot
Route 2	Purrloin
Route 2	Yamper
Route 2	Zigzagoon
Route 3	Machop
Route 3	Pancham
Route 3	Gossifleur
Route 3	Vulpix
Route 3	Growlithe
Route 3	Mudbray
Route 3	Stunky
Route 3	Trubbish
Route 3	Sizzlipede
Route 4	Wooloo
Route 4	Yamper
Route 4	Electrike
Route 4	Meowth
Route 4	Milcery
Route 4	Joltik
Route 4	Pumpkaboo
Route 4	Cutiefly
Route 4	Budew
Route 4	Pikachu
Route 4	Eevee
Route 4	Ferroseed
Route 5	Dottler
Route 5	Spritzee
Route 5	Swirlix
Route 5	Espurr
Route 5	Wobbuffet
Route 5	Applin
Route 5	Farfetch'd
Route 5	Nincada
Route 5	Dewpider
Route 6	Duskull
Route 6	Yamask
Route 6	Silicobra
Route 6	Helioptile
Route 6	Dugtrio
Route 6	Heatmor
Route 6	Durant
Route 6	Hippopotas
Route 6	Skorupi
Route 6	Maractus
Route 6	Torkoal
Route 6	Trapinch
Route 6	Axew
Route 6	Hawlucha
Route 7	Perrserker
Route 7	Corviknight
Route 7	Toxel
Route 7	Galvantula
Route 7	Thievul
Route 7	Liepard
Route 7	Karrablast
Route 7	Shelmet
Route 7	Seismitoad
Route 7	Meowstic
Route 7	Morpeko
Route 8	Golett
Route 8	Pawniard
Route 8	Bronzong
Route 8	Togedemaru
Route 8	Sandaconda
Route 8	Rhyhorn
Route 8	Boldore
Route 8	Gurdurr
Route 8	Dusclops
Route 8	Haunter
Route 8	Rufflet
Route 8	Vullaby
Route 8	Hippowdon
Route 8	Lunatone
Route 8	Solrock
Route 8	Drapion
Route 8	Falinks
Route 9	Pelipper
Route 9	Octillery
Route 9	Jellicent
Route 9	Mareanie
Route 9	Pyukumuku
Route 9	Cramorant
Route 9	Kingler
Route 9	Gastrodon
Route 9	Pincurchin
Slippery Slope	Greedent
Slippery Slope	Snom
Slippery Slope	Swinub
Slippery Slope	Piloswine
Slippery Slope	Smoochum
Slippery Slope	Mime Jr.
Slippery Slope	Cryogonal
Slippery Slope	Jynx
Slippery Slope	Amaura
Slippery Slope	Audino
Slumbering Weald	Skwovet
Slumbering Weald	Rookidee
Slumbering Weald	Hoothoot
Slumbering Weald	Blipbug
Slumbering Weald	Grubbin
Slumbering Weald	Weezing
Slumbering Weald	Munna
Slumbering Weald 2	Corviknight
Slumbering Weald 2	Orbeetle
Slumbering Weald 2	Butterfree
Slumbering Weald 2	Stunfisk
Slumbering Weald 2	Whiscash
Slumbering Weald 2	Magikarp
Slumbering Weald 2	Barboach
Soothing Wetlands	Skwovet
Soothing Wetlands	Applin
Soothing Wetlands	Skorupi
Soothing Wetlands	Shelmet
Soothing Wetlands	Happiny
Soothing Wetlands	Chansey
Soothing Wetlands	Dunsparce
Soothing Wetlands	Wooper
Soothing Wetlands	Lickitung
Soothing Wetlands	Bouffalant
South Lake Miloch	Vanillite
South Lake Miloch	Klink
South Lake Miloch	Snover
South Lake Miloch	Delibird
South Lake Miloch	Corphish
South Lake Miloch	Machop
Stepping-Stone Sea	Wingull
Stepping-Stone Sea	Skwovet
Stepping-Stone Sea	Blipbug
Stepping-Stone Sea	Exeggcute
Stepping-Stone Sea	Happiny
Stepping-Stone Sea	Chansey
Stepping-Stone Sea	Flapple
Stepping-Stone Sea	Appletun
Stony Wilderness	Sneasel
Stony Wilderness	Pawniard
Stony Wilderness	Ferroseed
Stony Wilderness	Baltoy
Stony Wilderness	Bronzor
Stony Wilderness	Golett
Training Lowlands	Blipbug
Training Lowlands	Happiny
Training Lowlands	Chansey
Training Lowlands	Lillipup
Training Lowlands	Tauros
Training Lowlands	Miltank
Training Lowlands	Scyther
Training Lowlands	Pinsir
Training Lowlands	Heracross
Training Lowlands	Magikarp
Training Lowlands	Corphish
Training Lowlands	Arrokuda
Training Lowlands	Cramorant
Training Lowlands	Carvanha
Training Lowlands	Sharpedo
Tunnel to the Top	Snorunt
Tunnel to the Top	Audino
Tunnel to the Top	Zubat
Tunnel to the Top	Carbink
Tunnel to the Top	Bagon
Tunnel to the Top	Gible
Tunnel to the Top	Clefairy
Warm-Up Tunnel	Torkoal
Warm-Up Tunnel	Chansey
Warm-Up Tunnel	Sandshrew
Warm-Up Tunnel	Cubone
Warm-Up Tunnel	Kangaskhan
Watchtower Ruins	Cherubi
Watchtower Ruins	Delibird
Watchtower Ruins	Snorunt
Watchtower Ruins	Purrloin
Watchtower Ruins	Snover
Watchtower Ruins	Gastly
Watchtower Ruins	Duskull
Watchtower Ruins	Drifloon
West Lake Axewell	Vanillite
West Lake Axewell	Klink
West Lake Axewell	Delibird
West Lake Axewell	Bunnelby
West Lake Axewell	Tympole
West Lake Axewell	Krabby
West Lake Axewell	Goldeen
West Lake Axewell	Wishiwashi
West Lake Axewell	Vanillite
West Lake Axewell	Remoraid
West Lake Axewell	Frillish
Workout Sea	Magikarp
Workout Sea	Remoraid
Workout Sea	Octillery
Workout Sea	Mantyke
Workout Sea	Wingull
Workout Sea	Tentacool
Workout Sea	Gyarados
Workout Sea	Skrelp
Workout Sea	Clauncher
Workout Sea	Dragalge
Workout Sea	Clawitzer"""

lines = raw_data.strip().split('\n')
header = lines[0].split('\t')
data = []
for line in lines[1:]:
    parts = line.split('\t')
    if len(parts) >= 2:
        route = parts[0].strip()
        pokemon = parts[1].strip()
        data.append({"Route / Place": route, "Pokemon Name": pokemon})

with open("raw_encounters.json", "w") as f:
    json.dump(data, f, indent=2)

print("Parsed and saved as raw_encounters.json")
