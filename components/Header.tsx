
import React from 'react';
import { SunIcon, MoonIcon } from './icons';

interface HeaderProps {
  title: string;
  theme: string;
  toggleTheme: () => void;
  toggleSidebar: () => void; // New prop
}

const Header: React.FC<HeaderProps> = ({ title, theme, toggleTheme, toggleSidebar }) => {
  return (
    <header className="bg-white dark:bg-brand-navy shadow-md p-4 z-10 flex justify-between items-center lg:justify-end">
      <button onClick={toggleSidebar} className="lg:hidden p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-accent mr-4">
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-white hidden lg:block flex-grow text-center">{title}</h1>
      <button 
        onClick={toggleTheme}
        className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-accent"
        aria-label="Toggle theme"
      >
        {theme === 'light' ? (
          <MoonIcon className="h-6 w-6" />
        ) : (
          <SunIcon className="h-6 w-6" />
        )}
      </button>
    </header>
  );
};

export default Header;