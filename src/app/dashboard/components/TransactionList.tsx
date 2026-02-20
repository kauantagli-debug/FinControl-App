'use client';

import { Transaction } from '../types';
import { Coffee, Car, Home, DollarSign, ShoppingBag, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface TransactionListProps {
    transactions: Transaction[];
    onTransactionDeleted: () => void;
}

export function TransactionList({ transactions, onTransactionDeleted }: TransactionListProps) {
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir?')) return;
        setDeletingId(id);
        try {
            const res = await fetch(`/api/transactions?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                onTransactionDeleted();
            }
        } catch (e) {
            console.error(e);
        } finally {
            setDeletingId(null);
        }
    }

    // Helper to get icon based on category (mock logic for now)
    const getIcon = (categoryName?: string) => {
        const lower = categoryName?.toLowerCase() || '';
        if (lower.includes('alimentação') || lower.includes('comida')) return <Coffee className="w-5 h-5" />;
        if (lower.includes('transporte') || lower.includes('uber')) return <Car className="w-5 h-5" />;
        if (lower.includes('moradia') || lower.includes('casa')) return <Home className="w-5 h-5" />;
        if (lower.includes('salário') || lower.includes('pagamento')) return <DollarSign className="w-5 h-5" />;
        return <ShoppingBag className="w-5 h-5" />;
    };

    if (!transactions || transactions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <ShoppingBag className="w-8 h-8 text-zinc-600" />
                </div>
                <h3 className="text-white font-medium mb-1">Nenhuma transação</h3>
                <p className="text-zinc-500 text-sm">Adicione uma nova transação para começar.</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-4 px-6 pb-24">
            <div className="flex justify-between items-end mb-2">
                <h3 className="text-white font-bold text-lg">Histórico</h3>
                <button className="text-purple-400 text-sm hover:text-purple-300 transition-colors">Ver todos</button>
            </div>

            {transactions.map((t) => (
                <div key={t.id} className="group relative flex items-center justify-between p-4 rounded-2xl bg-[#1c1c26] border border-white/5 hover:bg-[#1c1c26]/80 transition-all active:scale-[0.99] overflow-hidden">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${t.type === 'INCOME' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-white/5 text-purple-400'
                            }`}>
                            {getIcon(t.category?.name)}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-white font-medium">{t.description}</span>
                            <span className="text-zinc-500 text-xs">{t.category?.name || 'Sem categoria'} • {new Date(t.date).toLocaleDateString('pt-BR')}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className={`font-bold ${t.type === 'INCOME' ? 'text-emerald-400' : 'text-white'}`}>
                            {t.type === 'EXPENSE' ? '-' : '+'}
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(t.amount))}
                        </span>

                        {/* Delete Button (Visible on hover or mostly always on mobile? swipe? For now simple button) */}
                        <button
                            onClick={() => handleDelete(t.id)}
                            disabled={deletingId === t.id}
                            className="opacity-0 group-hover:opacity-100 p-2 text-zinc-500 hover:text-red-400 transition-all"
                        >
                            {deletingId === t.id ? <div className="w-4 h-4 rounded-full border-2 border-zinc-500 border-t-transparent animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            ))}
        </div>
    )
}
