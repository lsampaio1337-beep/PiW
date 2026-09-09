# Game Mechanics & Specifications

This document provides a comprehensive overview of all formulas, game mechanics, item data, progression constraints, and offline simulation rules for the game. Designed for AI systems to accurately test and re-balance the game.

## 1. Core Calculations & Formulas

### Stat Calculation
- **HP** = `Math.floor((((2 * BaseHP + IV_HP) * Level / 100) + Level + 10) * Quality)`
- **Other Stats (ATK, DEF, SPA, SPD, SPE)** = `Math.floor((((2 * BaseStat + IV_Stat) * Level / 100) + 5) * Quality)`

### Experience & Leveling
- **ReqXP(L)** (XP needed to go from Level L to L+1) = `Math.floor(L * (36 + 0.44 * (L - 1)^2))`
- **TotalXP(L)** (Cumulative XP from Level 1 to L) = Sum of ReqXP from Level 1 to L-1.
- **EVXP** (Battle XP from defeating a Pokemon):
  `Math.max(1, Math.floor((7.0 + 8.47 * (Level - 1)) * (BST / 300)^0.85 * (Quality / 1.20)^0.30 * (0.85 + 0.15 * (TotalIV / 600))))`
  - *Note*: XP gains are further multiplied by Oak Task Level Tier bonuses and Purple Candy bonuses (see Items section).

### Economy Calculation
- **EVM** (Money dropped from defeating a wild Pokemon):
  `Math.max(1, Math.floor(0.75 * Level^1.15 * (BST / 300)^0.5 * (Quality / 1.20)^0.5 * (0.70 + 0.30 * (TotalIV / 600))))`
  - *Note*: Money gains are multiplied by the Loot Multiplier (Green Candy bonuses).
- **PP** (Pokemon Price - Sale value of caught Pokemon):
  `Math.max(1, Math.floor(50 * (Quality / 1.40)^4.0 * (TotalIV / 450)^3.0 * (BST / 300)^1.1 * (Level / 50)))`
- **Items Sell Value**: Items always sell for 50% of their base buy price.

### Combat Calculation
- **Damage Formula**:
  `BaseDamage = Math.floor(((Level + 5) / 125) * ((MovePower * AttackStat) / DefenseStat) + 2)`
  `FinalDamage = Math.max(1, Math.floor(BaseDamage * TypeEffectiveness * CriticalHitMultiplier * RandomVariance))`
  - **Critical Hit**: 4% chance. Multiplier is 1.5x if critical, 1.0x otherwise.
  - **Random Variance**: Uniform random float between [0.85, 1.00].
  - *Note*: Quality is not directly applied in the damage calculation, as it's already pre-factored into the Attack and Defense stats.
- **Turn Delays & Combat Speed**:
  - **Attack Delay (Attack Speed)** = `Math.max(250, 2.0 * 1000 * (100 / (100 + pokemonSpeed))) / gameSpeed` (Base 2.0s)
  - **Search Time (Encounter Delay)** = `Math.max(300, 3.0 * 1000 * (100 / (100 + leaderSpeed))) / gameSpeed` (Base 3.0s)

### Catch Calculation
- **Catch Chance (%)**:
  `BaseChance = 74.0 - (BST / 14.6) - (Level / 4.0) - 8.0 * ((Quality - 0.8) / 1.0) - 5.0 * (TotalIV / 600)`
  *(Clamped to a minimum of 1)*
  `FinalChance = BaseChance * BallMultiplier * (1 + CatchBonus / 100) * ShinyCatchMulti`
  - **CatchBonus**: Comes from Oak Tasks (up to +25) and Black Yellow Candies (+4 per candy).
  - **ShinyCatchMulti**: 2.0 if the target is Shiny AND the player has Shiny Seen Task Tier >= 3. Otherwise 1.0.
  - **Masterball Exception**: If `BallMultiplier >= 10`, chance is strictly 100%.

