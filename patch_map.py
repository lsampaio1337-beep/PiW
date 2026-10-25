with open('config/mapCoordinates.js', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('"diglett_s_cave": {', '"digglett_cave": {')
content = content.replace('"name": "Diglett\'s Cave"', '"name": "Digglett Cave"')

content = content.replace('"mythical_and_legendaries": {', '"indigo_summit": {')
content = content.replace('"name": "Mythical and Legendaries"', '"name": "Indigo Summit"')

dummy_areas = """  "indigo_summit": {
    "name": "Indigo Summit",
    "x": 35.77,
    "y": 3.38
  },
  "150_challenge_area": {
    "name": "150 Challenge Area",
    "x": 48.0,
    "y": 48.0
  },
  "key_for_indigo_summit": {
    "name": "Key for Indigo Summit",
    "x": 48.0,
    "y": 48.0
  }"""
content = content.replace('  "indigo_summit": {\n    "name": "Indigo Summit",\n    "x": 35.77,\n    "y": 3.38\n  }', dummy_areas)

with open('config/mapCoordinates.js', 'w', encoding='utf-8') as f:
    f.write(content)
