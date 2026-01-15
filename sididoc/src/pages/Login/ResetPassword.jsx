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
    
    // Verifica apenas os caracteres especiais permitidos: @$!%*?&#.
    if (!/[@$!%*?&#.]/.test(pass)) return "Use um caractere especial: @$!%*?&#.";
    
    return null; // Sem erros
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(''); // Limpa mensagens anteriores

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
        <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500 font-sans">
            <div className="text-center">
                <FiAlertCircle size={40} className="mx-auto mb-2 text-red-400"/>
                <p>Link inválido. Token não encontrado.</p>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans text-gray-800">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md border border-gray-100">
        
        {status === 'success' ? (
          <div className="text-center py-6 animate-fadeIn">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCheckCircle size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Senha Alterada!</h2>
            <p className="text-gray-500 mt-2 text-sm">Sua senha foi atualizada com sucesso.</p>
            <p className="text-gray-400 mt-4 text-xs">Redirecionando para login...</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Definir Nova Senha</h2>
                <div className="text-xs text-gray-500 mt-2 bg-gray-50 p-2 rounded border border-gray-100 text-left">
                  <p className="font-bold mb-1">Requisitos:</p>
                  <ul className="list-disc pl-4 space-y-0.5">
                    <li>Mínimo de 8 caracteres</li>
                    <li>Letra Maiúscula e Minúscula</li>
                    <li>Pelo menos um Número</li>
                    <li>Especial: <span className="font-mono bg-gray-200 px-1 rounded">@$!%*?&#.</span></li>
                  </ul>
                </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              {msg && (
                <div className={`text-sm text-center p-3 rounded-lg flex items-center justify-center gap-2 border ${status === 'error' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-yellow-50 text-yellow-600 border-yellow-100'}`}>
                    <FiAlertCircle className="shrink-0" /> <span className="text-left">{msg}</span>
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
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2.5 rounded-lg transition shadow-sm hover:shadow-md disabled:opacity-70 mt-2"
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