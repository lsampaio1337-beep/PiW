import re

with open('index.html', 'r') as f:
    content = f.read()

content = re.sub(
    r'<div style="position: relative; display: inline-block; height: 100%;">\s*<img src="Assets/Extra/BonusCandy.png" id="btn-bonus-candy"',
    r'<div id="bonus-candy-container" style="position: relative; display: none; height: 100%;">\n          <img src="Assets/Extra/BonusCandy.png" id="btn-bonus-candy"',
    content
)

with open('index.html', 'w') as f:
    f.write(content)
