import type { TemplateConfig } from '../types';

export interface EventTheme {
  accent: string;
  accent2: string;
  glow: string;
  background: string;
  text: string;
}

const DEFAULT_THEME: EventTheme = {
  accent: '#FF4D4F',
  accent2: '#FF2D55',
  glow: '#7C3AED',
  background: '#0E0E11',
  text: '#F5F5F5',
};

export function deriveThemeFromTemplate(templateConfig?: TemplateConfig): EventTheme {
  // Check if template has theme config
  const theme = (templateConfig as any)?.theme;
  
  if (theme && typeof theme === 'object') {
    return {
      accent: theme.accent || DEFAULT_THEME.accent,
      accent2: theme.accent2 || DEFAULT_THEME.accent2,
      glow: theme.glow || DEFAULT_THEME.glow,
      background: theme.background || DEFAULT_THEME.background,
      text: theme.text || DEFAULT_THEME.text,
    };
  }
  
  // Fallback: try to derive from template colors
  if (templateConfig?.textFields && templateConfig.textFields.length > 0) {
    const firstTextField = templateConfig.textFields[0];
    if (firstTextField.color) {
      return {
        ...DEFAULT_THEME,
        accent: firstTextField.color,
        accent2: firstTextField.color,
      };
    }
  }
  
  return DEFAULT_THEME;
}

export function getDefaultTheme(): EventTheme {
  return DEFAULT_THEME;
}

// Ensure color contrast for accessibility
export function ensureContrast(color: string, _background: string): string {
  // Simple fallback - in production, use a proper contrast checker
  return color;
}
