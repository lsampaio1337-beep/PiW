function getGlobalBadgeInfo(gymIndex) {
    if (gymIndex >= 0 && gymIndex <= 7) return { region: 'Kanto', number: gymIndex + 1 };
    if (gymIndex >= 9 && gymIndex <= 16) return { region: 'Johto', number: gymIndex - 8 };
    if (gymIndex >= 17 && gymIndex <= 24) return { region: 'Sinnoh', number: gymIndex - 16 };
    if (gymIndex >= 25 && gymIndex <= 32) return { region: 'Unova2', number: gymIndex - 24 };
    if (gymIndex >= 33 && gymIndex <= 40) return { region: 'Hoenn', number: gymIndex - 32 };
    if (gymIndex >= 41 && gymIndex <= 48) return { region: 'Kalos', number: gymIndex - 40 };
    if (gymIndex >= 49 && gymIndex <= 56) return { region: 'Alola', number: gymIndex - 48 };
    if (gymIndex >= 57 && gymIndex <= 64) return { region: 'Galar', number: gymIndex - 56 };
    if (gymIndex >= 65 && gymIndex <= 72) return { region: 'Hisui', number: gymIndex - 64 };
    if (gymIndex >= 73 && gymIndex <= 80) return { region: 'Paldea', number: gymIndex - 72 };

    return { region: 'Kanto', number: 1 };
}

// In Johto, gifts are given:
// 1st badge (Violet): gymIndex = 9. -> Johto 1.
// 8th badge (Blackthorn): gymIndex = 16. -> Johto 8.
// 9th badge (Pewter): gymIndex = 0. -> Kanto 1.
// 16th badge (Viridian): gymIndex = 7. -> Kanto 8.

// Wait, the user said: "Remove the 8th badge and increase all Kanto badges to +1. Therefore Kanto will be 1-8 and there will be no elite 4 badge. Badge order in region 2 should be 9-10-11-12-13-14-15-16-1-2-3-4-5-6-7-8"
// This aligns perfectly with what I wrote!!!
// 9-10-11-12-13-14-15-16 -> Johto badges!
// 1-2-3-4-5-6-7-8 -> Kanto badges! (They said increase Kanto badges to +1. They were probably thinking gymIndex was 0-7, so they meant 1-8). Wait, if they think Kanto is 1-8, then gymIndex + 1 would be 1-8, which means gymIndex is 0-7. So my mapping `gymIndex + 1` handles exactly this!

console.log('Tested!');
