# Idle Pokemon World Game Documentation

This document serves as a comprehensive guide to the internal mechanics, mathematical formulas, and progression systems of the game. It is designed to provide full transparency into how the engine operates, making it a perfect reference for AI simulations and game logic understanding.

---

## 1. Core Stats & Math

### Base Stat Scaling
Pokemon stats dynamically scale based on their Base Stats, IVs (Individual Values), Level, and Quality (Q). The formulas mirror standard Pokemon scaling but incorporate the custom `Quality` modifier.

- **HP Formula**:
  $$HP = \lfloor (\frac{(2 \times \text{BaseHP} + \text{IV\_HP}) \times \text{Level}}{100} + \text{Level} + 10) \times Q \rfloor$$
- **Core Stat Formula** (Attack, Defense, Special Attack, Special Defense, Speed):
  $$Stat = \lfloor (\frac{(2 \times \text{BaseStat} + \text{IV\_Stat}) \times \text{Level}}{100} + 5) \times Q \rfloor$$

### Experience Points (XP)
The XP leveling system uses an exponential curve logic. `TotalXP` dictates cumulative XP to reach a level, while `ReqXP` is the delta between levels.

- **Total XP Formula**:
  $$TotalXP(n) = \lfloor 12.65 \times (n^{3.45}) \rfloor - 12$$
  *(where $n$ is Level, up to a cap of 100)*

### Encounter Value (EV)
Encounter Value governs three things: battle XP, battle gold drops, and the base sell price (PP) of a caught Pokemon. EV scales dramatically with high Base Stat Totals (BST), Level, Quality, and Total IVs.

- **EV Formula**:
  $$EV = \lfloor 12.5 \times (\frac{BST}{195})^{2.86} \times (1 + 16.82 \times (\frac{\text{Level} - 1}{99})^{1.5}) \times Q \times (1 + \frac{\text{TotalIV}}{1500}) \rfloor$$

### Individual Values (IVs)
Wild Pokemon generate a random `SumIV` (Total IV) from 6 to 600. This pool is randomly distributed across the 6 stats (HP, Atk, Def, SpA, SpD, Spe), each capped at 100.
Modifiers apply to the `SumIV` before distribution:
- **Mastery Boost**: Up to +25% depending on Professor Oak IV Task tier.
- **Shiny Boost**: +25% if the Pokemon is Shiny and the Oak Shiny Task tier $\ge 1$.

### Quality (Q)
Quality is a float multiplier generated via a 1–12,000 dice roll, representing tiers from Weak to Shiny.
- **Roll Brackets**:
  - 1–1474: Weak (0.80 to 0.99)
  - 1475–6586: Regular (1.00 to 1.19)
  - 6587–9593: Uncommon (1.20 to 1.39)
  - 9594–11097: Rare (1.40 to 1.59)
  - 11098–11999: Epic (1.60 to 1.80)
  - 12000: Shiny (Fixed 2.00)

*Note: Oak Tasks and Rainbow Candies alter these rolls. (See Candy Meta-Progression & Oak Tasks).*

---

## 2. Combat System

### Turn Logic & Speed
Battles are auto-battled continuous turns. Which combatant goes first depends on their Speed stat compared to the Base Attack Delay.
- **Attack Delay Formula**:
  $$Delay(ms) = 2.0 \times 1000 \times \frac{100}{100 + \text{Speed}}$$
  *(Minimum delay is capped at 0.25s, inversely affected by `gameSpeed`)*
- The attacker with the lowest initial delay strikes first. The other attacker is then scheduled to strike based on their delay, resetting back and forth.

### Damage Formula
Damage calculation factors in physical vs special splits, type effectiveness, crits, and quality.

- **Damage Formula**:
  $$Damage = \lfloor (\frac{\text{Level} + 5}{125} \times (\text{Power} \times \frac{\text{AttackStat}}{\text{DefenseStat}}) + 2) \rfloor \times Modifier$$
