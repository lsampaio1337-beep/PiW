## 2024-05-24 - Pokemon Data Lookup Array Indexing
**Learning:** In a codebase where pokemon data IDs are strictly 1-indexed and match the array position minus 1 (e.g. `id: 1` is at index `0`), calling `find(p => p.id === id)` on a 151-element array multiple times in battle calculations is O(n) and unnecessary. It can be easily refactored to O(1) array access `state.config.pokemonData[id - 1]`.
**Action:** Replace `find` on `pokemonData` with direct array indexing since we verified IDs map directly to indices.
