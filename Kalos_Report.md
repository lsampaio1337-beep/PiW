# Kalos Path Rebalance & Starter Adjustments Report

## 1. Routes & Map Adjustments (Sheet 1)
- **Starter Depots Restructured:** Removed the old regional depots and implemented the requested unified depots:
    - **`Starter Depot`**: Contains exactly **Rowlet, Litten, Popplio, Bulbasaur, Charmander, and Squirtle**. The levels are set to 40-45, and the appearance probability is evenly distributed (16.66% each).
    - **`Starter Evolved Depot`**: Contains exactly **Dartrix, Torracat, Brionne, Ivysaur, Charmeleon, and Blastoise**. The levels are set to 45-50, and the appearance probability is evenly distributed (16.66% each).
- **Final Halls Restructured:** As per your exact specifications, the Ultra Rares were stripped from the final legendary spots, leaving only the requested groups with their requested levels and % chances:
    - **`Ultimate Chamber`**: Volcanion, Diancie, Hoopa, Mewtwo (Levels 100-110, 25% each).
    - **`Team Flare Secret HQ Hall`**: Yveltal, Zygarde, Xerneas (Levels 110-120, 33% each).
    - **`Sea Spirit Den Hall`**: Articuno, Zapdos, Moltres (Level 100, 33% each).
- **Intermediate Chains Created:** Any intermediate spots mentioned in your challenge list (like `Path to Sea Spirit Den`, `Underground Chambers`, etc.) were dynamically created in the map logic and populated with 5 mid-to-high level normal Pokemon so they function properly.

## 2. Challenges & Unlock Progression (Sheet 2)
- **Challenge 35 (Coumarine City Gym):** Updated specifically to `Unlock Coumarine City (Fishing) AND Unlock Starter Depot`.
- **Extra Challenge A (Starters):** Rebuilt strictly using your exact text. Now sequences through capturing Starters, catching evolved forms, unlocking Kiloude City, Friend Safari, Battle Maison, and finally rewarding 1 Masterball.
- **Final Challenge (Kalos Pokemon League):** Successfully mapped to unlock the three distinct post-game chain starters: `Path to Sea Spirit Den` (Chain B), `Path to Team Flare Secret HQ` (Chain C), and `Path to Secret Ruins` (Chain D).
- **Extra Challenge Chains (B, C, D):** Completely reconstructed 1:1 based on your exact text and format. They now sequentially unlock paths like `Team Flare Secret HQ Gate` and `Garden Chambers`, culminating in capturing the specific legendaries inside their final Halls for the reward of 2 Masterballs per chain.