- **Modifier**:
  $$Modifier = TypeEffectiveness \times Critical \times Random \times Q$$
  - *Critical*: 4% chance for 1.5x damage.
  - *Random*: Uniform float between 0.85 and 1.00.
  - *Q*: The attacker's Quality multiplier.
  - *Minimum Damage*: 1

### Best Move Selection
The auto-battler ignores status moves and always selects the attacking move with the highest Expected Damage. Expected Damage is calculated identically to the formula above but without the Critical and Random multipliers.

---

## 3. Capture Mechanics

### Catch Chance
When a Pokeball is thrown, a capture probability is computed based on the wild Pokemon's BST and Level, clamped between 1% and 100%.

- **Base Catch Formula**:
  $$BaseChance = \max(1, 72 - (\frac{BST}{8.5}) - (\frac{\text{Level}}{4}))$$
- **Final Chance**:
  $$Chance = BaseChance \times BallMultiplier \times (1 + TaskBonus) \times ShinyBoost \times CatchCandyMultiplier$$

### Pokeball Multipliers
- **Pokeball**: 1.0x
- **Greatball**: 1.5x
- **Safariball**: 1.5x
- **Ultraball**: 2.0x
- **Masterball**: Fixed 100% catch rate (Overrides all formulas).

---

## 4. World & Progression

### Route Spawns
Each route has an array of possible Pokemon spawns.
- Spawns have a fixed chance (`chance` float). The sum of all chances in a route's spawn array must always equal exactly 1.0.
- Level bounds are defined per spawn (`minLevel`, `maxLevel`).
- *Route 1 Specific Logic*: If the player's leader is Level 1, wild Pokemon spawn at Level 1. Otherwise, they have a 50% chance to be Level 1 or 2.

### Gym & Elite 4 Scaling
Gym Leaders and the Elite 4 do not use standard Quality or IV generation. Instead, their stats scale based on their chronological progression index (0 to 8, with 8 being Elite 4).
- **Quality**: $1.2 + (\text{GymIndex} \times 0.05)$
- **SumIV**: $270 + (\text{GymIndex} \times 30)$ (Distributed evenly across all 6 stats)
- Note: The player party receives a full heal between individual trainer fights inside a Gym.

---

## 5. Economy & Items

### Economy
Money is earned by defeating wild Pokemon (Gold Drop = EV * Loot Multiplier) or by selling items and Pokemon.

- **PokeMarket (Sell)**: All items sell for exactly 50% of their base buy cost.
- **Pokemon PP (Price)**: The sell value of a Pokemon is exactly equal to its EV.

### Fees
- **Safari Zone**: Costs \$5,000 per battle. Provides infinite Safari Balls. Ejects player on bankruptcy.
- **Casino Standard**: Costs \$5,000 per battle.
- **Casino Double Shiny**: Costs \$10,000 per battle. The shiny dice roll has double the thresholds, significantly increasing shiny odds.

---

## 6. Background Systems

### ZzZ Offline Mode
The game simulates offline progression accurately without visual rendering.
- **Time Limits**: Offline simulation caps based on `Jigglypuff Dust`. (1 grain = 1 minute offline / 60,000ms). Players generate 1 grain per 60 seconds of active playtime.
- **Combat Fidelity**: The simulation runs accurate turn-by-turn math, including speed delays, best move selections, type advantages, auto-potions, and capture attempts.
- **Stoppage Conditions**: Simulation halts when time runs out, the entire party faints, or the player runs out of money to afford Safari/Casino entry fees.

---

## 7. Candy Meta-Progression

Candies provide permanent account-wide boosters. They are purchased with `White Candy`, a meta-currency earned primarily through continuous grinding.