### Generation RNG (Quality, IV, Shiny)
- **Quality Generation**:
  - 1-12000 Roll.
  - Base Thresholds: Weak (1-1474), Regular (1475-6586), Uncommon (6587-9593), Rare (9594-11097), Epic (11098-11999), Shiny (12000).
  - **Shiny Rolls Bonus**: Rainbow Candies (+1 roll each). Shiny Seen Task Tier 1 (+1 roll), Tier 2+ (+2 rolls). A +1 roll means a roll of 11999 is converted to 12000.
  - **Quality Multiplier Roll**: After a tier is selected, it rolls a float between the tier's Min and Max Q value. Oak Quality Tasks boost this final rolled value up to +100% (BonusValue = 1.0) and dynamically lowers the threshold arrays for lower tiers.
- **IV Generation**:
  - SumIV is rolled uniformly between 6 and 595.
  - **Mastery IV Boost**: Up to +25% multiplicatively.
  - **Shiny IV Boost**: If Shiny and Shiny Caught Task Tier >= 1, +25% multiplicatively.
  - *Cap*: SumIV is strictly capped at 600. Then it is distributed randomly among the 6 stats (min 1, max 100 per stat).

## 2. Items, Economy & Bonuses

### Pokeballs
- **Pokeball**: Price $2, Multiplier 1.0x
- **Greatball**: Price $18, Multiplier 1.5x
- **Ultraball**: Price $75, Multiplier 2.0x
- **Masterball**: Price $1,000,000, Multiplier 999.0x (100% catch rate)

### Potions
- **Tiny Potion**: Price $3, Heal 25 HP
- **Small Potion**: Price $12, Heal 50 HP
- **Regular Potion**: Price $35, Heal 100 HP
- **Big Potion** (Key: `Big Potion`, Balance key: `Big`): Price $90, Heal 250 HP
- **Hyper Potion**: Price $220, Heal 1000 HP
- **Ultra Potion**: Price $9000, Heal 5000 HP
- **Max Potion**: Price $300,000, Heal 999,999 HP

### Upgrades / Expansions
- **Ball Pocket**: Tiers 1-6 (+$150 to $20,000). Max Capacity +8999.
- **Potion Satchel**: Tiers 1-5 (+$75 to $3,000). Max Capacity +280.
- **Pokemon Box**: Tiers 1-5 (+$100 to $6,000). Max Capacity +300.

### Candies & Bonus Stats
- **White Candy**: Earned automatically every 250 wild pokemon defeats.
- **Green Candy**: Effect = +3% Loot Probability & Quantity (EVm drops). Cost = `1 + Math.floor(Owned / 5)` White Candies.
- **Purple Candy**: Effect = +2% XP Gain. Cost = `2 + Math.floor(Owned / 3)` White Candies.
- **Black Yellow Candy**: Effect = +4% Catch Chance. Cost = `3 + Math.floor(Owned / 2)` White Candies.
- **Rainbow Candy**: Effect = +1 Shiny Roll. Cost = `8 + (Owned * 4)` White Candies. (Max capacity: 5).

### Other Item Drops
- **Evolution Stones**: Dropped when defeating Pokemon. Drop chance based on enemy Quality: Uncommon (1%), Rare (2%), Epic (3%), Shiny (100%). Sell value $200.
- **Loot Drops (Balls/Potions)**: Wild pokemon can drop loot based on IVs: `(2.0 + 8.0 * (TotalIV / 600))%`.

## 3. Game Progression & Scaling

### Gyms & Elite 4 Scaling
- Gym trainers and Elite 4 dynamically scale based on the gym's progression index (0 to 8).
- **Quality (QValue)** = `1.2 + (GymIndex * 0.05)`
- **SumIV** = `270 + (GymIndex * 30)`, distributed evenly across all 6 stats.
- **Rest Phase**: Auto-heals the entire party between gym trainer battles. Auto-potions are disabled in gym battles.

