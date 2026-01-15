import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiAlertCircle, FiUserCheck } from 'react-icons/fi';
import { completeRegistration } from '../../services/authService';
import { PasswordInput } from '../../components/PasswordInput'; 

export default function ActivateAccount() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Pega o token da URL (?token=...)
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [msg, setMsg] = useState('');

  // === VALIDAÇÃO ===
  const validatePassword = (pass) => {
    if (pass.length < 8) return "Mínimo de 8 caracteres.";
    if (!/[A-Z]/.test(pass)) return "Precisa de uma letra MAIÚSCULA.";
    if (!/[a-z]/.test(pass)) return "Precisa de uma letra minúscula.";
    if (!/[0-9]/.test(pass)) return "Precisa de um número.";
    if (!/[@$!%*?&#.]/.test(pass)) return "Use um especial: @$!%*?&#.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');

    if (password !== confirmPassword) {
      setMsg("As senhas não coincidem.");
      return;
    }

    const validationError = validatePassword(password);
    if (validationError) {
      setMsg(validationError);
      return;
    }

    setStatus('loading');
    try {
      await completeRegistration(token, password);
      setStatus('success');
      setTimeout(() => navigate('/login'), 4000);
    } catch (error) {
      console.error(error);
      setStatus('error');
      const errorMsg = error.response?.data?.message || error.response?.data || "Erro ao ativar conta. Token inválido.";
      setMsg(typeof errorMsg === 'string' ? errorMsg : "Erro desconhecido.");
    }
  };

  if (!token) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 font-sans">
            <div className="bg-white p-6 rounded-2xl shadow-sm text-center w-full max-w-sm border border-gray-100">
                <div className="w-12 h-12 bg-red-50 text-red-400 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FiAlertCircle className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-bold text-gray-800 mb-1">Link Inválido</h2>
                <p className="text-gray-500 text-sm">O link de ativação não foi encontrado ou expirou.</p>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8 font-sans text-gray-800">
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg w-full max-w-md border border-gray-100">
        
        {status === 'success' ? (
          <div className="text-center py-6 animate-fadeIn">
            <div className="w-16 h-16 bg-cyan-100 text-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiUserCheck className="w-8 h-8" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">Conta Ativada!</h2>
            <p className="text-gray-500 mt-2 text-sm leading-relaxed">Sua senha foi definida com sucesso.</p>
            <p className="text-gray-400 mt-6 text-xs animate-pulse">Indo para o login...</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-6 md:mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800">Ativar Conta</h2>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">Bem-vindo! Defina sua senha segura para começar a usar o sistema.</p>
              
              {/* Dica de Senha */}
              <div className="text-xs text-gray-500 mt-4 bg-gray-50 p-3 md:p-4 rounded-xl border border-gray-100 text-left">
                <p className="font-bold mb-2 text-gray-700 uppercase tracking-wide text-[10px]">Requisitos de Senha:</p>
                <ul className="space-y-1 text-gray-600">
                  <li className="flex items-center gap-2">
                     <div className="w-1 h-1 rounded-full bg-gray-400"></div> 8 caracteres ou mais
                  </li>
                  <li className="flex items-center gap-2">
                     <div className="w-1 h-1 rounded-full bg-gray-400"></div> Maiúscula, Minúscula e Número
                  </li>
                  <li className="flex items-center gap-2">
                     <div className="w-1 h-1 rounded-full bg-gray-400"></div> Símbolo: <span className="font-mono bg-white border border-gray-200 px-1 rounded text-gray-800">@$!%*?&#.</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
              {msg && (
                <div className={`text-sm text-center p-3 rounded-lg flex items-start justify-center gap-2 border ${status === 'error' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-yellow-50 text-yellow-600 border-yellow-100'}`}>
                    <FiAlertCircle className="shrink-0 mt-0.5 w-4 h-4" /> 
                    <span className="text-left flex-1 leading-tight">{msg}</span>
                </div>
              )}
              
              <PasswordInput 
                label="Definir Senha"
                placeholder="Crie sua senha"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />

              <PasswordInput 
                label="Confirmar Senha"
                placeholder="Repita a senha"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
              />

              <button 
                type="submit" 
                disabled={status === 'loading'} 
                className="w-full h-12 md:h-11 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-lg transition-all shadow-sm hover:shadow-md active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 mt-2"
              >
                {status === 'loading' ? "Ativando..." : "Ativar e Entrar"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}