export const colors = {
  // Pastel Periwinkle / Lavender Primary
  // Darker than the original pastel #818CF8 so white text on it meets WCAG AA (6.3:1)
  primary: '#4F46E5', // Indigo
  primaryLight: '#EEF2FF', // Very light soft lavender
  primaryDark: '#4338CA',
  primarySoft: '#E0E7FF',

  // Pastel Lateness Indicators
  overdue: {
    badge: '#FB7185', // Pastel soft rose
    bg: '#FFF1F2', // Airy pastel blush
    border: '#FECDD3',
    text: '#BE123C',
  },
  onTrack: {
    badge: '#34D399', // Pastel mint
    bg: '#F0FDF4', // Airy pastel sage
    border: '#A7F3D0',
    text: '#047857',
  },

  // Pastel Graph Colors
  graph: {
    onTimeBar: '#6EE7B7', // Pastel mint
    delayedBar: '#FCD34D', // Pastel warm honey
    track: '#F1F5F9',
  },

  // UI Surfaces & Text (Gentle, low-contrast fatigue)
  background: '#FAFBFD', // Soft airy pastel off-white
  card: '#FFFFFF',
  cardBorder: '#EEF2F6', // Gentle soft border
  textMain: '#1E293B', // Soft charcoal
  textSecondary: '#5B6B7F', // Soft slate (≥4.5:1 on light surfaces)
  textMuted: '#6B7280', // Muted grey (≥4.5:1 on light surfaces)
  border: '#E8EDF5',

  // Pastel Tags
  tagBg: '#F1F5F9',
  tagText: '#475569',
  danger: '#FB7185',
  success: '#34D399',

  // Pastel Accents for Categories
  pastels: [
    { bg: '#EEF2FF', text: '#4F46E5', border: '#C7D2FE' }, // Periwinkle
    { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A' }, // Buttercup
    { bg: '#FCE7F3', text: '#BE185D', border: '#FBCFE8' }, // Rose Pink
    { bg: '#E0F2FE', text: '#0369A1', border: '#BAE6FD' }, // Sky
    { bg: '#DCFCE7', text: '#15803D', border: '#BBF7D0' }, // Mint
    { bg: '#F3E8FF', text: '#7E22CE', border: '#E9D5FF' }, // Lilac
    { bg: '#FFEDD5', text: '#C2410C', border: '#FED7AA' }, // Peach
  ],
};
