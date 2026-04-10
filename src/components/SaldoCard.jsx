import React from 'react';
import { TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const SaldoCard = ({ total, changeLabel }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    style={{ backgroundColor: 'var(--color-surface)' }}
    className="mx-4 rounded-2xl p-5"
  >
    <p className="label-xs mb-3">Saldo Total</p>

    <p
      className="amount-lg mb-2"
      style={{ color: 'var(--color-accent)' }}
    >
      {total}
    </p>

    <div className="flex items-center gap-1.5">
      <TrendingUp size={13} style={{ color: 'var(--color-accent)' }} />
      <span style={{ color: 'var(--color-accent)', fontSize: '0.72rem' }}>
        {changeLabel}
      </span>
    </div>
  </motion.div>
);

export default SaldoCard;
