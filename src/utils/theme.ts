/**
 * PocketPilot — Centralized Theme Configurations
 * Supports Theme A: Mint Minimal and Theme B: Midnight Luxe
 */

export type ThemeId = 'mint-minimal' | 'midnight-luxe';

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  label: string;
  tagline: string;
  description: string;
  preview: {
    bg: string;
    card: string;
    primary: string;
    accent: string;
    text: string;
  };
  chart: {
    primary: string;
    income: string;
    expense: string;
    axis: string;
    tooltipBg: string;
    tooltipBorder: string;
    tooltipText: string;
    piePalette: string[];
  };
}

export const THEMES: Record<ThemeId, ThemeDefinition> = {
  'mint-minimal': {
    id: 'mint-minimal',
    name: 'Mint Minimal',
    label: 'A. Mint Minimal',
    tagline: 'Theme A (Default)',
    description: 'Clean, bright, and simple.',
    preview: {
      bg: '#FFFFFF',
      card: '#FFFFFF',
      primary: '#047857',
      accent: '#D1FAE5',
      text: '#1F2937',
    },
    chart: {
      primary: '#047857',
      income: '#047857',
      expense: '#DC2626',
      axis: '#94A3B8',
      tooltipBg: '#FFFFFF',
      tooltipBorder: '#E2E8F0',
      tooltipText: '#1F2937',
      piePalette: [
        '#047857',
        '#10B981',
        '#0284C7',
        '#6366F1',
        '#F59E0B',
        '#8B5CF6',
        '#14B8A6',
        '#EC4899',
        '#64748B',
      ],
    },
  },
  'midnight-luxe': {
    id: 'midnight-luxe',
    name: 'Midnight Luxe',
    label: 'B. Midnight Luxe',
    tagline: 'Theme B',
    description: 'Bold, stylish, and modern with a dark background.',
    preview: {
      bg: '#09090B',
      card: '#27272A',
      primary: '#A3E635',
      accent: '#3F3F46',
      text: '#FAFAFA',
    },
    chart: {
      primary: '#A3E635',
      income: '#A3E635',
      expense: '#F87171',
      axis: '#A1A1AA',
      tooltipBg: '#27272A',
      tooltipBorder: '#3F3F46',
      tooltipText: '#FAFAFA',
      piePalette: [
        '#A3E635',
        '#38BDF8',
        '#818CF8',
        '#FACC15',
        '#F472B6',
        '#A78BFA',
        '#2DD4BF',
        '#FB923C',
        '#94A3B8',
      ],
    },
  },
};

export function getThemeConfig(themeId?: string): ThemeDefinition {
  if (themeId && themeId in THEMES) {
    return THEMES[themeId as ThemeId];
  }
  return THEMES['mint-minimal'];
}
