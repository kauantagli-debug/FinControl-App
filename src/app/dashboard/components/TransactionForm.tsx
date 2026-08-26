'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Calendar, Tag, FileText, CheckCircle2, ChevronDown, CreditCard, Loader2 } from 'lucide-react';
import { Category, Card } from '../types';
import { transactionSchema, TransactionFormData, useTransactions } from '@/lib/hooks/useTransactions';

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
    const { submitTransaction } = useTransactions();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors }
    } = useForm<TransactionFormData>({
        resolver: zodResolver(transactionSchema),
        defaultValues: {
            type: 'EXPENSE',
            amount: undefined,
            description: '',
            categoryId: '',
            cardId: '',
            installments: 1,
            date: new Date().toISOString().split('T')[0]
        }
    });

    const type = watch('type');
    const cardId = watch('cardId');

    const onSubmit = async (data: TransactionFormData) => {
        setIsSubmitting(true);
        try {
            await submitTransaction({
                ...data,
                cardId: data.type === 'EXPENSE' ? data.cardId : undefined,
                installments: data.type === 'EXPENSE' && data.cardId ? data.installments : 1,
                date: new Date(data.date).toISOString()
            });
            onTransactionAdded();
            reset();
            onClose();
        } catch (error) {
            const err = error as Error;
            alert(`Erro ao salvar: ${err.message || "Tente novamente."}`);
        } finally {
            setIsSubmitting(false);
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

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                    {/* Type Toggle */}
                    <div className="grid grid-cols-2 gap-2 p-1 bg-white/5 rounded-xl mb-2">
                        <button
                            type="button"
                            onClick={() => setValue('type', 'INCOME')}
                            className={`py-2 rounded-lg text-sm font-medium transition-all ${type === 'INCOME' ? 'bg-[#1c1c26] text-green-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
                                }`}
                        >
                            Entrada
                        </button>
                        <button
                            type="button"
                            onClick={() => setValue('type', 'EXPENSE')}
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
                            {...register('amount', { valueAsNumber: true })}
                            className="w-full bg-[#1c1c26] border border-white/5 rounded-xl py-4 pl-10 pr-4 text-2xl font-bold text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                        />
                        {errors.amount && <span className="text-red-400 text-xs absolute -bottom-5 left-2">{errors.amount.message}</span>}
                    </div>

                    {/* Card Selector (Expense Only) */}
                    {type === 'EXPENSE' && (
                        cards && cards.length > 0 ? (
                            <div className="space-y-2 mt-2">
                                <div className="relative group">
                                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-purple-400 transition-colors" />
                                    <select
                                        {...register('cardId')}
                                        className="w-full bg-[#1c1c26] border border-white/5 rounded-xl py-3 pl-12 pr-4 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-sm"
                                    >
                                        <option value="">Saldo da Conta (Débito/Dinheiro)</option>
                                        {cards.map(card => (
                                            <option key={card.id} value={card.id}>
                                                💳 Cartão {card.name} (Final {card.last4Digits})
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                                </div>

                                {/* Installments (If Card Selected) */}
                                {cardId && (
                                    <div className="relative group animate-fadeIn">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-xs font-medium">Nº Parcelas</span>
                                        <input
                                            type="number"
                                            min="1"
                                            max="24"
                                            placeholder="1"
                                            {...register('installments', { valueAsNumber: true })}
                                            className="w-full bg-[#1c1c26] border border-white/5 rounded-xl py-3 pl-28 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-sm"
                                        />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="mt-2 p-3 bg-purple-500/5 border border-purple-500/10 rounded-xl flex items-center justify-between text-xs">
                                <span className="text-zinc-400 flex items-center gap-1.5">
                                    <CreditCard className="w-4 h-4 text-purple-400" />
                                    Pagar no crédito / parcelado?
                                </span>
                                <Link 
                                    href="/cards" 
                                    className="text-purple-400 hover:text-purple-300 font-semibold underline underline-offset-2"
                                    onClick={onClose}
                                >
                                    + Cadastrar Cartão
                                </Link>
                            </div>
                        )
                    )}

                    {/* Description */}
                    <div className="relative group mt-2">
                        <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-purple-400 transition-colors" />
                        <input
                            type="text"
                            placeholder="Descrição"
                            {...register('description')}
                            className="w-full bg-[#1c1c26] border border-white/5 rounded-xl py-3 pl-12 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                        />
                        {errors.description && <span className="text-red-400 text-xs absolute -bottom-5 left-2">{errors.description.message}</span>}
                    </div>

                    {/* Date and Category Grid */}
                    <div className="grid grid-cols-2 gap-4 mt-2">
                        {/* Date */}
                        <div className="relative group">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-purple-400 transition-colors" />
                            <input
                                type="date"
                                {...register('date')}
                                className="w-full bg-[#1c1c26] border border-white/5 rounded-xl py-3 pl-12 pr-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                            />
                            {errors.date && <span className="text-red-400 text-xs absolute -bottom-5 left-2">{errors.date.message}</span>}
                        </div>

                        {/* Category */}
                        <div className="relative group">
                            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-purple-400 transition-colors" />
                            <select
                                {...register('categoryId')}
                                className="w-full bg-[#1c1c26] border border-white/5 rounded-xl py-3 pl-12 pr-8 text-white text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                            >
                                <option value="">Categoria</option>
                                {categories
                                    .map(cat => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.icon} {cat.name}
                                        </option>
                                    ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                            {errors.categoryId && <span className="text-red-400 text-xs absolute -bottom-5 left-2">{errors.categoryId.message}</span>}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-purple-600 hover:bg-purple-500 text-white rounded-xl py-4 mt-4 font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <CheckCircle2 className="w-5 h-5" />
                                Salvar Transação
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
