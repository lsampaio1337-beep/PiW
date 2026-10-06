export function formatQuantity(q) {
    if (q >= 1000000) return Math.floor(q / 1000000) + 'm';
    if (q >= 1000) return Math.floor(q / 1000) + 'k';
    return q;
}
