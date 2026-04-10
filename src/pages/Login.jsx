import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import Icon from '../components/Icon';

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { signIn, signUp } = useAuth();

  const errorMessages = {
    'Invalid login credentials': 'Email ou senha incorretos.',
    'Email not confirmed': 'Confirme seu email antes de entrar. Verifique sua caixa de entrada.',
    'User already registered': 'Este email já está cadastrado. Tente entrar.',
    'Password should be at least 6 characters': 'A senha deve ter pelo menos 6 caracteres.',
    'Unable to validate email address: invalid format': 'Formato de email inválido.',
    'email rate limit exceeded': 'Muitas tentativas de cadastro. Aguarde alguns minutos e tente novamente.',
    'over_email_send_rate_limit': 'Muitas tentativas de cadastro. Aguarde alguns minutos e tente novamente.',
    'For security purposes, you can only request this after': 'Aguarde antes de solicitar outro email.',
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { data, error } = await signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
          },
        });
        if (error) throw error;

        // Se o email de confirmação não é exigido, o usuário já está ativo
        if (data?.session) {
          return; // login automático — AuthContext detecta a sessão
        }

        setError('Conta criada! Verifique seu email para confirmar o cadastro.');
      } else {
        const { error } = await signIn({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      const msg = err.message ?? '';
      const translated = Object.entries(errorMessages).find(([key]) => msg.toLowerCase().includes(key.toLowerCase()));
      setError(translated ? translated[1] : msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!email) { setError('Digite seu email para reenviar a confirmação.'); return; }
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    setError(error ? 'Erro ao reenviar. Tente novamente.' : 'Email de confirmação reenviado!');
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
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-primary-fixed/10 rounded-2xl flex items-center justify-center mb-5 shadow-inner">
            <Icon name="account_balance_wallet" className="text-3xl text-primary-fixed" />
          </div>
          <h1 className="font-['Michroma'] tracking-tight text-3xl flex items-center leading-none">
            <span className="text-on-surface">CONTROLA</span>
            <span className="text-primary-fixed ml-1 text-glow">+</span>
          </h1>
          <p className="font-body text-on-surface-variant text-sm mt-1 opacity-60">
            {isSignUp ? 'Crie sua conta gratuita' : 'Bem-vindo ao seu cofre digital'}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex bg-on-surface/5 rounded-2xl p-1 mb-8">
          <button
            type="button"
            onClick={() => { setIsSignUp(false); setError(null); }}
            className={`flex-1 py-3 rounded-xl font-headline font-bold text-sm transition-all ${
              !isSignUp
                ? 'bg-primary-fixed text-on-primary shadow'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => { setIsSignUp(true); setError(null); }}
            className={`flex-1 py-3 rounded-xl font-headline font-bold text-sm transition-all ${
              isSignUp
                ? 'bg-primary-fixed text-on-primary shadow'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Criar Conta
          </button>
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-2">
              <p className="text-error text-[10px] font-bold uppercase tracking-widest">{error}</p>
              {error.includes('email') && !isSignUp && (
                <button
                  type="button"
                  onClick={handleResendConfirmation}
                  className="text-primary-fixed text-[10px] uppercase tracking-widest hover:underline"
                >
                  Reenviar email de confirmação
                </button>
              )}
            </motion.div>
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
                <span>{isSignUp ? 'Cadastrar' : 'Entrar no Sistema'}</span>
              </>
            )}
          </button>
        </form>

      </motion.div>
    </div>
  );
};

export default Login;
