import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiFileText } from 'react-icons/fi';

import { loginRequest, getMe } from '../../services/authService';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Alert } from '../../components/Alert'; // Novo Componente

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const data = await loginRequest(email, password);
      const token = data.token || data.accessToken;

      if (token) {
        localStorage.setItem('sidi_token', token);
        
        // Tenta buscar dados do usuário atualizados
        try {
            const userMe = await getMe();
            const nameToSave = userMe.name || userMe.nome || email.split('@')[0];
            localStorage.setItem('sidi_user_name', nameToSave);
            if (userMe.role) localStorage.setItem('sidi_user_role', userMe.role);
            
            if (userMe.role === 'SUPER_ADMIN') navigate('/admin');
            else navigate('/home');
        } catch (meError) {
            // Fallback caso /me falhe
            const nameToSave = data.name || email.split('@')[0];
            localStorage.setItem('sidi_user_name', nameToSave);
            navigate('/home'); 
        }

        if (rememberMe) localStorage.setItem('sidi_email_saved', email);
        else localStorage.removeItem('sidi_email_saved');

      } else {
        setError('Erro de protocolo: Token não recebido.');
      }

    } catch (err) {
      console.error("Erro login:", err);
      const status = err.response ? err.response.status : null;
      if (status === 401 || status === 400 || status === 404) setError('E-mail ou senha incorretos.');
      else if (err.code === "ERR_NETWORK") setError('Sem conexão com o servidor.');
      else setError('Ocorreu um erro inesperado.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 font-sans">
      <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl w-full max-w-md text-center border border-gray-100">
        
        <div className="mb-8">
          <div className="bg-primary w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <FiFileText size={24} color="white" />
          </div>
          <h1 className="text-gray-900 text-2xl font-extrabold mb-1">SIDI-DOC</h1>
          <p className="text-gray-500 text-sm">Acesse sua conta</p>
        </div>

        <form onSubmit={handleLogin} className="text-left space-y-5">
          {/* Componente Alert */}
          {error && <Alert type="error" message={error} />}

          <Input 
            label="Email" type="email" placeholder="seu@email.com" icon={FiMail}
            value={email} onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading} required
          />

          <Input 
            label="Senha" type={showPassword ? "text" : "password"} placeholder="••••••••" icon={FiLock}
            value={password} onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading} required
            rightElement={
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-600 focus:outline-none flex">
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            }
          />

          <div className="flex justify-between items-center text-sm pt-1">
            <label className="flex items-center gap-2 text-gray-500 cursor-pointer">
              <input type="checkbox" className="accent-primary w-4 h-4 rounded border-gray-300 focus:ring-primary cursor-pointer"
                checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} disabled={isLoading} />
              Lembrar-me
            </label>
            <a href="#" className="text-primary font-bold hover:brightness-90 no-underline">Esqueceu a senha?</a>
          </div>
        
          <Button type="submit" isLoading={isLoading}>Entrar</Button>
        </form>

        <footer className="text-[10px] text-gray-400 leading-tight mx-auto max-w-[250px] pt-6">
          Seus dados estão protegidos com segurança de nível corporativo
        </footer>
      </div>
    </div>
  );
}

export default Login;