import { useColorScheme } from 'react-native';

export function useAppTheme() {
  const dark = useColorScheme() === 'dark';
  return {
    dark,
    background: dark ? '#000000' : '#F2F2F7',
    text: dark ? '#FFFFFF' : '#111111',
    mutedText: dark ? '#98989D' : '#6B6B70',
    cards: dark
      ? ['#1D4ED8', '#7C3AED', '#BE185D', '#047857', '#B45309', '#0E7490']
      : ['#93C5FD', '#C4B5FD', '#F9A8D4', '#6EE7B7', '#FCD34D', '#67E8F9'],
  };
}
