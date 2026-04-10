import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Icon from '../components/Icon';

const Lancamento = ({ type = 'expense', onBack }) => {
  const [value, setValue] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const isExpense = type === 'expense';
  const themeColor = isExpense ? 'text-error' : 'text-primary-fixed';
  const bgColor = isExpense ? 'bg-error/10' : 'bg-primary-fixed/10';

  const categories = isExpense 
    ? [
        { id: 'moradia', label: 'Moradia', icon: 'home' },
        { id: 'transporte', label: 'Transporte', icon: 'directions_car' },
        { id: 'alimentacao', label: 'Alimentação', icon: 'restaurant' },
        { id: 'saude', label: 'Saúde', icon: 'medical_services' },
        { id: 'lazer', label: 'Lazer', icon: 'sports_esports' },
        { id: 'outros', label: 'Outros', icon: 'more_horiz' },
      ]
    : [
        { id: 'salario', label: 'Salário', icon: 'payments' },
        { id: 'freelance', label: 'Freelance', icon: 'work' },
        { id: 'investimento', label: 'Investimento', icon: 'trending_up' },
        { id: 'presente', label: 'Presente', icon: 'redeem' },
        { id: 'outros', label: 'Outros', icon: 'more_horiz' },
      ];

  const handleValueChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val === '') {
      setValue('');
      return;
    }
    const numericValue = (parseInt(val) / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
    setValue(numericValue);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Salvando lançamento:', { value, description, category, date, type });
    onBack();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onBack}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Modal Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-lg bg-surface rounded-[2rem] shadow-2xl overflow-hidden border border-outline-variant/10"
      >
        <div className="p-8">
          
          {/* Internal Header */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold">
              Novo Lançamento: <span className={themeColor}>{isExpense ? 'Despesa' : 'Receita'}</span>
            </h2>
            <button 
              onClick={onBack}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-on-surface/5 text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <Icon name="close" className="text-sm" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Value input (Large) */}
            <div className="text-center">
              <input
                autoFocus
                type="text"
                placeholder="R$ 0,00"
                value={value}
                onChange={handleValueChange}
                className={`w-full bg-transparent border-none text-center font-headline font-extrabold text-5xl md:text-6xl focus:ring-0 ${themeColor} tracking-tighter`}
              />
            </div>

            <div className="space-y-6">
              {/* Description */}
              <div className="space-y-2">
                <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant ml-1">Descrição</label>
                <input 
                  type="text" 
                  placeholder="Ex: Supermercado, Aluguel..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full h-12 bg-on-surface/5 border border-outline-variant/10 rounded-xl px-4 text-on-surface font-body focus:border-primary-fixed/30 focus:ring-0 transition-all outline-none"
                />
              </div>

              {/* Category Grid */}
              <div className="space-y-2">
                <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant ml-1">Categoria</label>
                <div className="grid grid-cols-3 gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-300 ${
                        category === cat.id 
                          ? `${bgColor} border-primary-fixed/40` 
                          : 'bg-on-surface/5 border-transparent grayscale opacity-60 hover:grayscale-0 hover:opacity-100 hover:bg-on-surface/10'
                      }`}
                    >
                      <Icon name={cat.icon} className={`text-lg mb-2 ${category === cat.id ? themeColor : 'text-on-surface'}`} />
                      <span className="text-[8px] font-label uppercase tracking-widest font-bold text-on-surface">
                        {cat.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date */}
              <div className="space-y-2">
                <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant ml-1">Data</label>
                <input 
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full h-12 bg-on-surface/5 border border-outline-variant/10 rounded-xl px-4 text-on-surface font-body focus:border-primary-fixed/30 transition-all outline-none"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              disabled={!value || !category}
              className={`w-full h-14 rounded-xl flex items-center justify-center gap-3 font-label font-bold text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 disabled:opacity-30 disabled:grayscale ${
                isExpense ? 'bg-error text-white shadow-lg shadow-error/20' : 'bg-primary-fixed text-on-primary shadow-lg shadow-primary-fixed/20'
              }`}
            >
              <Icon name={isExpense ? 'remove_circle_outline' : 'add_circle_outline'} className="text-base" />
              <span>Lançar {isExpense ? 'Despesa' : 'Receita'}</span>
            </button>

          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Lancamento;
