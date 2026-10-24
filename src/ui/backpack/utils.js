export function formatQuantity(q) {
    if (q >= 1000000000) return (q / 1000000000).toFixed(1) + 'b';
    if (q >= 1000000) return (q / 1000000).toFixed(1) + 'm';
    if (q >= 1000) return (q / 1000).toFixed(1) + 'k';
    return q.toString();
}
