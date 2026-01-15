import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { resetPassword } from '../../services/authService';
import { PasswordInput } from '../../components/PasswordInput'; 

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState('idle'); 
  const [msg, setMsg] = useState('');

  // === FUNÇÃO DE VALIDAÇÃO ===
  const validatePassword = (pass) => {
    if (pass.length < 8) return "A senha deve ter no mínimo 8 caracteres.";
    if (!/[A-Z]/.test(pass)) return "A senha precisa de uma letra MAIÚSCULA.";
    if (!/[a-z]/.test(pass)) return "A senha precisa de uma letra minúscula.";
    if (!/[0-9]/.test(pass)) return "A senha precisa de um número.";
    if (!/[@$!%*?&#.]/.test(pass)) return "Use um caractere especial: @$!%*?&#.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');

    // 1. Valida Confirmação
    if (password !== confirmPassword) {
      setMsg("As senhas não coincidem.");
      return;
    }

    // 2. Valida Regras de Segurança
    const validationError = validatePassword(password);
    if (validationError) {
      setMsg(validationError);
      return;
    }

    // 3. Envia para o Backend
    setStatus('loading');
    try {
      await resetPassword(token, password);
      setStatus('success');
      setTimeout(() => navigate('/login'), 4000);
    } catch (error) {
      console.error(error);
      setStatus('error');
      const errorMsg = error.response?.data?.message || error.response?.data || "Erro ao redefinir. Link inválido ou expirado.";
      setMsg(typeof errorMsg === 'string' ? errorMsg : "Erro desconhecido.");
    }
  };

  if (!token) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 font-sans text-gray-500">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 w-full max-w-sm text-center">
                <FiAlertCircle className="mx-auto mb-3 text-red-400 w-10 h-10"/>
                <p className="font-medium">Link inválido.</p>
                <p className="text-sm mt-1">Token de segurança não encontrado.</p>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8 font-sans text-gray-800">
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg w-full max-w-md border border-gray-100">
        
        {status === 'success' ? (
          <div className="text-center py-6 animate-fadeIn">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCheckCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">Senha Alterada!</h2>
            <p className="text-gray-500 mt-2 text-sm">Sua senha foi atualizada com sucesso.</p>
            <p className="text-gray-400 mt-6 text-xs animate-pulse">Redirecionando para login...</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-6 md:mb-8">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">Definir Nova Senha</h2>
                
                <div className="text-xs text-gray-500 mt-4 bg-gray-50 p-3 md:p-4 rounded-xl border border-gray-100 text-left">
                  <p className="font-bold mb-2 text-gray-700 uppercase tracking-wide text-[10px]">Requisitos:</p>
                  <ul className="space-y-1 text-gray-600">
                    <li className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-gray-400"></div> Mínimo de 8 caracteres
                    </li>
                    <li className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-gray-400"></div> Maiúscula e Minúscula
                    </li>
                    <li className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-gray-400"></div> Pelo menos um Número
                    </li>
                    <li className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-gray-400"></div> Especial: <span className="font-mono bg-white border border-gray-200 px-1 rounded text-gray-800">@$!%*?&#.</span>
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
                label="Nova Senha"
                placeholder="Digite sua nova senha"
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
                {status === 'loading' ? "Salvando..." : "Redefinir Senha"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}