import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { motion } from 'framer-motion';

const StatCard = ({ label, value, trend }, index) => {
  const isUp = trend === 'up';
  const arrowColor = isUp ? 'var(--color-income)' : 'var(--color-expense)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      style={{ backgroundColor: 'var(--color-surface)' }}
      className="flex-1 rounded-2xl p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="label-xs">{label}</span>
        <div
          style={{ backgroundColor: isUp ? 'var(--color-accent-dim)' : 'var(--color-urgent-dim)' }}
          className="w-6 h-6 rounded-full flex items-center justify-center"
        >
          {isUp
            ? <ArrowUp size={12} style={{ color: arrowColor }} />
            : <ArrowDown size={12} style={{ color: arrowColor }} />
          }
        </div>
      </div>
      <p className="amount-md" style={{ color: 'var(--color-text-primary)' }}>
        {value}
      </p>
    </motion.div>
  );
};

export default StatCard;