### Special Zones
- **Route 1 Cap**: Spawned pokemon levels are strictly capped to the player's active lead pokemon level: `Math.min(SpawnLevel, PlayerLevel)`.
- **Safari Zone**: Costs $5000 per entry (subtracted before each encounter). Ejects to Safari Hub if funds run out. Provides infinite Safari Balls during combat that don't consume inventory.
- **Casino Routes**: Standard Route ($5000), Double Shiny Route ($10,000). Funds evaluated before each battle. Ejects to Casino Hub if out of money.

### Area Unlock Conditions
- **Route 1**: Default
- **Pewter Gym**: Defeat Route 2 (x15)
- **Route 3**: Earn Boulder Badge
- **Mt. Moon**: Catch Spearow (x1)
- **Cerulean Gym**: Defeat Mt. Moon (x50)
- **Route 5,6**: Earn Cascade Badge
- **Vermilion Gym**: Catch Meowth (x2), Oddish (x2)
- **Route 11**: Earn Thunder Badge
- **Diglett's Cave**: Catch Drowzee (x5), Raticate (x1)
- **Route 9**: Catch Dugtrio (x2)
- **Route 10**: Catch Fearow (x2)
- **Rock Tunnel**: Defeat Route 10 (x100)
- **Route 8**: Catch Onix (x2), Machop (x2)
- **Celadon Gym & Casino**: Catch Kadabra (x2), Catch Fire Types (x10) from Route 8
- **Route 7**: Earn Rainbow Badge
- **Pokémon Tower**: Defeat Route 7 (x150)
- **Route 12**: Catch Haunter (x2), Cubone (x1)
- **Route 13**: Catch Farfetch'd (x3)
- **Route 14,15**: Catch Victreebel (x1), Vileplume (x1)
- **Fuchsia Gym**: Catch Ditto (x5)
- **Cycling Road**: Earn Soul Badge
- **Safari Zone**: Catch Dodrio (x2)
- **Saffron Gym**: Defeat Safari Zone (x400)
- **Sea Routes**: Earn Marsh Badge
- **Pokémon Mansion**: Defeat Sea Routes (x250)
- **Cinnabar Gym**: Catch Magmar (Rare x1)
- **Viridian Gym**: Earn Volcano Badge
- **Route 22**: Earn Earth Badge
- **Route 23**: Defeat Route 22 (x350)
- **Elite 4**: Catch Nidoking/Nidoqueen (Rare x1)
- **Prestige / Region Reset**: Defeat Elite 4 Champion
- **Small Fishing Spot**: Catch Bulbasaur, Charmander, Squirtle in Casino
- **Fighting Dojo**: Catch Magikarp (Epic x1), Slot Machine (Ivysaur/Charmeleon/Wartortle)
- **Big Fishing Spot**: Catch Hitmonchan/Hitmonlee (Rare x1), Slot Machine (Eeveelutions)
- **Fossil Revival Lab**: Catch Dragon (Rare x2), Slot Machine (Lapras/Porygon/Lickitung)
- **Trade With Friends Hub**: Catch Aerodactyl (Rare x1), Slot Machine (Venusaur/Charizard/Blastoise)
- **Power Plant**: Catch Gengar, Golem, Alakazam, Machamp
- **Seafoam Islands**: Defeat Zapdos (x5)
- **Victory Road**: Defeat Articuno (x5)
- **Cerulean Cave**: Defeat Moltres (x5)


### Gym Leaders & Elite 4 Data
*(Note: Gyms and Elite 4 dynamically scale their IV and Quality based on their progression index. See Gyms & Elite 4 Scaling above)*

#### Pewter Gym (Leader: Brock)
- **Leader Brock**
  - Geodude (Lv. 6)
  - Onix (Lv. 7)

#### Cerulean Gym (Leader: Misty)
- **Leader Misty**
  - Psyduck (Lv. 15)
  - Staryu (Lv. 15)
  - Starmie (Lv. 16)

#### Vermilion Gym (Leader: Lt. Surge)
- **Leader Lt. Surge**
  - Pikachu (Lv. 25)
  - Electrode (Lv. 26)
  - Raichu (Lv. 27)

