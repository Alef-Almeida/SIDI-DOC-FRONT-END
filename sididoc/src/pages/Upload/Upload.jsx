import React from 'react';
import { Link } from 'react-router-dom';

export default function Upload() {
  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold">Página de Upload</h1>
      <p>Aqui ficará o formulário de envio.</p>
      <Link to="/dashboard" className="text-blue-500 underline mt-4 block">Voltar ao Dashboard</Link>
    </div>
  );
}