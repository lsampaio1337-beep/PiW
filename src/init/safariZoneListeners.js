export function setupSafariZoneListeners() {
    const safariBtn = document.getElementById('btn-enter-safari');
    if (safariBtn) {
        safariBtn.addEventListener('click', () => {
            if (window.enterSafariZone) window.enterSafariZone();
        });
    }
}
