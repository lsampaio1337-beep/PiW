import re

with open('src/ui/topbar.js', 'r') as f:
    content = f.read()

replacement = """    const bonusCandyContainer = document.getElementById('bonus-candy-container');
    const exclamation = document.getElementById('bonus-candy-exclamation');
    if (bonusCandyContainer && exclamation) {
        if (state.stats.bonusCandyDefeats >= 250) {
            bonusCandyContainer.style.display = 'inline-block';
            if (!state.stats.hasSeenBonusCandyIcon) {
                exclamation.style.display = 'block';
            } else {
                exclamation.style.display = 'none';
            }
        } else {
            if (state.stats.hasSeenBonusCandyIcon) {
                bonusCandyContainer.style.display = 'inline-block';
                exclamation.style.display = 'none';
            } else {
                bonusCandyContainer.style.display = 'none';
                exclamation.style.display = 'none';
            }
        }
    }"""

content = re.sub(
    r'    const exclamation = document.getElementById\(\'bonus-candy-exclamation\'\);\n    if \(exclamation\) \{\n        if \(state\.stats\.bonusCandyDefeats >= 250\) \{\n            exclamation\.style\.display = \'block\';\n        \} else \{\n            exclamation\.style\.display = \'none\';\n        \}\n    \}',
    replacement,
    content
)

with open('src/ui/topbar.js', 'w') as f:
    f.write(content)
