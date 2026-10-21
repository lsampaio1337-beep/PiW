const gyms = [
  { name: "Pewter Gym", index: 0, expectedRegion: "Kanto", expectedNumber: 1 },
  { name: "Cerulean Gym", index: 1, expectedRegion: "Kanto", expectedNumber: 2 },
  { name: "Vermilion Gym", index: 2, expectedRegion: "Kanto", expectedNumber: 3 },
  { name: "Celadon Gym", index: 3, expectedRegion: "Kanto", expectedNumber: 4 },
  { name: "Fuchsia Gym", index: 4, expectedRegion: "Kanto", expectedNumber: 5 },
  { name: "Saffron Gym", index: 5, expectedRegion: "Kanto", expectedNumber: 6 },
  { name: "Cinnabar Gym", index: 6, expectedRegion: "Kanto", expectedNumber: 7 },
  { name: "Viridian Gym", index: 7, expectedRegion: "Kanto", expectedNumber: 8 },
  { name: "Indigo Plateau", index: 8, expectedRegion: null, expectedNumber: null },
  { name: "Violet Gym", index: 9, expectedRegion: "Johto", expectedNumber: 1 },
  { name: "Azalea Gym", index: 10, expectedRegion: "Johto", expectedNumber: 2 },
  { name: "Goldenrod Gym", index: 11, expectedRegion: "Johto", expectedNumber: 3 },
  { name: "Ecruteak Gym", index: 12, expectedRegion: "Johto", expectedNumber: 4 },
  { name: "Cianwood Gym", index: 13, expectedRegion: "Johto", expectedNumber: 5 },
  { name: "Olivine Gym", index: 14, expectedRegion: "Johto", expectedNumber: 6 },
  { name: "Mahogany Gym", index: 15, expectedRegion: "Johto", expectedNumber: 7 },
  { name: "Blackthorn Gym", index: 16, expectedRegion: "Johto", expectedNumber: 8 },
  { name: "Oreburgh Gym", index: 17, expectedRegion: "Sinnoh", expectedNumber: 1 },
];

function getRegionAndBadgeNumber(gymIndex) {
    if (gymIndex >= 0 && gymIndex <= 7) return { region: "Kanto", number: gymIndex + 1 };
    if (gymIndex >= 9 && gymIndex <= 16) return { region: "Johto", number: gymIndex - 8 };
    if (gymIndex >= 17 && gymIndex <= 24) return { region: "Sinnoh", number: gymIndex - 16 };
    if (gymIndex >= 25 && gymIndex <= 32) return { region: "Unova", number: gymIndex - 24 };
    if (gymIndex >= 33 && gymIndex <= 40) return { region: "Hoenn", number: gymIndex - 32 };
    // What is Hoenn's index? Wait, from gyms.js: 17 is Oreburgh (Sinnoh), wait... let's check Hoenn.
    return { region: "Unknown", number: 0 };
}

gyms.forEach(g => {
    if (g.index === 8) return; // Indigo plateau doesn't have a badge
    const res = getRegionAndBadgeNumber(g.index);
    console.log(`Gym: ${g.name}, Expected: ${g.expectedRegion} ${g.expectedNumber}, Got: ${res.region} ${res.number}`);
});
