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
  const getStyles = () => {
    switch (variant) {
      case 'success': return {
        iconBg: 'bg-emerald-100 text-emerald-600',
        text: 'text-gray-900'
      };
      case 'danger': return {
        iconBg: 'bg-rose-100 text-rose-600',
        text: 'text-gray-900'
      };
      case 'warning': return {
        iconBg: 'bg-amber-100 text-amber-600',
        text: 'text-gray-900'
      };
      case 'info': return {
        iconBg: 'bg-brand-100 text-brand-600',
        text: 'text-brand-900'
      };
      default: return {
        iconBg: 'bg-gray-100 text-gray-600',
        text: 'text-gray-900'
      };
    }
  };

  const styles = getStyles();

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-soft flex flex-col justify-between transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg h-full">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
        </div>
        <div className={`p-2.5 rounded-xl ${styles.iconBg}`}>
          <Icon size={22} strokeWidth={2} />
        </div>
      </div>
      <div>
        <h3 className={`text-2xl md:text-3xl font-bold tracking-tight ${styles.text}`}>
          {formatCurrency(amount)}
        </h3>
        {subtitle && (
          <p className={`text-xs mt-2 font-medium ${
            subtitle.includes('Negativo') ? 'text-rose-500' : 'text-gray-400'
          }`}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};