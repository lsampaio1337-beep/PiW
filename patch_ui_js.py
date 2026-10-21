import re

with open('src/ui.js', 'r') as f:
    content = f.read()

helper = """
window.getGlobalBadgeInfo = function(gymIndex) {
    if (gymIndex >= 0 && gymIndex <= 7) return { region: 'Kanto', number: gymIndex + 1 };
    if (gymIndex >= 9 && gymIndex <= 16) return { region: 'Johto', number: gymIndex - 8 };
    if (gymIndex >= 17 && gymIndex <= 24) return { region: 'Sinnoh', number: gymIndex - 16 };
    if (gymIndex >= 25 && gymIndex <= 32) return { region: 'Unova2', number: gymIndex - 24 };
    if (gymIndex >= 33 && gymIndex <= 40) return { region: 'Hoenn', number: gymIndex - 32 };
    if (gymIndex >= 41 && gymIndex <= 48) return { region: 'Kalos', number: gymIndex - 40 };
    if (gymIndex >= 49 && gymIndex <= 56) return { region: 'Alola', number: gymIndex - 48 };
    if (gymIndex >= 57 && gymIndex <= 64) return { region: 'Galar', number: gymIndex - 56 };
    if (gymIndex >= 65 && gymIndex <= 72) return { region: 'Hisui', number: gymIndex - 64 };
    if (gymIndex >= 73 && gymIndex <= 80) return { region: 'Paldea', number: gymIndex - 72 };
    return { region: 'Kanto', number: 1 };
};

window.getBadgeFileName = function(region, number) {"""

content = content.replace("window.getBadgeFileName = function(region, number) {", helper)

with open('src/ui.js', 'w') as f:
    f.write(content)
