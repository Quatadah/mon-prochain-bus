import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2.5 transition-all rounded-lg bg-card hover:bg-card/80 hover:scale-105 active:scale-95 border border-border hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      aria-label={isDarkMode ? "Passer en mode clair" : "Passer en mode sombre"}
    >
      <div className="relative w-5 h-5">
        <Sun className={`absolute inset-0 w-5 h-5 text-yellow-500 transition-all duration-300 ${isDarkMode ? 'rotate-0 opacity-100' : 'rotate-90 opacity-0'}`} />
        <Moon className={`absolute inset-0 w-5 h-5 text-primary transition-all duration-300 ${isDarkMode ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100'}`} />
      </div>
    </button>
  );
}; 