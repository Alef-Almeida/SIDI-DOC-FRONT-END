import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiFileText, FiAlertCircle } from 'react-icons/fi';

// Importando a regra de negócio (Service)
import { loginRequest } from "../../services/authService";

// Importando os componentes reutilizáveis (UI)
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";

function Login() {
  // Estados do formulário
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [lembrar, setLembrar] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  
  // Estados de controle da interface (loading e erro)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setError('');       // Limpa erros anteriores
    setLoading(true);   // Trava o botão e mostra spinner

    try {
      // 1. Chama o serviço de autenticação
      const data = await loginRequest(email, senha);

      // 2. Verifica se recebeu o token (adapte conforme o retorno do seu Java)
      const token = data.token || data.accessToken;

      if (token) {
        // 3. Salva o token para manter a sessão
        localStorage.setItem('sidi_token', token);

        // Lógica do "Lembrar-me"
        if (lembrar) {
          localStorage.setItem('sidi_email_saved', email);
        } else {
          localStorage.removeItem('sidi_email_saved');
        }

        // 4. Redireciona para o sistema principal
        navigate('/home');
      } else {
        // Caso o backend retorne 200 OK mas sem token (improvável, mas possível)
        setError('Erro de protocolo: Token não recebido.');
      }

    } catch (err) {
      console.error("Erro no login:", err);
      
      // Tratamento de erros comuns
      if (err.response && err.response.status === 401) {
        setError('E-mail ou senha incorretos.');
      } else if (err.code === "ERR_NETWORK") {
        setError('Sem conexão com o servidor. Verifique sua internet.');
      } else {
        setError('Ocorreu um erro inesperado. Tente novamente.');
      }
    } finally {
      // Sempre libera o botão no final, dando erro ou sucesso
      setLoading(false);
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
          
          {/* Alerta de Erro (Só aparece se houver erro) */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100 animate-pulse">
                <FiAlertCircle size={18} /> 
                <span>{error}</span>
            </div>
          )}

          {/* Componente Input: E-mail */}
          <Input 
            label="Email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={FiMail}
            disabled={loading}
            required
          />

          {/* Componente Input: Senha (com botão de toggle) */}
          <Input 
            label="Senha"
            type={mostrarSenha ? "text" : "password"}
            placeholder="••••••••"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            icon={FiLock}
            disabled={loading}
            required
            // Passamos o botão do olho como elemento da direita
            rightElement={
              <button 
                type="button" 
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="text-gray-400 hover:text-gray-600 focus:outline-none flex items-center justify-center transition-colors"
                tabIndex="-1" // Evita focar no olho ao dar Tab
              >
                {mostrarSenha ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            }
          />

          {/* Opções Extras */}
          <div className="flex justify-between items-center text-sm pt-1">
            <label className="flex items-center gap-2 text-gray-500 cursor-pointer select-none hover:text-gray-700">
              <input 
                type="checkbox" 
                className="accent-primary w-4 h-4 rounded border-gray-300 focus:ring-primary cursor-pointer"
                checked={lembrar}
                onChange={(e) => setLembrar(e.target.checked)}
                disabled={loading}
              />
              Lembrar-me
            </label>
            <a href="#" className="text-primary font-bold hover:brightness-90 transition-all no-underline">
              Esqueceu a senha?
            </a>
          </div>
        
          {/* Componente Button */}
          <Button type="submit" isLoading={loading}>
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