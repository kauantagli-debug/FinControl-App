import React from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { formatMonthYear } from '../utils';

interface MonthSelectorProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export const MonthSelector: React.FC<MonthSelectorProps> = ({ 
  currentDate, 
  onPrevMonth, 
  onNextMonth 
}) => {
  return (
    <div className="flex items-center bg-white rounded-full p-1.5 shadow-sm border border-gray-200">
      <button 
        onClick={onPrevMonth} 
        className="p-2 hover:bg-gray-50 text-gray-400 hover:text-brand-600 rounded-full transition-colors active:scale-95"
        aria-label="Mês anterior"
      >
        <ChevronLeft size={20} />
      </button>
      
      <div className="flex items-center gap-2.5 px-6 min-w-[180px] justify-center select-none border-x border-gray-100 mx-1">
        <Calendar size={16} className="text-brand-500" />
        <span className="font-bold text-gray-800 capitalize text-sm tracking-wide">
          {formatMonthYear(currentDate)}
        </span>
      </div>

      <button 
        onClick={onNextMonth} 
        className="p-2 hover:bg-gray-50 text-gray-400 hover:text-brand-600 rounded-full transition-colors active:scale-95"
        aria-label="Próximo mês"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};