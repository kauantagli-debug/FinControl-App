'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { BottomNav } from '../dashboard/components/BottomNav';
import { ReportData } from '../dashboard/types';
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, BarChart3, PieChart, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

const CHART_COLORS = [
    '#8b5cf6', '#ec4899', '#f59e0b', '#10b981',
    '#3b82f6', '#ef4444', '#06b6d4', '#f97316',
    '#6366f1', '#84cc16',
];

// SVG Bar Chart for monthly trend
function MonthlyBarChart({ data }: { data: ReportData['monthlyTrend'] }) {
    if (!data || data.length === 0) return null;

    const maxVal = Math.max(...data.flatMap(d => [d.income, d.expense]));
    const barHeight = 140;

    return (
        <div className="flex items-end justify-between gap-2 h-[180px] px-2">
            {data.map((month, i) => {
                const incomeH = maxVal > 0 ? (month.income / maxVal) * barHeight : 0;
                const expenseH = maxVal > 0 ? (month.expense / maxVal) * barHeight : 0;

                return (
                    <div key={i} className="flex flex-col items-center gap-1 flex-1">
                        <div className="flex items-end gap-1 h-[140px]">
                            {/* Income bar */}
                            <div
                                className="w-4 rounded-t-md bg-emerald-500/80 transition-all duration-700 ease-out hover:bg-emerald-400"
                                style={{
                                    height: `${incomeH}px`,
                                    minHeight: month.income > 0 ? '4px' : '0px',
                                    boxShadow: '0 0 8px rgba(16, 185, 129, 0.3)',
                                }}
                                title={`Entradas: R$ ${month.income.toFixed(2)}`}
                            />
                            {/* Expense bar */}
                            <div
                                className="w-4 rounded-t-md bg-rose-500/80 transition-all duration-700 ease-out hover:bg-rose-400"
                                style={{
                                    height: `${expenseH}px`,
                                    minHeight: month.expense > 0 ? '4px' : '0px',
                                    boxShadow: '0 0 8px rgba(244, 63, 94, 0.3)',
                                }}
                                title={`Saídas: R$ ${month.expense.toFixed(2)}`}
                            />
                        </div>
                        <span className="text-zinc-500 text-[10px] font-medium">{month.label}</span>
                    </div>
                );
            })}
        </div>
    );
}

