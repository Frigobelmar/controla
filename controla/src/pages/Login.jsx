import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import Icon from '../components/Icon';

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [whatsapp, setWhatsapp] = useState('+55 ');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Estados para Verificação de WhatsApp (Cadastro)
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [generatedPin, setGeneratedPin] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Estados para Recuperação de Senha (Esqueci a Senha)
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState(0); // 0: Email, 1: Code+NewPassword
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotCode, setForgotCode] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotGeneratedPin, setForgotGeneratedPin] = useState('');
  const [forgotTimeLeft, setForgotTimeLeft] = useState(60);
  
  const { signIn, signUp, signOut } = useAuth();

  // Timer para expiração do código (Cadastro)
  React.useEffect(() => {
    let interval;
    if (isVerifying && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setCanResend(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isVerifying, timeLeft]);

  // Timer para expiração do código (Recuperação)
  React.useEffect(() => {
    let interval;
    if (isForgotPassword && forgotStep === 1 && forgotTimeLeft > 0) {
      interval = setInterval(() => {
        setForgotTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (forgotTimeLeft === 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isForgotPassword, forgotStep, forgotTimeLeft]);

  const errorMessages = {
    'Invalid login credentials': 'Email ou senha incorretos.',
    'Email not confirmed': 'Confirme seu email antes de entrar. Verifique sua caixa de entrada.',
    'User already registered': 'Este email já está cadastrado. Tente entrar.',
    'Password should be at least 6 characters': 'A senha deve ter pelo menos 6 caracteres.',
    'Unable to validate email address: invalid format': 'Formato de email inválido.',
    'email rate limit exceeded': 'Muitas tentativas. Aguarde alguns minutos e tente novamente.',
    'over_email_send_rate_limit': 'Muitas tentativas. Aguarde alguns minutos e tente novamente.',
    'For security purposes, you can only request this after': 'Aguarde antes de solicitar outro código.',
  };

  const VERIFICATION_URL = '/api/send-verification';

  const formatWhatsApp = (value) => {
    // Garante que o +55 não seja removido e remove o resto que não é número
    let numbers = value.replace(/\D/g, '');
    
    // Se o usuário apagar o 55 inicial, nós recolocamos
    if (!numbers.startsWith('55')) {
      numbers = '55' + (numbers.length > 0 ? numbers : '');
    }

    // Máscara: +55 (11) 99999-9999
    if (numbers.length <= 2) return `+${numbers}`;
    if (numbers.length <= 4) return `+${numbers.slice(0, 2)} (${numbers.slice(2)}`;
    if (numbers.length <= 9) return `+${numbers.slice(0, 2)} (${numbers.slice(2, 4)}) ${numbers.slice(4)}`;
    return `+${numbers.slice(0, 2)} (${numbers.slice(2, 4)}) ${numbers.slice(4, 9)}-${numbers.slice(9, 13)}`;
  };

  const handleSendVerification = async (e) => {
    if(e) e.preventDefault();
    if (!fullName || !email || !password || !whatsapp) {
      setError('Preencha todos os campos corretamente.');
      return;
    }

    if (whatsapp.length < 13) {
      setError('Número de WhatsApp inválido.');
      return;
    }

    setLoading(true);
    setError(null);

    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedPin(pin);

    try {
      const response = await fetch(VERIFICATION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          whatsapp: whatsapp.replace(/\D/g, ''),
          code: pin,
          name: fullName,
          email: email,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Serviço de WhatsApp indisponível. Tente novamente em instantes.');
      }

      setIsVerifying(true);
      setTimeLeft(60);
      setCanResend(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        // Se estamos em modo de registro, primeiro validamos o PIN
        if (isVerifying) {
          if (timeLeft <= 0) {
            throw new Error('O código expirou. Solicite um novo código.');
          }
          if (otpCode !== generatedPin) {
            throw new Error('Código de verificação incorreto.');
          }
        } else {
          // Se não está verificando ainda, envia o código
          return handleSendVerification(e);
        }

        const whatsappFormatted = '+' + whatsapp.replace(/\D/g, '');
        const { data, error } = await signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              whatsapp: whatsappFormatted,
              phone: whatsappFormatted, // Mantém no metadata para compatibilidade
            },
          },
        });
        if (error) throw error;

        // Salvar WhatsApp na tabela pública de preferências na coluna 'phone'
        if (data?.user) {
          await supabase.from('preferencias_usuario').upsert({
            user_id: data.user.id,
            phone: whatsappFormatted,
            whatzap: whatsappFormatted, // Salva em ambas para garantir
          }, { onConflict: 'user_id' }).then(({ error: e }) => {
            if (e) console.warn('preferencias_usuario upsert:', e.message);
          });

          // Salvar também na tabela de números ativados como 'liberado'
          await supabase.from('whatsapp_ativados').upsert({
            whatsapp: whatsappFormatted,
            email: email,
            status: 'liberado',
          }, { onConflict: 'whatsapp' }).then(({ error: e }) => {
            if (e) console.warn('whatsapp_ativados upsert:', e.message);
          });
        }

        // Se o email de confirmação não é exigido, o usuário já está ativo
        if (data?.session) {
          return; // login automático — AuthContext detecta a sessão
        }

        setError('Conta criada! Verifique seu email para confirmar o cadastro.');
      } else {
        const { data: authData, error } = await signIn({ email, password });
        if (error) throw error;

        // Verificar se o usuário está liberado na tabela configuracao_dono
        const { data: stData, error: stError } = await supabase
          .from('configuracao_dono')
          .select('status')
          .eq('email', email)
          .maybeSingle();

        if (stError) {
          console.warn('configuracao_dono: erro ao verificar status (ignorado):', stError.message);
        } else if (stData && stData.status?.toLowerCase() !== 'liberado') {
          await signOut();
          throw new Error('Seu acesso não está liberado. Entre em contato com o suporte.');
        }
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

  // Funções para Recuperação de Senha
  const handleSendForgotCode = async (e) => {
    if (e) e.preventDefault();
    if (!forgotEmail) {
      setError('Digite seu email para recuperar a senha.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      // Buscar o WhatsApp do usuário
      // Buscar o WhatsApp e o Nome do usuário
      let whatsappNumber = null;
      let userName = 'Usuário';

      const { data: userData } = await supabase
        .from('whatsapp_ativados')
        .select('whatsapp')
        .eq('email', forgotEmail)
        .maybeSingle();

      if (userData?.whatsapp) {
        whatsappNumber = userData.whatsapp.replace(/\D/g, '');
      }

      // Buscar nome na configuracao_dono (e usar whatsapp de lá como fallback)
      const { data: donoData } = await supabase
        .from('configuracao_dono')
        .select('telefone_whatsapp, nome')
        .eq('email', forgotEmail)
        .maybeSingle();
        
      if (donoData) {
        if (!whatsappNumber && donoData.telefone_whatsapp) {
          whatsappNumber = donoData.telefone_whatsapp.replace(/\D/g, '');
        }
        if (donoData.nome) {
          userName = donoData.nome;
        }
      }

      if (!whatsappNumber) {
        throw new Error('Nenhum número de WhatsApp encontrado para este email.');
      }

      const pin = Math.floor(100000 + Math.random() * 900000).toString();
      setForgotGeneratedPin(pin);

      const response = await fetch(VERIFICATION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          whatsapp: whatsappNumber,
          code: pin,
          name: userName,
          email: forgotEmail,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Serviço de WhatsApp indisponível. Tente novamente em instantes.');
      }

      setForgotStep(1);
      setForgotTimeLeft(60);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndResetPassword = async (e) => {
    if (e) e.preventDefault();
    
    if (forgotTimeLeft <= 0) {
      setError('O código expirou. Solicite um novo código.');
      return;
    }

    if (forgotCode !== forgotGeneratedPin) {
      setError('Código de verificação incorreto.');
      return;
    }

    if (forgotNewPassword.length < 6) {
      setError('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Chama a Edge Function para alterar a senha
      const { data, error } = await supabase.functions.invoke('reset-password', {
        body: { email: forgotEmail, new_password: forgotNewPassword }
      });

      if (error) {
        throw error;
      }

      // Sucesso
      setError('Senha alterada com sucesso! Você já pode entrar.');
      setIsForgotPassword(false);
      setForgotStep(0);
      setForgotEmail('');
      setForgotCode('');
      setForgotNewPassword('');
    } catch (err) {
      setError('Erro ao alterar senha. Verifique se o serviço está disponível.');
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
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-primary-fixed/10 rounded-2xl flex items-center justify-center mb-5 shadow-inner">
            <Icon name="account_balance_wallet" className="text-3xl text-primary-fixed" />
          </div>
          <h1 className="font-['Michroma'] tracking-tight text-3xl flex items-center leading-none">
            <span className="text-on-surface">CONTROLA</span>
            <span className="text-primary-fixed ml-1 text-glow">+</span>
          </h1>
          <p className="font-body text-on-surface-variant text-sm mt-1 opacity-60 text-center">
            {isForgotPassword 
              ? 'Recuperação de Acesso' 
              : (isSignUp ? 'Crie sua conta gratuita' : 'Bem-vindo ao seu cofre digital')
            }
          </p>
        </div>

        {!isForgotPassword && (
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
        )}

        {isForgotPassword ? (
          // FORMULÁRIO DE ESQUECI A SENHA
          <form onSubmit={forgotStep === 0 ? handleSendForgotCode : handleVerifyAndResetPassword} className="space-y-6">
            <AnimatePresence mode="wait">
              {forgotStep === 0 && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 overflow-hidden"
                >
                  <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant ml-1">Email Cadastrado</label>
                  <input 
                    type="email" 
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full h-14 bg-on-surface/5 border border-outline-variant/10 rounded-2xl px-5 text-on-surface font-body focus:border-primary-fixed/30 outline-none transition-all"
                  />
                  <p className="text-xs text-on-surface-variant mt-2 text-center opacity-70">
                    Você receberá um código no WhatsApp vinculado a este email.
                  </p>
                </motion.div>
              )}

              {forgotStep === 1 && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-4"
                >
                  <div className="p-6 bg-primary-fixed/5 border border-primary-fixed/20 rounded-3xl space-y-4 mb-4">
                    <div className="text-center">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-primary-fixed">Confirmar Código</p>
                      <p className="text-xs text-on-surface-variant mt-1">Enviamos um código para seu WhatsApp</p>
                    </div>
                    <input 
                      type="text" 
                      value={forgotCode}
                      onChange={(e) => setForgotCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      className="w-full h-16 bg-surface border-2 border-primary-fixed/30 rounded-2xl px-5 text-center text-2xl font-bold tracking-[0.5em] text-on-surface outline-none focus:border-primary-fixed"
                    />
                    <div className="flex flex-col items-center gap-3">
                      {forgotTimeLeft > 0 ? (
                        <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-medium">
                          O código expira em <span className="text-primary-fixed font-bold">{forgotTimeLeft}s</span>
                        </p>
                      ) : (
                        <button 
                          type="button"
                          onClick={handleSendForgotCode}
                          className="text-[10px] font-bold uppercase tracking-widest text-primary-fixed hover:underline flex items-center gap-1"
                        >
                          <Icon name="refresh" className="text-xs" />
                          Reenviar Código
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant ml-1">Nova Senha</label>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        value={forgotNewPassword}
                        onChange={(e) => setForgotNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full h-14 bg-on-surface/5 border border-outline-variant/10 rounded-2xl px-5 pr-12 text-on-surface font-body focus:border-primary-fixed/30 outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-60 hover:opacity-100 transition-opacity"
                        title={showPassword ? "Ocultar senha" : "Exibir senha"}
                      >
                        <Icon name={showPassword ? 'visibility_off' : 'visibility'} className="text-xl" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-2">
                <p className="text-error text-[10px] font-bold uppercase tracking-widest">{error}</p>
              </motion.div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full h-16 rounded-2xl bg-primary-fixed text-on-primary font-headline font-bold text-lg shadow-lg shadow-primary-fixed/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-4"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Icon name={forgotStep === 1 ? 'lock_reset' : 'send'} />
                  <span>{forgotStep === 1 ? 'Salvar Nova Senha' : 'Enviar Código via WhatsApp'}</span>
                </>
              )}
            </button>

            <button 
              type="button"
              onClick={() => { setIsForgotPassword(false); setForgotStep(0); setError(null); }}
              className="w-full text-[10px] uppercase tracking-widest text-on-surface-variant hover:text-primary-fixed text-center opacity-60 hover:opacity-100 transition-opacity mt-4"
            >
              Voltar para Login
            </button>
          </form>
        ) : (
          // FORMULÁRIO NORMAL DE LOGIN/CADASTRO
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
                    disabled={isVerifying}
                    className="w-full h-14 bg-on-surface/5 border border-outline-variant/10 rounded-2xl px-5 text-on-surface font-body focus:border-primary-fixed/30 outline-none transition-all disabled:opacity-50"
                  />

                  <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant ml-1 mt-4 block">WhatsApp</label>
                  <input 
                    type="text" 
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(formatWhatsApp(e.target.value))}
                    placeholder="+55 (11) 99999-9999"
                    disabled={isVerifying}
                    className="w-full h-14 bg-on-surface/5 border border-outline-variant/10 rounded-2xl px-5 text-on-surface font-body focus:border-primary-fixed/30 outline-none transition-all disabled:opacity-50"
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
                disabled={isVerifying}
                className="w-full h-14 bg-on-surface/5 border border-outline-variant/10 rounded-2xl px-5 text-on-surface font-body focus:border-primary-fixed/30 outline-none transition-all disabled:opacity-50"
              />
            </div>

            {!isVerifying && (
              <div className="space-y-2">
                <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant ml-1">Senha</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-14 bg-on-surface/5 border border-outline-variant/10 rounded-2xl px-5 pr-12 text-on-surface font-body focus:border-primary-fixed/30 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-60 hover:opacity-100 transition-opacity"
                    title={showPassword ? "Ocultar senha" : "Exibir senha"}
                  >
                    <Icon name={showPassword ? 'visibility_off' : 'visibility'} className="text-xl" />
                  </button>
                </div>
                {!isSignUp && (
                  <div className="flex justify-end mt-2">
                    <button
                      type="button"
                      onClick={() => { setIsForgotPassword(true); setError(null); }}
                      className="text-[10px] font-bold uppercase tracking-widest text-primary-fixed hover:underline"
                    >
                      Esqueci minha senha
                    </button>
                  </div>
                )}
              </div>
            )}

            <AnimatePresence>
              {isSignUp && isVerifying && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-6 bg-primary-fixed/5 border border-primary-fixed/20 rounded-3xl space-y-4"
                >
                  <div className="text-center">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary-fixed">Confirmar WhatsApp</p>
                    <p className="text-xs text-on-surface-variant mt-1">Enviamos um código para seu WhatsApp</p>
                  </div>
                  <input 
                    type="text" 
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="w-full h-16 bg-surface border-2 border-primary-fixed/30 rounded-2xl px-5 text-center text-2xl font-bold tracking-[0.5em] text-on-surface outline-none focus:border-primary-fixed"
                  />

                  <div className="flex flex-col items-center gap-3">
                    {timeLeft > 0 ? (
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-medium">
                        O código expira em <span className="text-primary-fixed font-bold">{timeLeft}s</span>
                      </p>
                    ) : (
                      <button 
                        type="button"
                        onClick={handleSendVerification}
                        className="text-[10px] font-bold uppercase tracking-widest text-primary-fixed hover:underline flex items-center gap-1"
                      >
                        <Icon name="refresh" className="text-xs" />
                        Reenviar Código
                      </button>
                    )}
                    
                    <button 
                      type="button"
                      onClick={() => setIsVerifying(false)}
                      className="w-full text-[10px] uppercase tracking-widest text-on-surface-variant hover:text-primary-fixed text-center opacity-60 hover:opacity-100 transition-opacity"
                    >
                      Alterar número ou dados
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

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
                  <Icon name={isVerifying ? 'verified' : (isSignUp ? 'person_add' : 'login')} />
                  <span>{isVerifying ? 'Confirmar e Cadastrar' : (isSignUp ? 'Cadastrar' : 'Entrar no Sistema')}</span>
                </>
              )}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default Login;
