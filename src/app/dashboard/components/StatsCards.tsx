'use client';

import { DashboardData } from '../types';
import { ArrowUpRight, ArrowDownRight, Wallet, TrendingUp, TrendingDown, ShieldCheck } from 'lucide-react';

interface StatsCardsProps {
    data: DashboardData;
    comparison?: {
        incomeChange: number;
        expenseChange: number;
    } | null;
}


function HealthScore({ income, expense }: { income: number; expense: number }) {
    const ratio = income > 0 ? expense / income : 1;
    let score: number;
    let label: string;
    let emoji: string;
    let color: string;

    if (ratio <= 0.5) {
        score = 100; label = 'Excelente'; emoji = '🏆'; color = 'text-emerald-400';
    } else if (ratio <= 0.7) {
        score = 80; label = 'Muito Bom'; emoji = '💪'; color = 'text-emerald-400';
    } else if (ratio <= 0.85) {
        score = 60; label = 'Bom'; emoji = '👍'; color = 'text-yellow-400';
    } else if (ratio <= 1.0) {
        score = 40; label = 'Atenção'; emoji = '⚡'; color = 'text-amber-400';
    } else {
        score = 20; label = 'Crítico'; emoji = '🚨'; color = 'text-red-400';
    }

    return (
        <div className="relative overflow-hidden rounded-3xl bg-[#1c1c26]/60 backdrop-blur-md border border-white/5 p-5 hover:bg-[#1c1c26]/80 transition-colors">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-zinc-400 text-xs">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Saúde Financeira</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">{emoji}</span>
                        <span className={`text-lg font-bold ${color}`}>{label}</span>
                    </div>
                </div>
                {/* Circular score */}
                <div className="relative w-14 h-14">
                    <svg width="56" height="56" viewBox="0 0 56 56">
                        <circle cx="28" cy="28" r="22" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="5" />
                        <circle
                            cx="28" cy="28" r="22"
                            fill="none"
                            stroke={ratio <= 0.7 ? '#10b981' : ratio <= 1 ? '#f59e0b' : '#ef4444'}
                            strokeWidth="5"
                            strokeDasharray={`${(score / 100) * 138.2} 138.2`}
                            strokeLinecap="round"
                            transform="rotate(-90 28 28)"
                            className="transition-all duration-1000 ease-out"
                        />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">{score}</span>
                </div>
            </div>
        </div>
    );
}

export function StatsCards({ data, comparison }: StatsCardsProps) {
    const savings = data.totalIncome - data.totalExpense;
    const savingsRate = data.totalIncome > 0 ? Math.round((savings / data.totalIncome) * 100) : 0;

    return (
        <div className="flex flex-col gap-4 px-6 mb-8 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
            {/* Main Balance Card - Deep Purple Gradient with Glassmorphism */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#6b2c91] to-[#2e1a4f] p-6 shadow-2xl shadow-purple-900/40 border border-white/10 group">
                <div className="absolute -top-10 -right-10 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                    <Wallet className="w-48 h-48 text-white rotate-12" />
                </div>

                {/* Decorative background blurs */}
                <div className="absolute top-0 left-0 w-full h-full bg-noise opacity-5 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-purple-200/80 font-medium text-sm uppercase tracking-wider">
                            <Wallet className="w-4 h-4" />
                            <span>Saldo Total</span>
                        </div>
                        {savingsRate > 0 && (
                            <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-2 py-1 rounded-full">
                                {savingsRate}% economizado
                            </span>
                        )}
                    </div>
                    <h2 className="text-4xl font-bold text-white tracking-tight">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.totalBalance)}
                    </h2>

                    {/* Available to spend */}
                    {savings > 0 && (
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-purple-200/60 text-xs">Disponível para gastar:</span>
                            <span className="text-purple-100 text-sm font-semibold">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(savings)}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Income & Expense Row */}
            <div className="grid grid-cols-2 gap-4">
                <div className="rounded-3xl bg-[#1c1c26]/60 backdrop-blur-md border border-white/5 p-5 flex flex-col gap-3 hover:bg-[#1c1c26]/80 transition-colors">
                    <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                            <ArrowUpRight className="w-5 h-5" />
                        </div>
                        {comparison && comparison.incomeChange !== 0 && (
                            <span className={`text-xs font-medium flex items-center gap-1 ${comparison.incomeChange > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {comparison.incomeChange > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                {comparison.incomeChange > 0 ? '+' : ''}{comparison.incomeChange}%
                            </span>
                        )}
                    </div>
                    <span className="text-zinc-400 text-sm">Entradas</span>
                    <span className="text-xl font-bold text-white">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.totalIncome)}
                    </span>
                </div>
                <div className="rounded-3xl bg-[#1c1c26]/60 backdrop-blur-md border border-white/5 p-5 flex flex-col gap-3 hover:bg-[#1c1c26]/80 transition-colors">
                    <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400">
                            <ArrowDownRight className="w-5 h-5" />
                        </div>
                        {comparison && comparison.expenseChange !== 0 && (
                            <span className={`text-xs font-medium flex items-center gap-1 ${comparison.expenseChange > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                                {comparison.expenseChange > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                {comparison.expenseChange > 0 ? '+' : ''}{comparison.expenseChange}%
                            </span>
                        )}
                    </div>
                    <span className="text-zinc-400 text-sm">Saídas</span>
                    <span className="text-xl font-bold text-white">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.totalExpense)}
                    </span>
                </div>
            </div>

            {/* Health Score */}
            <HealthScore income={data.totalIncome} expense={data.totalExpense} />
        </div>
    )
}
