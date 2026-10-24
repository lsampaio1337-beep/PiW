# Alola Routes and Challenges - Changes Report

## 1. Special Encounters & Relocations
* **Ditto Relocation**: Order #13 (previously solely Ditto) was removed. Ditto has been logically relocated to Route 10 Main Area to ensure it is not isolated.
* **Amaura Insertion**: Amaura was inserted into Route 8 Fossil Restoration Center.
* **Special Mythical / Legendary Locations Setup**:
    * **Sacred Shrine**: Contains Tapu Koko, Tapu Lele, Tapu Bulu, and Tapu Fini.
    * **Obsidian Sphere**: Contains Cosmog, Cosmoem, Solgaleo, Lunala, and Necrozma.
    * **The Interdimensional Rift**: Contains exclusively the 10 Ultra Beasts (Nihilego, Buzzwole, Pheromosa, Xurkitree, Celesteela, Kartana, Guzzlord, Poipole, Stakataka, Blacephalon).
    * **The Zenith Anomaly**: A newly created final location for the Trio (Magearna, Marshadow, Zeraora).

## 2. Route Constraints Enforcement
* Standard routes with fewer than 3 Pokémon were dynamically merged into adjacent nodes to maintain encounter density.
* Large routes (>9 Pokémon) were automatically split (e.g., The Interdimensional Rift Part 1 and Part 2) with a 50/50 division to prevent any subsequent part from having only 1 Pokémon leftover.

## 3. Extra Challenge Chains Reorganization
Exactly 6 Extra Challenge Chains were established to strictly mirror geographic proximity and progression logic:

### Pre-League (4 Chains):
* **Extra Challenge 1 (Starter Depot)**: 5 total challenges starting after Defeating Captain Lana. Leads through Route 6 -> Royal Avenue -> Pikachu Valley -> Heahea Surf Spot -> **Starter Depot** (Contains all 3 base Alolan starters and their 2nd stage evolutions).
* **Extra Challenge 2 (Obsidian Sphere)**: 4 total challenges starting after Defeating Captain Sophocles. Leads through Blush Mountain -> Ula'ula Meadow -> Lake of the Sunne -> **Obsidian Sphere** (Cosmog, etc).
* **Extra Challenge 3 (Sacred Shrine)**: 3 total challenges starting after Defeating Kahuna Hala. Leads through Route 3 -> Memorial Hill -> **Sacred Shrine** (Tapus).
* **Extra Challenge 4 (Aether Paradise)**: 3 total challenges starting after Defeating Kahuna Nanu. Leads through Route 15 -> Aether Paradise Labs -> **Aether Paradise Secret Lab** (Type: Null, Porygon, Silvally).

### Post-League (2 Chains):
* **Extra Challenge 5 (The Interdimensional Rift)**: Starts immediately after Defeating Champion Hau. Leads through Poni Grove -> Poni Plains -> Resolution Cave -> **The Interdimensional Rift**.
* **Extra Challenge 6 (The Zenith Anomaly)**: **Strictly unlocks only after The Interdimensional Rift is completed**, fulfilling the request to gate the Trio behind the Ultra Beasts. Leads through Poni Coast -> **The Zenith Anomaly**.

## 4. Challenge Verification
Every single node explicitly writes "Unlocks [Spot]" to clearly show the progression map.

## 5. Missing Pokémon List
Sheet 3 was successfully reconstructed. It highlights all explicitly placed Generation 7 Pokémon and their designated path assignments, keeping tracking transparent.
