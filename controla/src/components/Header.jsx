import React from 'react';
import Icon from './Icon';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const Header = ({ isDarkMode, toggleTheme, onLogoClick }) => {
  const { signOut } = useAuth();

  return (
  <header className="fixed top-0 w-full z-50 glass-panel border-b-0">
    <div className="flex items-center justify-between px-6 h-16 w-full max-w-7xl mx-auto">

      {/* Logo Area */}
      <div onClick={onLogoClick} className="flex items-center group cursor-pointer active:scale-95 transition-transform duration-200">
        <h1 className="font-['Michroma'] tracking-tight text-xl md:text-2xl flex items-center leading-none">
          <span className="text-on-surface/60 group-hover:text-on-surface transition-colors duration-500">CONTROLA</span>
          <span className="text-primary-fixed ml-1 text-glow">+</span>
        </h1>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* WhatsApp status — desktop only */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-surface-container-high rounded-full border border-outline-variant/15">
          <span className="w-2 h-2 rounded-full bg-primary-fixed animate-pulse" />
          <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
            IA: Online
          </span>
        </div>

        {/* Theme Toggle Button */}
        <button 
          onClick={toggleTheme}
          className="w-10 h-10 rounded-xl bg-surface-container-high border border-outline-variant/10 flex items-center justify-center relative overflow-hidden group active:scale-90 duration-200"
          aria-label="Toggle Theme"
        >
          <AnimatePresence mode="wait">
            {isDarkMode ? (
              <motion.div
                key="moon"
                initial={{ y: 20, opacity: 0, rotate: 45 }}
                animate={{ y: 0, opacity: 1, rotate: 0 }}
                exit={{ y: -20, opacity: 0, rotate: -45 }}
                transition={{ duration: 0.2 }}
              >
                <Icon name="dark_mode" className="text-primary-fixed" style={{ fontSize: 20 }} />
              </motion.div>
            ) : (
              <motion.div
                key="sun"
                initial={{ y: 20, opacity: 0, rotate: 45 }}
                animate={{ y: 0, opacity: 1, rotate: 0 }}
                exit={{ y: -20, opacity: 0, rotate: -45 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center pt-0.5"
              >
                <Icon name="light_mode" className="text-amber-500" style={{ fontSize: 22 }} />
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        {/* Avatar */}
        <div className="w-10 h-10 rounded-xl border border-outline-variant/10 bg-surface-container-high flex items-center justify-center cursor-pointer active:scale-95 duration-200">
          <Icon name="person" className="text-on-surface-variant" style={{ fontSize: 20 }} />
        </div>

        {/* Logout */}
        <button
          onClick={() => signOut()}
          title="Sair"
          className="w-10 h-10 rounded-xl bg-error/10 border border-error/20 flex items-center justify-center active:scale-90 duration-200 hover:bg-error/20 transition-colors"
        >
          <Icon name="logout" className="text-error" style={{ fontSize: 20 }} />
        </button>
      </div>

    </div>
  </header>
  );
};

export default Header;
