import React from 'react';
import { TrendingUp, TrendingDown, CreditCard, Trash2, Wallet } from 'lucide-react';
import { Transaction } from '../types';
import { formatCurrency, formatDate } from '../utils';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({ transactions, onDelete }) => {
  
  const handleDeleteClick = (id: string, description: string) => {
    if (window.confirm(`Deseja realmente excluir o lançamento "${description}"?`)) {
      onDelete(id);
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center flex flex-col items-center justify-center h-full min-h-[300px]">
        <div className="bg-gray-50 p-4 rounded-full mb-4">
          <Wallet size={48} className="text-gray-300" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">Sem lançamentos</h3>
        <p className="text-gray-500 mt-1">Nenhuma transação encontrada para este mês.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="divide-y divide-gray-100">
        {transactions.map((t) => (
          <div key={t.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group relative">
            
            <div className="flex items-center gap-4">
              {/* Ícone Indicativo */}
              <div className={`
                w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full shrink-0
                ${t.type === 'income' ? 'bg-emerald-100 text-emerald-600' : ''}
                ${t.type === 'expense' ? 'bg-rose-100 text-rose-600' : ''}
                ${t.type === 'credit' ? 'bg-purple-100 text-purple-600' : ''}
              `}>
                {t.type === 'income' && <TrendingUp size={20} />}
                {t.type === 'expense' && <TrendingDown size={20} />}
                {t.type === 'credit' && <CreditCard size={20} />}
              </div>

              {/* Detalhes */}
              <div className="min-w-0">
                <p className="font-semibold text-gray-800 truncate pr-2">{t.description}</p>
                <div className="flex flex-wrap gap-2 text-xs text-gray-500 items-center mt-0.5">
                  <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-medium">{t.category}</span>
                  <span className="hidden md:inline">•</span>
                  <span>{formatDate(t.date)}</span>
                  
                  {t.isFixed && <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded ml-1">Fixo</span>}
                  
                  {t.type === 'expense' && (
                    <span className={`px-1.5 py-0.5 rounded ml-1 border ${t.isPaid ? 'border-emerald-200 text-emerald-700' : 'border-amber-200 text-amber-700'}`}>
                      {t.isPaid ? 'Pago' : 'Pendente'}
                    </span>
                  )}
                  
                  {t.type === 'credit' && (
                    <span className="text-purple-600 font-medium ml-1 flex items-center gap-1">
                      <CreditCard size={10} /> Fatura
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Valor e Ações */}
            <div className="flex items-center gap-3 md:gap-5 pl-2">
              <span className={`font-bold whitespace-nowrap text-sm md:text-base ${t.type === 'income' ? 'text-emerald-600' : 'text-slate-700'}`}>
                {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
              </span>
              
              <button 
                onClick={() => handleDeleteClick(t.id, t.description)}
                className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                title="Excluir transação"
              >
                <Trash2 size={18} />
              </button>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};
