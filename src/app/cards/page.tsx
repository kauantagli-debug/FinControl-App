
'use client';

import { useState, useEffect } from 'react';
import { Plus, CreditCard as CardIcon, Loader2, Receipt } from 'lucide-react';
import { CreditCard3D } from '../components/CreditCard3D';
import { CardForm } from './components/CardForm';
import { BottomNav } from '../dashboard/components/BottomNav';
import { TransactionForm } from '../dashboard/components/TransactionForm';
import { Category } from '../dashboard/types';

export default function CardsPage() {
    const [cards, setCards] = useState<any[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
    const [selectedCardIndex, setSelectedCardIndex] = useState(0);

    const fetchData = async () => {
        try {
            const [cardsRes, catRes] = await Promise.all([
                fetch('/api/cards'),
                fetch('/api/categories')
            ]);

            if (cardsRes.ok) setCards(await cardsRes.json());
            if (catRes.ok) setCategories(await catRes.json());

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const selectedCard = cards[selectedCardIndex];

    return (
        <div className="min-h-screen bg-[#05050f] text-white font-sans pb-32">
            <header className="p-6 pt-8 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Meus Cartões</h1>
                    <p className="text-zinc-400 text-sm">Gerencie limites e faturas</p>
                </div>
                <button
                    onClick={() => setIsFormOpen(true)}
                    className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400 hover:bg-white/10 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                </button>
            </header>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                </div>
            ) : cards.length === 0 ? (
                <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CardIcon className="w-8 h-8 text-zinc-500" />
                    </div>
                    <h2 className="text-lg font-bold text-zinc-300">Nenhum cartão</h2>
                    <p className="text-zinc-500 mb-6">Adicione seu primeiro cartão para controlar faturas.</p>
                    <button
                        onClick={() => setIsFormOpen(true)}
                        className="px-6 py-3 bg-indigo-600 rounded-xl text-white font-bold hover:bg-indigo-500 transition-colors"
                    >
                        Adicionar Cartão
                    </button>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Carousel */}
                    <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory px-6 pb-8 pt-4 no-scrollbar">
                        {cards.map((card, i) => (
                            <div
                                key={card.id}
                                className="snap-center shrink-0 w-full max-w-sm"
                                onClick={() => setSelectedCardIndex(i)}
                            >
                                <div className={`transition-all duration-300 ${i === selectedCardIndex ? 'scale-100 opacity-100' : 'scale-95 opacity-50 blur-[1px]'}`}>
                                    <CreditCard3D
                                        name={card.name}
                                        last4Digits={card.last4Digits}
                                        limit={parseFloat(card.limit)}
                                        currentInvoice={card.currentInvoice}
                                        color={card.color}
                                        closingDay={card.closingDay}
                                        dueDay={card.dueDay}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Selected Card Details (Invoice Breakdown) */}
                    {selectedCard && (
                        <div className="px-6 animate-in slide-in-from-bottom-10 fade-in duration-500">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    <Receipt className="w-5 h-5 text-indigo-400" />
                                    Fatura Atual (Virtual)
                                </h3>
                                <span className="text-xs text-zinc-500 bg-white/5 px-2 py-1 rounded">
                                    {new Date(selectedCard.invoicePeriod.start).toLocaleDateString()} - {new Date(selectedCard.invoicePeriod.end).toLocaleDateString()}
                                </span>
                            </div>

                            <div className="bg-[#12121a] border border-white/5 rounded-2xl p-4 space-y-4">
                                {selectedCard.currentInvoice === 0 ? (
                                    <p className="text-center text-zinc-500 py-4 text-sm">Sem gastos nesta fatura.</p>
                                ) : (
                                    selectedCard.transactions
                                        .filter((t: any) => {
                                            const tDate = new Date(t.date);
                                            const start = new Date(selectedCard.invoicePeriod.start);
                                            const end = new Date(selectedCard.invoicePeriod.end);
                                            return tDate >= start && tDate <= end;
                                        })
                                        .map((t: any) => (
                                            <div key={t.id} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-lg">
                                                        {t.category?.icon || "💸"}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-sm text-zinc-200">{t.description}</p>
                                                        <p className="text-xs text-zinc-500">{new Date(t.date).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <span className="font-bold text-zinc-200">
                                                    R$ {parseFloat(t.amount).toFixed(2)}
                                                </span>
                                            </div>
                                        ))
                                )}

                                <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                                    <span className="text-zinc-400 text-sm">Total da Fatura</span>
                                    <span className="text-xl font-bold text-indigo-400">
                                        R$ {selectedCard.currentInvoice.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <CardForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSuccess={fetchData}
            />

            <TransactionForm
                categories={categories}
                cards={cards}
                onTransactionAdded={fetchData}
                isOpen={isTransactionModalOpen}
                onClose={() => setIsTransactionModalOpen(false)}
            />

            <BottomNav onAddClick={() => setIsTransactionModalOpen(true)} />
        </div>
    );
}
