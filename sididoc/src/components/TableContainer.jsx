import React from 'react';

export function TableContainer({ children }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse">
          {children}
        </table>
      </div>
    </div>
  );
}

export function TableHeader({ headers }) {
  return (
    <thead className="bg-gray-50/50 border-b border-gray-200 text-xs uppercase text-gray-500 font-bold tracking-wider">
      <tr>
        {headers.map((h, i) => (
          <th 
            key={i} 
            className={`px-4 py-3 md:px-6 md:py-4 whitespace-nowrap ${h.className || ''}`}
          >
            {h.label}
          </th>
        ))}
      </tr>
    </thead>
  );
}