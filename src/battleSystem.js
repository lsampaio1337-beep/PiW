import { VITAMINS, WHITE_CANDY_DEFEAT_REQUIREMENT } from "./constants.js";
// src/battleSystem.js
import * as mathEngine from './mathEngine.js';
import { escapeHTML } from './utils/stringUtils.js';

class BattleSystem {

    cloneEncounter(encounter) {
        if (!encounter) return null;
        return {
            ...encounter,
            types: encounter.types ? [...encounter.types] : undefined,
            ivs: encounter.ivs ? { ...encounter.ivs } : undefined,
            currentStats: encounter.currentStats ? { ...encounter.currentStats } : undefined,
            moves: encounter.moves ? encounter.moves.map(m => ({ ...m })) : undefined
        };
    }

    constructor(gameState, updateUI) {
        this.state = gameState; // reference to global game state
        this.updateUI = updateUI; // callback to update UI

        this.activeEncounter = null;
        this.combatLoop = null;
        this.isSearching = false;
        this.isFainting = false;

        this.consecutiveHeals = 0;


        this.multiplayerState = {
            isActive: false,
            opponentParty: null,
            currentPokemonIndex: 0
        };

        this.gymState = {
            isActive: false,
            gym: null,
            gymIndex: 0,
            currentTrainerIndex: 0
        };
    }

    _initPokemonBaseMap() {
        this.pokemonBaseMap = new Map();
        const pokemonData = this.state.config?.pokemonData;
        if (!pokemonData) return;

        for (const p of pokemonData) {
            this.pokemonBaseMap.set(p.id, p);
        }
    }

    getPokemonBase(id) {
        if (!this.pokemonBaseMap) {
            this._initPokemonBaseMap();
        }
        return this.pokemonBaseMap.get(id);
    }

    _initRouteMap(routes, currentRegion) {
        this._routeMap = new Map();
        this._routeMapRegion = currentRegion;
        for (let i = 0; i < routes.length; i++) {
            this._routeMap.set(routes[i].name, routes[i]);
        }
    }

    getRoute(routeName) {
        const currentRegion = this.state.currentRegionName;

        if (this._cachedRouteName === routeName && this._cachedRegionName === currentRegion) {
            return this._cachedRoute;
        }

        const routes = window.getCurrentRoutes();
        let foundRoute = undefined;

        if (routes) {
            if (this._routeMapRegion !== currentRegion || !this._routeMap) {
                this._initRouteMap(routes, currentRegion);
            }
            foundRoute = this._routeMap.get(routeName);
        }

        this._cachedRouteName = routeName;
        this._cachedRegionName = currentRegion;
        this._cachedRoute = foundRoute;

        return foundRoute;
    }

    _initGymMapCache() {
        this._gymMapCache = new Map();
        const gyms = this.state.config?.gyms;
        if (!gyms) return;

        for (const g of gyms) {
            this._gymMapCache.set(g.name, g);
        }
    }

    getGym(gymName) {
        if (!this._gymMapCache) {
            this._initGymMapCache();
        }
        return this._gymMapCache.get(gymName);
    }

    _initPokeballMapCache() {
        this._pokeballMapCache = new Map();
        const pokeballs = this.state.config?.balance?.items?.pokeballs;
        if (!pokeballs) return;

        for (const b of pokeballs) {
            this._pokeballMapCache.set(b.name, b);
        }
    }

    getPokeballConfig(ballName) {
        if (!this._pokeballMapCache) {
            this._initPokeballMapCache();
        }
        return this._pokeballMapCache.get(ballName);
    }

    getSpawnForRoute(route) {
        if (!route || !route.spawns || route.spawns.length === 0) {
            return null;
        }

        // Fast path for single spawn routes (no need to generate random number)
        if (route.spawns.length === 1) {
            return route.spawns[0];
        }

        // Cache the CDF on the route object
        if (!route._cumulativeChances) {
            route._cumulativeChances = new Float64Array(route.spawns.length);
            let acc = 0;
            for (let i = 0; i < route.spawns.length; i++) {
                acc += route.spawns[i].chance;
                route._cumulativeChances[i] = acc;
            }
        }

        const rand = Math.random();
        let low = 0;
        let high = route.spawns.length - 1;
        let mid;
        const cdf = route._cumulativeChances;

        // Binary search
        while (low < high) {
            mid = (low + high) >> 1;
            if (rand > cdf[mid]) {
                low = mid + 1;
            } else {
                high = mid;
            }
        }

        return route.spawns[low] || route.spawns[0];
    }

    getSpeedMultiplier() {
        const speedTier = this.state.stats?.upgrades?.speedTier || 0;
        // Tier 0: 1.0 (100% time)
        // Tier 1: 0.9 (90% time)
        // Tier 5+: 0.5 (50% time)
        const mult = 1.0 - (speedTier * 0.1);
        return Math.max(0.5, mult);
    }

    getLootTier() {
        return this.state.stats?.upgrades?.lootTier || 0;
    }


    getEvolutionStage(pokemonId) {
        if (!this.evolutionStageMap) {
            const evolveFromMap = {};
            const pokemonData = this.state.config.pokemonData;
            const len = pokemonData.length;

            // First pass: Build the reverse lookup map
            for (let i = 0; i < len; i++) {
                const p = pokemonData[i];
                if (p.evolutions) {
                    const evos = p.evolutions;
                    for (let j = 0; j < evos.length; j++) {
                        evolveFromMap[evos[j].to] = p.id;
                    }
                }
            }

            this.evolutionStageMap = {};

            // Second pass: Calculate stages iteratively using an array for path to avoid recursion
            for (let i = 0; i < len; i++) {
                let id = pokemonData[i].id;

                if (this.evolutionStageMap[id]) continue;

                let stage = 1;
                const path = [];

                // Trace back to the base form or a previously calculated stage
                while (id && !this.evolutionStageMap[id]) {
                    path.push(id);
                    id = evolveFromMap[id];
                }

                // If we found a previously calculated stage, start from there
                if (id) {
                    stage = this.evolutionStageMap[id] + 1;
                }

                // Assign stages forward along the path
                for (let j = path.length - 1; j >= 0; j--) {
                    this.evolutionStageMap[path[j]] = stage > 5 ? 5 : stage;
                    stage++;
                }
            }
        }
        return this.evolutionStageMap[pokemonId] || 1;
    }

    start() {

        if (!this.combatLoop) {
            const leaderSpeed = this.state.party[0].currentStats.spe;
            const speedMult = this.getSpeedMultiplier();
            let slideDelay = this.state.config.balance.baseSearchTime * 1000 * (100 / (100 + leaderSpeed)) * speedMult;
            slideDelay = Math.max(300, slideDelay) / this.state.settings.gameSpeed;
            this.generateEncounter(slideDelay);
        }
    }

    stop() {
        if (this.combatLoop) {
            clearTimeout(this.combatLoop);
            this.combatLoop = null;
        }
    }

