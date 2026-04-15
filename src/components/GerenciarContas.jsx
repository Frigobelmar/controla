import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from './Icon';
import { useAuth } from '../contexts/AuthContext';
import { getContas, createConta, deleteConta, setContaPadrao } from '../lib/database';
import { BANK_LOGOS, svgToDataUri } from '../lib/bankLogos';

// ── Bancos brasileiros com logos oficiais ─────────────────────────────────
export const BANCOS = [
  { codigo: 'CARTEIRA', nome: 'Carteira',             cor: '#6B7280', logoKey: 'CARTEIRA', tipo: 'CARTEIRA' },
  { codigo: '341',      nome: 'Itaú',                 cor: '#EC7000', logoKey: 'ITAU',         tipo: 'CORRENTE' },
  { codigo: '237',      nome: 'Bradesco',              cor: '#CC0000', logoKey: 'BRADESCO',     tipo: 'CORRENTE' },
  { codigo: '001',      nome: 'Banco do Brasil',       cor: '#F9D000', logoKey: 'BANCO_BRASIL', tipo: 'CORRENTE' },
  { codigo: '104',      nome: 'Caixa Econômica',       cor: '#005CA9', logoKey: 'CAIXA',        tipo: 'CORRENTE' },
  { codigo: '033',      nome: 'Santander',             cor: '#EC0000', logoKey: 'SANTANDER',    tipo: 'CORRENTE' },
  { codigo: '260',      nome: 'Nubank',                cor: '#820AD1', logoKey: 'NUBANK',       tipo: 'CORRENTE' },
  { codigo: '077',      nome: 'Inter',                 cor: '#FF7A00', logoKey: 'INTER',        tipo: 'CORRENTE' },
  { codigo: '336',      nome: 'C6 Bank',               cor: '#242424', logoKey: 'C6BANK',       tipo: 'CORRENTE' },
  { codigo: '212',      nome: 'Banco Original',        cor: '#00A651', logoKey: 'ORIGINAL',     tipo: 'CORRENTE' },
  { codigo: '756',      nome: 'Sicoob',                cor: '#005B2B', logoKey: 'SICOOB',       tipo: 'CORRENTE' },
  { codigo: '748',      nome: 'Sicredi',               cor: '#00A859', logoKey: 'SICREDI',      tipo: 'CORRENTE' },
  { codigo: '380',      nome: 'PicPay',                cor: '#11C76F', logoKey: 'PICPAY',       tipo: 'CORRENTE' },
  { codigo: '290',      nome: 'PagBank',               cor: '#05A357', logoKey: 'PAGBANK',      tipo: 'CORRENTE' },
  { codigo: 'XP',       nome: 'XP Investimentos',      cor: '#1A1A1A', logoKey: 'XP',           tipo: 'INVESTIMENTO' },
  { codigo: 'OUTRO',    nome: 'Outro Banco',           cor: '#64748B', logoKey: null,           tipo: 'CORRENTE' },
];

const TIPOS_CONTA = [
  { id: 'CORRENTE',     label: 'Conta Corrente' },
  { id: 'POUPANCA',     label: 'Poupança' },
  { id: 'INVESTIMENTO', label: 'Investimento' },
  { id: 'CARTEIRA',     label: 'Carteira' },
];

// ── Badge visual do banco ──────────────────────────────────────────────────
export const BancoBadge = ({ banco, size = 'md', logoKey, cor }) => {
  // Aceita objeto banco completo, ou props avulsas (logoKey + cor)
  const resolvedKey = logoKey || (typeof banco === 'object' ? banco?.logoKey : null);
  const resolvedCor = cor || (typeof banco === 'object' ? banco?.cor : null) || '#6B7280';

  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const svgSrc = resolvedKey && BANK_LOGOS[resolvedKey]
    ? svgToDataUri(BANK_LOGOS[resolvedKey])
    : null;

  if (svgSrc) {
    return (
      <div className={`${sizes[size]} rounded-xl overflow-hidden flex-shrink-0 shadow-md`} style={{ backgroundColor: resolvedCor }}>
        <img
          src={svgSrc}
          alt=""
          className="w-full h-full object-cover"
          draggable={false}
        />
      </div>
    );
  }

  // Fallback: iniciais coloridas
  const sigla = typeof banco === 'object' ? banco?.sigla : '?';
  const textSizes = { sm: 'text-[10px]', md: 'text-xs', lg: 'text-sm' };
  return (
    <div
      className={`${sizes[size]} rounded-xl flex items-center justify-center font-bold text-white shadow-md flex-shrink-0`}
      style={{ backgroundColor: resolvedCor }}
    >
      <span className={textSizes[size]}>{sigla || '??'}</span>
    </div>
  );
};

