import React from 'react';
import Icon from './Icon';

const tabs = [
  { id: 'painel',     label: 'Painel',     icon: 'dashboard'    },
  { id: 'financeiro', label: 'Financeiro', icon: 'payments'     },
  { id: 'agenda',     label: 'Agenda',     icon: 'calendar_today' },
  { id: 'ajustes',    label: 'Ajustes',    icon: 'settings'     },
];

const BottomNav = ({ active, onChange }) => (
  <nav className="fixed bottom-0 w-full z-50 rounded-t-3xl glass-panel border-x-0 border-b-0 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
    <div className="w-full flex justify-around items-center px-4 pt-4 pb-8 max-w-2xl mx-auto">
      {tabs.map(({ id, label, icon }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`flex flex-col items-center justify-center transition-all active:scale-90 duration-300 relative group ${
              isActive
                ? 'text-primary-fixed'
                : 'text-on-surface-variant/40 hover:text-on-surface-variant'
            }`}
          >
            {isActive && (
              <div className="absolute -top-4 w-12 h-1 bg-primary-fixed rounded-full blur-[2px] shadow-[0_0_10px_var(--primary-glow)]" />
            )}
            <Icon name={icon} className={`mb-1.5 ${isActive ? 'text-glow' : ''}`} style={{ fontSize: 24 }} />
            <span className={`font-label text-[10px] uppercase tracking-[0.15em] font-medium transition-opacity ${isActive ? 'opacity-100' : 'opacity-60'}`}>
              {label}
            </span>
          </button>
        );
      })}
    </div>
  </nav>
);

export default BottomNav;
