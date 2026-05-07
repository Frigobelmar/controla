import React from 'react';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';

const StatsCard = ({ title, value, change, trend, type = 'neutral' }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card flex flex-col gap-5 p-7"
    >
      <div className="flex items-center justify-between">
        <span className="label-sm">{title}</span>
        <div className={`p-2.5 rounded-full ${
          type === 'income' ? "bg-income/10 text-income" : 
          type === 'expense' ? "bg-expense/10 text-expense" : "bg-elevated text-slate-900"
        }`}>
          {type === 'income' ? <TrendingUp size={18} /> : 
           type === 'expense' ? <TrendingDown size={18} /> : <Wallet size={18} />}
        </div>
      </div>
      
      <div className="flex flex-col gap-1.5">
        <span className="text-4xl font-display font-medium tracking-tight text-slate-900">
          {value}
        </span>
        {change && (
          <span className={`text-[11px] font-semibold uppercase tracking-wider ${
            trend === 'up' ? "text-income" : "text-expense"
          }`}>
            {trend === 'up' ? "+" : ""}{change} este mês
          </span>
        )}
      </div>
    </motion.div>
  );
};

export default StatsCard;