// ── Componente principal ───────────────────────────────────────────────────
const GerenciarContas = ({ onClose, onContasChange }) => {
  const { user } = useAuth();
  const [contas, setContas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Formulário
  const [bancoBusca, setBancoBusca] = useState('');
  const [bancoSelecionado, setBancoSelecionado] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [nomeConta, setNomeConta] = useState('');
  const [tipoConta, setTipoConta] = useState('CORRENTE');
  const [agencia, setAgencia] = useState('');
  const [numeroConta, setNumeroConta] = useState('');
  const [saldoInicial, setSaldoInicial] = useState('');

  useEffect(() => { load(); }, [user]);

  async function load() {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getContas(user.id);
      setContas(data);
    } catch (e) {
      setError('Erro ao carregar contas.');
    } finally {
      setLoading(false);
    }
  }

  function selecionarBanco(banco) {
    setBancoSelecionado(banco);
    setBancoBusca(banco.nome);
    setTipoConta(banco.tipo);
    setNomeConta(banco.codigo === 'CARTEIRA' ? 'Carteira' : banco.nome);
    setDropdownOpen(false);
    setAgencia('');
    setNumeroConta('');
  }

  const bancosFiltrados = BANCOS.filter(b =>
    b.nome.toLowerCase().includes(bancoBusca.toLowerCase())
  );

  async function handleCreate(e) {
    e.preventDefault();
    if (!bancoSelecionado) { setError('Selecione um banco.'); return; }
    setSaving(true);
    setError('');
    try {
      const nova = await createConta(user.id, {
        nome: nomeConta || bancoSelecionado.nome,
        tipo: tipoConta,
        banco_nome: bancoSelecionado.nome,
        banco_codigo: bancoSelecionado.codigo,
        banco_cor: bancoSelecionado.cor,
        agencia: agencia.trim() || null,
        conta: numeroConta.trim() || null,
        saldo_inicial: saldoInicial !== '' ? parseFloat(saldoInicial) : 0,
        padrao: contas.length === 0,
      });
      setContas(prev => [...prev, nova]);
      onContasChange?.();
      resetForm();
      setShowForm(false);
    } catch (e) {
      setError(e?.message ?? 'Erro ao criar conta.');
    } finally {
      setSaving(false);
    }
  }

  function resetForm() {
    setBancoBusca('');
    setBancoSelecionado(null);
    setNomeConta('');
    setTipoConta('CORRENTE');
    setAgencia('');
    setNumeroConta('');
    setSaldoInicial('');
  }

  async function handleDelete(id) {
    const c = contas.find(x => x.id === id);
    if (c?.padrao) { setError('Não é possível excluir a conta padrão.'); return; }
    try {
      await deleteConta(id);
      setContas(prev => prev.filter(x => x.id !== id));
      onContasChange?.();
    } catch (e) { setError('Erro ao excluir conta.'); }
  }

  async function handleSetPadrao(id) {
    try {
      await setContaPadrao(user.id, id);
      setContas(prev => prev.map(c => ({ ...c, padrao: c.id === id })));
    } catch (e) { setError('Erro ao definir conta padrão.'); }
  }

  const formatCurrency = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-lg bg-surface rounded-[2rem] shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-outline-variant/10">
          <div>
            <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Configurações</p>
            <h2 className="font-headline font-bold text-xl text-on-surface">Contas Bancárias</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setShowForm(v => !v); resetForm(); setError(''); }}
              className="h-9 px-4 rounded-xl bg-primary-fixed text-on-primary font-bold text-xs flex items-center gap-1.5 hover:brightness-110 transition-all"
            >
              <Icon name="add" className="text-sm" />
              Nova Conta
            </button>
            <button onClick={onClose} className="w-9 h-9 rounded-xl bg-surface-container-high flex items-center justify-center hover:bg-surface-container transition-colors">
              <Icon name="close" className="text-on-surface-variant text-[18px]" />
            </button>
          </div>
        </div>

        <div className="px-6 py-4 max-h-[75vh] overflow-y-auto space-y-4">
          {error && <p className="text-error text-xs font-bold uppercase tracking-widest text-center bg-error/10 px-4 py-2 rounded-xl">{error}</p>}

          {/* ── Formulário nova conta ── */}
          <AnimatePresence>
            {showForm && (
              <motion.form
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}
                onSubmit={handleCreate}
                className="overflow-hidden"
              >
                <div className="p-4 rounded-2xl bg-surface-container-low border border-primary-fixed/20 space-y-4 mb-2">
                  <p className="font-label text-[10px] uppercase tracking-widest text-primary-fixed font-bold">Nova Conta</p>

                  {/* Seletor de banco (dropdown) */}
                  <div className="relative">
                    <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-1.5 block">Banco</label>
                    <div className="relative">
                      <input
                        value={bancoBusca}
                        onChange={e => { setBancoBusca(e.target.value); setDropdownOpen(true); setBancoSelecionado(null); }}
                        onFocus={() => setDropdownOpen(true)}
                        placeholder="Selecione ou pesquise o banco..."
                        className="w-full h-11 bg-on-surface/5 border border-outline-variant/10 rounded-xl pl-4 pr-10 text-on-surface text-sm font-body outline-none focus:border-primary-fixed/30 transition-all"
                      />
                      {bancoSelecionado && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <BancoBadge banco={bancoSelecionado} size="sm" />
                        </div>
                      )}
                      {!bancoSelecionado && (
                        <Icon name="expand_more" className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]" />
                      )}
                    </div>

                    <AnimatePresence>
                      {dropdownOpen && bancosFiltrados.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                          className="absolute z-10 top-full mt-1 w-full bg-surface-container rounded-xl shadow-xl border border-outline-variant/10 overflow-hidden max-h-52 overflow-y-auto"
                        >
                          {bancosFiltrados.map(banco => (
                            <button
                              key={banco.codigo}
                              type="button"
                              onClick={() => { selecionarBanco(banco); setDropdownOpen(false); }}
                              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-on-surface/5 transition-colors text-left"
                            >
                              {banco.logoKey && BANK_LOGOS[banco.logoKey] ? (
                                <div
                                  className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 shadow"
                                  style={{ backgroundColor: banco.cor }}
                                >
                                  <img
                                    src={svgToDataUri(BANK_LOGOS[banco.logoKey])}
                                    alt={banco.nome}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ) : (
                                <div
                                  className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs text-white flex-shrink-0 shadow"
                                  style={{ backgroundColor: banco.cor }}
                                >
                                  {banco.nome.slice(0,2).toUpperCase()}
                                </div>
                              )}
                              <div>
                                <p className="font-body font-semibold text-on-surface text-sm">{banco.nome}</p>
                                {banco.codigo !== 'CARTEIRA' && banco.codigo !== 'OUTRO' && (
                                  <p className="text-on-surface-variant text-[10px]">Código {banco.codigo}</p>
                                )}
                              </div>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Nome da conta */}
                  <div>
                    <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-1.5 block">Nome da Conta</label>
                    <input
                      value={nomeConta}
                      onChange={e => setNomeConta(e.target.value)}
                      placeholder="Ex: Conta Principal, Nubank Pessoal..."
                      className="w-full h-11 bg-on-surface/5 border border-outline-variant/10 rounded-xl px-4 text-on-surface text-sm font-body outline-none focus:border-primary-fixed/30 transition-all"
                    />
                  </div>

                  {/* Tipo de conta */}
                  {bancoSelecionado?.codigo !== 'CARTEIRA' && (
                    <div>
                      <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-1.5 block">Tipo</label>
                      <div className="grid grid-cols-3 gap-2">
                        {TIPOS_CONTA.filter(t => t.id !== 'CARTEIRA').map(t => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setTipoConta(t.id)}
                            className={`py-2 px-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                              tipoConta === t.id
                                ? 'bg-primary-fixed text-on-primary'
                                : 'bg-on-surface/5 text-on-surface-variant hover:bg-on-surface/10'
                            }`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Agência e Conta (apenas para bancos reais) */}
                  {bancoSelecionado && bancoSelecionado.codigo !== 'CARTEIRA' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-1.5 block">Agência</label>
                        <input
                          value={agencia}
                          onChange={e => setAgencia(e.target.value)}
                          placeholder="0000"
                          className="w-full h-11 bg-on-surface/5 border border-outline-variant/10 rounded-xl px-4 text-on-surface text-sm font-body outline-none focus:border-primary-fixed/30 transition-all"
                        />
                      </div>
                      <div>
                        <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-1.5 block">Conta</label>
                        <input
                          value={numeroConta}
                          onChange={e => setNumeroConta(e.target.value)}
                          placeholder="00000-0"
                          className="w-full h-11 bg-on-surface/5 border border-outline-variant/10 rounded-xl px-4 text-on-surface text-sm font-body outline-none focus:border-primary-fixed/30 transition-all"
                        />
                      </div>
                    </div>
                  )}

                  {/* Saldo inicial */}
                  <div>
                    <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-1.5 block">Saldo Inicial</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">R$</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={saldoInicial}
                        onChange={e => setSaldoInicial(e.target.value)}
                        placeholder="0,00"
                        className="w-full h-11 bg-on-surface/5 border border-outline-variant/10 rounded-xl pl-10 pr-4 text-on-surface text-sm font-body outline-none focus:border-primary-fixed/30 transition-all"
                      />
                    </div>
                  </div>

                  {/* Botões */}
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={saving || !bancoSelecionado}
                      className="flex-1 h-11 rounded-xl bg-primary-fixed text-on-primary font-bold text-sm flex items-center justify-center gap-2 hover:brightness-110 transition-all disabled:opacity-40"
                    >
                      {saving
                        ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        : <><Icon name="check" className="text-base" /> Criar Conta</>
                      }
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowForm(false); resetForm(); }}
                      className="h-11 px-4 rounded-xl bg-on-surface/10 text-on-surface-variant text-sm hover:bg-on-surface/20 transition-all"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* ── Lista de contas ── */}
          {loading ? (
            <div className="py-10 flex justify-center">
              <div className="w-6 h-6 border-2 border-primary-fixed/30 border-t-primary-fixed rounded-full animate-spin" />
            </div>
          ) : contas.length === 0 ? (
            <div className="py-10 text-center border border-dashed border-outline-variant/20 rounded-xl">
              <Icon name="account_balance_wallet" className="text-on-surface-variant/40 text-4xl mb-3" />
              <p className="text-on-surface-variant text-sm">Nenhuma conta criada.</p>
              <p className="text-on-surface-variant/60 text-xs mt-1">Clique em "Nova Conta" para começar.</p>
            </div>
          ) : (
            <AnimatePresence>
              {contas.map(conta => (
                <motion.div
                  key={conta.id}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                    conta.padrao
                      ? 'bg-primary-fixed/10 border border-primary-fixed/20'
                      : 'bg-surface-container-low'
                  }`}
                >
                  <BancoBadge
                    logoKey={BANCOS.find(b => b.nome === conta.banco_nome || b.codigo === conta.banco_codigo)?.logoKey}
                    cor={conta.banco_cor || '#6B7280'}
                    banco={{ sigla: conta.banco_nome?.slice(0,2).toUpperCase() ?? '??' }}
                    size="md"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-body font-semibold text-on-surface text-sm truncate">{conta.nome}</p>
                      {conta.padrao && (
                        <span className="flex-shrink-0 text-[8px] font-bold uppercase tracking-widest text-primary-fixed bg-primary-fixed/10 px-2 py-0.5 rounded-full">
                          Padrão
                        </span>
                      )}
                    </div>
                    <p className="text-on-surface-variant text-xs">
                      {conta.banco_nome}
                      {conta.agencia && ` · Ag. ${conta.agencia}`}
                      {conta.conta && ` · CC ${conta.conta}`}
                    </p>
                    <p className="text-on-surface-variant text-[10px] mt-0.5">
                      Saldo inicial: {formatCurrency(conta.saldo_inicial)}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {!conta.padrao && (
                      <button
                        onClick={() => handleSetPadrao(conta.id)}
                        title="Definir como padrão"
                        className="w-8 h-8 rounded-lg bg-on-surface/5 text-on-surface-variant hover:bg-primary-fixed/10 hover:text-primary-fixed flex items-center justify-center transition-colors"
                      >
                        <Icon name="star_outline" className="text-[16px]" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(conta.id)}
                      className="w-8 h-8 rounded-lg bg-error/10 text-error flex items-center justify-center hover:bg-error/20 transition-colors"
                    >
                      <Icon name="delete_outline" className="text-[16px]" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default GerenciarContas;
