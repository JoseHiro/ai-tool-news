export const DATE_COLORS = [
  '#7c3aed', // violet
  '#2563eb', // blue
  '#0d9488', // teal
  '#d97706', // amber
  '#db2777', // pink
  '#059669', // emerald
  '#9333ea', // purple
]

export function getDateColor(date: string): string {
  const seed = date.replace(/-/g, '').split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return DATE_COLORS[seed % DATE_COLORS.length]
}
