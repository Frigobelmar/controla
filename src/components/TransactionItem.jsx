import React from 'react';
import { motion } from 'framer-motion';

const TransactionItem = ({ name, category, date, amount, type }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="flex items-center justify-between py-4 group hover:px-2 transition-all duration-200"
    >
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-full bg-sectioning flex items-center justify-center font-display font-bold text-slate-900">
          {name.charAt(0)}
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-slate-900 tracking-tight">{name}</span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-text-on-container">{category} • {date}</span>
        </div>
      </div>
      
      <div className="flex flex-col items-end">
        <span className={`font-bold tracking-tight ${
          type === 'income' ? "text-income" : "text-expense"
        }`}>
          {type === 'income' ? "+" : "-"} R$ {Math.abs(amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </span>
      </div>
    </motion.div>
  );
};

export default TransactionItem;

