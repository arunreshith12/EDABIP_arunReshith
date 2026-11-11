/** One CSV row. Quotes are escaped and formula-looking cells are neutralised. */
export function toCsvRow(cells: readonly (string | number)[]): string {
  return cells
    .map(cell => {
      let text = String(cell);
      if (/^[=+@]/.test(text) || (text.startsWith('-') && text !== '-')) text = `'${text}`;
      return `"${text.replace(/"/g, '""')}"`;
    })
    .join(',');
}

export function downloadCsv(filename: string, rows: readonly (readonly (string | number)[])[]): void {
  const blob = new Blob([rows.map(toCsvRow).join('\n')], { type: 'text/csv' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}
