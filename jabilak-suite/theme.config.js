/**
 * المصدر الوحيد لهوية التطبيق.
 * عدّل هذه القيم لتتغير الألوان والخطوط في لوحات العميل والتاجر والإدارة.
 */
const themeColors = {
  primary: { light: '#3B4CCA', dark: '#6C7AE0' },
  background: { light: '#FFF3E8', dark: '#17183A' },
  surface: { light: '#FFF3E8', dark: '#24265A' },
  foreground: { light: '#2B2D6E', dark: '#FFF3E8' },
  muted: { light: '#F0EBE5', dark: '#C9CBEA' },
  border: { light: '#6C7AE0', dark: '#6C7AE0' },
  success: { light: '#7BB662', dark: '#92D47A' },
  warning: { light: '#6C7AE0', dark: '#9AA5FF' },
  error: { light: '#C0392B', dark: '#FF8178' },
  aero: { light: '#6C7AE0', dark: '#9AA5FF' },
  plummy: { light: '#6C7AE0', dark: '#858FFF' },
  plumIsland: { light: '#2B2D6E', dark: '#12132F' },
  riverStyx: { light: '#2B2D6E', dark: '#0D0E26' },
};

const fonts = {
  sans: "'IBM Plex Sans Arabic', system-ui, -apple-system, sans-serif",
  serif: "Georgia, 'Times New Roman', serif",
  rounded: "'IBM Plex Sans Arabic', system-ui, sans-serif",
  mono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
};

module.exports = { themeColors, fonts };
