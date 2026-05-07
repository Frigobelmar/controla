import React from 'react';
import { Zap, Cloud, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';

const iconMap = {
  zap:      Zap,
  cloud:    Cloud,
  building: Building2,
};

const BillCard = ({ name, icon, amount, dueLabel, status, statusLabel }, index) => {
  const Icon = iconMap[icon] ?? Building2;
  const isUrgent = status === 'urgent';

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, delay: index * 0.07 }}
      style={{ backgroundColor: 'var(--color-surface)' }}
      className="mx-4 rounded-2xl p-4 flex items-center gap-3"
    >
      {/* Icon */}
      <div
        style={{ backgroundColor: 'var(--color-surface-2)', color: 'var(--color-text-secondary)' }}
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
      >
        <Icon size={18} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p
          style={{ color: 'var(--color-text-primary)', fontSize: '0.85rem', fontWeight: 600 }}
          className="truncate"
        >
          {name}
        </p>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.72rem' }}>
          {dueLabel}
        </p>
      </div>

      {/* Amount + Badge */}
      <div className="flex flex-col items-end gap-1.5 shrink-0">
        <span
          style={{
            color: 'var(--color-text-primary)',
            fontSize: '0.85rem',
            fontWeight: 700,
            fontFamily: 'var(--font-mono)',
          }}
        >
          {amount}
        </span>
        <span
          style={{
            backgroundColor: isUrgent ? 'var(--color-urgent-dim)' : 'var(--color-pending-dim)',
            color: isUrgent ? 'var(--color-urgent)' : 'var(--color-text-secondary)',
            fontSize: '0.55rem',
            fontWeight: 700,
            letterSpacing: '0.1em',
            padding: '2px 7px',
            borderRadius: '4px',
          }}
        >
          {statusLabel}
        </span>
      </div>
    </motion.div>
  );
};

export default BillCard;
