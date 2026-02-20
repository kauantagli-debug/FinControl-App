
'use client';

import { useState } from 'react';
import { X, Check, CreditCard } from 'lucide-react';

interface CardFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const COLORS = [
    { name: 'Nubank Purple', value: 'from-purple-800 to-purple-600' },
    { name: 'Inter Orange', value: 'from-orange-600 to-yellow-500' },
    { name: 'C6 Black', value: 'from-zinc-900 to-zinc-700' },
    { name: 'Blue Classic', value: 'from-blue-700 to-cyan-500' },
    { name: 'Gold Premium', value: 'from-yellow-600 to-amber-400' },
    { name: 'Green Eco', value: 'from-emerald-700 to-green-500' },
];

export function CardForm({ isOpen, onClose, onSuccess }: CardFormProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        last4Digits: '',
        limit: '',
        closingDay: '',
        dueDay: '',
        color: COLORS[0].value
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/cards', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                onSuccess();
                onClose();
                setFormData({ name: '', last4Digits: '', limit: '', closingDay: '', dueDay: '', color: COLORS[0].value });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#12121a] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-white/5 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-indigo-400" />
                        Novo Cartão
                    </h2>
                    <button onClick={onClose} className="p-1 hover:bg-white/5 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-zinc-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-1">Apelido do Cartão</label>
                        <input
                            type="text"
                            required
                            placeholder="Ex: Nubank, XP Infinite..."
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-zinc-400 mb-1">Últimos 4 dígitos</label>
                            <input
                                type="text"
                                maxLength={4}
                                placeholder="1234"
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-colors font-mono"
                                value={formData.last4Digits}
                                onChange={e => setFormData({ ...formData, last4Digits: e.target.value.replace(/\D/g, '') })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-zinc-400 mb-1">Limite Total (R$)</label>
                            <input
                                type="number"
                                required
                                placeholder="5000.00"
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
                                value={formData.limit}
                                onChange={e => setFormData({ ...formData, limit: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-zinc-400 mb-1">Dia do Fechamento</label>
                            <input
                                type="number"
                                min={1} max={31}
                                required
                                placeholder="Dia"
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
                                value={formData.closingDay}
                                onChange={e => setFormData({ ...formData, closingDay: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-zinc-400 mb-1">Dia do Vencimento</label>
                            <input
                                type="number"
                                min={1} max={31}
                                required
                                placeholder="Dia"
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
                                value={formData.dueDay}
                                onChange={e => setFormData({ ...formData, dueDay: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-2">Cor do Cartão</label>
                        <div className="grid grid-cols-6 gap-2">
                            {COLORS.map((c) => (
                                <button
                                    key={c.value}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, color: c.value })}
                                    className={`w-8 h-8 rounded-full bg-gradient-to-br ${c.value} border-2 transition-all ${formData.color === c.value ? 'border-white scale-110 shadow-lg shadow-white/20' : 'border-transparent opacity-60 hover:opacity-100'
                                        }`}
                                    title={c.name}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Check className="w-5 h-5" />
                                    Salvar Cartão
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
