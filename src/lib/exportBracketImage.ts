function sanitizeFilename(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u00C0-\u024F]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

export async function downloadBracketImage(
  element: HTMLElement,
  userName: string,
): Promise<void> {
  const { toPng } = await import('html-to-image');
  const dataUrl = await toPng(element, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: '#f5f5f3',
    skipFonts: false,
  });

  const link = document.createElement('a');
  const safeName = sanitizeFilename(userName) || 'prediction';
  link.download = `world-cup-2026-${safeName}.png`;
  link.href = dataUrl;
  link.click();
}