    getTypeEffectiveness(moveType, defenderTypes) {
        if (!this._typeEffectivenessCache) {
            this._typeEffectivenessCache = new Map();
        }

        let cacheForMove = this._typeEffectivenessCache.get(moveType);
        if (cacheForMove === undefined) {
            cacheForMove = new Map();
            this._typeEffectivenessCache.set(moveType, cacheForMove);
        }

        const len = defenderTypes.length;
        let key = defenderTypes[0];
        if (len === 2) {
             key += defenderTypes[1];
        } else if (len > 2) {
             key = defenderTypes.join('');
        }

        let eff = cacheForMove.get(key);
        if (eff !== undefined) return eff;

        eff = 1.0;
        const moveData = this.state.config.types[moveType];
        if (moveData) {
            for (let i = 0; i < len; i++) {
                const defType = defenderTypes[i];
                if (moveData[defType] !== undefined) {
                    eff *= moveData[defType];
                }
            }
        }

        cacheForMove.set(key, eff);
        return eff;
    }

    getExplosionMove(pokemon) {
        if (!pokemon || !pokemon.moves) return null;
        let bestExplosion = null;
        for (const move of pokemon.moves) {
            if (!move || !move.name) continue;
            if (move.name === 'Self-Destruct' || move.name === 'Self Destruct' || move.name === 'Explosion') {
                if (!bestExplosion || move.power > bestExplosion.power) {
                    bestExplosion = move;
                }
            }
        }
        return bestExplosion;
    }

    getBestMove(attacker, defender) {
        let bestMove = null;
        let maxExpectedDamage = -1;

        // In a full implementation, attacker.moves would have populated Move objects
        if (!attacker.moves) return null;
        for (const move of attacker.moves) {
            // Very simplified: skip if missing data
            if (!move || move.power === 0) continue;

            // Do not use Self-Destruct or Explosion normally
            if (move.name === 'Self-Destruct' || move.name === 'Self Destruct' || move.name === 'Explosion') continue;

            const isPhysical = move.category === 'Physical';
            const atkStat = isPhysical ? attacker.currentStats.atk : attacker.currentStats.spa;
            const defStat = isPhysical ? defender.currentStats.def : defender.currentStats.spd;
            const eff = this.getTypeEffectiveness(move.type, defender.types);

            // Expected damage ignores crit/random modifier for selection
            const expDamage = Math.floor((((attacker.level + 5) / 125) * (move.power * atkStat / defStat)) + 2) * eff * attacker.quality;

            if (expDamage > maxExpectedDamage) {
                maxExpectedDamage = expDamage;
                bestMove = move;
            }
        }

        // Fallback to struggle if no moves
        if (!bestMove) {
            bestMove = { name: "Struggle", power: 50, type: "Normal", category: "Physical" };
        }

        return bestMove;
    }


    startMultiplayerBattle(opponentParty, isHost) {
        this.stop();
        this.multiplayerState = {
            isActive: true,
            opponentParty: opponentParty,
            isHost: isHost,
            currentPokemonIndex: 0
        };

        if (typeof window.switchView === 'function') {
            window.switchView("BATTLE_ARENA");
        }

        const leaderSpeed = this.state.party[0].currentStats.spe;
        let slideDelay = this.state.config.balance.baseSearchTime * 1000 * (100 / (100 + leaderSpeed));
        slideDelay = Math.max(300, slideDelay) / this.state.settings.gameSpeed;

        this.generateMultiplayerEncounter(slideDelay);
    }

    stopMultiplayerBattle() {
        this.multiplayerState.isActive = false;
        this.multiplayerState.opponentParty = null;
        this.multiplayerState.currentPokemonIndex = 0;
        this.stop();

        // Restore party from backup
        import('./ui/multiplayer.js').then((mp) => {
            if (mp.originalParty && mp.originalParty.length > 0) {
                // Restore the original party array, overriding the shifted one
                this.state.party.length = 0;
                mp.originalParty.forEach(p => {
                     // Heal them up too just in case
                     p.currentHp = p.maxHp;
                     this.state.party.push(p);
                });
            }

            if (typeof window.switchView === 'function') {
                if (this.state.currentRegionName === 'Hoenn') {
                    window.switchView("HOENN_PROFESSOR_LAB");
                } else if (this.state.currentRegionName === 'Johto') {
                    window.switchView("JOHTO_PROFESSOR_LAB");
                } else {
                    window.switchView("PROFESSOR_LAB");
                }
            }

            // Re-generate idle encounter
            const leaderSpeed = this.state.party[0] ? this.state.party[0].currentStats.spe : 100;
            let slideDelay = this.state.config.balance.baseSearchTime * 1000 * (100 / (100 + leaderSpeed));
            slideDelay = Math.max(300, slideDelay) / this.state.settings.gameSpeed;
            this.generateEncounter(slideDelay);

            // Switch view back to battle stadium and reset ready states so players stay connected
            if (typeof window.resetMultiplayerReady === 'function') {
                window.resetMultiplayerReady();
            }
            if (typeof window.switchView === 'function') {
                window.switchView("BATTLE_STADIUM");
            }
        }).catch(err => {
            console.error("Error importing multiplayer:", err);
            // Fallback: Switch view back to battle stadium and reset ready states so players stay connected
            if (typeof window.resetMultiplayerReady === 'function') {
                window.resetMultiplayerReady();
            }
            if (typeof window.switchView === 'function') {
                window.switchView("BATTLE_STADIUM");
            }
        });
    }

    generateMultiplayerEncounter(slideDelay) {
        if (!this.multiplayerState.opponentParty) return;

        const pokemonDef = this.multiplayerState.opponentParty[this.multiplayerState.currentPokemonIndex];
        if (!pokemonDef) {
            this.stopMultiplayerBattle();
            return;
        }

        const pokemonBase = this.getPokemonBase(pokemonDef.id);

        let stats = { ...pokemonDef.currentStats };

        this.activeEncounter = {
            id: pokemonDef.id,
            uuid: pokemonDef.uuid,
            name: pokemonBase.name,
            level: pokemonDef.level,
            maxHp: pokemonDef.maxHp,
            currentHp: pokemonDef.currentHp,
            xp: mathEngine.calculateTotalXP(pokemonDef.level),
            types: pokemonDef.types,
            quality: pokemonDef.quality,
            qualityName: pokemonDef.qualityName,
            isShiny: pokemonDef.isShiny,
            currentStats: stats,
            moves: pokemonDef.moves || this.getLearnsetMoves(pokemonBase, pokemonDef.level),
            isBoss: false,
            catchRate: 0,
            xp: mathEngine.calculateTotalXP(pokemonDef.level)
        };

        this.updateUI();

        if (this.state.settings.smartCapture && typeof window.updateSmartCaptureIcon === 'function') {
            window.updateSmartCaptureIcon();
        }

        if (typeof window.triggerSlideAnimation === 'function') {
            window.triggerSlideAnimation(slideDelay);
        }

        this.isSearching = false;
        this.isFainting = false;
        this.isSliding = true;
        this.slideDuration = slideDelay;

        this.combatLoop = setTimeout(() => {
            this.isSliding = false;
            this.updateUI();

            const playerPokemon = this.state.party[0];
            const enemyPokemon = this.activeEncounter;

            // In Multiplayer, the host calculates everything, but we still need turn order based on speed
            if (playerPokemon.currentStats.spe >= enemyPokemon.currentStats.spe) {
                this.executeMultiplayerTurn(playerPokemon, enemyPokemon);
            } else {
                this.executeMultiplayerTurn(enemyPokemon, playerPokemon);
            }
        }, slideDelay);
    }

