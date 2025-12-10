// Recebemos props para tornar o componente flexível
// icon: O ícone que vai na esquerda
// rightElement: O botão de "olhinho" ou qualquer coisa que vá na direita
// label: O texto acima do input
// ...props: Repassa todo o resto (value, onChange, type, placeholder) para o input HTML nativo
export function Input({ icon: Icon, rightElement, label, error, ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-gray-900 font-semibold mb-2 text-sm">
          {label}
        </label>
      )}
      
      <div className="relative flex items-center">
        {Icon && <Icon className="absolute left-3 text-gray-400" size={20} />}
        
        <input 
          className={`
            w-full py-3 px-4 border-2 rounded-lg transition-colors outline-none
            text-gray-700 placeholder-gray-400
            ${Icon ? 'pl-10' : 'pl-4'} /* Ajusta padding se tiver ícone */
            ${rightElement ? 'pr-10' : 'pr-4'} /* Ajusta padding se tiver botão na direita */
            ${error ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-primary'}
          `}
          {...props} 
        />
        
        {rightElement && (
          <div className="absolute right-3 flex items-center">
            {rightElement}
          </div>
        )}
      </div>
      
      {/* Mensagem de erro automática */}
      {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
    </div>
  );
}