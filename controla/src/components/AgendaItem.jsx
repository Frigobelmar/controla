import React from 'react';
import { motion } from 'framer-motion';

const AgendaItem = ({ time, title, description, done }, index) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay: index * 0.08 }}
    className="flex gap-3"
  >
    {/* Timeline dot */}
    <div className="flex flex-col items-center pt-1">
      <div
        style={{
          width: 18,
          height: 18,
          borderRadius: '50%',
          border: `2px solid ${done ? 'var(--color-accent)' : 'var(--color-border)'}`,
          backgroundColor: done ? 'var(--color-accent-dim)' : 'transparent',
          flexShrink: 0,
        }}
      />
      <div
        style={{
          width: 1,
          flex: 1,
          backgroundColor: 'var(--color-border)',
          marginTop: 4,
        }}
      />
    </div>

    {/* Content */}
    <div className="pb-5">
      <p
        style={{ color: 'var(--color-accent)', fontSize: '0.68rem', fontWeight: 600, fontFamily: 'var(--font-mono)' }}
        className="mb-0.5"
      >
        {time}
      </p>
      <p
        style={{ color: 'var(--color-text-primary)', fontSize: '0.88rem', fontWeight: 700 }}
        className="mb-1"
      >
        {title}
      </p>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem', lineHeight: 1.5 }}>
        {description}
      </p>
    </div>
  </motion.div>
);

export default AgendaItem;
