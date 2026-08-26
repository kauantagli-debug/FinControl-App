'use client';

interface BudgetItem {
    id: string;
    categoryId: string;
    categoryName: string;
    categoryIcon: string | null;
    categoryColor: string;
    budgetAmount: number;
    spentAmount: number;
    percentage: number;
}

interface BudgetProgressProps {
    budgets: BudgetItem[];
    onManageBudgets?: () => void;
}

export function BudgetProgress({ budgets, onManageBudgets }: BudgetProgressProps) {
    if (!budgets || budgets.length === 0) {
        return (
            <div className="flex flex-col gap-4 px-6 mb-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-white font-bold text-lg">Orçamentos</h3>
                    {onManageBudgets && (
                        <button
                            onClick={onManageBudgets}
                            className="text-purple-400 text-sm hover:text-purple-300 transition-colors"
                        >
                            Configurar
                        </button>
                    )}
                </div>
                <div className="bg-[#1c1c26]/60 backdrop-blur-md border border-white/5 rounded-3xl p-6 text-center">
                    <p className="text-zinc-500 text-sm">Nenhum orçamento definido.</p>
                    <p className="text-zinc-600 text-xs mt-1">Defina limites por categoria para controlar seus gastos.</p>
                </div>
            </div>
        );
    }

    const getBarColor = (percentage: number) => {
        if (percentage >= 100) return { bar: 'bg-red-500', glow: 'shadow-red-500/30', text: 'text-red-400' };
        if (percentage >= 80) return { bar: 'bg-amber-500', glow: 'shadow-amber-500/30', text: 'text-amber-400' };
        return { bar: 'bg-emerald-500', glow: 'shadow-emerald-500/30', text: 'text-emerald-400' };
    };

    const getStatusLabel = (percentage: number) => {
        if (percentage >= 100) return '⚠️ Excedido';
        if (percentage >= 80) return '⚡ Quase lá';
        if (percentage >= 50) return '👀 Atenção';
        return '✅ Tranquilo';
    };

    return (
        <div className="flex flex-col gap-4 px-6 mb-6">
            <div className="flex justify-between items-center">
                <h3 className="text-white font-bold text-lg">Orçamentos</h3>
                {onManageBudgets && (
                    <button
                        onClick={onManageBudgets}
                        className="text-purple-400 text-sm hover:text-purple-300 transition-colors"
                    >
                        Gerenciar
                    </button>
                )}
            </div>

            <div className="flex flex-col gap-3">
                {budgets.map((b) => {
                    const colors = getBarColor(b.percentage);
                    const remaining = Math.max(0, b.budgetAmount - b.spentAmount);

                    return (
                        <div
                            key={b.id}
                            className="bg-[#1c1c26]/60 backdrop-blur-md border border-white/5 rounded-2xl p-4 transition-all hover:bg-[#1c1c26]/80"
                        >
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm">{b.categoryIcon || '📂'}</span>
                                    <span className="text-white text-sm font-medium">{b.categoryName}</span>
                                </div>
                                <span className={`text-xs font-medium ${colors.text}`}>
                                    {getStatusLabel(b.percentage)}
                                </span>
                            </div>

                            {/* Progress bar */}
                            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mb-2">
                                <div
                                    className={`h-full rounded-full ${colors.bar} shadow-lg ${colors.glow} transition-all duration-700 ease-out`}
                                    style={{ width: `${Math.min(b.percentage, 100)}%` }}
                                />
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-zinc-500 text-xs">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(b.spentAmount)}
                                    {' / '}
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(b.budgetAmount)}
                                </span>
                                <span className="text-zinc-400 text-xs">
                                    Resta {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(remaining)}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
