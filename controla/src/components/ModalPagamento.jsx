import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from './Icon';

const addDays = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

const formatDateBR = (iso) => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

const ATALHOS = [
  { label: '7 dias',  days: 7 },
  { label: '15 dias', days: 15 },
  { label: '30 dias', days: 30 },
  { label: '60 dias', days: 60 },
];

const ModalPagamento = ({ transacao, onClose, onConfirm, loading }) => {
  const [tipo, setTipo] = useState('total');
  const [valorParcial, setValorParcial] = useState('');
  const [proximaData, setProximaData] = useState(addDays(30)); // padrão: 30 dias

  if (!transacao) return null;

  const valorTotal = Number(transacao.valor);

  const formatCurrency = (v) =>
    Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const handleValorChange = (e) => {
    const raw = e.target.value.replace(/[^\d,]/g, '');
    setValorParcial(raw);
  };

  const valorNumerico = () => {
    if (tipo === 'total') return valorTotal;
    const n = parseFloat(valorParcial.replace(',', '.'));
    return isNaN(n) ? 0 : n;
  };

  const podeConfirmar = () => {
    if (tipo === 'total') return true;
    const v = valorNumerico();
    return v > 0 && v <= valorTotal && !!proximaData;
  };

  const handleConfirm = () => {
    const v = valorNumerico();
    if (v <= 0) return;
    onConfirm(transacao.id, v, tipo, proximaData);
  };

  const restante = valorTotal - valorNumerico();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          className="relative w-full max-w-sm bg-surface rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-outline-variant/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-fixed/10 flex items-center justify-center">
                <Icon name="payments" className="text-primary-fixed text-xl" />
              </div>
              <div>
                <p className="font-headline font-bold text-on-surface text-sm leading-tight">
                  Registrar Pagamento
                </p>
                <p className="text-on-surface-variant text-[11px] truncate max-w-[180px]">
                  {transacao.descricao}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors">
              <Icon name="close" className="text-xl" />
            </button>
          </div>

          <div className="px-6 py-5 space-y-5">
            {/* Valor total */}
            <div className="p-4 bg-surface-container-low rounded-2xl flex items-center justify-between">
              <span className="text-on-surface-variant text-xs uppercase tracking-widest font-label">Valor total</span>
              <span className="font-headline font-bold text-on-surface text-lg">
                {formatCurrency(valorTotal)}
              </span>
            </div>

            {/* Tipo de pagamento */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setTipo('total')}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                  tipo === 'total'
                    ? 'border-primary-fixed bg-primary-fixed/10 text-primary-fixed'
                    : 'border-outline-variant/20 bg-surface-container-low text-on-surface-variant hover:border-primary-fixed/30'
                }`}
              >
                <Icon name="check_circle" className="text-2xl" />
                <span className="text-[11px] font-bold uppercase tracking-widest">Total</span>
                <span className="text-[10px] opacity-70">Quitar tudo</span>
              </button>
              <button
                onClick={() => setTipo('parcial')}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                  tipo === 'parcial'
                    ? 'border-amber-400 bg-amber-400/10 text-amber-500'
                    : 'border-outline-variant/20 bg-surface-container-low text-on-surface-variant hover:border-amber-400/30'
                }`}
              >
                <Icon name="pie_chart" className="text-2xl" />
                <span className="text-[11px] font-bold uppercase tracking-widest">Parcial</span>
                <span className="text-[10px] opacity-70">Parte do valor</span>
              </button>
            </div>

            {/* Seção parcial */}
            <AnimatePresence>
              {tipo === 'parcial' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden space-y-4"
                >
                  {/* Valor a pagar */}
                  <div>
                    <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-2 block">
                      Valor a pagar agora
                    </label>
                    <div className="flex items-center gap-2 h-14 bg-on-surface/5 border border-outline-variant/20 rounded-2xl px-4 focus-within:border-amber-400/50 transition-colors">
                      <span className="text-on-surface-variant text-sm font-bold">R$</span>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={valorParcial}
                        onChange={handleValorChange}
                        placeholder="0,00"
                        className="flex-1 bg-transparent text-on-surface font-headline font-bold text-lg outline-none"
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Aviso restante */}
                  {valorNumerico() > 0 && valorNumerico() < valorTotal && (
                    <div className="p-3 bg-amber-400/10 border border-amber-400/20 rounded-xl flex items-center gap-2">
                      <Icon name="info" className="text-amber-500 text-base shrink-0" />
                      <p className="text-[11px] text-amber-600">
                        Restante <strong>{formatCurrency(restante)}</strong> será lançado como nova pendência
                      </p>
                    </div>
                  )}

                  {valorNumerico() > valorTotal && (
                    <div className="p-3 bg-error/10 border border-error/20 rounded-xl flex items-center gap-2">
                      <Icon name="error" className="text-error text-base shrink-0" />
                      <p className="text-[11px] text-error">Valor maior que o total da transação</p>
                    </div>
                  )}

                  {/* Data do restante */}
                  <div>
                    <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-2 block">
                      Vencimento do restante
                    </label>

                    {/* Atalhos rápidos */}
                    <div className="flex gap-2 mb-3 flex-wrap">
                      {ATALHOS.map(({ label, days }) => {
                        const val = addDays(days);
                        const ativo = proximaData === val;
                        return (
                          <button
                            key={days}
                            type="button"
                            onClick={() => setProximaData(val)}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${
                              ativo
                                ? days === 30
                                  ? 'bg-primary-fixed text-on-primary border-primary-fixed shadow'
                                  : 'bg-amber-400 text-white border-amber-400 shadow'
                                : 'bg-surface-container-low text-on-surface-variant border-outline-variant/20 hover:border-primary-fixed/40'
                            }`}
                          >
                            {days === 30 && <span className="mr-1">⚡</span>}
                            {label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Input de data */}
                    <div className="flex items-center gap-2 h-12 bg-on-surface/5 border border-outline-variant/20 rounded-2xl px-4 focus-within:border-primary-fixed/40 transition-colors">
                      <Icon name="calendar_today" className="text-on-surface-variant text-base shrink-0" />
                      <input
                        type="date"
                        value={proximaData}
                        onChange={(e) => setProximaData(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="flex-1 bg-transparent text-on-surface font-body text-sm outline-none"
                      />
                      {proximaData && (
                        <span className="text-on-surface-variant text-[10px] shrink-0">
                          {formatDateBR(proximaData)}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Botão confirmar */}
            <button
              onClick={handleConfirm}
              disabled={!podeConfirmar() || loading}
              className="w-full h-14 rounded-2xl bg-primary-fixed text-on-primary font-headline font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-40 transition-all hover:brightness-110 active:scale-95"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Icon name="check" className="text-lg" />
                  {tipo === 'total' ? 'Confirmar Pagamento Total' : 'Confirmar Pagamento Parcial'}
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ModalPagamento;
