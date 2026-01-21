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
    <div className="flex items-center bg-gray-100 rounded-full p-1 shadow-inner">
      <button 
        onClick={onPrevMonth} 
        className="p-2 hover:bg-white rounded-full shadow-sm transition-all text-gray-600 hover:text-brand-600 active:scale-95"
        aria-label="Mês anterior"
      >
        <ChevronLeft size={20} />
      </button>
      
      <div className="flex items-center gap-2 px-4 min-w-[160px] md:min-w-[200px] justify-center select-none">
        <Calendar size={18} className="text-brand-600" />
        <span className="font-bold text-gray-700 capitalize text-sm md:text-base">
          {formatMonthYear(currentDate)}
        </span>
      </div>

      <button 
        onClick={onNextMonth} 
        className="p-2 hover:bg-white rounded-full shadow-sm transition-all text-gray-600 hover:text-brand-600 active:scale-95"
        aria-label="Próximo mês"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};
