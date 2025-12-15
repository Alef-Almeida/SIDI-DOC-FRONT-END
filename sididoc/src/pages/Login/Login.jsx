import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiFileText, FiAlertCircle } from 'react-icons/fi';

// Services
import { loginRequest } from '../../services/authService';

// UI Components
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';

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
      // 1. Chama o serviço de autenticação
      const data = await loginRequest(email, password);

      // 2. Verifica e salva o token
      const token = data.token || data.accessToken;

      if (token) {
        localStorage.setItem('sidi_token', token);
        
        // Lógica de Fallback: Salva o nome para usar caso a API /users/me falhe
        // Tenta pegar 'name' ou 'nome', se não tiver, usa o começo do email
        const nameToSave = data.name || data.nome || email.split('@')[0];
        localStorage.setItem('sidi_user_name', nameToSave);

        if (data.role) {
            localStorage.setItem('sidi_user_role', data.role);
        }
        
        // Lógica do "Lembrar-me"
        if (rememberMe) {
          localStorage.setItem('sidi_email_saved', email);
        } else {
          localStorage.removeItem('sidi_email_saved');
        }

        if (data.role === 'SUPER_ADMIN') {
            navigate('/admin');
        } else {
            navigate('/home');
        }
      } else {
        setError('Erro de protocolo: Token não recebido.');
      }

    } catch (err) {
      console.error("Erro no login:", err);
      
      const status = err.response ? err.response.status : null;

      if (status === 401 || status === 400 || status === 404) {
        setError('E-mail ou senha incorretos.');
      } else if (err.code === "ERR_NETWORK") {
        setError('Sem conexão com o servidor. Verifique se o backend está rodando.');
      } else {
        setError('Ocorreu um erro inesperado. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 font-sans">
      
      {/* Card Principal */}
      <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl w-full max-w-md text-center border border-gray-100">
        
        {/* Cabeçalho com Logo */}
        <div className="mb-8">
          <div className="bg-primary w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <FiFileText size={24} color="white" />
          </div>
          <h1 className="text-gray-900 text-2xl font-extrabold mb-1">SIDI-DOC</h1>
          <p className="text-gray-500 text-sm">Acesse sua conta</p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleLogin} className="text-left space-y-5">
          
          {/* Alerta de Erro */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100 animate-pulse">
                <FiAlertCircle size={18} /> 
                <span>{error}</span>
            </div>
          )}

          {/* Input E-mail */}
          <Input 
            label="Email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={FiMail}
            disabled={isLoading}
            required
          />

          {/* Input Senha */}
          <Input 
            label="Senha"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={FiLock}
            disabled={isLoading}
            required
            rightElement={
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600 focus:outline-none flex items-center justify-center transition-colors"
                tabIndex="-1"
              >
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            }
          />

          {/* Opções Extras */}
          <div className="flex justify-between items-center text-sm pt-1">
            <label className="flex items-center gap-2 text-gray-500 cursor-pointer select-none hover:text-gray-700">
              <input 
                type="checkbox" 
                className="accent-primary w-4 h-4 rounded border-gray-300 focus:ring-primary cursor-pointer"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading}
              />
              Lembrar-me
            </label>
            <a href="#" className="text-primary font-bold hover:brightness-90 transition-all no-underline">
              Esqueceu a senha?
            </a>
          </div>
        
          {/* Botão Entrar */}
          <Button type="submit" isLoading={isLoading}>
            Entrar
          </Button>

        </form>

        {/* Rodapé */}
        <footer className="text-[10px] text-gray-400 leading-tight mx-auto max-w-[250px] pt-6">
          Seus dados estão protegidos com segurança de nível corporativo
        </footer>

      </div>
    </div>
  );
}

export default Login;