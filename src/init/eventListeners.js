import { setupSystemEventListeners } from './listeners/systemListeners.js';
import { setupWindowToggles } from './listeners/windowListeners.js';
import { setupSafariZoneListeners } from './listeners/safariListeners.js';
import { setupTutorialListeners } from './listeners/tutorialListeners.js';
import { setupDaycareListeners } from './listeners/daycareListeners.js';

export function setupGlobalEventListeners() {
    setupSystemEventListeners();
    setupWindowToggles();
    setupSafariZoneListeners();
    setupTutorialListeners();
    setupDaycareListeners();
}