    handleMultiplayerEvent(event) {
        if (!this.multiplayerState.isActive) return;

        if (event.type === 'attack') {
            const defender = event.target === 'player' ? this.state.party[0] : this.activeEncounter;
            const attacker = event.target === 'player' ? this.activeEncounter : this.state.party[0];

            const animDuration = 500 / this.state.settings.gameSpeed;
            if (typeof window.playCombatAnimations === 'function') {
                window.playCombatAnimations(event.target, event.moveType, animDuration);
            }

            setTimeout(() => {
                defender.currentHp = event.newHp;

                if (typeof window.showDamage === 'function') {
                    window.showDamage(event.target, event.damage, event.isCritical, event.effectiveness);
                }

                this.updateUI();

                if (event.fainted) {
                    this.handleMultiplayerDefeat(defender);
                }
            }, animDuration);
        }
    }

    executeMultiplayerTurn(attacker, defender) {
        if (!this.multiplayerState.isHost) return; // Only host calculates combat
        import('./ui/multiplayer.js').then((mp) => {

            if (this.isFainting) return;
            if (!this.activeEncounter) return;

            let move = this.getBestMove(attacker, defender);
            if (!move) move = { name: 'Struggle', type: 'Normal', category: 'Physical', power: 50 };
            const isPhysical = move.category === 'Physical';
            const atkStat = isPhysical ? attacker.currentStats.atk : attacker.currentStats.spa;
            const defStat = isPhysical ? defender.currentStats.def : defender.currentStats.spd;
            const eff = this.getTypeEffectiveness(move.type, defender.types);

            const hit = mathEngine.calculateDamage(attacker.level, move.power, atkStat, defStat, eff, attacker.quality);

            const targetSide = attacker === this.state.party[0] ? 'enemy' : 'player';
            const animDuration = 500 / this.state.settings.gameSpeed;

            if (typeof window.playCombatAnimations === 'function') {
                window.playCombatAnimations(targetSide, move.type, animDuration);
            }

            let fainted = false;

            setTimeout(() => {
                defender.currentHp -= hit.damage;
                if (defender.currentHp <= 0) {
                    defender.currentHp = 0;
                    fainted = true;

                    let explosionMove = this.getExplosionMove(defender);
                    if (explosionMove) {
                        const isPhys = explosionMove.category === 'Physical';
                        const atkS = isPhys ? defender.currentStats.atk : defender.currentStats.spa;
                        const defS = isPhys ? attacker.currentStats.def : attacker.currentStats.spd;
                        const e = this.getTypeEffectiveness(explosionMove.type, attacker.types);
                        const expHit = mathEngine.calculateDamage(defender.level, explosionMove.power, atkS, defS, e, defender.quality);
                        attacker.currentHp -= expHit.damage;
                        // Client is expected to update its own hp, but we update server state here
                        if (typeof window.showDamage === 'function') {
                            window.showDamage(targetSide === 'enemy' ? 'player' : 'enemy', expHit.damage, expHit.isCritical, explosionMove.name, explosionMove.type, e);
                        }
                    }
                }

                if (typeof window.showDamage === 'function') {
                    window.showDamage(targetSide, hit.damage, hit.isCritical, hit.effectiveness);
                }

                // Send result to client
                if (mp.dataChannel) {
                     mp.dataChannel.send(JSON.stringify({
                         type: 'combatEvent',
                         event: {
                             type: 'attack',
                             target: targetSide === 'enemy' ? 'player' : 'enemy', // Invert target for the client
                             damage: hit.damage,
                             newHp: defender.currentHp,
                             isCritical: hit.isCritical,
                             effectiveness: hit.effectiveness,
                             moveType: move.type,
                             fainted: fainted
                         }
                     }));
                }

                this.updateUI();

                if (fainted) {
                    this.handleMultiplayerDefeat(defender);
                } else {
                    const delay = Math.max(200, 1000 / this.state.settings.gameSpeed);
                    this.combatLoop = setTimeout(() => {
                        this.executeMultiplayerTurn(defender, attacker);
                    }, delay);
                }
            }, animDuration);
        });
    }

    handleMultiplayerDefeat(defeated) {
        this.isFainting = true;
        this.stop(); // Clear loop

        if (defeated === this.activeEncounter) {
             if (typeof window.triggerDefeatAnimation === 'function') {
                 window.triggerDefeatAnimation('enemy');
             }

             this.multiplayerState.currentPokemonIndex++;

             setTimeout(() => {
                 this.isFainting = false;
                 if (this.multiplayerState.currentPokemonIndex >= this.multiplayerState.opponentParty.length) {
                     this.stopMultiplayerBattle();
                     setTimeout(() => {
                         if (typeof window.showGameAlert === 'function') {
                             window.showGameAlert("You won the multiplayer battle!", "view-battle-stadium");
                         } else {
                             alert("You won the multiplayer battle!");
                         }
                     }, 100);
                 } else {
                     const leaderSpeed = this.state.party[0].currentStats.spe;
                     let slideDelay = this.state.config.balance.baseSearchTime * 1000 * (100 / (100 + leaderSpeed));
                     slideDelay = Math.max(300, slideDelay) / this.state.settings.gameSpeed;
                     this.generateMultiplayerEncounter(slideDelay);
                 }
             }, 1000);
        } else {
             if (typeof window.triggerDefeatAnimation === 'function') {
                 window.triggerDefeatAnimation('player');
             }
             // Wait for defeat animation
             setTimeout(() => {
                 this.state.party.shift(); // Remove fainted pokemon
                 this.updateUI();

                 if (this.state.party.length === 0) {
                     this.isFainting = false;
                     this.stopMultiplayerBattle();
                     setTimeout(() => {
                         if (typeof window.showGameAlert === 'function') {
                             window.showGameAlert("You lost the multiplayer battle.", "view-battle-stadium");
                         } else {
                             alert("You lost the multiplayer battle.");
                         }
                     }, 100);
                 } else {
                     this.isFainting = false;
                     const playerPokemon = this.state.party[0];
                     const enemyPokemon = this.activeEncounter;
                     const delay = Math.max(200, 1000 / this.state.settings.gameSpeed);

                     if (playerPokemon.currentStats.spe >= enemyPokemon.currentStats.spe) {
                         this.combatLoop = setTimeout(() => this.executeMultiplayerTurn(playerPokemon, enemyPokemon), delay);
                     } else {
                         this.combatLoop = setTimeout(() => this.executeMultiplayerTurn(enemyPokemon, playerPokemon), delay);
                     }
                 }
             }, 1000);
        }
    }

