import fs from 'fs';
import assert from 'node:assert';
import test, { beforeEach } from 'node:test';

// The project does not use "type": "module" and relies on electron packaging or a bundler.
// Node cannot natively import unbundled ES modules in this configuration without throwing SyntaxErrors.
// This is explicitly noted in the project memory:
// "Node utility scripts cannot natively import project configuration files ... using ES6 imports because the project's package.json lacks 'type': 'module'. Parsing the file contents as strings using Regex, eval(), or stripping exports for new Function() is a required workaround for standalone script execution."

const stateJsContent = fs.readFileSync('src/state.js', 'utf8');
const stateJsCleaned = stateJsContent
    .replace(/export (const|let|var|function|default)/g, '$1')
    .replace(/export {.*?};?/g, '')
    .replace(/import .*?;\n?/g, '');

global.window = {};

let state, swapRegion, REGION_TEMPLATE, initialState;

function setupModule() {
    const context = { window: global.window, globals: {} };
    const setupFn = new Function('context', `
        ${stateJsCleaned}
        return { state, swapRegion, REGION_TEMPLATE };
    `);
    const exports = setupFn(context);
    state = exports.state;
    swapRegion = exports.swapRegion;
    REGION_TEMPLATE = exports.REGION_TEMPLATE;

    // Deep copy of the initial state to restore before each test
    initialState = JSON.parse(JSON.stringify(state));
}

beforeEach(() => {
    // We recreate the state object cleanly before each test to prevent mutation leakage
    setupModule();
});

test('swapRegion does nothing if swapping to the current region', () => {
    // Set a baseline
    state.currentRegionName = 'Kanto';
    state.trainer.money = 100;

    // Swap to the same region
    swapRegion('Kanto');

    // Should not have packed the region into state.regions['Kanto']
    assert.deepStrictEqual(state.regions, {});
    assert.strictEqual(state.trainer.money, 100);
});

test('swapRegion packs current region and initializes a new standard region', () => {
    state.currentRegionName = 'Kanto';
    state.trainer.money = 500; // Modify current state to verify packing
    state.currentRoute = 'Route 2';

    swapRegion('Hoenn');

    // Verify Kanto was packed properly
    assert.ok(state.regions['Kanto']);
    assert.strictEqual(state.regions['Kanto'].trainer.money, 500);
    assert.strictEqual(state.regions['Kanto'].currentRoute, 'Route 2');

    // Verify Hoenn was initialized correctly
    assert.strictEqual(state.currentRegionName, 'Hoenn');
    assert.strictEqual(state.trainer.money, REGION_TEMPLATE.trainer.money);
    assert.strictEqual(state.currentRoute, REGION_TEMPLATE.currentRoute); // 'Route 1' default
});

test('swapRegion initializes Johto with specific starting routes', () => {
    state.currentRegionName = 'Kanto';

    swapRegion('Johto');

    // Verify Johto specific setup
    assert.strictEqual(state.currentRegionName, 'Johto');
    assert.strictEqual(state.currentRoute, 'Route 29');
    assert.deepStrictEqual(state.stats.activeChallenges, ['Route 29']);

    // Verify it is saved in regions correctly too
    assert.strictEqual(state.regions['Johto'].currentRoute, 'Route 29');
});

test('swapRegion restores an existing region from state.regions correctly', () => {
    // Start Kanto, set some state
    state.currentRegionName = 'Kanto';
    state.trainer.money = 1234;

    // Swap to Johto
    swapRegion('Johto');

    // Johto state modifications
    state.trainer.money = 5678;

    // Swap back to Kanto
    swapRegion('Kanto');

    // Verify Kanto was restored
    assert.strictEqual(state.currentRegionName, 'Kanto');
    assert.strictEqual(state.trainer.money, 1234);

    // Verify Johto was packed
    assert.strictEqual(state.regions['Johto'].trainer.money, 5678);
});
