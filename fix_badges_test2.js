function getBadgeInfo(gymIndex) {
    let region = 'Kanto';
    let badgeNum = gymIndex + 1;

    if (gymIndex >= 0 && gymIndex <= 7) {
        region = 'Kanto';
        badgeNum = gymIndex + 1;
    } else if (gymIndex >= 9 && gymIndex <= 16) {
        region = 'Johto';
        badgeNum = gymIndex - 8;
    } else if (gymIndex >= 17 && gymIndex <= 24) {
        region = 'Sinnoh';
        badgeNum = gymIndex - 16;
    } else if (gymIndex >= 25 && gymIndex <= 32) {
        region = 'Unova';
        badgeNum = gymIndex - 24;
    }

    return { region, badgeNum };
}

// But actually, where is Hoenn? Hoenn is missing from gyms.js but what if it's there? Wait, the game has Kanto, Johto, Hoenn, Sinnoh, Unova, Kalos, Alola, Galar, Hisui, Paldea...
// Wait, looking at memory: "The canonical gym order for the Hoenn region (Region 3) is Rustboro (1), Dewford (2), Mauville (3), Lavaridge (4), Petalburg (5), Fortree (6), Mossdeep (7), and Sootopolis (8)."
// However, the test output shows no Hoenn gyms in gyms.js. Maybe they aren't implemented yet in config/gyms.js?
// Let's verify if Hoenn exists in gyms.js! No, it didn't in the list above. Wait, Oreburgh Gym is Sinnoh! Hoenn must have been skipped or added after Sinnoh in gyms.js? No, the list went Kanto -> Johto -> Sinnoh -> Unova.
// That is very interesting!
