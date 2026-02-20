'use client';

import { useState } from 'react';
import { X, Calendar, Tag, FileText, CheckCircle2, ChevronDown, CreditCard } from 'lucide-react';
import { Category, Card } from '../types';

interface TransactionFormProps {
    categories: Category[];
    cards?: Card[];
    onTransactionAdded: () => void;
    currentMonth?: number;
    currentYear?: number;
    isOpen: boolean;
    onClose: () => void;
}

export function TransactionForm({ categories, cards = [], onTransactionAdded, isOpen, onClose }: TransactionFormProps) {
    const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [cardId, setCardId] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch('/api/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: parseFloat(amount),
                    description,
                    categoryId,
                    cardId: type === 'EXPENSE' ? cardId : undefined,
                    date: new Date(date).toISOString(),
                    type
                })
            });

            if (res.ok) {
                onTransactionAdded();
                onClose();
                // Reset Fields
                setAmount('');
                setDescription('');
                setCategoryId('');
                setCardId('');
            } else {
                console.error("Failed to save transaction");
            }
        } catch (error) {
            console.error("Error submitting transaction", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4 animate-in fade-in duration-200">
            <div
                className="w-full max-w-md bg-[#121217] border-t sm:border border-white/10 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-20 duration-300"
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">Nova Transação</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-white/5 transition-colors"
                    >
                        <X className="w-6 h-6 text-zinc-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {/* Type Toggle */}
                    <div className="grid grid-cols-2 gap-2 p-1 bg-white/5 rounded-xl mb-2">
                        <button
                            type="button"
                            onClick={() => setType('INCOME')}
                            className={`py-2 rounded-lg text-sm font-medium transition-all ${type === 'INCOME' ? 'bg-[#1c1c26] text-green-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
                                }`}
                        >
                            Entrada
                        </button>
                        <button
                            type="button"
                            onClick={() => setType('EXPENSE')}
                            className={`py-2 rounded-lg text-sm font-medium transition-all ${type === 'EXPENSE' ? 'bg-[#1c1c26] text-red-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
                                }`}
                        >
                            Saída
                        </button>
                    </div>

                    {/* Amount Input */}
                    <div className="relative group">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-purple-400 transition-colors">R$</span>
                        <input
                            type="number"
                            step="0.01"
                            placeholder="0,00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full bg-[#1c1c26] border border-white/5 rounded-xl py-4 pl-10 pr-4 text-2xl font-bold text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                            required
                        />
                    </div>

                    {/* Card Selector (Expense Only) */}
                    {type === 'EXPENSE' && cards && cards.length > 0 && (
                        <div className="relative group">
                            <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-purple-400 transition-colors" />
                            <select
                                value={cardId}
                                onChange={(e) => setCardId(e.target.value)}
                                className="w-full bg-[#1c1c26] border border-white/5 rounded-xl py-3 pl-12 pr-4 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                            >
                                <option value="">Saldo da Conta (Débito/Dinheiro)</option>
                                {cards.map(card => (
                                    <option key={card.id} value={card.id}>
                                        Cartão {card.name} (Final {card.last4Digits})
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                        </div>
                    )}

                    {/* Description */}
                    <div className="relative group">
                        <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-purple-400 transition-colors" />
                        <input
                            type="text"
                            placeholder="Descrição"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-[#1c1c26] border border-white/5 rounded-xl py-3 pl-12 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                            required
                        />
                    </div>

                    {/* Category */}
                    <div className="relative group">
                        <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-purple-400 transition-colors" />
                        <select
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            className="w-full bg-[#1c1c26] border border-white/5 rounded-xl py-3 pl-12 pr-4 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                            required
                        >
                            <option value="" disabled>Selecione uma categoria</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                    </div>

                    {/* Date */}
                    <div className="relative group">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-purple-400 transition-colors" />
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full bg-[#1c1c26] border border-white/5 rounded-xl py-3 pl-12 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                            required
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-[#6b2c91] hover:bg-[#5a257a] text-white font-bold py-4 rounded-xl mt-4 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                Confirmar <CheckCircle2 className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}
