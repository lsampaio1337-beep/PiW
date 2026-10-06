# Idle Pokemon World

Idle Pokemon World is a standalone desktop application built with Electron. It simulates a continuous idle combat loop in the Kanto region, complete with stats, captures, breeding, and UI hubs.

## Prerequisites
- Node.js (v14 or newer recommended)
- npm

## Setup & Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Download Sprites:
   Before running the game, you need to download the Pokemon sprites into the `assets/sprites` directory:
   ```bash
   node scripts/downloadSprites.js
   ```

3. Run the Game:
   ```bash
   npm start
   ```
   *Note: Because this game was designed for zero-install static execution capabilities (running just the `index.html`), configuration files have been refactored into ES Modules (`.js`).*

## Building the Standalone Executable (.exe)

To build the game into a standalone desktop application for Windows:

```bash
npm run make
```

The resulting executable and associated files will be located in the `out/` directory.

## Modifying Configurations

The game uses dedicated JavaScript configuration files to keep data separate from logic. You can easily modify these files located in the `config/` directory:

- `balance.js`: Contains overall game balancing numbers, potion heals, pokeball rates, and quality tier probabilities.
- `gyms.js`: Configures the gym leaders, their trainers, required levels, and teams.
- `pokemonData.js`: Base stats, types, and evolutions for the 151 original Pokemon.
- `routes.js`: Defines the spawn tables and probabilities for every route.
- `moves.js`: Defines the power, type, and category of moves.
- `types.js`: The type effectiveness matrix.
- `mapCoordinates.js`: XY coordinates for the interactive Kanto map.

After modifying any `.js` file, simply restart the game to see the changes applied.
