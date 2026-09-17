import re

with open('src/ui.js', 'r') as f:
    content = f.read()

replacement = """    bindBtn('btn-gift', () => {
        if(!checkCombatLock()) {
            state.stats.hasSeenGiftIcon = true;
            storage.save(state);
            updateTopbar();
            showGiftModal();
        }
    });"""

content = re.sub(
    r'    bindBtn\(\'btn-gift\', \(\) => \{\n        if\(!checkCombatLock\(\)\) \{\n            showGiftModal\(\);\n\n        \}\n    \}\);',
    replacement,
    content
)

with open('src/ui.js', 'w') as f:
    f.write(content)
