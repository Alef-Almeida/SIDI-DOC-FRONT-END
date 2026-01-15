import React from 'react';
import { Link } from 'react-router-dom';

export function ActionCard({ to, icon: Icon, title, description, colorClass = "text-cyan-500", bgClass = "bg-cyan-50" }) {
  return (
    <Link to={to} className="group block h-full">
      <div className="h-full flex flex-col justify-center p-5 md:p-6 bg-white rounded-xl shadow-sm border border-gray-200 cursor-pointer transition-all duration-200 hover:border-cyan-400 hover:shadow-md active:scale-[0.98] active:bg-gray-50">
        <div className="flex items-center gap-3 md:gap-4 mb-2 md:mb-3">
          <div className={`p-2.5 md:p-3 rounded-full transition group-hover:brightness-95 shrink-0 ${bgClass}`}>
            <Icon className={`w-5 h-5 md:w-6 md:h-6 ${colorClass}`} />
          </div>
          <h3 className="text-base md:text-lg font-semibold text-gray-800 leading-tight">
            {title}
          </h3>
        </div>
        <p className="text-sm text-gray-500 leading-relaxed">
          {description}
        </p>
      </div>
    </Link>
  );
}