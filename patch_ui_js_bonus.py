import re

with open('src/ui.js', 'r') as f:
    content = f.read()

replacement = """    bindBtn('btn-bonus-candy', () => {
        if(!checkCombatLock()) {
            state.stats.hasSeenBonusCandyIcon = true;
            storage.save(state);
            updateTopbar();
            showBonusCandyModal();
        }
    });"""

content = re.sub(
    r'    bindBtn\(\'btn-bonus-candy\', \(\) => \{\n        if\(!checkCombatLock\(\)\) \{\n            showBonusCandyModal\(\);\n\n        \}\n    \}\);',
    replacement,
    content
)

with open('src/ui.js', 'w') as f:
    f.write(content)
