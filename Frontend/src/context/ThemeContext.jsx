import { createContext, useContext, useState, useEffect } from 'react';

/**
 * ThemeProvider — manages light/dark mode for the entire app.
 *
 * Behaviour:
 *   1. On first load, reads the OS preference via `prefers-color-scheme`.
 *   2. User can manually toggle via the navbar icon.
 *   3. Manual choice is persisted in localStorage ('theme').
 *   4. Applies/removes the 'dark' class on <html> for Tailwind's `darkMode: 'class'`.
 */
const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

const STORAGE_KEY = 'theme';

/**
 * Reads the stored or system-preferred theme.
 * @returns {'light' | 'dark'}
 */
const getInitialTheme = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') return stored;

    // Fallback to OS preference
    if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) return 'dark';
    return 'light';
};

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(getInitialTheme);

    // Apply the 'dark' class on <html> whenever theme changes
    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem(STORAGE_KEY, theme);
    }, [theme]);

    // Listen for OS preference changes (only when no manual override)
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e) => {
            // Only follow system if user hasn't manually set preference
            if (!localStorage.getItem(STORAGE_KEY)) {
                setTheme(e.matches ? 'dark' : 'light');
            }
        };
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    const toggleTheme = () => {
        setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export default ThemeProvider;
