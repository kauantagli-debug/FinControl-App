import React, { useState, useEffect } from 'react';
import { X, CheckCircle, CreditCard, DollarSign, Wallet, Calendar } from 'lucide-react';
import { Transaction, TransactionType } from '../types';
import { getMonthKey, generateId, getDateFromMonthKey } from '../utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Transaction) => void;
  currentMonthKey: string; // O mês que o usuário está visualizando no dashboard
}

export const TransactionModal: React.FC<ModalProps> = ({ isOpen, onClose, onSave, currentMonthKey }) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Outros');
  
  // A data inicial deve ser baseada no Mês que o usuário está visualizando, não necessariamente "Hoje".
  // Se o usuário está em "Abril" mas hoje é "Março", sugerimos 01 de Abril.
  const [date, setDate] = useState('');
  
  const [isFixed, setIsFixed] = useState(false);
  const [isPaid, setIsPaid] = useState(true);
  
  // Específico para cartão: Mês da Fatura
  const [targetInvoiceMonth, setTargetInvoiceMonth] = useState(currentMonthKey);

  useEffect(() => {
    if (isOpen) {
      setDescription('');
      setAmount('');
      setCategory(type === 'income' ? 'Salário' : 'Alimentação');
      
      // Lógica Inteligente de Data:
      const today = new Date();
      const currentViewMonth = getDateFromMonthKey(currentMonthKey).substring(0, 7); // YYYY-MM
      const actualMonth = getMonthKey(today); // YYYY-MM

      if (currentViewMonth === actualMonth) {
        // Se estamos vendo o mês atual, sugerimos a data de hoje
        setDate(today.toISOString().split('T')[0]);
      } else {
        // Se estamos vendo outro mês, sugerimos o dia 01 daquele mês para evitar erros
        setDate(getDateFromMonthKey(currentMonthKey));
      }

      setTargetInvoiceMonth(currentMonthKey);
      setIsFixed(false);
      setIsPaid(true);
    }
  }, [isOpen, currentMonthKey, type]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Determina o "Mês Contábil" (Target Month)
    // Se for Cartão: O usuário define explicitamente (Fatura).
    // Se for Receita/Despesa: É o mês da data selecionada.
    let finalTargetMonth = targetInvoiceMonth;
    
    if (type !== 'credit') {
        const d = new Date(date + 'T12:00:00'); // Força meio dia para evitar problemas de fuso no cálculo do mês
        finalTargetMonth = getMonthKey(d);
    }

    const newTransaction: Transaction = {
      id: generateId(),
      description,
      amount: parseFloat(amount),
      category,
      type,
      date,
      targetMonth: finalTargetMonth,
      isFixed: type === 'expense' ? isFixed : undefined,
      isPaid: type === 'expense' ? isPaid : undefined,
    };

    onSave(newTransaction);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-4 border-b border-gray-100 shrink-0">
          <h2 className="text-lg font-bold text-gray-800">Nova Transação</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto">
          
          {/* Seleção de Tipo */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 ${
                type === 'income' 
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm' 
                  : 'border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
            >
              <DollarSign size={20} className="mb-1" />
              <span className="text-xs font-semibold">Receita</span>
            </button>
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 ${
                type === 'expense' 
                  ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-sm' 
                  : 'border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Wallet size={20} className="mb-1" />
              <span className="text-xs font-semibold">Despesa</span>
            </button>
            <button
              type="button"
              onClick={() => setType('credit')}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 ${
                type === 'credit' 
                  ? 'bg-purple-50 border-purple-500 text-purple-700 shadow-sm' 
                  : 'border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
            >
              <CreditCard size={20} className="mb-1" />
              <span className="text-xs font-semibold">Cartão</span>
            </button>
          </div>

          {/* Campos Principais */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <input
              required
              type="text"
              autoFocus
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={type === 'credit' ? 'Ex: Netflix, Ifood...' : 'Ex: Salário, Aluguel...'}
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-shadow"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
              <input
                required
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0,00"
                className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
              <input
                required
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
             <select 
               value={category} 
               onChange={(e) => setCategory(e.target.value)}
               className="w-full p-3 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-brand-500 outline-none"
             >
                <option>Alimentação</option>
                <option>Moradia</option>
                <option>Transporte</option>
                <option>Saúde</option>
                <option>Lazer</option>
                <option>Educação</option>
                <option>Assinaturas</option>
                <option>Salário</option>
                <option>Investimento</option>
                <option>Outros</option>
             </select>
          </div>

          {/* Campos Lógicos Condicionais */}
          {type === 'credit' && (
            <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-2 mb-2 text-purple-900">
                <Calendar size={18} />
                <label className="text-sm font-bold">Vencimento da Fatura</label>
              </div>
              <p className="text-xs text-purple-700 mb-3 leading-relaxed">
                Independente da data da compra, selecione em qual <strong>Mês/Fatura</strong> este valor será cobrado do seu saldo.
              </p>
              <input
                required
                type="month"
                value={targetInvoiceMonth}
                onChange={(e) => setTargetInvoiceMonth(e.target.value)}
                className="w-full p-3 rounded-lg border border-purple-200 focus:ring-2 focus:ring-purple-500 outline-none bg-white"
              />
            </div>
          )}

          {type === 'expense' && (
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg animate-in fade-in">
              <label className="flex items-center space-x-3 cursor-pointer p-1">
                <input 
                  type="checkbox" 
                  checked={isFixed}
                  onChange={(e) => setIsFixed(e.target.checked)}
                  className="w-5 h-5 text-brand-600 rounded focus:ring-brand-500 border-gray-300" 
                />
                <span className="text-sm font-medium text-gray-700">Gasto Fixo?</span>
              </label>

               <label className="flex items-center space-x-3 cursor-pointer p-1">
                <input 
                  type="checkbox" 
                  checked={isPaid}
                  onChange={(e) => setIsPaid(e.target.checked)}
                  className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500 border-gray-300" 
                />
                <span className="text-sm font-medium text-gray-700">Já pago?</span>
              </label>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 px-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-lg shadow-brand-500/30 transition-all active:scale-[0.98] mt-4 flex justify-center items-center gap-2"
          >
            <CheckCircle size={20} />
            Salvar Transação
          </button>
        </form>
      </div>
    </div>
  );
};