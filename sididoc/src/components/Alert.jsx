import React from 'react';
import { FiAlertCircle, FiCheckCircle, FiInfo } from 'react-icons/fi';

export function Alert({ type = 'error', message }) {
  if (!message) return null;

  const styles = {
    error: {
      container: 'bg-red-50 border-red-100 text-red-700',
      icon: <FiAlertCircle className="w-5 h-5 shrink-0" />
    },
    success: {
      container: 'bg-green-50 border-green-100 text-green-800',
      icon: <FiCheckCircle className="w-5 h-5 shrink-0" />
    },
    info: {
      container: 'bg-blue-50 border-blue-100 text-blue-800',
      icon: <FiInfo className="w-5 h-5 shrink-0" />
    }
  };

  const currentStyle = styles[type] || styles.error;

  return (
    <div className={`p-3 md:p-4 rounded-lg border text-sm flex items-start gap-3 animate-pulse ${currentStyle.container}`}>
      <div className="mt-0.5">{currentStyle.icon}</div>
      <span className="font-medium leading-snug">{message}</span>
    </div>
  );
}