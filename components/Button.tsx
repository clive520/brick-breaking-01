import React from 'react';

interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({ 
  onClick, 
  children, 
  variant = 'primary',
  className = ''
}) => {
  const baseStyle = "px-8 py-3 rounded-lg text-lg font-bold uppercase tracking-widest transition-all transform hover:scale-105 active:scale-95 shadow-lg";
  const variants = {
    primary: "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-500/50",
    secondary: "bg-slate-700 hover:bg-slate-600 text-white border border-slate-500"
  };

  return (
    <button 
      onClick={onClick} 
      className={`${baseStyle} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};