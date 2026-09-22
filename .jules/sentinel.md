## 2026-09-22 - XSS in Profile Name
**Vulnerability:** Unsanitized user input (`profileName`) was being interpolated directly into an element's `innerHTML` in `src/ui.js`.
**Learning:** The Electron app uses `nodeIntegration: true` and `contextIsolation: false`, meaning an XSS payload could potentially escalate to Remote Code Execution (RCE) via Node.js APIs if an attacker controls the profile name (e.g. by modifying the save file or via a malicious input field).
**Prevention:** Always use an `escapeHtml` function or assign via `textContent`/`innerText` when rendering user-provided strings in the UI.
