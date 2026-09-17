import re

with open('src/state.js', 'r') as f:
    content = f.read()

replacement = """        jigglypuffGrains: 0,
        hasSeenBonusCandyIcon: false,
        hasSeenGiftIcon: false,
        hasSeenZzZTutorial: false,"""

content = re.sub(
    r'        jigglypuffGrains: 0,\n        hasSeenZzZTutorial: false,',
    replacement,
    content
)

with open('src/state.js', 'w') as f:
    f.write(content)
