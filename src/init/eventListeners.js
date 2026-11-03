import { setupSystemEventListeners } from './systemEventListeners.js';
import { setupWindowToggles } from './windowToggles.js';
import { setupSafariZoneListeners } from './safariZoneListeners.js';
import { setupTutorialListeners } from './tutorialListeners.js';
import { setupDaycareListeners } from './daycareListeners.js';

export function setupGlobalEventListeners() {
    setupSystemEventListeners();
    setupWindowToggles();
    setupSafariZoneListeners();
    setupTutorialListeners();
    setupDaycareListeners();
}
