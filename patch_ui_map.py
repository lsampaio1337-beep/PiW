with open('src/ui/map.js', 'r', encoding='utf-8') as f:
    content = f.read()

search = """    if (window.currentMapRegion === "Johto") {
        unlockedAreas.add("Route 29");
    }

    if (targetStats.completed150Challenge) {
        unlockedAreas.add("Temporal Sanctuary Spot");
    }"""
replace = """    if (window.currentMapRegion === "Johto") {
        unlockedAreas.add("Route 29");
    }"""
content = content.replace(search, replace)

with open('src/ui/map.js', 'w', encoding='utf-8') as f:
    f.write(content)
