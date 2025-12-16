export function TableContainer({ children }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          {children}
        </table>
      </div>
    </div>
  );
}

// Sub-componente para o Header da tabela (opcional, mas ajuda)
export function TableHeader({ headers }) {
  return (
    <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-bold">
      <tr>
        {headers.map((h, i) => (
          <th key={i} className={`p-4 ${h.className || ''}`}>
            {h.label}
          </th>
        ))}
      </tr>
    </thead>
  );
}