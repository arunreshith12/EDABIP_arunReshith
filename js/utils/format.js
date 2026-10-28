export const formatNumber = n => n.toLocaleString('en-US');

export const formatPercent = n => (n == null ? '-' : `${n.toFixed(1)}%`);

export function timeAgo(timestamp) {
  const minutes = Math.floor((Date.now() - timestamp) / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return hours < 24 ? `${hours}h ago` : `${Math.floor(hours / 24)}d ago`;
}

/** Round a maximum up to a "nice" axis end: 80 -> 100, 95000 -> 100000. */
export function niceCeil(max) {
  if (max <= 0) return 1;
  const power = 10 ** Math.floor(Math.log10(max));
  const n = max / power;
  const nice = [1, 2, 2.5, 5, 10].find(step => n <= step);
  return nice * power;
}

/** One CSV row; quotes are escaped and formula-looking cells are neutralised. */
export function toCsvRow(cells) {
  return cells
    .map(cell => {
      let text = String(cell);
      if (/^[=+@]/.test(text) || (/^-/.test(text) && text !== '-')) text = `'${text}`;
      return `"${text.replace(/"/g, '""')}"`;
    })
    .join(',');
}
