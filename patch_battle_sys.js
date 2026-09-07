const fs = require('fs');

// The issue the user is reporting is "Battle is not starting, my pokemon keeps animated and nothing happens"
// Is it possible the combatLoop is not firing because of `applyMovementAnimation`?
// No, the animation iteration event is firing and clearing classes.

// Wait. `updateBattleArena` is called constantly in the UI.
// If `battleSystem.isSliding` is false, it calls `applyMovementAnimation(..., false)` which sets `elContainer.dataset.stopping = "true"` and adds the event listener.
// But it ONLY does that if `elContainer.dataset.isAnimating === "true" && elContainer.dataset.stopping !== "true"`.
// Then, the event listener removes classes and sets `isAnimating = false` and `stopping = false`.
// But what if `animationiteration` never fires? The game logic does NOT rely on the animation iteration event!
// The game logic in `src/battleSystem.js` relies purely on `setTimeout` for `this.combatLoop`.
