import React from 'react';
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ListTodo,
  Bot,
} from 'lucide-react';
import { motion } from 'framer-motion';

const iconMap = {
  expense: ArrowDownToLine,
  income:  ArrowUpFromLine,
  task:    ListTodo,
  bot:     Bot,
};

const ActionButton = ({ label, icon, variant = 'default', onClick }) => {
  const Icon = iconMap[icon] ?? Bot;
  const isAccent = variant === 'accent';

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      style={{
        backgroundColor: isAccent ? 'var(--color-accent)' : 'var(--color-surface)',
        color: isAccent ? '#0C0C0C' : 'var(--color-text-secondary)',
        border: 'none',
        cursor: 'pointer',
        fontFamily: 'var(--font-body)',
      }}
      className="flex flex-col items-center justify-center gap-2 rounded-2xl p-4 aspect-square"
    >
      <Icon size={22} />
      <span
        style={{
          fontSize: '0.62rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: isAccent ? '#0C0C0C' : 'var(--color-text-secondary)',
        }}
      >
        {label}
      </span>
    </motion.button>
  );
};

export default ActionButton;
