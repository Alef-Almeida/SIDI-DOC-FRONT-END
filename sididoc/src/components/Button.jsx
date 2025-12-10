export function Button({ children, isLoading, ...props }) {
  return (
    <button 
      className={`
        w-full py-3 rounded-lg font-bold text-base transition-all shadow-md active:scale-[0.98]
        flex items-center justify-center
        ${isLoading 
          ? 'bg-gray-400 cursor-not-allowed' 
          : 'bg-primary text-white hover:brightness-95'
        }
      `}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        // Um spinner simples feito com CSS/Tailwind
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : (
        children
      )}
    </button>
  );
}