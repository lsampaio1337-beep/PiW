1. Remove Mirage Island route entirely from Hoenn data (`config/hoennRoutes.js` and `config/hoennMapCoordinates.js`).
2. Rename the 4 fishing spots in Hoenn to lore-accurate names in `config/hoennRoutes.js` and `config/hoennMapCoordinates.js`.
   - Tiny Fishing Spot -> Route 106 Fishing Spot (or Route 106 Underwater/Fishing)
   - Small Fishing Spot -> Route 109 Fishing Spot
   - Big Fishing Spot -> Route 118 Fishing Spot
   - Underwater Fishing Spot -> Route 126 Underwater
3. Adjust Hoenn Gym distribution. Add missing route between gyms to ensure there are at least 3 main challenges between them, while remaining lore-accurate. Then renumber the challenges so they stay sequential. Update `unlocks` lists.
4. Adjust requirements for challenges as specified by user.
5. Complete pre commit steps (which include `pre_commit_instructions`).
6. Submit change.
