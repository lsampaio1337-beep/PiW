with open('src/ui/battle.js', 'r') as f:
    content = f.read()

content = content.replace("hpContainerEnemy.style.left = '100%';", "")

with open('src/ui/battle.js', 'w') as f:
    f.write(content)