    startGymBattle(gymName) {
        const gym = this.getGym(gymName);
        if (!gym) return;

        let gymIndex = this.state.config.gyms.findIndex(g => g.name === gymName);
        if (gymIndex === -1) gymIndex = 0; // Fallback

        this.stop();
        this.gymState = {
            gymIndex: gymIndex,
            isActive: true,
            gym: gym,
            currentTrainerIndex: 0,
            inCombat: false
        };

        // Update gym UI specifically to show current trainer
        this.updateGymUI();
    }


    updateGymUI() {
        const vGym = document.getElementById("view-gym");
        const contentArea = document.getElementById("gym-content-area");
        if (!vGym || !contentArea) return;

        const gymTitleHeader = document.getElementById("gym-title-header");
        if (gymTitleHeader) {
            gymTitleHeader.style.display = "none";
        }

        const gym = this.gymState.gym;
        if (!gym) return;

        // Ensure no previous dynamic UI overlays
        const existingDynamicBg = document.getElementById('dynamic-gym-bg-ui');
        if (existingDynamicBg) {
            existingDynamicBg.remove();
        }

        // Apply elite 4 background during rest phase if applicable
        if (gym.name === "Kanto Pokemon League") {
            const trainerBGs = [
                'BG-Elite4-1Lorelei.png',
                'BG-Elite4-2Bruno.png',
                'BG-Elite4-3Agatha.png',
                'BG-Elite4-4Lance.png',
                'BG-Elite4-5Champion.png'
            ];
            let trainerIndex = this.gymState.currentTrainerIndex;
            if (trainerIndex >= trainerBGs.length) {
                trainerIndex = trainerBGs.length - 1; // Keep Champion BG after beating them
            }
            const bgImage = trainerBGs[trainerIndex] || 'BattleMode/Test.png';
            vGym.style.backgroundImage = `url('./Assets/BG/${bgImage}')`;
            vGym.style.backgroundSize = "cover";
        } else {
            // Check for dynamic background config
            if (this.state.config && this.state.config.gymAssets && this.state.config.gymAssets[gym.leader]) {
                const assetConfig = this.state.config.gymAssets[gym.leader];
                const spritePath = `./Assets/Gym/GymLeaders/${assetConfig.sprite}`;
                const bgPath = `./Assets/Gym/BG/${assetConfig.background}`;

                const dynamicBg = document.createElement('div');
                dynamicBg.id = 'dynamic-gym-bg-ui';
                dynamicBg.style.position = 'absolute';
                dynamicBg.style.top = '0';
                dynamicBg.style.left = '0';
                dynamicBg.style.width = '100%';
                dynamicBg.style.height = '100%';
                dynamicBg.style.zIndex = '0';
                dynamicBg.style.backgroundImage = `url('${bgPath}')`;
                dynamicBg.style.backgroundSize = '100% 100%';
                dynamicBg.style.overflow = 'hidden';

                const img = document.createElement('img');
                img.src = spritePath;
                img.style.position = 'absolute';
                img.style.left = `${assetConfig.position.rel_x * 100}%`;
                img.style.top = `${assetConfig.position.rel_y * 100}%`;
                img.style.width = `${(assetConfig.size.px_width / 1800) * 100}%`;
                img.style.transform = `rotate(${assetConfig.tilt.angle_deg}deg)`;
                img.style.transformOrigin = assetConfig.tilt.origin;
                img.style.pointerEvents = 'none';
                dynamicBg.replaceChildren();
                dynamicBg.appendChild(img);

                vGym.style.backgroundImage = 'none';
                vGym.style.position = 'relative'; // Ensure relative positioning
                vGym.insertBefore(dynamicBg, vGym.firstChild);
            } else {
                const gymIndex = this.gymState.gymIndex;
                const gymBGs = [
                    'BG-Gym-1-Pewter-Rock.png',
                    'BG-Gym-2-Cerulean-Water.png',
                    'BG-Gym-3-Vermilion-Electric.png',
                    'BG-Gym-4-Celadon-Grass.png',
                    'BG-Gym-5-Fuchsia-Poison.png',
                    'BG-Gym-6-Saffron-Psychic.png',
                    'BG-Gym-7-Cinnabar-Fire.png',
                    'BG-Gym-8-Viridian-Ground.png',
                    'IndigoPlateau.png',
                    '../Gym/BG/BG_Gym_Flying.png',
                    '../Gym/BG/BG_Gym_Bug.png',
                    '../Gym/BG/BG_Gym_Normal.png',
                    '../Gym/BG/BG_Gym_Ghost.png',
                    '../Gym/BG/BG_Gym_Fighting.png',
                    '../Gym/BG/BG_Gym_Steel.png',
                    '../Gym/BG/BG_Gym_Ice.png',
                    '../Gym/BG/BG_Gym_Dragon.png'
                ];
                const bgImage = gymBGs[gymIndex] || 'BattleMode/Test.png';
                vGym.style.backgroundImage = `url('./Assets/BG/${bgImage}')`;
                vGym.style.backgroundSize = "cover";
            }
        }

        const trainer = gym.trainers[this.gymState.currentTrainerIndex];


        if (trainer) {
            let trainerButtonsHtml = gym.trainers.map((t, index) => {
                const isLeader = index === gym.trainers.length - 1;
                const buttonText = isLeader ? `Fight Gym Leader` : `Fight Gym Trainer`;

                if (index < this.gymState.currentTrainerIndex) {
                    return `<button disabled class="action-btn" style="opacity: 0.5; width: 100%;">${buttonText} (Defeated)</button>`;
                } else if (index === this.gymState.currentTrainerIndex) {
                    return `<button id="btn-start-gym-battle" class="action-btn action-btn-primary" onclick="window.battleEngine.startNextGymBattle()" style="width: 100%;">${buttonText} (${escapeHTML(t.name)})</button>`;
                } else {
                    return `<button disabled class="action-btn" style="opacity: 0.5; width: 100%;">${buttonText} (${escapeHTML(t.name)})</button>`;
                }
            }).join('');

            // Rest phase UI
            contentArea.innerHTML = `
                <div id="gym-rest-area" style="display: flex; flex-direction: column; gap: 10px; width: 100%;">
                    <p style="font-size: 14px; margin-bottom: 10px;">You may organize your party.</p>
                    ${trainerButtonsHtml}
                    <button class="action-btn action-btn-danger" onclick="window.battleEngine.stopGymBattle()" style="margin-top: 10px; width: 100%;">Flee Gym</button>
                </div>
            `;
            // Temporary expose for the button
            window.battleEngine = this;

            // Re-bind to use our special gym start func that toggles visibility
            window.battleEngine.startNextGymBattle = () => {
                this.gymState.inCombat = true;
                if (typeof window.switchView === 'function') {
                    window.switchView("BATTLE_ARENA");
                }
                const leaderSpeed = this.state.party[0].currentStats.spe;
                const speedMult = this.getSpeedMultiplier();
            let slideDelay = this.state.config.balance.baseSearchTime * 1000 * (100 / (100 + leaderSpeed)) * speedMult;
            slideDelay = Math.max(300, slideDelay) / this.state.settings.gameSpeed;
            this.generateGymEncounter(slideDelay);
            };
        } else {
            // Gym completed
            const htmlContent = `
                <h3>You defeated ${escapeHTML(gym.leader)}!</h3>
                <p>A Gift is awaiting for you.</p>
                <button class="action-btn action-btn-primary" onclick="window.battleEngine.stopGymBattle()" style="margin-top: 10px; width: 100%;">Leave</button>
            `;
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlContent, 'text/html');
            contentArea.innerHTML = '';
            while (doc.body.firstChild) {
                contentArea.appendChild(doc.body.firstChild);
            }
            window.battleEngine = this;
        }
    }

    stopGymBattle() {
        this.gymState.isActive = false;
        this.gymState.gym = null;
        this.gymState.gymIndex = 0;
        this.stop();

        // Return to normal map or idle
        if (typeof window.navigateToLocation === 'function') {
             // Reset UI back to just the gym entry
             window.navigateToLocation(this.state.currentRoute);
        }
    }

    async searchNext() {
        // Prevent searching if we are in the middle of fading out/fainting
        if (this.isFainting) {
            return;
        }

        if (this.state.party.every(p => p.currentHp <= 0)) {
            this.handleWipeout();
            return;
        }

        if (this.state.currentRoute === 'Johto Safari Zone') {
            encounterCost = 80;
            requiresPayment = true;
        } else if (this.state.currentRoute === 'Safari Zone' || this.state.currentRoute === 'Kanto Safari Zone') {
            encounterCost = 150;
            requiresPayment = true;
        } else if (this.state.currentRoute && this.state.currentRoute.startsWith("Casino - ")) {
            const baseCostStandard = this.state.config.balance.casinoPrices?.standard || 10;
            const baseCostSpecial = this.state.config.balance.casinoPrices?.doubleShiny || 20;
            encounterCost = this.state.casinoDoubleShiny ? baseCostSpecial : baseCostStandard;
            requiresPayment = true;
        } else if (this.state.currentRoute === 'Celadon Casino' || ['Starter Troupe', 'Babies', 'Special Spot', 'Eeveelution', 'Late Troupe'].includes(this.state.currentRoute)) {
            const casinoPrices = (typeof window !== 'undefined' && window.state && window.state.config && window.state.config.casinoPrices) || this.state.config.balance.casinoPrices || {};
            encounterCost = casinoPrices[this.state.currentRoute] || 120;
            requiresPayment = true;
        } else if (this.state.currentRoute === 'Goldenrod Baby Corner') {
            encounterCost = 5;
            requiresPayment = true;
        } else if (this.state.currentRoute === 'Goldenrod Game Corner' || this.state.currentRoute === 'Goldenrod Lucky Spot Corner') {
            encounterCost = 10;
            requiresPayment = true;
        } else if (this.state.currentRoute && this.state.currentRoute.startsWith("Casino - ")) {
            const baseCostStandard = this.state.config.balance.casinoPrices?.standard || 10;
            const baseCostSpecial = this.state.config.balance.casinoPrices?.doubleShiny || 20;
            encounterCost = this.state.casinoDoubleShiny ? baseCostSpecial : baseCostStandard;
            requiresPayment = true;
        }

        while (totalSimTime < maxTime) {
            // Check if wiped out
            if (!this.state.party.some(p => p.currentHp > 0)) {
                results.fainted = true;
                break;
            }

            // Check if can pay for encounter
            if (requiresPayment) {
                if (this.state.trainer.money < encounterCost) {
                    results.outOfMoney = true;
                    break;
                }
                this.state.trainer.money -= encounterCost;
            }

            let leader = this.state.party[0];

            // Generate Encounter explicitly without UI triggers
            let pokemonBase;
            let level;
            let q;
            let ivs;

            // Simplify spawn logic for background
            let selectedSpawn = this.getSpawnForRoute(route);
            if(!selectedSpawn) {
                totalSimTime += 5000;
                continue;
            }

            pokemonBase = this.getPokemonBase(selectedSpawn.pokemonId);
            level = Math.floor(Math.random() * (selectedSpawn.maxLevel - selectedSpawn.minLevel + 1)) + selectedSpawn.minLevel;

            if (this.state.currentRoute === "Route 1") {
                const playerLevel = leader.level || 1;
                level = Math.min(level, playerLevel);
            }

            q = mathEngine.generateQuality(this.state.stats, this.state.casinoDoubleShiny);

            if (selectedSpawn && selectedSpawn.forceShiny) {
                q = { name: "Shiny", q: 2.00 };
            }

            if (!this.state.stats.seenSpecies) this.state.stats.seenSpecies = {};
            this.state.stats.seenSpecies[pokemonBase.name] = true;

            if (q.name === "Shiny") {
                if (this.state.currentRoute === 'Casino') {
                    if (typeof window !== 'undefined' && typeof window.trackDailyChallenge === 'function') window.trackDailyChallenge('casino_shiny');
                }
                this.state.stats.shiniesSeen = (this.state.stats.shiniesSeen || 0) + 1;
                if (!this.state.stats.seenShiniesSpecies) this.state.stats.seenShiniesSpecies = {};
                this.state.stats.seenShiniesSpecies[pokemonBase.name] = true;
            }
            ivs = mathEngine.generateIVs(this.state.stats, q.name === "Shiny");

            const stats = {
                hp: mathEngine.calculateHP(pokemonBase.hp, ivs.hp, level, q.q),
                atk: mathEngine.calculateStat(pokemonBase.atk, ivs.atk, level, q.q),
                def: mathEngine.calculateStat(pokemonBase.def, ivs.def, level, q.q),
                spa: mathEngine.calculateStat(pokemonBase.spa, ivs.spa, level, q.q),
                spd: mathEngine.calculateStat(pokemonBase.spd, ivs.spd, level, q.q),
                spe: mathEngine.calculateStat(pokemonBase.spe, ivs.spe, level, q.q),
            };

            const totalIV = ivs.hp + ivs.atk + ivs.def + ivs.spa + ivs.spd + ivs.spe;
            const bst = pokemonBase.hp + pokemonBase.atk + pokemonBase.def + pokemonBase.spa + pokemonBase.spd + pokemonBase.spe;
            const evxp = mathEngine.calculateEVXP(bst, level, q.q, totalIV);
            const evm = mathEngine.calculateEVM(bst, level, q.q, totalIV);
            const pp = mathEngine.calculatePP(bst, level, q.q, totalIV);

            this.activeEncounter = {
                id: pokemonBase.id,
                name: pokemonBase.name,
                types: pokemonBase.types,
                level: level,
                qualityName: q.name,
                quality: q.q,
                ivs: ivs,
                currentStats: stats,
                maxHp: stats.hp,
                currentHp: stats.hp,
                xp: mathEngine.calculateTotalXP(level),
                evxp: evxp, evm: evm, pp: pp,
                bst: bst,
                moves: this.getLearnsetMoves(pokemonBase, level),
                xp: mathEngine.calculateTotalXP(level)
            };

            let leaderSpe = leader.currentStats ? leader.currentStats.spe : 10;
            let enemySpe = this.activeEncounter.currentStats ? this.activeEncounter.currentStats.spe : 10;

            // Accurate search time to mimic Natural play at 1x speed
            let searchTime = this.state.config.balance.baseSearchTime * 1000 * (100 / (100 + leaderSpe));
            searchTime = Math.max(300, searchTime);

            // Add slide-in animation delay that occurs in Natural play (1000ms at 1x speed)
            searchTime += 1000;

            // Accurate Combat Simulation Loop
            let combatTime = 0;
            let leaderConsecutiveHeals = 0;

            // Leader and Enemy attack delays
            let leaderDelay = this.state.config.balance.baseAttackDelay * 1000 * (100 / (100 + leaderSpe));
            leaderDelay = Math.max(250, leaderDelay);
            let enemyDelay = this.state.config.balance.baseAttackDelay * 1000 * (100 / (100 + enemySpe));
            enemyDelay = Math.max(250, enemyDelay);

            // Which goes first
            let isLeaderFaster = leaderDelay <= enemyDelay;
            let firstDelay = Math.min(leaderDelay, enemyDelay);

            const executeSimulatedTurn = (attacker, defender, isLeader) => {
                if (isLeader && this.state.settings.autoPotion) {
                    let threshold = this.state.settings.autoPotionThreshold !== undefined ? this.state.settings.autoPotionThreshold : 25;
                    let hpPercentage = (attacker.currentHp / attacker.maxHp) * 100;

                    if (hpPercentage <= threshold) {
                        if (leaderConsecutiveHeals >= 3) {
                            leaderConsecutiveHeals = 0;
                        } else {
                            if (this.tryUsePotion(attacker)) {
                                leaderConsecutiveHeals++;
                                return true; // Potion takes the turn
                            }
                        }
                    } else {
                        leaderConsecutiveHeals = 0;
                    }
                }

                const move = this.getBestMove(attacker, defender);
                const isPhysical = move.category === 'Physical';
                const atkStat = isPhysical ? attacker.currentStats.atk : attacker.currentStats.spa;
                const defStat = isPhysical ? defender.currentStats.def : defender.currentStats.spd;
                const eff = this.getTypeEffectiveness(move.type, defender.types);

                const hit = mathEngine.calculateDamage(attacker.level, move.power, atkStat, defStat, eff, attacker.quality);
                defender.currentHp -= hit.damage;

                if (defender.currentHp <= 0) {
                    let explosionMove = this.getExplosionMove(defender);
                    if (explosionMove) {
                        const isPhys = explosionMove.category === 'Physical';
                        const atkS = isPhys ? defender.currentStats.atk : defender.currentStats.spa;
                        const defS = isPhys ? attacker.currentStats.def : attacker.currentStats.spd;
                        const e = this.getTypeEffectiveness(explosionMove.type, attacker.types);
                        const expHit = mathEngine.calculateDamage(defender.level, explosionMove.power, atkS, defS, e, defender.quality);
                        attacker.currentHp -= expHit.damage;
                    }
                }

                return false; // Not a potion, just an attack
            };

            while (leader.currentHp > 0 && this.activeEncounter.currentHp > 0) {
                let firstActor = isLeaderFaster ? leader : this.activeEncounter;
                let secondActor = isLeaderFaster ? this.activeEncounter : leader;

                combatTime += firstDelay;

                // First turn
                executeSimulatedTurn(firstActor, secondActor, isLeaderFaster);

                if (secondActor.currentHp <= 0) break;

                // Second turn (delay before second actor strikes)
                let secondDelay = isLeaderFaster ? enemyDelay : leaderDelay;
                combatTime += secondDelay;

                executeSimulatedTurn(secondActor, firstActor, !isLeaderFaster);
            }

            // Add UI defeat/faint fade-out delay mimicking natural play
            combatTime += 500;

            // End of combat logic
            if (leader.currentHp > 0) {
                // Out of combat insta-heal if threshold is met, identical to handleEnemyDefeat
                if (this.state.settings.autoPotion) {
                    let threshold = this.state.settings.autoPotionThreshold !== undefined ? this.state.settings.autoPotionThreshold : 25;
                    while ((leader.currentHp / leader.maxHp) * 100 <= threshold) {
                        if (!this.tryUsePotion(leader)) break;
                    }
                }

                this.state.stats.bonusCandyDefeats = (this.state.stats.bonusCandyDefeats || 0) + 1;
                if (this.state.stats.bonusCandyDefeats >= WHITE_CANDY_DEFEAT_REQUIREMENT) {
                    this.state.stats.bonusCandyDefeats -= WHITE_CANDY_DEFEAT_REQUIREMENT;
                    this.state.stats.whiteCandies = (this.state.stats.whiteCandies || 0) + 1;
                }

                // Track Daily Challenges
                if (typeof window !== 'undefined' && typeof window.trackDailyChallenge === 'function') {
                    window.trackDailyChallenge('defeat_level', { level: this.activeEncounter.level, playerLevel: leader.level });
                    window.trackDailyChallenge('defeat_type', { types: this.activeEncounter.types });
                    window.trackDailyChallenge('defeat_species', { species: this.activeEncounter.name });
                    window.trackDailyChallenge('defeat_underdog', { level: this.activeEncounter.level, playerLevel: leader.level });

                    if (this.state.stats.dailyChallenges) {
                        window.trackDailyChallenge('defeat_endurance', { streak: 1 });

                        if (this.state.currentRoute === this.state.stats.dailyChallenges.currentRoute) {
                            window.trackDailyChallenge('defeat_single_route', { streak: 2 });
                        } else {
                            this.state.stats.dailyChallenges.currentRoute = this.state.currentRoute;
                            window.trackDailyChallenge('defeat_single_route', { streak: 1 });
                        }
                    }

                    if (this.turnCount === 1) {
                         window.trackDailyChallenge('defeat_1_turn');
                    }
                }

                if (this.state.settings.autoCatch) {
                    const ballResult = this.throwPokeball();
                    if (ballResult.caught) {
                        let caughtPokemon = this.cloneEncounter(this.activeEncounter);
                        let trackingName = this.activeEncounter.name;

                        if (caughtPokemon.isDisguisedDitto) {
                            const dittoBase = this.getPokemonBase(132);
                            caughtPokemon.id = 132;
                            caughtPokemon.name = "Ditto";
                            caughtPokemon.types = ["Normal"];

                            const level = caughtPokemon.level;
                            const ivs = caughtPokemon.ivs;
                            const q = caughtPokemon.quality;

                            caughtPokemon.currentStats = {
                                hp: mathEngine.calculateHP(dittoBase.hp, ivs.hp, level, q),
                                atk: mathEngine.calculateStat(dittoBase.atk, ivs.atk, level, q),
                                def: mathEngine.calculateStat(dittoBase.def, ivs.def, level, q),
                                spa: mathEngine.calculateStat(dittoBase.spa, ivs.spa, level, q),
                                spd: mathEngine.calculateStat(dittoBase.spd, ivs.spd, level, q),
                                spe: mathEngine.calculateStat(dittoBase.spe, ivs.spe, level, q),
                            };

                            caughtPokemon.maxHp = caughtPokemon.currentStats.hp;
                            caughtPokemon.currentHp = caughtPokemon.currentStats.hp;

                            const bst = dittoBase.hp + dittoBase.atk + dittoBase.def + dittoBase.spa + dittoBase.spd + dittoBase.spe;
                            const totalIV = ivs.hp + ivs.atk + ivs.def + ivs.spa + ivs.spd + ivs.spe;

                            caughtPokemon.bst = bst;
                            caughtPokemon.evxp = mathEngine.calculateEVXP(bst, level, q, totalIV);
                            caughtPokemon.evm = mathEngine.calculateEVM(bst, level, q, totalIV);
                            caughtPokemon.pp = mathEngine.calculatePP(bst, level, q, totalIV);
                            caughtPokemon.moves = this.getLearnsetMoves(dittoBase, level);

                            trackingName = "Ditto";

                            // Fix the level 100 jump bug by setting xp explicitly to the exact minimum needed for their captured level
                            caughtPokemon.xp = mathEngine.calculateTotalXP(caughtPokemon.level);
                            delete caughtPokemon.isDisguisedDitto;
                        }

                        if (!this.state.stats.caughtSpecies) this.state.stats.caughtSpecies = {};
                        if (!this.state.stats.caughtSpecies[trackingName]) {
                            this.state.stats.caughtSpeciesCount = (this.state.stats.caughtSpeciesCount || 0) + 1;
                        }
                        this.state.stats.caughtSpecies[trackingName] = (this.state.stats.caughtSpecies[trackingName] || 0) + 1;
                        this.state.storage.push(caughtPokemon);
                        results.caughtPokemonList.push(caughtPokemon);
                        this.state.stats.caught++;
                        if (caughtPokemon.level > (this.state.stats.highestLevelCaptured || 0)) this.state.stats.highestLevelCaptured = caughtPokemon.level;
                        if (caughtPokemon.quality > (this.state.stats.highestQualityCaptured || 0)) this.state.stats.highestQualityCaptured = caughtPokemon.quality;
                        let sumIV_ZzZ = caughtPokemon.ivs.hp + caughtPokemon.ivs.atk + caughtPokemon.ivs.def + caughtPokemon.ivs.spa + caughtPokemon.ivs.spd + caughtPokemon.ivs.spe;
                        if (sumIV_ZzZ > (this.state.stats.highestSumIVCaptured || 0)) this.state.stats.highestSumIVCaptured = sumIV_ZzZ;

                        // Track Daily Challenges
                        if (typeof window !== 'undefined' && typeof window.trackDailyChallenge === 'function') {
                            window.trackDailyChallenge('catch_sum_iv', { sumIv: sumIV_ZzZ });
                            window.trackDailyChallenge('catch_level', { level: caughtPokemon.level });
                        }
                        if (this.activeEncounter.qualityName === "Shiny") this.state.stats.shiniesCaught = (this.state.stats.shiniesCaught || 0) + 1;
                        if (this.activeEncounter.qualityName === "Shiny") {
                            if (!this.state.stats.caughtShiniesSpecies) this.state.stats.caughtShiniesSpecies = {};
                            this.state.stats.caughtShiniesSpecies[trackingName] = true;
                        }
                    }
                }

                const lootMultiplier = 1 + (0.0025 * (this.state.stats.greenCandies || 0));
                const moneyMultiplier = 1 + (0.01 * (this.state.stats.greenCandies || 0));
                this.grantXP(leader, evxp, false);
        if (typeof window !== 'undefined' && typeof window.trackDailyChallenge === 'function') window.trackDailyChallenge('gain_exp', { amount: evxp });
                let earnedZzZ = Math.floor(evm * moneyMultiplier);
                this.state.trainer.money += earnedZzZ;
                if (typeof window !== 'undefined' && typeof window.trackDailyChallenge === 'function') {
                    window.trackDailyChallenge('earn_money', { amount: earnedZzZ });
                }

                // Add loot drops
                const lootTier = this.getLootTier();
                let dropRate = 0;
                const evoStage = this.getEvolutionStage(this.activeEncounter.id);

                if (evoStage === 2) dropRate = 0.005;
                else if (evoStage >= 3) dropRate = 0.01;

                if (this.activeEncounter.qualityName === "Shiny" && evoStage >= 2) {
                    dropRate = 1.0;
                }

                if (lootTier >= 3 && Math.random() < (dropRate * lootMultiplier) && this.activeEncounter.types && this.activeEncounter.types.length > 0) {
                    const types = this.activeEncounter.types;
                    const randomType = types[Math.floor(Math.random() * types.length)];
                    const stoneName = `${randomType} Stone`;

                    let dropQuantity = Math.floor(lootMultiplier);
                    if (Math.random() < (lootMultiplier % 1)) dropQuantity += 1;

                    if (!this.state.backpack.stones) this.state.backpack.stones = {};
                    this.state.backpack.stones[stoneName] = (this.state.backpack.stones[stoneName] || 0) + dropQuantity;
                    results.itemsLooted[stoneName] = (results.itemsLooted[stoneName] || 0) + dropQuantity;
                }

                let sumIV = 0;
                if (this.activeEncounter.ivs) {
                    sumIV = this.activeEncounter.ivs.hp + this.activeEncounter.ivs.atk + this.activeEncounter.ivs.def +
                            this.activeEncounter.ivs.spa + this.activeEncounter.ivs.spd + this.activeEncounter.ivs.spe;
                }

                // Vitamin drops
                if (lootTier >= 4 && sumIV > 500 && this.activeEncounter?.quality > 1.6 && Math.random() < (0.1 * lootMultiplier)) {
                    const vitamins = VITAMINS;
                    const randomVitamin = vitamins[Math.floor(Math.random() * vitamins.length)];

                    let dropQuantity = Math.floor(lootMultiplier);
                    if (Math.random() < (lootMultiplier % 1)) dropQuantity += 1;

                    if (!this.state.backpack.stones) this.state.backpack.stones = {};
                    this.state.backpack.stones[randomVitamin] = (this.state.backpack.stones[randomVitamin] || 0) + dropQuantity;
                    results.itemsLooted[randomVitamin] = (results.itemsLooted[randomVitamin] || 0) + dropQuantity;
                }

                let itemDropChance = (2.0 * (sumIV / 600)) / 100.0;
                let level = this.activeEncounter.level || 1;
                let ballTierName = "Pokeball";
                let potionTierName = "Tiny Potion";

                if (level <= 15) {
                    ballTierName = "Pokeball";
                    potionTierName = "Tiny Potion";
                } else if (level <= 35) {
                    ballTierName = "Pokeball";
                    potionTierName = "Small Potion";
                } else if (level <= 55) {
                    ballTierName = "Greatball";
                    potionTierName = "Regular Potion";
                } else if (level <= 75) {
                    ballTierName = "Greatball";
                    potionTierName = "Big Potion";
                } else {
                    ballTierName = "Ultraball";
                    potionTierName = "Huge Potion";
                }

                if (lootTier >= 2 && Math.random() < itemDropChance) {
                    let ballDropQty = Math.floor(lootMultiplier);
                    if (Math.random() < (lootMultiplier % 1)) ballDropQty += 1;

                    const currentBalls = mathEngine.getCurrentCount(this.state, 'balls');
                    const maxBalls = mathEngine.getCapacity(this.state, 'balls');
                    if (currentBalls + ballDropQty > maxBalls && ballTierName !== 'Masterball') {
                        const spaceLeft = maxBalls - currentBalls;
                        if (spaceLeft > 0) {
                            if (!this.state.backpack.pokeballs) this.state.backpack.pokeballs = {};
                            this.state.backpack.pokeballs[ballTierName] = (this.state.backpack.pokeballs[ballTierName] || 0) + spaceLeft;
                            results.itemsLooted[ballTierName] = (results.itemsLooted[ballTierName] || 0) + spaceLeft;
                        }
                        results.itemsMissed[ballTierName] = (results.itemsMissed[ballTierName] || 0) + (ballDropQty - spaceLeft);
                    } else {
                        if (!this.state.backpack.pokeballs) this.state.backpack.pokeballs = {};
                        this.state.backpack.pokeballs[ballTierName] = (this.state.backpack.pokeballs[ballTierName] || 0) + ballDropQty;
                        results.itemsLooted[ballTierName] = (results.itemsLooted[ballTierName] || 0) + ballDropQty;
                    }
                }

                if (lootTier >= 1 && Math.random() < itemDropChance) {
                    let potionDropQty = Math.floor(lootMultiplier);
                    if (Math.random() < (lootMultiplier % 1)) potionDropQty += 1;

                    const currentPotions = mathEngine.getCurrentCount(this.state, 'potions');
                    const maxPotions = mathEngine.getCapacity(this.state, 'potions');
                    if (currentPotions + potionDropQty > maxPotions) {
                        const spaceLeft = maxPotions - currentPotions;
                        if (spaceLeft > 0) {
                            if (!this.state.backpack.potions) this.state.backpack.potions = {};
                            this.state.backpack.potions[potionTierName] = (this.state.backpack.potions[potionTierName] || 0) + spaceLeft;
                            results.itemsLooted[potionTierName] = (results.itemsLooted[potionTierName] || 0) + spaceLeft;
                        }
                        results.itemsMissed[potionTierName] = (results.itemsMissed[potionTierName] || 0) + (potionDropQty - spaceLeft);
                    } else {
                        if (!this.state.backpack.potions) this.state.backpack.potions = {};
                        this.state.backpack.potions[potionTierName] = (this.state.backpack.potions[potionTierName] || 0) + potionDropQty;
                        results.itemsLooted[potionTierName] = (results.itemsLooted[potionTierName] || 0) + potionDropQty;
                    }
                }

                this.state.stats.battlesWon++;
            } else {
                leader.currentHp = 0;
                const fainted = this.state.party.shift();

                // Revert Ditto Transformation on Faint
                if (fainted && fainted.isTransformed && fainted.transformedIntoId) {
                    fainted.isTransformed = false;
                    fainted.transformedIntoId = null;
                    fainted.transformedIntoName = null;
                    fainted.id = 132;
                    fainted.name = 'Ditto';

                    const newBase = this.getPokemonBase(132);
                    if (newBase) {
                        fainted.types = newBase.types;
                        fainted.bst = newBase.hp + newBase.atk + newBase.def + newBase.spa + newBase.spd + newBase.spe;
                        fainted.maxHp = Math.floor((((2 * newBase.hp + fainted.ivs.hp) * fainted.level / 100) + fainted.level + 10) * fainted.quality);
                        fainted.currentStats.atk = Math.floor((((2 * newBase.atk + fainted.ivs.atk) * fainted.level / 100) + 5) * fainted.quality);
                        fainted.currentStats.def = Math.floor((((2 * newBase.def + fainted.ivs.def) * fainted.level / 100) + 5) * fainted.quality);
                        fainted.currentStats.spa = Math.floor((((2 * newBase.spa + fainted.ivs.spa) * fainted.level / 100) + 5) * fainted.quality);
                        fainted.currentStats.spd = Math.floor((((2 * newBase.spd + fainted.ivs.spd) * fainted.level / 100) + 5) * fainted.quality);
                        fainted.currentStats.spe = Math.floor((((2 * newBase.spe + fainted.ivs.spe) * fainted.level / 100) + 5) * fainted.quality);
                        fainted.currentHp = Math.min(fainted.currentHp, fainted.maxHp);

                        fainted.moves = this.getLearnsetMoves(newBase, fainted.level).slice(-4);
                    }
                }

                this.state.party.push(fainted);
            }

            totalSimTime += searchTime + combatTime;
        }

        results.money = this.state.trainer.money - lastKnownMoney;
        results.caught = this.state.stats.caught - lastKnownCaught;
        results.shinies = (this.state.stats.shiniesCaught || 0) - lastKnownShinies;
        results.encounters = (this.state.stats.battlesWon || 0) - lastKnownEncounters;
        results.shinyEncounters = (this.state.stats.shiniesSeen || 0) - lastKnownShinyEncounters;

        let finalBalls = this.state.settings.activeBallTier >= 0 ?
            this.state.backpack.pokeballs[this.state.config.balance.items.pokeballs[this.state.settings.activeBallTier].name] || 0 : 0;
        let finalPotions = this.state.settings.activePotionTier >= 0 ?
            this.state.backpack.potions[this.state.config.balance.items.potions[this.state.settings.activePotionTier].name] || 0 : 0;

        results.ballsUsed = Math.max(0, initialBalls - finalBalls);
        results.potionsUsed = Math.max(0, initialPotions - finalPotions);

        results.simulatedTimeMs = totalSimTime;
        results.xpEarned = this.state.party[0] ? this.state.party[0].xp - initialLeaderXP : 0;

        if (results.fainted) {
            // Track faint
            this.state.stats.faints = (this.state.stats.faints || 0) + 1;
            // Heal all
            this.state.party.forEach(p => p.currentHp = p.maxHp);
            this.state.currentRoute = "PokeCenter & PokeMarket";
        }

        return results;
    }
}

export default BattleSystem;