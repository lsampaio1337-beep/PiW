import re

with open('index.html', 'r') as f:
    html = f.read()

# We need to make sure we don't have font-size hardcoded, or if we do, it matches .window-header.
# .window-header has font-size: 14px; padding: 5px 10px; font-weight: bold;
# Our inline style on #main-control-header: `height: 30px;` might be too tall or short. Let's remove `height: 30px;` to match other headers.

html = re.sub(r'padding: 5px; cursor: move; height: 30px;', 'cursor: move;', html)

with open('index.html', 'w') as f:
    f.write(html)
