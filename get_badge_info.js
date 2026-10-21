function getBadgeByGymIndex(gymIndex) {
    if (gymIndex >= 0 && gymIndex <= 7) return { region: 'Kanto', number: gymIndex + 1 };
    if (gymIndex === 8) return null; // Indigo Plateau
    if (gymIndex >= 9 && gymIndex <= 16) return { region: 'Johto', number: gymIndex - 8 };
    if (gymIndex >= 17 && gymIndex <= 24) return { region: 'Sinnoh', number: gymIndex - 16 };
    if (gymIndex >= 25 && gymIndex <= 32) return { region: 'Unova2', number: gymIndex - 24 };

    // Wait, Hoenn, Kalos, Alola, Galar, Hisui, Paldea ?
    // Where are they in gyms.js? Let's check!
    return { region: 'Kanto', number: gymIndex + 1 };
}