// SVG Donut for category breakdown
function CategoryDonut({ data, total }: { data: ReportData['categoryBreakdown']; total: number }) {
    const size = 200;
    const strokeWidth = 30;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    let cumulativePercent = 0;
    const segments = data.map((item, index) => {
        const percent = total > 0 ? item.total / total : 0;
        const offset = circumference * (1 - cumulativePercent);
        const length = circumference * percent;
        cumulativePercent += percent;

        return {
            ...item,
            chartColor: CHART_COLORS[index % CHART_COLORS.length],
            offset,
            length,
            percent: Math.round(percent * 100),
        };
    });

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative">
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                    <circle
                        cx={size / 2} cy={size / 2} r={radius}
                        fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={strokeWidth}
                    />
                    {segments.map((seg, i) => (
                        <circle
                            key={i}
                            cx={size / 2} cy={size / 2} r={radius}
                            fill="none"
                            stroke={seg.chartColor}
                            strokeWidth={strokeWidth}
                            strokeDasharray={`${seg.length} ${circumference - seg.length}`}
                            strokeDashoffset={seg.offset}
                            strokeLinecap="round"
                            transform={`rotate(-90 ${size / 2} ${size / 2})`}
                            className="transition-all duration-700 ease-out"
                            style={{ filter: `drop-shadow(0 0 6px ${seg.chartColor}50)` }}
                        />
                    ))}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xs text-zinc-400">Total Gastos</span>
                    <span className="text-xl font-bold text-white">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(total)}
                    </span>
                </div>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 w-full">
                {segments.map((seg, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: seg.chartColor }} />
                        <span className="text-zinc-400 text-xs truncate flex-1">{seg.name}</span>
                        <span className="text-white text-xs font-medium">{seg.percent}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function ReportsPage() {
    const { status } = useSession();
    const router = useRouter();
    const [reportData, setReportData] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'categories' | 'trends'>('overview');

    const now = new Date();
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [year, setYear] = useState(now.getFullYear());

    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

    const fetchReports = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/reports?month=${month}&year=${year}`);
            if (res.ok) setReportData(await res.json());
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [month, year]);

    useEffect(() => {
        if (status === 'unauthenticated') router.push('/login');
        else if (status === 'authenticated') fetchReports();
    }, [status, router, fetchReports]);

    const prevMonth = () => {
        if (month === 1) { setMonth(12); setYear(y => y - 1); }
        else setMonth(m => m - 1);
    };
    const nextMonth = () => {
        if (month === 12) { setMonth(1); setYear(y => y + 1); }
        else setMonth(m => m + 1);
    };

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen bg-[#05050f] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 border-4 border-indigo-600 rounded-full animate-spin border-t-transparent"></div>
                    <span className="text-zinc-500 text-sm animate-pulse">Analisando seus dados...</span>
                </div>
            </div>
        );
    }

    const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

    return (
        <div className="min-h-screen bg-[#05050f] text-white font-sans pb-32">
            {/* Header */}
            <div className="px-6 pt-8 pb-4">
                <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <BarChart3 className="w-6 h-6 text-purple-400" /> Relatórios
                </h1>

                {/* Month Navigation */}
                <div className="flex items-center justify-between bg-[#1c1c26]/60 backdrop-blur-md border border-white/5 rounded-2xl p-3">
                    <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                        <ChevronLeft className="w-5 h-5 text-zinc-400" />
                    </button>
                    <div className="flex items-center gap-2 text-white font-medium">
                        <Calendar className="w-4 h-4 text-purple-400" />
                        {monthNames[month - 1]} {year}
                    </div>
                    <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                        <ChevronRight className="w-5 h-5 text-zinc-400" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mt-4">
                    {([
                        { key: 'overview', label: 'Visão Geral' },
                        { key: 'categories', label: 'Categorias' },
                        { key: 'trends', label: 'Tendências' },
                    ] as const).map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === tab.key
                                ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40'
                                : 'bg-white/5 text-zinc-400 hover:bg-white/10'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="px-6">
                {activeTab === 'overview' && reportData && (
                    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-[#1c1c26]/60 backdrop-blur-md border border-white/5 rounded-2xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                        <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                                    </div>
                                    <span className="text-zinc-400 text-xs">Entradas</span>
                                </div>
                                <span className="text-lg font-bold text-white">{fmt(reportData.comparison.currentIncome)}</span>
                                {reportData.comparison.incomeChange !== 0 && (
                                    <div className={`flex items-center gap-1 mt-1 text-xs ${reportData.comparison.incomeChange > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {reportData.comparison.incomeChange > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                        {reportData.comparison.incomeChange > 0 ? '+' : ''}{reportData.comparison.incomeChange}% vs mês anterior
                                    </div>
                                )}
                            </div>
                            <div className="bg-[#1c1c26]/60 backdrop-blur-md border border-white/5 rounded-2xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center">
                                        <ArrowDownRight className="w-4 h-4 text-rose-400" />
                                    </div>
                                    <span className="text-zinc-400 text-xs">Saídas</span>
                                </div>
                                <span className="text-lg font-bold text-white">{fmt(reportData.comparison.currentExpense)}</span>
                                {reportData.comparison.expenseChange !== 0 && (
                                    <div className={`flex items-center gap-1 mt-1 text-xs ${reportData.comparison.expenseChange > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                                        {reportData.comparison.expenseChange > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                        {reportData.comparison.expenseChange > 0 ? '+' : ''}{reportData.comparison.expenseChange}% vs mês anterior
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Comparison Table */}
                        <div className="bg-[#1c1c26]/60 backdrop-blur-md border border-white/5 rounded-2xl p-5">
                            <h3 className="text-white font-bold text-sm mb-4">Comparativo Mensal</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-zinc-400 text-sm">Categoria</span>
                                    <div className="flex gap-8">
                                        <span className="text-zinc-400 text-xs w-20 text-right">Mês Anterior</span>
                                        <span className="text-zinc-400 text-xs w-20 text-right">Mês Atual</span>
                                    </div>
                                </div>
                                <div className="h-px bg-white/5" />
                                <div className="flex justify-between items-center">
                                    <span className="text-emerald-400 text-sm">Entradas</span>
                                    <div className="flex gap-8">
                                        <span className="text-zinc-300 text-sm w-20 text-right">{fmt(reportData.comparison.prevIncome)}</span>
                                        <span className="text-white text-sm font-medium w-20 text-right">{fmt(reportData.comparison.currentIncome)}</span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-rose-400 text-sm">Saídas</span>
                                    <div className="flex gap-8">
                                        <span className="text-zinc-300 text-sm w-20 text-right">{fmt(reportData.comparison.prevExpense)}</span>
                                        <span className="text-white text-sm font-medium w-20 text-right">{fmt(reportData.comparison.currentExpense)}</span>
                                    </div>
                                </div>
                                <div className="h-px bg-white/5" />
                                <div className="flex justify-between items-center">
                                    <span className="text-purple-400 text-sm font-medium">Saldo</span>
                                    <div className="flex gap-8">
                                        <span className="text-zinc-300 text-sm w-20 text-right">{fmt(reportData.comparison.prevIncome - reportData.comparison.prevExpense)}</span>
                                        <span className="text-white text-sm font-bold w-20 text-right">{fmt(reportData.comparison.currentIncome - reportData.comparison.currentExpense)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'categories' && reportData && (
                    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
                        {reportData.categoryBreakdown.length > 0 ? (
                            <>
                                <CategoryDonut data={reportData.categoryBreakdown} total={reportData.totalExpense} />

                                {/* Category List */}
                                <div className="flex flex-col gap-3">
                                    {reportData.categoryBreakdown.map((cat, i) => {
                                        const percent = reportData.totalExpense > 0
                                            ? Math.round((cat.total / reportData.totalExpense) * 100)
                                            : 0;
                                        return (
                                            <div key={i} className="bg-[#1c1c26]/60 backdrop-blur-md border border-white/5 rounded-2xl p-4 hover:bg-[#1c1c26]/80 transition-colors">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                                                            style={{ backgroundColor: `${CHART_COLORS[i % CHART_COLORS.length]}20` }}
                                                        >
                                                            {cat.icon || '📂'}
                                                        </div>
                                                        <div>
                                                            <span className="text-white text-sm font-medium">{cat.name}</span>
                                                            <div className="text-zinc-500 text-xs">{percent}% do total</div>
                                                        </div>
                                                    </div>
                                                    <span className="text-white font-bold text-sm">{fmt(cat.total)}</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full transition-all duration-700"
                                                        style={{
                                                            width: `${percent}%`,
                                                            backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
                                                            boxShadow: `0 0 8px ${CHART_COLORS[i % CHART_COLORS.length]}40`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
                                <PieChart className="w-12 h-12 mb-3 opacity-30" />
                                <p className="text-sm">Nenhum gasto registrado neste mês.</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'trends' && reportData && (
                    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
                        {/* Monthly Bar Chart */}
                        <div className="bg-[#1c1c26]/60 backdrop-blur-md border border-white/5 rounded-2xl p-5">
                            <h3 className="text-white font-bold text-sm mb-4">Últimos 6 Meses</h3>
                            <MonthlyBarChart data={reportData.monthlyTrend} />
                            <div className="flex items-center gap-4 mt-4 justify-center">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-3 h-3 rounded-sm bg-emerald-500/80" />
                                    <span className="text-zinc-400 text-xs">Entradas</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-3 h-3 rounded-sm bg-rose-500/80" />
                                    <span className="text-zinc-400 text-xs">Saídas</span>
                                </div>
                            </div>
                        </div>

                        {/* Monthly Trend Details */}
                        <div className="flex flex-col gap-3">
                            {[...reportData.monthlyTrend].reverse().map((month, i) => {
                                const balance = month.income - month.expense;
                                return (
                                    <div key={i} className="bg-[#1c1c26]/60 backdrop-blur-md border border-white/5 rounded-2xl p-4 hover:bg-[#1c1c26]/80 transition-colors">
                                        <div className="flex justify-between items-center">
                                            <span className="text-white text-sm font-medium">{month.label}</span>
                                            <span className={`text-sm font-bold ${balance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                {balance >= 0 ? '+' : ''}{fmt(balance)}
                                            </span>
                                        </div>
                                        <div className="flex gap-4 mt-2 text-xs text-zinc-500">
                                            <span>↑ {fmt(month.income)}</span>
                                            <span>↓ {fmt(month.expense)}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            <BottomNav onAddClick={() => { }} />
        </div>
    );
}
