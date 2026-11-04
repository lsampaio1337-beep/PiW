// Johto badges are collected in reverse mapping for the first 8 badges when in region 2!
// Let's look at src/ui/gift.js line 47 and 169.
// if (state.currentRegionName === 'Johto') {
//     gymIndex = (i < 8) ? i + 9 : i - 8;
// }
// For i = 0 (1st badge), gymIndex = 9 (Johto 1)
// For i = 8 (9th badge), gymIndex = 0 (Kanto 1)
// So for Johto, the badges should be displayed from 9 to 16, then from 1 to 8!