#### Celadon Gym (Leader: Erika)
- **Leader Erika**
  - Victreebel (Lv. 50)
  - Tangela (Lv. 51)
  - Vileplume (Lv. 52)

#### Fuchsia Gym (Leader: Koga)
- **Leader Koga**
  - Golbat (Lv. 73)
  - Arbok (Lv. 74)
  - Muk (Lv. 74)
  - Weezing (Lv. 76)

#### Saffron Gym (Leader: Sabrina)
- **Leader Sabrina**
  - Mr. Mime (Lv. 82)
  - Jynx (Lv. 82)
  - Hypno (Lv. 83)
  - Alakazam (Lv. 84)

#### Cinnabar Gym (Leader: Blaine)
- **Leader Blaine**
  - Rapidash (Lv. 86)
  - Ninetales (Lv. 86)
  - Magmar (Lv. 87)
  - Arcanine (Lv. 87)
  - Charizard (Lv. 88)

#### Viridian Gym (Leader: Giovanni)
- **Leader Giovanni**
  - Onix (Lv. 87)
  - Golem (Lv. 88)
  - Nidoqueen (Lv. 88)
  - Nidoking (Lv. 89)
  - Rhydon (Lv. 90)

#### Elite Four #1 - Lorelei (Leader: Lorelei)
- **Elite Four #1 - Lorelei**
  - Dewgong (Lv. 94)
  - Cloyster (Lv. 94)
  - Slowbro (Lv. 95)
  - Jynx (Lv. 95)
  - Lapras (Lv. 96)

#### Elite Four #2 - Bruno (Leader: Bruno)
- **Elite Four #2 - Bruno**
  - Onix (Lv. 95)
  - Hitmonchan (Lv. 95)
  - Hitmonlee (Lv. 96)
  - Onix (Lv. 96)
  - Machamp (Lv. 97)

#### Elite Four #3 - Agatha (Leader: Agatha)
- **Elite Four #3 - Agatha**
  - Gengar (Lv. 96)
  - Golbat (Lv. 96)
  - Haunter (Lv. 97)
  - Arbok (Lv. 97)
  - Gengar (Lv. 98)

#### Elite Four #4 - Lance (Leader: Lance)
- **Elite Four #4 - Lance**
  - Gyarados (Lv. 97)
  - Dragonair (Lv. 97)
  - Dragonair (Lv. 98)
  - Aerodactyl (Lv. 98)
  - Dragonite (Lv. 99)

#### Champion (Leader: Champion)
- **Champion**
  - Snorlax (Lv. 100)
  - Alakazam (Lv. 100)
  - Rhydon (Lv. 100)
  - Exeggutor (Lv. 100)
  - Starmie (Lv. 100)
  - Arcanine (Lv. 100)

## 4. ZzZ Mode (Offline Fast-Forward)

### Mechanics & Limitations
- **Trigger**: Activating ZzZ Mode saves the timestamp, sets `state.isZzZMode = true`, and closes the game.
- **Time Currency (Jigglypuff Grains)**: 1 Grain = 60,000ms (1 minute) of offline simulation. Grains are earned passively (1 per 60s of active playtime).
- **Simulation Cap**: Offline simulation time is strictly capped to the player's available Jigglypuff Grains.
- **Execution Loop**: Uses `globals.battleSystem.runFastForward(timeElapsedMs)` which calculates turn-by-turn combat mathematically bypassing all visual UI renders. Uses the exact same math formulas listed above (including speed, delays, and critical hits).
- **Auto-Potions**: Simulated accurately mid-combat using 1 turn per potion. If 3 consecutive heals occur without attacking, forces an attack to prevent endless stalling loops.
- **Stopping Conditions**: The loop terminates immediately if:
  1. Time cap (Grains) runs out.
  2. The entire party faints (`!party.some(p => p.currentHp > 0)`).
  3. Funds run out for special entry-fee encounters (Safari / Casino) resulting in `results.outOfMoney = true`.
