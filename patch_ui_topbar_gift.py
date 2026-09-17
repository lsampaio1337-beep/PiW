import re

with open('src/ui/topbar.js', 'r') as f:
    content = f.read()

replacement = """    const giftContainer = document.getElementById('gift-container');
    const giftNotification = document.getElementById('gift-notification');
    if (giftContainer && giftNotification) {
        if (state.stats.giftIconUnlocked) {
            giftContainer.style.display = 'inline-block';
            if (!state.stats.hasSeenGiftIcon) {
                giftNotification.style.display = 'block';
            } else {
                if (state.stats.pendingGifts && state.stats.pendingGifts.length > 0) {
                    giftNotification.style.display = 'block';
                } else {
                    giftNotification.style.display = 'none';
                }
            }
        } else {
            if (state.stats.hasSeenGiftIcon) {
                giftContainer.style.display = 'inline-block';
                if (state.stats.pendingGifts && state.stats.pendingGifts.length > 0) {
                    giftNotification.style.display = 'block';
                } else {
                    giftNotification.style.display = 'none';
                }
            } else {
                giftContainer.style.display = 'none';
                giftNotification.style.display = 'none';
            }
        }
    }"""

content = re.sub(
    r'    const giftContainer = document\.getElementById\(\'gift-container\'\);\n    const giftNotification = document\.getElementById\(\'gift-notification\'\);\n    if \(giftContainer && giftNotification\) \{\n        if \(state\.stats\.giftIconUnlocked\) \{\n            giftContainer\.style\.display = \'inline-block\';\n        \} else \{\n            giftContainer\.style\.display = \'none\';\n        \}\n\n        if \(state\.stats\.pendingGifts && state\.stats\.pendingGifts\.length > 0\) \{\n            giftNotification\.style\.display = \'block\';\n        \} else \{\n            giftNotification\.style\.display = \'none\';\n        \}\n    \}',
    replacement,
    content
)

with open('src/ui/topbar.js', 'w') as f:
    f.write(content)
