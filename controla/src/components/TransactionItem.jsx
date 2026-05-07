import React from 'react';
import { motion } from 'framer-motion';

const TransactionItem = ({ name, category, date, amount, type, status, hasAnexo, onClick }) => {
  const isPaid = status === 'PAGO';
  
  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      onClick={onClick}
      className={`flex items-center justify-between py-4 group hover:px-2 transition-all duration-200 cursor-pointer ${!isPaid ? 'border-l-2 border-l-error/30 pl-2' : ''}`}
    >
      <div className="flex items-center gap-4">
        <div className={`w-11 h-11 rounded-full flex items-center justify-center font-display font-bold ${isPaid ? 'bg-sectioning text-slate-900' : 'bg-error/10 text-error'}`}>
          {name.charAt(0)}
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900 tracking-tight">{name}</span>
            {hasAnexo && <span className="text-on-surface-variant/40">📎</span>}
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-text-on-container">
            {category} • {date} • <span className={isPaid ? 'text-primary-fixed' : 'text-error'}>{isPaid ? 'PAGO' : 'PENDENTE'}</span>
          </span>
        </div>
      </div>
      
      <div className="flex flex-col items-end">
        <span className={`font-bold tracking-tight ${
          type === 'income' ? "text-income" : "text-expense"
        } ${!isPaid ? 'opacity-70' : ''}`}>
          {type === 'income' ? "+" : "-"} R$ {Math.abs(amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </span>
      </div>
    </motion.div>
  );
};

export default TransactionItem;

