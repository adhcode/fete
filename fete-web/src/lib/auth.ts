// Auth token management
const TOKEN_KEY = 'fete_auth_token';
const ORGANIZER_KEY = 'fete_organizer';

export interface Organizer {
  id: string;
  email: string;
  name: string | null;
}

export const auth = {
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken: (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
  },

  clearToken: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ORGANIZER_KEY);
  },

  getOrganizer: (): Organizer | null => {
    const data = localStorage.getItem(ORGANIZER_KEY);
    return data ? JSON.parse(data) : null;
  },

  setOrganizer: (organizer: Organizer): void => {
    localStorage.setItem(ORGANIZER_KEY, JSON.stringify(organizer));
  },

  isAuthenticated: (): boolean => {
    return !!auth.getToken();
  },
};
