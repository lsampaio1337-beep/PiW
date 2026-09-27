## 2026-09-20 - Window Close Buttons as `span`
**Learning:** Close buttons for floating windows and modals were implemented as `span` elements with `cursor: pointer`, lacking semantic meaning, keyboard accessibility, and ARIA labels. This is a common accessibility issue for custom desktop-like UI in web apps.
**Action:** Convert these `span` elements to semantic `<button>` tags with `aria-label="Close"`, transparent backgrounds, and inherit fonts to preserve visual styling while providing native accessibility support.
