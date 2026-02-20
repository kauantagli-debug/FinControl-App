'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { BottomNav } from '../dashboard/components/BottomNav';
import { Plus, Target, Trophy, ChevronRight, CheckCircle2, X } from 'lucide-react';

interface Goal {
    id: string;
    name: string;
    targetAmount: string;
    currentAmount: string;
    deadline: string | null;
    icon: string | null;
    color: string;
    isCompleted: boolean;
}

export default function GoalsPage() {
    const { status } = useSession();
    const router = useRouter();
    const [goals, setGoals] = useState<Goal[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isAddMoneyModalOpen, setIsAddMoneyModalOpen] = useState<Goal | null>(null);

    // Create Form State
    const [newGoalName, setNewGoalName] = useState('');
    const [newGoalTarget, setNewGoalTarget] = useState('');
    const [newGoalDeadline, setNewGoalDeadline] = useState('');

    // Add Money State
    const [addAmount, setAddAmount] = useState('');

    const fetchGoals = async () => {
        try {
            const res = await fetch('/api/goals');
            if (res.ok) setGoals(await res.json());
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (status === 'unauthenticated') router.push('/login');
        else if (status === 'authenticated') fetchGoals();
    }, [status, router]);

    const handleCreateGoal = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/goals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newGoalName,
                    targetAmount: newGoalTarget,
                    deadline: newGoalDeadline || null,
                    icon: '🎯',
                    color: '#8b5cf6'
                })
            });
            if (res.ok) {
                setIsCreateModalOpen(false);
                setNewGoalName('');
                setNewGoalTarget('');
                setNewGoalDeadline('');
                fetchGoals();
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleAddMoney = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAddMoneyModalOpen) return;

        try {
            const current = parseFloat(isAddMoneyModalOpen.currentAmount.toString());
            const added = parseFloat(addAmount);
            const newTotal = current + added;

            const res = await fetch('/api/goals', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: isAddMoneyModalOpen.id,
                    currentAmount: newTotal
                })
            });

            if (res.ok) {
                setIsAddMoneyModalOpen(null);
                setAddAmount('');
                fetchGoals();
            }
        } catch (e) {
            console.error(e);
        }
    };

    if (status === 'loading' || loading) {
        return <div className="min-h-screen bg-[#05050f] flex items-center justify-center text-white">Carregando metas...</div>;
    }

    return (
        <div className="min-h-screen bg-[#05050f] text-white font-sans pb-32 px-6 pt-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Target className="w-6 h-6 text-purple-400" /> Metas
                </h1>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="w-10 h-10 rounded-full bg-purple-600 hover:bg-purple-500 flex items-center justify-center shadow-lg shadow-purple-900/40 transition-all active:scale-95"
                >
                    <Plus className="w-5 h-5 text-white" />
                </button>
            </div>

            <div className="flex flex-col gap-4">
                {goals.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-zinc-500 text-center">
                        <Trophy className="w-16 h-16 mb-4 opacity-20" />
                        <p>Nenhuma meta criada.</p>
                        <p className="text-sm">Defina um objetivo para começar a economizar!</p>
                    </div>
                ) : (
                    goals.map(goal => {
                        const target = parseFloat(goal.targetAmount.toString());
                        const current = parseFloat(goal.currentAmount.toString());
                        const progress = Math.min((current / target) * 100, 100);

                        return (
                            <div key={goal.id} className="bg-[#1c1c26]/60 backdrop-blur-md border border-white/5 rounded-2xl p-5 relative overflow-hidden group">
                                {goal.isCompleted && (
                                    <div className="absolute top-0 right-0 bg-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1 rounded-bl-xl border-l border-b border-emerald-500/20 flex items-center gap-1">
                                        <Trophy className="w-3 h-3" /> Conquistado!
                                    </div>
                                )}

                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-xl">
                                            {goal.icon || '🎯'}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white">{goal.name}</h3>
                                            <p className="text-zinc-500 text-xs">
                                                {goal.deadline ? `Até ${new Date(goal.deadline).toLocaleDateString('pt-BR')}` : 'Sem prazo'}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIsAddMoneyModalOpen(goal)}
                                        className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-2xl font-bold text-white">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(current)}
                                    </span>
                                    <span className="text-zinc-500 text-xs">
                                        de {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(target)}
                                    </span>
                                </div>

                                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 ${goal.isCompleted ? 'bg-emerald-500 shadow-emerald-500/40' : 'bg-purple-500 shadow-purple-500/40'}`}
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Create Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4">
                    <div className="w-full max-w-md bg-[#121217] border-t sm:border border-white/10 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-10">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Nova Meta</h2>
                            <button onClick={() => setIsCreateModalOpen(false)}><X className="w-6 h-6 text-zinc-400" /></button>
                        </div>
                        <form onSubmit={handleCreateGoal} className="flex flex-col gap-4">
                            <input
                                type="text"
                                placeholder="Nome da meta (ex: Viagem, Carro)"
                                value={newGoalName}
                                onChange={e => setNewGoalName(e.target.value)}
                                className="bg-[#1c1c26] border border-white/5 rounded-xl p-4 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                required
                            />
                            <input
                                type="number"
                                placeholder="Valor alvo (R$)"
                                value={newGoalTarget}
                                onChange={e => setNewGoalTarget(e.target.value)}
                                className="bg-[#1c1c26] border border-white/5 rounded-xl p-4 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                required
                            />
                            <input
                                type="date"
                                value={newGoalDeadline}
                                onChange={e => setNewGoalDeadline(e.target.value)}
                                className="bg-[#1c1c26] border border-white/5 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                            />
                            <button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 rounded-xl mt-2 transition-all active:scale-95">
                                Criar Meta
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Money Modal */}
            {isAddMoneyModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4">
                    <div className="w-full max-w-md bg-[#121217] border-t sm:border border-white/10 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-10">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Adicionar Progresso</h2>
                            <button onClick={() => setIsAddMoneyModalOpen(null)}><X className="w-6 h-6 text-zinc-400" /></button>
                        </div>
                        <p className="text-zinc-400 text-sm mb-4">Adicionando para: <span className="text-white font-bold">{isAddMoneyModalOpen.name}</span></p>
                        <form onSubmit={handleAddMoney} className="flex flex-col gap-4">
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">R$</span>
                                <input
                                    type="number"
                                    placeholder="0,00"
                                    value={addAmount}
                                    onChange={e => setAddAmount(e.target.value)}
                                    className="w-full bg-[#1c1c26] border border-white/5 rounded-xl p-4 pl-10 text-white text-xl font-bold placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                    required
                                    autoFocus
                                />
                            </div>
                            <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl mt-2 transition-all active:scale-95 flex items-center justify-center gap-2">
                                Confirmar <CheckCircle2 className="w-5 h-5" />
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <BottomNav onAddClick={() => { }} />
        </div>
    );
}
