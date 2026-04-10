import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import Icon from '../components/Icon';

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { signIn, signUp } = useAuth();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        alert('Confirme seu email para continuar!');
      } else {
        const { error } = await signIn({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary-fixed/5 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-primary-fixed/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-secondary/10 blur-[120px] rounded-full" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md bg-surface border border-outline-variant/10 rounded-[2.5rem] shadow-2xl p-8 md:p-12"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-primary-fixed/10 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
            <Icon name="account_balance_wallet" className="text-3xl text-primary-fixed" />
          </div>
          <h1 className="font-headline font-extrabold text-3xl text-on-surface tracking-tighter">FinanceWhats</h1>
          <p className="font-body text-on-surface-variant text-sm mt-2 opacity-60">
            {isSignUp ? 'Crie sua conta administrativa' : 'Bem-vindo ao seu cofre digital'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          <AnimatePresence mode="wait">
            {isSignUp && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 overflow-hidden"
              >
                <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant ml-1">Nome Completo</label>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Seu nome"
                  className="w-full h-14 bg-on-surface/5 border border-outline-variant/10 rounded-2xl px-5 text-on-surface font-body focus:border-primary-fixed/30 outline-none transition-all"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-2">
            <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant ml-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full h-14 bg-on-surface/5 border border-outline-variant/10 rounded-2xl px-5 text-on-surface font-body focus:border-primary-fixed/30 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant ml-1">Senha</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full h-14 bg-on-surface/5 border border-outline-variant/10 rounded-2xl px-5 text-on-surface font-body focus:border-primary-fixed/30 outline-none transition-all"
            />
          </div>

          {error && (
            <motion.p 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="text-error text-[10px] font-bold uppercase tracking-widest text-center"
            >
              {error}
            </motion.p>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full h-16 rounded-2xl bg-primary-fixed text-on-primary font-headline font-bold text-lg shadow-lg shadow-primary-fixed/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Icon name={isSignUp ? 'person_add' : 'login'} />
                <span>{isSignUp ? 'Criar Conta' : 'Entrar no Sistema'}</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant hover:text-primary-fixed transition-colors"
          >
            {isSignUp ? 'Já possui uma conta? Entre aqui' : 'Não tem conta? Solicite acesso'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
