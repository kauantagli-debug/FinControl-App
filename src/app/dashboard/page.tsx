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

    // Generate month list
    // Generate month list for 2026
    const monthList = [];
    // Fixed to 2026 as per user request
    const targetYear = 2026;

    for (let i = 0; i < 12; i++) {
        const date = new Date(targetYear, i, 1);
        const name = date.toLocaleString("pt-BR", { month: "long" });
        // Capitalize first letter
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
                        // Create date based on selected month/year, preserving current time
                        const transactionDate = new Date(currentYear, currentMonth - 1, now.getDate(), now.getHours(), now.getMinutes());
                        // Check for month overflow (e.g., adding to Feb when today is 30th)
                        if (transactionDate.getMonth() !== currentMonth - 1) {
                            transactionDate.setDate(0); // Set to last day of the intended month
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
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-400">Carregando...</div>
            </div>
        );
    }

    return (
        <>
            {/* Navbar */}
            <nav className="fixed w-full z-50 top-0 left-0 border-b border-white/5 bg-[#0f0f1b]/60 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link href="/dashboard" className="flex items-center gap-3 group">
                            <div className="h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg transform group-hover:scale-110 transition-transform">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <span className="font-bold text-2xl tracking-tighter text-white">Finance App</span>
                        </Link>

                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-400 hidden sm:block">{session?.user?.email}</span>
                            <button
                                onClick={() => signOut({ callbackUrl: "/login" })}
                                className="bg-[#1e1e2e] hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all border border-gray-700"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="h-16"></div>

            <main className="container mx-auto px-4 py-8">
                <div className="flex flex-col gap-8">
                    {/* Main Content */}
                    <div className="space-y-8">
                        {/* Header & Month Selector */}
                        <div className="animate-fadeIn flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-white mb-2">Bem-vindo de volta! 👋</h1>
                                <p className="text-gray-400">
                                    Resumo financeiro de <span className="text-indigo-400 font-semibold">{currentYear}</span>
                                </p>
                            </div>

                            <div className="flex items-center gap-3 glass p-1.5 pr-4 rounded-xl">
                                <div className="bg-indigo-500/20 p-2 rounded-lg text-indigo-400">
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
                                    className="bg-transparent text-white font-medium outline-none cursor-pointer appearance-none pr-8 relative z-10"
                                    style={{ backgroundImage: 'none' }}
                                >
                                    {monthList.map((m) => (
                                        <option key={`${m.year}-${m.month}`} value={`${m.year}-${m.month}`} className="bg-[#0f0f1b] text-white">
                                            {m.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Balance */}
                            <div className="glass-card rounded-3xl p-8 relative overflow-hidden animate-fadeIn group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-indigo-500/30 transition-all duration-700"></div>
                                <h3 className="text-gray-400 text-sm font-medium mb-2 uppercase tracking-wider">Saldo Total</h3>
                                <div className="text-5xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-4">
                                    R$ {(data?.totalBalance || 0).toFixed(2)}
                                </div>
                            </div>

                            {/* Income */}
                            <div className="glass-card rounded-3xl p-8 animate-fadeIn group" style={{ animationDelay: "0.1s" }}>
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-1">Receitas</h3>
                                        <div className="text-3xl font-bold text-emerald-400">
                                            R$ {(data?.totalIncome || 0).toFixed(2)}
                                        </div>
                                    </div>
                                    <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400 group-hover:scale-110 transition-transform">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Expenses */}
                            <div className="glass-card rounded-3xl p-8 animate-fadeIn group" style={{ animationDelay: "0.2s" }}>
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-1">Despesas</h3>
                                        <div className="text-3xl font-bold text-rose-400">
                                            R$ {(data?.totalExpense || 0).toFixed(2)}
                                        </div>
                                    </div>
                                    <div className="p-3 bg-rose-500/10 rounded-2xl text-rose-400 group-hover:scale-110 transition-transform">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Transactions & Add Form */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Transactions List */}
                            <div className="space-y-4 animate-fadeIn">
                                <h3 className="font-bold text-white">Transações</h3>
                                {data?.transactions && data.transactions.length > 0 ? (
                                    data.transactions.map((t) => (
                                        data.transactions.map((t) => (
                                            <div
                                                key={t.id}
                                                className="glass rounded-xl p-4 flex items-center justify-between transition-all hover:bg-white/5 group border border-white/5"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div
                                                        className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg shadow-lg ${t.type === "INCOME" ? "bg-emerald-500/10 text-emerald-400 shadow-emerald-500/10" : "bg-rose-500/10 text-rose-400 shadow-rose-500/10"
                                                            }`}
                                                    >
                                                        {t.category?.icon || "📂"}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-white text-sm">{t.description}</div>
                                                        <div className="text-xs text-gray-500">
                                                            {new Date(t.date).toLocaleDateString("pt-BR", { month: "short", day: "numeric" })} •{" "}
                                                            {t.category?.name || "Geral"}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div
                                                        className={`font-bold font-mono text-base ${t.type === "INCOME" ? "text-emerald-400" : "text-white"
                                                            }`}
                                                    >
                                                        {t.type === "INCOME" ? "+" : "-"}R$ {parseFloat(t.amount).toFixed(2)}
                                                    </div>
                                                    <button
                                                        onClick={() => handleDelete(t.id)}
                                                        className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all ml-2"
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
                                    <div className="text-gray-500 text-center py-8">Nenhuma transação neste mês.</div>
                                )}
                            </div>

                            {/* Add Transaction Form */}
                            <div className="space-y-6">
                                <div className="glass-card rounded-3xl p-8 animate-fadeIn">
                                    <h3 className="font-bold text-white mb-6 text-lg">Nova Transação</h3>
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-gray-500"
                                                placeholder="R$ 0,00"
                                                required
                                            />
                                            <select
                                                value={type}
                                                onChange={(e) => setType(e.target.value)}
                                                className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                                            >
                                                <option value="EXPENSE" className="bg-[#0f0f1b]">Despesa</option>
                                                <option value="INCOME" className="bg-[#0f0f1b]">Receita</option>
                                            </select>
                                        </div>
                                        <input
                                            type="text"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-gray-500"
                                            placeholder="Descrição"
                                            required
                                        />
                                        <select
                                            value={categoryId}
                                            onChange={(e) => setCategoryId(e.target.value)}
                                            className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                                        >
                                            <option value="" className="bg-[#0f0f1b]">Selecionar categoria</option>
                                            {categories.map((cat) => (
                                                <option key={cat.id} value={cat.id} className="bg-[#0f0f1b]">
                                                    {cat.name}
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                                        >
                                            {submitting ? "Adicionando..." : "Adicionar Transação"}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}

export default function DashboardPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-gray-400">Carregando...</div></div>}>
            <DashboardContent />
        </Suspense>
    );
}
