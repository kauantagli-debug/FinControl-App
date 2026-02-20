"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback, Suspense } from "react";
import Link from "next/link";

interface Category {
    id: string;
    name: string;
    icon: string | null;
    color: string;
}

interface Transaction {
    id: string;
    amount: string;
    description: string;
    type: string;
    date: string;
    category: Category | null;
}

interface DashboardData {
    transactions: Transaction[];
    totalIncome: number;
    totalExpense: number;
    totalBalance: number;
    categoryData: { category__name: string; total: number }[];
}

function DashboardContent() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [data, setData] = useState<DashboardData | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    // Form state
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState("EXPENSE");
    const [categoryId, setCategoryId] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Month navigation
    const currentMonth = parseInt(searchParams.get("month") || (new Date().getMonth() + 1).toString());
    const currentYear = parseInt(searchParams.get("year") || new Date().getFullYear().toString());

    // Generate month list for 2026/Current context
    const monthList = [];
    const targetYear = 2026; // Fixed as per previous context

    for (let i = 0; i < 12; i++) {
        const date = new Date(targetYear, i, 1);
        const name = date.toLocaleString("pt-BR", { month: "long" });
        const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);

        monthList.push({
            name: capitalizedName,
            year: targetYear,
            month: i + 1,
            active: (i + 1) === currentMonth && targetYear === currentYear,
        });
    }

    const currentMonthName = new Date(currentYear, currentMonth - 1, 1).toLocaleString("pt-BR", { month: "long", year: "numeric" });

    const fetchData = useCallback(async () => {
        try {
            const [transRes, catRes] = await Promise.all([
                fetch(`/api/transactions?month=${currentMonth}&year=${currentYear}`),
                fetch("/api/categories"),
            ]);

            if (transRes.ok) {
                const transData = await transRes.json();
                setData(transData);
            }

            if (catRes.ok) {
                const catData = await catRes.json();
                setCategories(catData);
            }
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setLoading(false);
        }
    }, [currentMonth, currentYear]);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated") {
            fetchData();
        }
    }, [status, router, fetchData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const res = await fetch("/api/transactions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount: parseFloat(amount),
                    description,
                    type,
                    categoryId: categoryId || null,
                    date: (() => {
                        const now = new Date();
                        const transactionDate = new Date(currentYear, currentMonth - 1, now.getDate(), now.getHours(), now.getMinutes());
                        if (transactionDate.getMonth() !== currentMonth - 1) {
                            transactionDate.setDate(0);
                        }
                        return transactionDate.toISOString();
                    })(),
                }),
            });

            if (res.ok) {
                setAmount("");
                setDescription("");
                setType("EXPENSE");
                setCategoryId("");
                fetchData();
            }
        } catch (error) {
            console.error("Failed to create transaction:", error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
            if (res.ok) {
                fetchData();
            }
        } catch (error) {
            console.error("Failed to delete transaction:", error);
        }
    };

    if (status === "loading" || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0f0f1b]">
                <div className="relative">
                    <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-4 h-4 bg-indigo-500 rounded-full animate-pulse"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-20">
            {/* Navbar with blurry glass effect */}
            <nav className="fixed w-full z-50 top-0 left-0 border-b border-white/5 bg-[#0f0f1b]/80 backdrop-blur-xl supports-[backdrop-filter]:bg-[#0f0f1b]/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        <Link href="/dashboard" className="flex items-center gap-4 group">
                            <div className="relative">
                                <div className="absolute inset-0 bg-indigo-500 rounded-xl blur-lg opacity-50 group-hover:opacity-100 transition-opacity"></div>
                                <div className="relative h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-xl transform group-hover:scale-105 transition-all duration-300">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                </div>
                            </div>
                            <span className="font-bold text-2xl tracking-tight text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-indigo-300 transition-all duration-300">
                                Finance<span className="font-light">App</span>
                            </span>
                        </Link>

                        <div className="flex items-center gap-6">
                            <span className="text-sm text-gray-400 hidden sm:block font-medium tracking-wide">{session?.user?.email}</span>
                            <button
                                onClick={() => signOut({ callbackUrl: "/login" })}
                                className="group relative px-4 py-2 rounded-lg overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-white/5 group-hover:bg-white/10 transition-colors"></div>
                                <span className="relative text-sm font-medium text-gray-300 group-hover:text-white transition-colors">Sair</span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="h-20"></div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="flex flex-col gap-10">
                    {/* Header & Month Selector */}
                    <div className="animate-fadeIn flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">
                                Bem-vindo <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">de volta!</span>
                            </h1>
                            <p className="text-gray-400 text-lg">
                                Visão geral das suas finanças em <span className="text-white font-medium">{currentYear}</span>
                            </p>
                        </div>

                        <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-1.5 pr-4 rounded-2xl backdrop-blur-md shadow-lg shadow-black/20 hover:bg-white/10 transition-colors duration-300">
                            <div className="bg-indigo-500/20 p-2.5 rounded-xl text-indigo-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <select
                                value={`${currentYear}-${currentMonth}`}
                                onChange={(e) => {
                                    const [y, m] = e.target.value.split('-');
                                    router.push(`/dashboard?month=${m}&year=${y}`);
                                }}
                                className="bg-transparent text-white font-medium text-lg outline-none cursor-pointer appearance-none pr-8 relative z-10 font-sans"
                            >
                                {monthList.map((m) => (
                                    <option key={`${m.year}-${m.month}`} value={`${m.year}-${m.month}`} className="bg-[#0f0f1b] text-white">
                                        {m.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Stats Cards - Grid Reformulated */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        {/* Balance Card - Taking 6 columns */}
                        <div className="md:col-span-6 lg:col-span-6 relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-[2rem] blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
                            <div className="glass-card rounded-[2rem] p-8 h-full relative overflow-hidden flex flex-col justify-between">
                                {/* Decorative elements */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                                <div className="absolute bottom-0 left-0 w-40 h-40 bg-pink-500/10 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none"></div>

                                <div className="relative z-10">
                                    <h3 className="text-gray-300 font-medium text-sm uppercase tracking-wider mb-1 flex items-center gap-2">
                                        Saldo Total
                                        <div className="h-1 w-1 bg-green-400 rounded-full animate-pulse"></div>
                                    </h3>
                                    <div className="text-5xl lg:text-6xl font-bold text-white tracking-tight mt-4">
                                        R$ <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-gray-400">{(data?.totalBalance || 0).toFixed(2)}</span>
                                    </div>
                                </div>
                                <div className="mt-8 relative z-10">
                                    <div className="inline-flex items-center gap-2 bg-white/10 border border-white/5 rounded-full px-4 py-1.5 text-sm backdrop-blur-md">
                                        <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                                        <span className="text-indigo-200">Balanço do Mês</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Income Card - 3 Columns */}
                        <div className="md:col-span-3 lg:col-span-3 relative group">
                            <div className="glass-card rounded-[2rem] p-6 h-full flex flex-col justify-between hover:bg-white/5 transition-all duration-300 border border-emerald-500/10 hover:border-emerald-500/30">
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400 group-hover:scale-110 transition-transform duration-300 ring-1 ring-emerald-500/20">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Receitas</h3>
                                        <div className="text-2xl lg:text-3xl font-bold text-emerald-400">
                                            R$ {(data?.totalIncome || 0).toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 h-1 w-full bg-emerald-900/30 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500/50 w-3/4 rounded-full"></div>
                                </div>
                            </div>
                        </div>

                        {/* Expense Card - 3 Columns */}
                        <div className="md:col-span-3 lg:col-span-3 relative group">
                            <div className="glass-card rounded-[2rem] p-6 h-full flex flex-col justify-between hover:bg-white/5 transition-all duration-300 border border-rose-500/10 hover:border-rose-500/30">
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-rose-500/10 rounded-2xl text-rose-400 group-hover:scale-110 transition-transform duration-300 ring-1 ring-rose-500/20">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Despesas</h3>
                                        <div className="text-2xl lg:text-3xl font-bold text-rose-400">
                                            R$ {(data?.totalExpense || 0).toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 h-1 w-full bg-rose-900/30 rounded-full overflow-hidden">
                                    <div className="h-full bg-rose-500/50 w-1/2 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                        {/* New Transaction Form - 4 Cols */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className="glass-card rounded-[2rem] p-8 animate-fadeIn sticky top-24 border border-white/10 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                                    <svg className="w-32 h-32 text-indigo-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" /></svg>
                                </div>

                                <h3 className="font-bold text-white mb-6 text-xl flex items-center gap-2">
                                    Nova Transação
                                    <span className="text-xs font-normal text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">Rápido</span>
                                </h3>

                                <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                                    {/* Type Toggle */}
                                    <div className="bg-black/40 p-1.5 rounded-xl flex gap-1 border border-white/5">
                                        <button
                                            type="button"
                                            onClick={() => setType("EXPENSE")}
                                            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${type === "EXPENSE"
                                                    ? "bg-rose-500/20 text-rose-400 shadow-lg shadow-rose-900/20 border border-rose-500/20"
                                                    : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                                                }`}
                                        >
                                            Despesa
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setType("INCOME")}
                                            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${type === "INCOME"
                                                    ? "bg-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-900/20 border border-emerald-500/20"
                                                    : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                                                }`}
                                        >
                                            Receita
                                        </button>
                                    </div>

                                    {/* Amount */}
                                    <div className="relative group">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">R$</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 pl-10 text-white focus:outline-none focus:border-indigo-500 focus:bg-white/10 transition-all font-mono text-lg placeholder:text-gray-600"
                                            placeholder="0,00"
                                            required
                                        />
                                    </div>

                                    {/* Description */}
                                    <input
                                        type="text"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-indigo-500 focus:bg-white/10 transition-all placeholder:text-gray-600"
                                        placeholder="Descrição (ex: Aluguel)"
                                        required
                                    />

                                    {/* Category */}
                                    <div className="relative">
                                        <select
                                            value={categoryId}
                                            onChange={(e) => setCategoryId(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-indigo-500 focus:bg-white/10 transition-all cursor-pointer appearance-none"
                                        >
                                            <option value="" className="bg-[#0f0f1b] text-gray-500">Selecionar categoria</option>
                                            {categories.map((cat) => (
                                                <option key={cat.id} value={cat.id} className="bg-[#0f0f1b]">
                                                    {cat.name}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all transform hover:-translate-y-1 active:translate-y-0 relative overflow-hidden group"
                                    >
                                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                        <span className="relative flex items-center justify-center gap-2">
                                            {submitting ? (
                                                <>Processing <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div></>
                                            ) : (
                                                <>Adicionar Transação <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg></>
                                            )}
                                        </span>
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Recent Transactions - 8 Cols */}
                        <div className="lg:col-span-8">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-white text-xl">Últimas Transações</h3>
                                <button className="text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors">Ver todas</button>
                            </div>

                            <div className="space-y-3 animate-fadeIn">
                                {data?.transactions && data.transactions.length > 0 ? (
                                    data.transactions.map((t, index) => (
                                        <div
                                            key={t.id}
                                            className="group glass rounded-2xl p-4 flex items-center justify-between transition-all duration-300 hover:bg-white/10 hover:shadow-lg hover:shadow-black/20 hover:-translate-y-0.5 border border-white/5 hover:border-white/10"
                                            style={{ animationDelay: `${index * 0.05}s` }}
                                        >
                                            <div className="flex items-center gap-5">
                                                <div
                                                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg transition-transform group-hover:scale-110 ${t.type === "INCOME"
                                                            ? "bg-gradient-to-br from-emerald-500/20 to-teal-500/10 text-emerald-400 shadow-emerald-500/10 ring-1 ring-emerald-500/20"
                                                            : "bg-gradient-to-br from-rose-500/20 to-red-500/10 text-rose-400 shadow-rose-500/10 ring-1 ring-rose-500/20"
                                                        }`}
                                                >
                                                    {t.category?.icon || "📂"}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white text-base mb-0.5 group-hover:text-indigo-200 transition-colors">{t.description}</div>
                                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                                        <span className="bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                                                            {new Date(t.date).toLocaleDateString("pt-BR", { month: "short", day: "numeric" })}
                                                        </span>
                                                        <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                                                        <span>{t.category?.name || "Geral"}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <div
                                                    className={`font-bold font-mono text-lg tracking-tight ${t.type === "INCOME" ? "text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]" : "text-white group-hover:text-rose-200"
                                                        }`}
                                                >
                                                    {t.type === "INCOME" ? "+" : "-"}R$ {parseFloat(t.amount).toFixed(2)}
                                                </div>

                                                <button
                                                    onClick={() => handleDelete(t.id)}
                                                    className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100"
                                                    title="Excluir"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="glass rounded-3xl p-10 text-center flex flex-col items-center justify-center gap-4 border-dashed border-2 border-white/5">
                                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-gray-600">
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M12 5l7 7-7 7" /></svg>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 font-medium text-lg">Nenhuma transação neste mês</p>
                                            <p className="text-gray-600 text-sm">Adicione uma nova transação para começar</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function DashboardPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#0f0f1b]"><div className="w-8 h-8 border-4 border-indigo-500 rounded-full animate-spin border-t-transparent"></div></div>}>
            <DashboardContent />
        </Suspense>
    );
}
