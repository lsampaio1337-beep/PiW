# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: verify.spec.js >> Verify Casino and Maps
- Location: playwright/tests/verify.spec.js:3:1

# Error details

```
Error: page.evaluate: TypeError: window.initGame is not a function
    at eval (eval at evaluate (:311:30), <anonymous>:4:12)
    at UtilityScript.evaluate (<anonymous>:313:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44)
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - navigation [ref=e2]:
    - generic [ref=e3]: "Level: 1 | XP: 0 | Money: $0 | Badges: 0"
    - generic [ref=e4]: "Next Challenge: None"
    - generic [ref=e5]:
      - button "Map" [ref=e6] [cursor=pointer]
      - button "Backpack" [ref=e7] [cursor=pointer]
      - button "Pokedex" [ref=e8] [cursor=pointer]
      - button "Stats" [ref=e9] [cursor=pointer]
      - button "Settings" [ref=e10] [cursor=pointer]
  - generic [ref=e11]:
    - complementary [ref=e12]:
      - heading "Party" [level=3] [ref=e13]
      - generic [ref=e14]:
        - heading "Day Care" [level=3] [ref=e15]
        - generic [ref=e16]: "Breeding: 0/100"
        - generic [ref=e17]: "Training: 0/100"
    - main [ref=e18]:
      - generic [ref=e20]:
        - heading "Choose your Starter Pokémon" [level=2] [ref=e21]
        - generic [ref=e22]:
          - button "Bulbasaur" [ref=e23] [cursor=pointer]
          - button "Charmander" [ref=e25] [cursor=pointer]
          - button "Squirtle" [ref=e27] [cursor=pointer]
```