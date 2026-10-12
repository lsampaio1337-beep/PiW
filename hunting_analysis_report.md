# Hunting Methods Analysis Report

This report compares the in-game progression systems over a standardized **1-Hour** period (using a high-speed Level 50 Bulbasaur on an early route).

## Definitions
1. **Natural (1x)**: Normal active play.
2. **Game Speed (Multiplier)**: Active play with the cheat slider adjusted to 2x or 5x speed.
3. **ZzZ Mode (Jigglypuff Dust)**: Background/Offline progression system. Uses `runFastForward()`.
4. **Timelapse (Settings Cheat)**: Time-skipping progression. Also uses `runFastForward()`.

## Performance Data (Per 1 Hour)
| Hunting Method | Multiplier | Encounters/Hr | XP | Total Time Per Encounter (ms) |
| --- | --- | --- | --- | --- |
| Natural Game Speed | 1x | **900** | 22500 | 4000 |
| Natural Game Speed | 2x | **1800** | 45000 | 2000 |
| Natural Game Speed | 5x | **4500** | 112500 | 800 |
| ZzZ Mode (Jigglypuff) | 1x | **900** | 22500 | 4000 |
| Timelapse (Settings) | 1x | **900** | 22500 | 4000 |

## Technical Conclusions
1. **ZzZ Mode vs Timelapse**: Both of these methods share the exact same underlying logic (`runFastForward()` in `battleSystem.js`). As a result, they yield **identical results** per simulated hour.
2. **Normalization Update**: ZzZ Mode and Timelapse have been successfully normalized to mimic Natural 1x Speed. They now accurately simulate the UI delays of active play (slide-in animations, visual faint fade-outs, and stat-based attack delays). This ensures offline progression perfectly matches active play.
3. **Game Speed**:
   - The Game Speed slider divides all delays in Natural play.
   - A 2x Game Speed effectively cuts total encounter time in half (~2000ms), yielding 1800 encounters/hour.
