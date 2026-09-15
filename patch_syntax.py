import re

with open('src/ui.js', 'r') as f:
    content = f.read()

# Let's find exactly where the error is
# The syntax error was around line 1364.
