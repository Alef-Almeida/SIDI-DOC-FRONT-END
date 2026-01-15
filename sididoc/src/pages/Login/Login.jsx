import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMail, FiCheck, FiX } from 'react-icons/fi';
import { loginRequest, requestPasswordReset, getMe } from '../../services/authService';
import { PasswordInput } from '../../components/PasswordInput';

export default function Login() {
  const navigate = useNavigate();

  // Estados do Login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Estados do Modal "Esqueceu a Senha"
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryStatus, setRecoveryStatus] = useState(null); // 'sending', 'success', 'error'

  // --- LOGIN ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Autentica
      await loginRequest(email, password, rememberMe);

      // 2. Busca dados do usuário para verificar ROLE
      const user = await getMe();
      
      console.log("Usuário logado:", user);

      // Verifica roles
      if (user.role === 'SUPER_ADMIN' || user.role === 'ROLE_SUPER_ADMIN') {
        navigate('/admin');
      } else {
        navigate('/home');
      }

    } catch (err) {
      console.error(err);
      setError("Email ou senha incorretos.");
    } finally {
      setLoading(false);
    }
  };

  // --- RECUPERAÇÃO DE SENHA ---
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!recoveryEmail) return;

    setRecoveryStatus('sending');
    try {
      await requestPasswordReset(recoveryEmail);
      setRecoveryStatus('success');
      
      setTimeout(() => {
        setIsModalOpen(false);
        setRecoveryStatus(null);
        setRecoveryEmail('');
      }, 4000);
    } catch (err) {
      console.error(err);
      setRecoveryStatus('error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8 font-sans text-gray-800">
      
      {/* CARD DE LOGIN */}
      {/* Mobile: p-6 | Desktop: p-8 */}
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg w-full max-w-md border border-gray-100">
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">SIDI-DOC</h1>
          <p className="text-gray-500 text-sm mt-1">Bem-vindo de volta!</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 md:space-y-5">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center border border-red-100 animate-shake">
              {error}
            </div>
          )}

          {/* CAMPO DE EMAIL */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <FiMail className="w-5 h-5 md:w-[18px] md:h-[18px]" />
              </div>
              {/* text-base no mobile previne zoom no iOS */}
              <input 
                type="email" 
                required 
                className="w-full pl-10 pr-4 py-3 md:py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none text-base md:text-sm transition-all" 
                placeholder="seu@email.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
              />
            </div>
          </div>

          {/* CAMPO DE SENHA */}
          <PasswordInput 
            label="Senha"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* RODAPÉ DO FORM */}
          <div className="flex items-center justify-between text-sm pt-1">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input 
                type="checkbox" 
                className="text-cyan-500 rounded focus:ring-cyan-500 cursor-pointer w-4 h-4 border-gray-300" 
                checked={rememberMe} 
                onChange={(e) => setRememberMe(e.target.checked)} 
              />
              <span className="text-gray-500 group-hover:text-gray-700">Lembre-me</span>
            </label>
            
            <button 
              type="button" 
              onClick={() => setIsModalOpen(true)} 
              className="text-cyan-600 hover:text-cyan-700 hover:underline font-medium transition"
            >
              Esqueceu a senha?
            </button>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 md:py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98] mt-2"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>

      {/* MODAL SOLICITAÇÃO DE SENHA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 relative animate-scaleIn">
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition p-2"
            >
              <FiX size={20} />
            </button>
            
            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-800">Recuperar Senha</h3>
              <p className="text-sm text-gray-500 mt-1">Digite seu email para receber o link.</p>
            </div>

            {recoveryStatus === 'success' ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FiCheck size={24} />
                </div>
                <p className="text-gray-800 font-medium">Email enviado!</p>
                <p className="text-xs text-gray-400 mt-2">Verifique sua caixa de entrada.</p>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword}>
                <div className="mb-4">
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email Cadastrado</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <FiMail className="w-5 h-5 md:w-[18px] md:h-[18px]"/>
                    </div>
                    <input 
                      type="email" 
                      autoFocus 
                      required 
                      className="w-full pl-10 pr-4 py-3 md:py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none text-base md:text-sm transition-all"
                      placeholder="Email cadastrado" 
                      value={recoveryEmail} 
                      onChange={(e) => setRecoveryEmail(e.target.value)} 
                    />
                  </div>
                </div>
                
                {recoveryStatus === 'error' && (
                  <p className="text-xs text-red-500 mb-3 bg-red-50 p-2 rounded border border-red-100 text-center">
                    Erro ao enviar. Verifique o email.
                  </p>
                )}

                <button 
                  type="submit" 
                  disabled={recoveryStatus === 'sending'} 
                  className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 md:py-2.5 rounded-lg transition disabled:opacity-70 active:scale-[0.98]"
                >
                  {recoveryStatus === 'sending' ? "Enviando..." : "Enviar Link"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}