import { ref, computed } from 'vue';

export type ThemeMode = 'light' | 'dark';

export function useTheme() {
  const theme = useState<ThemeMode>('urbanflow_theme_mode', () => 'light');
  const isDark = computed(() => theme.value === 'dark');

  function initTheme() {
    if (typeof window === 'undefined') return;

    const saved = localStorage.getItem('urbanflow_theme') as ThemeMode | null;
    if (saved === 'dark' || saved === 'light') {
      theme.value = saved;
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      theme.value = prefersDark ? 'dark' : 'light';
    }
    applyTheme(theme.value);
  }

  function applyTheme(newTheme: ThemeMode) {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    if (newTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }

  function toggleTheme() {
    const newTheme: ThemeMode = theme.value === 'dark' ? 'light' : 'dark';
    theme.value = newTheme;
    if (typeof window !== 'undefined') {
      localStorage.setItem('urbanflow_theme', newTheme);
    }
    applyTheme(newTheme);
  }

  function setTheme(newTheme: ThemeMode) {
    theme.value = newTheme;
    if (typeof window !== 'undefined') {
      localStorage.setItem('urbanflow_theme', newTheme);
    }
    applyTheme(newTheme);
  }

  return {
    theme,
    isDark,
    toggleTheme,
    setTheme,
    initTheme,
  };
}
