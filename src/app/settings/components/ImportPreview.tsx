
'use client';

import { useState } from 'react';
import { Check, X, ArrowRight, Loader2 } from 'lucide-react';
import { Category } from '@/app/dashboard/types';

interface ImportedTransaction {
    date: string;
    description: string;
    amount: number;
    type: 'INCOME' | 'EXPENSE';
    categoryId?: string;
    suggestedCategory?: string;
    selected?: boolean;
}

interface ImportPreviewProps {
    transactions: ImportedTransaction[];
    categories: Category[];
    onCancel: () => void;
    onConfirm: (finalTransactions: ImportedTransaction[]) => void;
}

export function ImportPreview({ transactions: initialTransactions, categories, onCancel, onConfirm }: ImportPreviewProps) {
    const [transactions, setTransactions] = useState(
        initialTransactions.map(t => ({ ...t, selected: true }))
    );
    const [loading, setLoading] = useState(false);

    const handleCategoryChange = (index: number, catId: string) => {
        const newTrans = [...transactions];
        newTrans[index].categoryId = catId;
        setTransactions(newTrans);
    };

    const toggleSelect = (index: number) => {
        const newTrans = [...transactions];
        newTrans[index].selected = !newTrans[index].selected;
        setTransactions(newTrans);
    };

    const handleConfirm = async () => {
        const selected = transactions.filter(t => t.selected);
        if (selected.length === 0) return;

        setLoading(true);
        // Transform for API
        // API expects { transactions: [...] }
        // We call onConfirm, parent handles API call?
        // Let's handle API call here or pass back to parent.
        // Parent is better for UI flow.
        onConfirm(selected);
    };

    const totalSelected = transactions.filter(t => t.selected).length;

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-10 fade-in duration-300">
            <div className="flex justify-between items-center bg-[#1c1c26] p-4 rounded-xl border border-white/5">
                <div>
                    <h3 className="text-lg font-bold text-white">Revisar Importação</h3>
                    <p className="text-zinc-400 text-sm">{totalSelected} transações selecionadas</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 rounded-lg text-zinc-400 hover:bg-white/5 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={loading || totalSelected === 0}
                        className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        Confirmar Importação
                    </button>
                </div>
            </div>

            <div className="bg-[#121217] border border-white/5 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-zinc-400">
                        <thead className="bg-white/5 text-zinc-200 uppercase text-xs font-bold">
                            <tr>
                                <th className="p-4 w-10">
                                    <input type="checkbox" checked={totalSelected === transactions.length} readOnly className="rounded border-zinc-600 bg-zinc-800" />
                                </th>
                                <th className="p-4">Data</th>
                                <th className="p-4">Descrição</th>
                                <th className="p-4 text-right">Valor</th>
                                <th className="p-4">Categoria</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {transactions.map((t, i) => (
                                <tr key={i} className={`hover:bg-white/5 transition-colors ${!t.selected ? 'opacity-40' : ''}`}>
                                    <td className="p-4">
                                        <input
                                            type="checkbox"
                                            checked={t.selected}
                                            onChange={() => toggleSelect(i)}
                                            className="rounded border-zinc-600 bg-zinc-800 accent-purple-500 w-4 h-4"
                                        />
                                    </td>
                                    <td className="p-4 whitespace-nowrap">
                                        {new Date(t.date).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 font-medium text-zinc-200">
                                        {t.description}
                                    </td>
                                    <td className={`p-4 text-right font-bold whitespace-nowrap ${t.type === 'INCOME' ? 'text-green-400' : 'text-zinc-200'}`}>
                                        {t.type === 'EXPENSE' ? '-' : '+'} R$ {typeof t.amount === 'string' ? parseFloat(t.amount).toFixed(2) : t.amount.toFixed(2)}
                                    </td>
                                    <td className="p-4">
                                        <div className="relative">
                                            <select
                                                value={t.categoryId || ""}
                                                onChange={(e) => handleCategoryChange(i, e.target.value)}
                                                className={`w-full bg-[#1c1c26] border rounded-lg py-2 pl-3 pr-8 text-xs appearance-none focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors ${!t.categoryId ? 'border-orange-500/50 text-orange-400' : 'border-white/10 text-white'}`}
                                            >
                                                <option value="" disabled>Selecionar...</option>
                                                {categories.map(cat => (
                                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                ))}
                                            </select>
                                            {/* AI Badge if auto-matched */}
                                            {t.suggestedCategory && !t.categoryId && (
                                                <span className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-purple-500 text-[10px] text-white rounded shadow-sm pointer-events-none">
                                                    Sugerido: {t.suggestedCategory}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
