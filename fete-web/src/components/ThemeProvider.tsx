import { createContext, useContext, type ReactNode } from 'react';
import type { EventTheme } from '../lib/theme';
import { getDefaultTheme } from '../lib/theme';

interface ThemeContextValue {
  theme: EventTheme;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: getDefaultTheme(),
});

export function useTheme() {
  return useContext(ThemeContext);
}

interface Props {
  theme: EventTheme;
  children: ReactNode;
}

export default function ThemeProvider({ theme, children }: Props) {
  return (
    <ThemeContext.Provider value={{ theme }}>
      <div
        className="theme-root"
        style={{
          '--fete-bg': theme.background,
          '--fete-text': theme.text,
          '--fete-accent': theme.accent,
          '--fete-accent2': theme.accent2,
          '--fete-glow': theme.glow,
        } as React.CSSProperties}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
