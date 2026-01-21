import React from 'react';
import { formatCurrency } from '../utils';
import { LucideIcon } from 'lucide-react';

interface SummaryCardProps {
  title: string;
  amount: number;
  icon: LucideIcon;
  variant?: 'default' | 'success' | 'danger' | 'warning' | 'info';
  subtitle?: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ 
  title, 
  amount, 
  icon: Icon, 
  variant = 'default',
  subtitle
}) => {
  const getColors = () => {
    switch (variant) {
      case 'success': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'danger': return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'warning': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'info': return 'bg-blue-50 text-blue-700 border-blue-100';
      default: return 'bg-white text-slate-700 border-slate-200';
    }
  };

  return (
    <div className={`p-5 rounded-2xl border shadow-sm flex flex-col justify-between transition-all duration-200 hover:shadow-md ${getColors()}`}>
      <div className="flex justify-between items-start mb-2">
        <p className="text-sm font-medium opacity-80">{title}</p>
        <div className="p-2 bg-white/50 rounded-lg backdrop-blur-sm">
          <Icon size={20} />
        </div>
      </div>
      <div>
        <h3 className="text-2xl font-bold tracking-tight">{formatCurrency(amount)}</h3>
        {subtitle && <p className="text-xs mt-1 opacity-75">{subtitle}</p>}
      </div>
    </div>
  );
};