import re

with open('src/ui.js', 'r') as f:
    content = f.read()

# Replace the ZzZ mode modal completely using standard showModal.
# Oh, in the earlier checkout I saw that it was completely inside the 'btn.onclick' for loading profiles!

# Look for this exact code to replace:
old_logic_pattern = re.compile(r"document\.getElementById\('zzz-results-modal'\)\.style\.display = 'flex';.*?document\.getElementById\('btn-zzz-results-close'\)\.onclick = \(\) => \{\s*document\.getElementById\('zzz-results-modal'\)\.style\.display = 'none';\s*updateUI\(\);\s*\};", re.DOTALL)

new_logic = """showModal("ZzZ Mode", resultsHtml);"""

# Also I need to rename the Statistics modal to Trainer.
content = content.replace('showModal("Statistics"', 'showModal("Trainer"')

# The `resultsHtml` string actually needs to be defined BEFORE it's used.
# Since my previous patch injected `resultsHtml` string after `faintedBanner` block, let's just make sure it's clean.
# Actually wait, `resultsHtml` is already defined in `48f0a8e`? No, in my `48f0a8e` branch it's using the old `document.getElementById('zzz-results-content').innerHTML = ...`.

# Let's replace the whole assignment:
old_html_assignment = re.compile(r"document\.getElementById\('zzz-results-content'\)\.innerHTML = `(.*?)`;\s*document\.getElementById\('zzz-results-modal'\)\.style\.display = 'flex';\s*document\.getElementById\('btn-zzz-results-close'\)\.onclick = \(\) => \{\s*document\.getElementById\('zzz-results-modal'\)\.style\.display = 'none';\s*updateUI\(\);\s*\};", re.DOTALL)

content = old_html_assignment.sub(r"const resultsHtml = `\1`;\n                            showModal('ZzZ Mode', resultsHtml);", content)

with open('src/ui.js', 'w') as f:
    f.write(content)
