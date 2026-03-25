import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

const ThemeToggle = ({ className = "", collapsed = false, isSidebar = false }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check for saved user preference, if any, on mount
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
      setIsDark(true);
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className={`flex items-center justify-center p-3 rounded-xl transition-all duration-300 active:scale-95 ${isDark ? 'bg-slate-800 text-amber-400 border-b-4 border-slate-900' : 'bg-white text-slate-400 border-b-4 border-slate-200 hover:text-amber-500'} ${className}`}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {isDark ? <Sun size={20} strokeWidth={2.5} /> : <Moon size={20} strokeWidth={2.5} />}
      {!collapsed && <span className={`font-bold text-xs uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${isSidebar ? 'ml-3 lg:ml-0 lg:opacity-0 lg:-translate-x-2 lg:group-hover:opacity-100 lg:group-hover:translate-x-0' : 'ml-3 lg:hidden'}`}>{isDark ? 'Light Mode' : 'Dark Mode'}</span>}
    </button>
  );
};

export default ThemeToggle;