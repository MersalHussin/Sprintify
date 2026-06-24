import React from 'react';
import { useTheme } from '@/context/theme-context';
import { FaMoon, FaSun } from 'react-icons/fa6';

export default function Settings() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex-1 p-8 text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-slate-950 transition-colors duration-200">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      
      <div className="max-w-2xl bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-800">
        <h2 className="text-xl font-semibold mb-4">Appearance</h2>
        
        <div className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-slate-800">
          <div>
            <p className="font-medium">Theme</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Switch between dark and light mode.</p>
          </div>
          
          <button 
            onClick={toggleTheme}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            {theme === 'dark' ? (
              <>
                <FaSun className="text-yellow-500" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <FaMoon className="text-blue-500" />
                <span>Dark Mode</span>
              </>
            )}
          </button>
        </div>
        
      </div>
    </div>
  );
}
