import React from 'react';
import { TrendingUp, TrendingDown, CreditCard, Trash2, Wallet, ArrowRight } from 'lucide-react';
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
      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-12 text-center flex flex-col items-center justify-center h-[400px]">
        <div className="bg-gray-50 p-6 rounded-full mb-6">
          <Wallet size={48} className="text-gray-300" strokeWidth={1.5} />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Sem lançamentos</h3>
        <p className="text-gray-500 mt-2 max-w-xs mx-auto">Nenhuma transação encontrada para este mês. Comece adicionando uma receita ou despesa.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
      <div className="divide-y divide-gray-50">
        {transactions.map((t) => (
          <div key={t.id} className="p-5 hover:bg-gray-50/80 transition-all duration-200 flex items-center justify-between group relative">
            
            <div className="flex items-center gap-5">
              {/* Ícone Indicativo */}
              <div className={`
                w-12 h-12 flex items-center justify-center rounded-2xl shrink-0 shadow-sm
                ${t.type === 'income' ? 'bg-emerald-50 text-emerald-600' : ''}
                ${t.type === 'expense' ? 'bg-rose-50 text-rose-600' : ''}
                ${t.type === 'credit' ? 'bg-gray-900 text-white' : ''}
              `}>
                {t.type === 'income' && <TrendingUp size={20} strokeWidth={2.5} />}
                {t.type === 'expense' && <TrendingDown size={20} strokeWidth={2.5} />}
                {t.type === 'credit' && <CreditCard size={20} strokeWidth={2.5} />}
              </div>

              {/* Detalhes */}
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 text-base truncate pr-4">{t.description}</p>
                <div className="flex flex-wrap gap-2 text-xs text-gray-500 items-center mt-1.5">
                  <span className="bg-gray-100 px-2.5 py-1 rounded-md text-gray-600 font-medium tracking-wide text-[10px] uppercase">
                    {t.category}
                  </span>
                  
                  <span className="text-gray-400 font-medium">{formatDate(t.date)}</span>
                  
                  {t.isFixed && <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md font-medium">Fixo</span>}
                  
                  {t.type === 'expense' && (
                    <span className={`px-2 py-0.5 rounded-md font-medium ${t.isPaid ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                      {t.isPaid ? 'Pago' : 'Pendente'}
                    </span>
                  )}
                  
                  {t.type === 'credit' && (
                    <span className="text-gray-600 font-medium flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-md">
                      Fatura
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Valor e Ações */}
            <div className="flex items-center gap-6 pl-4">
              <span className={`font-bold whitespace-nowrap text-base md:text-lg tracking-tight ${
                t.type === 'income' ? 'text-emerald-600' : 
                t.type === 'expense' ? 'text-rose-600' : 'text-gray-900'
              }`}>
                {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
              </span>
              
              <button 
                onClick={() => handleDeleteClick(t.id, t.description)}
                className="p-2 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
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