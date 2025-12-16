import { Link } from 'react-router-dom';

export function ActionCard({ to, icon: Icon, title, description, colorClass = "text-cyan-500", bgClass = "bg-cyan-50" }) {
  return (
    <Link to={to} className="group">
      <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:border-cyan-400 hover:shadow-md transition cursor-pointer h-full">
        <div className="flex items-center gap-4 mb-2">
          <div className={`p-3 rounded-full transition group-hover:brightness-95 ${bgClass}`}>
            <Icon className={`w-6 h-6 ${colorClass}`} />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>
        <p className="text-gray-500 text-sm">{description}</p>
      </div>
    </Link>
  );
}