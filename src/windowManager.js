export class WindowManager {
    constructor() {
        this.windows = new Map();
        this.highestZIndex = 100;

        this.registerWindow('left-col', 'btn-toggle-party');
        this.registerWindow('center-col', 'btn-toggle-battle');

        // Expose globally for HTML inline onclick attributes
        window.WindowManager = this;
    }

    registerWindow(windowId, buttonId = null) {
        const el = document.getElementById(windowId);
        if (!el) return;

        this.windows.set(windowId, {
            element: el,
            buttonId: buttonId,
            isOpen: false
        });

        // Set up drag events
        const header = el.querySelector('.window-header');
        if (header) {
            let isDragging = false;
            let startX, startY, initialLeft, initialTop;

            header.onmousedown = (e) => {
                isDragging = true;
                this.focusWindow(windowId);

                startX = e.clientX;
                startY = e.clientY;

                const rect = el.getBoundingClientRect();
                const containerRect = document.getElementById('main-container').getBoundingClientRect();

                initialLeft = rect.left - containerRect.left;
                initialTop = rect.top - containerRect.top;

                document.onmousemove = (moveEvent) => {
                    if (!isDragging) return;

                    const dx = moveEvent.clientX - startX;
                    const dy = moveEvent.clientY - startY;

                    let newLeft = initialLeft + dx;
                    let newTop = initialTop + dy;

                    // Boundary checking (prevent dragging out of screen)
                    if (newLeft < 0) newLeft = 0;
                    if (newTop < 0) newTop = 0;
                    if (newLeft + rect.width > containerRect.width) newLeft = containerRect.width - rect.width;
                    if (newTop + rect.height > containerRect.height) newTop = containerRect.height - rect.height;

                    el.style.left = newLeft + 'px';
                    el.style.top = newTop + 'px';
                };

                document.onmouseup = () => {
                    isDragging = false;
                    document.onmousemove = null;
                    document.onmouseup = null;
                };
            };
        }

        // Focus when clicking anywhere on the window
        el.addEventListener('mousedown', () => this.focusWindow(windowId));
    }

    toggleWindow(windowId) {
        const win = this.windows.get(windowId);
        if (!win) return;

        if (win.isOpen) {
            this.hideWindow(windowId);
        } else {
            this.showWindow(windowId);
        }
    }

    showWindow(windowId) {
        const win = this.windows.get(windowId);
        if (!win) return;

        win.element.style.display = 'block';
        win.isOpen = true;
        this.focusWindow(windowId);
    }

    hideWindow(windowId) {
        const win = this.windows.get(windowId);
        if (!win) return;

        win.element.style.display = 'none';
        win.isOpen = false;
    }

    focusWindow(windowId) {
        const win = this.windows.get(windowId);
        if (!win) return;

        this.highestZIndex++;
        win.element.style.zIndex = this.highestZIndex;
    }
}
