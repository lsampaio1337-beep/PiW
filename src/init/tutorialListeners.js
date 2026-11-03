export function setupTutorialListeners() {
    const profTutorialSkipBtn = document.getElementById('btn-prof-tutorial-skip');
    if (profTutorialSkipBtn) {
        profTutorialSkipBtn.addEventListener('click', () => {
            if (window.skipProfTutorial) window.skipProfTutorial();
        });
    }
    const profTutorialProceedBtn = document.getElementById('btn-prof-tutorial-proceed');
    if (profTutorialProceedBtn) {
        profTutorialProceedBtn.addEventListener('click', () => {
            if (window.proceedProfTutorial) window.proceedProfTutorial();
        });
    }
    const profTutorialConcludeBtn = document.getElementById('btn-prof-tutorial-conclude');
    if (profTutorialConcludeBtn) {
        profTutorialConcludeBtn.addEventListener('click', () => {
            if (window.concludeProfTutorial) window.concludeProfTutorial();
        });
    }
}
