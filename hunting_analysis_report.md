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
| ZzZ Mode (Jigglypuff) | 1x | **2400** | 60000 | 1500 |
| Timelapse (Settings) | 1x | **2400** | 60000 | 1500 |

## Technical Conclusions
1. **ZzZ Mode vs Timelapse**: Both of these methods share the exact same underlying logic (`runFastForward()` in `battleSystem.js`). As a result, they yield **identical results** per simulated hour.
2. **Natural vs Fast Forward**:
   - Natural (1x speed) encounters take significantly longer (~4000ms per encounter) because they process full UI animations: sliding in (1000ms), combat text timeouts, fading out, etc.
   - Fast Forward (ZzZ / Timelapse) is highly optimized, skipping UI completely and hardcoding combat phases (~1500ms per encounter).
   - Thus, running offline/Fast Forward generates **~2.6x more encounters per hour** than Natural 1x play.
3. **Game Speed**:
   - The Game Speed slider divides all `setTimeout` delays in Natural play.
   - A 2x Game Speed effectively cuts total encounter time in half (~2000ms), yielding 1800 encounters/hour.
   - At around 2.6x Game Speed, Natural active play will match the offline Fast Forward rate.
