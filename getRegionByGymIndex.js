const gyms = [
    { region: 'Kanto', start: 0, end: 7 },
    { region: 'Johto', start: 9, end: 16 },
    { region: 'Sinnoh', start: 17, end: 24 },
    { region: 'Unova2', start: 25, end: 32 }
];

function getBadgeRegionAndNumber(gymIndex) {
    if (gymIndex >= 0 && gymIndex <= 7) return { region: 'Kanto', number: gymIndex + 1 };
    if (gymIndex >= 9 && gymIndex <= 16) return { region: 'Johto', number: gymIndex - 8 };
    if (gymIndex >= 17 && gymIndex <= 24) return { region: 'Sinnoh', number: gymIndex - 16 };
    if (gymIndex >= 25 && gymIndex <= 32) return { region: 'Unova', number: gymIndex - 24 };

    // Memory says: "When mapping local badge counts to global gymIndex values for UI elements or logic (like pending gifts), use the appropriate regional offset: Kanto gyms are 0-7, Indigo Plateau is 8 (no badge), Johto gyms are 9-16, and Hoenn gyms are 17-24."
    // Wait! Memory says Hoenn gyms are 17-24!
    // Let me check that.
}
