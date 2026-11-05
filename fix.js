// Wait, looking at grep, it seems `state.regions` is indexed by `regionName`, not region id!
// src/state.js:164: state.regions[currentRegion] = {};
// But currentRegion is actually currentRegionName ? Let's check how state.regions is indexed.
