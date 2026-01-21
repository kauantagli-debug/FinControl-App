import React, { useState, useEffect } from 'react';
import { X, CheckCircle, CreditCard, DollarSign, Wallet, Calendar, AlertCircle } from 'lucide-react';
import { Transaction, TransactionType } from '../types';
import { getMonthKey, generateId, getDateFromMonthKey } from '../utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Transaction) => void;
  currentMonthKey: string;
}

export const TransactionModal: React.FC<ModalProps> = ({ isOpen, onClose, onSave, currentMonthKey }) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Outros');
  const [date, setDate] = useState('');
  const [isFixed, setIsFixed] = useState(false);
  const [isPaid, setIsPaid] = useState(true);
  const [targetInvoiceMonth, setTargetInvoiceMonth] = useState(currentMonthKey);

  useEffect(() => {
    if (isOpen) {
      setDescription('');
      setAmount('');
      setCategory(type === 'income' ? 'Salário' : 'Alimentação');
      
      const today = new Date();
      const currentViewMonth = getDateFromMonthKey(currentMonthKey).substring(0, 7);
      const actualMonth = getMonthKey(today);

      if (currentViewMonth === actualMonth) {
        setDate(today.toISOString().split('T')[0]);
      } else {
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
    let finalTargetMonth = targetInvoiceMonth;
    if (type !== 'credit') {
        const d = new Date(date + 'T12:00:00');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm transition-all duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in flex flex-col max-h-[95vh] border border-gray-100">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Nova Transação</h2>
            <p className="text-sm text-gray-500 mt-0.5">Preencha os detalhes abaixo</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
          
          {/* Type Selector (Big Cards) */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'income', label: 'Receita', icon: DollarSign, color: 'emerald' },
              { id: 'expense', label: 'Despesa', icon: Wallet, color: 'rose' },
              { id: 'credit', label: 'Cartão', icon: CreditCard, color: 'brand' }
            ].map((item) => {
              const isSelected = type === item.id;
              const Icon = item.icon;
              // Dynamic coloring logic based on selection
              const activeClass = isSelected 
                ? item.id === 'income' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-1 ring-emerald-500'
                : item.id === 'expense' ? 'bg-rose-50 border-rose-500 text-rose-700 ring-1 ring-rose-500'
                : 'bg-brand-50 border-brand-500 text-brand-700 ring-1 ring-brand-500'
                : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300';
              
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setType(item.id as TransactionType)}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-200 ${activeClass}`}
                >
                  <Icon size={24} className="mb-2" />
                  <span className="text-xs font-bold tracking-wide">{item.label}</span>
                </button>
              )
            })}
          </div>

          {/* Core Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Descrição</label>
              <input
                required
                type="text"
                autoFocus
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={type === 'credit' ? 'Ex: Netflix, Ifood...' : 'Ex: Salário, Aluguel...'}
                className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 focus:border-transparent focus:bg-white outline-none transition-all placeholder-gray-400 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Valor (R$)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">R$</span>
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0,00"
                    className="w-full p-4 pl-10 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 focus:border-transparent focus:bg-white outline-none transition-all font-bold text-gray-800"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Data</label>
                <input
                  required
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 focus:border-transparent focus:bg-white outline-none transition-all font-medium text-gray-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Categoria</label>
               <div className="relative">
                 <select 
                   value={category} 
                   onChange={(e) => setCategory(e.target.value)}
                   className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 focus:border-transparent focus:bg-white outline-none transition-all appearance-none font-medium text-gray-700"
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
                 <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                   <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                 </div>
               </div>
            </div>
          </div>

          {/* Contextual Info */}
          {type === 'credit' && (
            <div className="bg-gray-900 p-5 rounded-2xl border border-gray-800 animate-in fade-in slide-in-from-top-2 shadow-lg">
              <div className="flex items-center gap-2 mb-3 text-white">
                <div className="bg-brand-500/20 p-1.5 rounded-lg">
                  <Calendar size={18} className="text-brand-300" />
                </div>
                <label className="text-sm font-bold tracking-wide">Vencimento da Fatura</label>
              </div>
              <p className="text-xs text-gray-400 mb-4 leading-relaxed border-l-2 border-brand-500 pl-3">
                Selecione em qual <strong>Mês de Fatura</strong> este valor será cobrado.
              </p>
              <input
                required
                type="month"
                value={targetInvoiceMonth}
                onChange={(e) => setTargetInvoiceMonth(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-700 bg-gray-800/50 text-white focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
          )}

          {type === 'expense' && (
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 animate-in fade-in">
              <label className="flex items-center space-x-3 cursor-pointer p-1">
                <input 
                  type="checkbox" 
                  checked={isFixed}
                  onChange={(e) => setIsFixed(e.target.checked)}
                  className="w-5 h-5 text-brand-600 rounded focus:ring-brand-500 border-gray-300 transition-all" 
                />
                <span className="text-sm font-medium text-gray-700">Gasto Fixo</span>
              </label>

               <label className="flex items-center space-x-3 cursor-pointer p-1">
                <input 
                  type="checkbox" 
                  checked={isPaid}
                  onChange={(e) => setIsPaid(e.target.checked)}
                  className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500 border-gray-300 transition-all" 
                />
                <span className="text-sm font-medium text-gray-700">Já pago</span>
              </label>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-4 px-6 bg-brand-600 hover:bg-brand-700 text-white font-bold text-lg rounded-2xl shadow-lg shadow-brand-500/30 transition-all active:scale-[0.98] mt-4 flex justify-center items-center gap-2"
          >
            <CheckCircle size={24} />
            <span>Salvar Transação</span>
          </button>
        </form>
      </div>
    </div>
  );
};