// If we replace:
// const badgeNum = state.currentRegionName === 'Johto' ? (gift.gymIndex > 8 ? gift.gymIndex - 8 : gift.gymIndex + 9) : gift.gymIndex + 1;
// <img src="./Assets/Gym/Badges/${window.getBadgeFileName(state.currentRegionName || 'Kanto', badgeNum)}"

// WITH:
/*
let region = 'Kanto';
let badgeNum = gift.gymIndex + 1;

if (gift.gymIndex >= 0 && gift.gymIndex <= 7) {
    region = 'Kanto';
    badgeNum = gift.gymIndex + 1;
} else if (gift.gymIndex >= 9 && gift.gymIndex <= 16) {
    region = 'Johto';
    badgeNum = gift.gymIndex - 8;
} else if (gift.gymIndex >= 17 && gift.gymIndex <= 24) {
    region = 'Sinnoh';
    badgeNum = gift.gymIndex - 16;
} else if (gift.gymIndex >= 25 && gift.gymIndex <= 32) {
    region = 'Unova2';
    badgeNum = gift.gymIndex - 24;
} else if (gift.gymIndex >= 33 && gift.gymIndex <= 40) {
    region = 'Hoenn';
    badgeNum = gift.gymIndex - 32;
} else if (gift.gymIndex >= 41 && gift.gymIndex <= 48) {
    region = 'Kalos';
    badgeNum = gift.gymIndex - 40;
} else if (gift.gymIndex >= 49 && gift.gymIndex <= 56) {
    region = 'Alola';
    badgeNum = gift.gymIndex - 48;
} else if (gift.gymIndex >= 57 && gift.gymIndex <= 64) {
    region = 'Galar';
    badgeNum = gift.gymIndex - 56;
} else if (gift.gymIndex >= 65 && gift.gymIndex <= 72) {
    region = 'Hisui';
    badgeNum = gift.gymIndex - 64;
} else if (gift.gymIndex >= 73 && gift.gymIndex <= 80) {
    region = 'Paldea';
    badgeNum = gift.gymIndex - 72;
}

const badgeFile = window.getBadgeFileName(region, badgeNum);
<img src="./Assets/Gym/Badges/${badgeFile}" ...
*/
