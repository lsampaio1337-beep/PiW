import re
with open('src/ui.js', 'r') as f:
    content = f.read()

# Make sure startNewGame gets bound to `btn-new-profile`.
# Right now the whole chunk:
# ```
#             profilesContainer.appendChild(btn);
#         });
#
#         document.getElementById('btn-new-profile').onclick = startNewGame;
# ```
# is missing from `src/ui.js` because of my previous botched sed patches or whatever. Let's see if it's there.