- **White Candy Drops**: Players earn 1 White Candy for every 250 wild Pokemon defeated (tracked via `bonusCandyDefeats`).
- **Candy Effects & Additive Boosts**: Let $b$ be the base bonus step and $n$ be the number of candies owned. Total Bonus = $\text{StandardValue} \times (1 + b \times n)$
  - **Green Candy (Loot)**: +1% Gold Drop and Item Drop Probability ($b = 0.01$). Cost: 1 White Candy.
  - **Purple Candy (XP)**: +1% XP Gain ($b = 0.01$). Cost: 2 White Candies.
  - **Black Yellow Candy (Catch)**: +1% Catch Chance Multiplier ($b = 0.01$). Cost: 3 White Candies.
- **Rainbow Candy (Shiny Rolls)**: Unlike percentage boosts, Rainbow Candies add direct flat rolls to the 12,000-sided Quality dice. Each Rainbow Candy grants +1 roll (e.g., 1 Rainbow Candy makes a roll of 11,999 evaluate as 12,000, triggering a Shiny). Cost: 5 White Candies.

---

## 8. Loot Drop System

Wild Pokemon occasionally drop items when defeated. Drops are evaluated independently for Balls, Potions, and Stones, heavily scaling off the enemy's IVs and Quality.

- **Ball & Potion Drops**: Driven by Total IV.
  $$\text{DropChance} = 2.0\% + 8.0\% \times (\frac{\text{TotalIV}}{600})$$
  - The tier of the drop (Pokeball vs Ultraball, Small Potion vs Hyper Potion) is determined strictly by the enemy's level bracket (e.g., Lv 1-15 = Pokeball/Tiny Potion, Lv 75+ = Ultraball/Hyper Potion).
- **Evolution Stone Drops**: Driven entirely by the enemy's Quality tier.
  - Uncommon: 1% chance
  - Rare: 2% chance
  - Epic: 3% chance
  - Shiny: 100% chance (Guaranteed drop)
  - *(Drop quantities can increase based on the Green Candy Loot Multiplier).*

---

## 9. Professor Oak Task Scaling & Boosters

Professor Oak tracks overall account milestones (Captures, Shinies Seen, Levels) to grant passive buffs. The thresholds are cumulative across task tiers.

- **Boosters Available**:
  - **Catch Booster**: +5% to +25% Catch Chance multiplier (Tiers 1–5).
  - **Quality Booster**: Expands the max dice roll ranges for higher Quality tiers. Boosters range from $b = 0.15$ to $1.00$ based on tier. Formula: $\text{NewQ} = (1 + b) \times (\text{OriginalQ} - \text{TierBaseQ}) + \text{TierBaseQ}$.
  - **Shiny Seen Booster**: Grants extra Shiny dice rolls. Tier 1 (Regular) gives +1 roll. Tier 2+ (Good) gives +2 rolls.
  - **Mastery IV Booster**: Grants a +5% to +25% multiplier to the final `SumIV` generated for wild Pokemon.
- **Tracking Mechanism**: The engine aggregates progression through distinct brackets (e.g., `weakPlusCaptures`, `regularPlusCaptures`, up to `epicPlusCaptures`) so catching a high-tier Pokemon simultaneously increments progress for all lower-tier tasks.

---

## 10. Daily Calendar Rewards

The Daily Calendar offers escalating rewards for consecutive days claimed, separated into Week 1, Week 2, and Week 3+ (Dynamic Scaling).

- **Week 1 & 2 Baselines**: Hardcoded tiered payouts, starting from 10 Pokeballs & 10 Tiny Potions on Day 1, scaling up to Ultraballs, Big Potions, and culminating in Masterballs on Day 7 of each week.
- **Week 3+ Dynamic Formula Scaling**: Let $d$ be total days claimed and $w$ be the current week number.
  - **Days 1 to 6**:
    - $\text{Ultraballs} = 40 + 5 \times (d - 14)$
    - $\text{Hyper Potions} = 10 + 2 \times (d - 14)$
  - **Day 7 (End of Week)**:
    - $\text{Masterballs} = w$
    - $\text{Big Potions} = 2 \times w$
