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
            <nav className="fixed w-full z-50 bg-[#0f0f1b]/80 backdrop-blur-md border-b border-gray-800">
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

                            <div className="flex items-center gap-3 bg-[#1e1e2e] p-1.5 pr-4 rounded-xl border border-gray-800 shadow-sm">
                                <div className="bg-indigo-500/10 p-2 rounded-lg text-indigo-500">
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
                                        <option key={`${m.year}-${m.month}`} value={`${m.year}-${m.month}`} className="bg-[#1e1e2e] text-white">
                                            {m.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Balance */}
                            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 shadow-xl relative overflow-hidden animate-fadeIn">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                                <h3 className="text-indigo-200 text-sm font-medium mb-1">Saldo Total</h3>
                                <div className="text-4xl font-bold text-white mb-4">
                                    R$ {(data?.totalBalance || 0).toFixed(2)}
                                </div>
                            </div>

                            {/* Income */}
                            <div className="bg-[#1e1e2e] border border-gray-800 rounded-2xl p-6 animate-fadeIn" style={{ animationDelay: "0.1s" }}>
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-gray-400 text-sm font-medium">Receitas</h3>
                                        <div className="text-2xl font-bold text-white">
                                            R$ {(data?.totalIncome || 0).toFixed(2)}
                                        </div>
                                    </div>
                                    <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Expenses */}
                            <div className="bg-[#1e1e2e] border border-gray-800 rounded-2xl p-6 animate-fadeIn" style={{ animationDelay: "0.2s" }}>
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-gray-400 text-sm font-medium">Despesas</h3>
                                        <div className="text-2xl font-bold text-white">
                                            R$ {(data?.totalExpense || 0).toFixed(2)}
                                        </div>
                                    </div>
                                    <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                        <div
                                            key={t.id}
                                            className="bg-[#1e1e2e] border border-gray-800 hover:border-indigo-500/30 rounded-xl p-4 flex items-center justify-between transition-all hover:bg-[#252538] group hover:shadow-lg hover:shadow-indigo-500/5"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div
                                                    className={`w-10 h-10 rounded-full flex items-center justify-center ${t.type === "INCOME" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
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
                                                    className={`font-bold text-sm ${t.type === "INCOME" ? "text-green-400" : "text-white"
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
                                <div className="bg-[#1e1e2e] border border-gray-800 rounded-2xl p-6 animate-fadeIn">
                                    <h3 className="font-bold text-white mb-4">Adicionar Transação</h3>
                                    <form onSubmit={handleSubmit} className="space-y-3">
                                        <div className="grid grid-cols-2 gap-3">
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                className="w-full bg-[#0f0f1b] border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500 text-sm"
                                                placeholder="Valor"
                                                required
                                            />
                                            <select
                                                value={type}
                                                onChange={(e) => setType(e.target.value)}
                                                className="w-full bg-[#0f0f1b] border border-gray-700 rounded-lg p-2 text-white text-sm"
                                            >
                                                <option value="EXPENSE">Despesa</option>
                                                <option value="INCOME">Receita</option>
                                            </select>
                                        </div>
                                        <input
                                            type="text"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className="w-full bg-[#0f0f1b] border border-gray-700 rounded-lg p-2 text-white text-sm"
                                            placeholder="Descrição"
                                            required
                                        />
                                        <select
                                            value={categoryId}
                                            onChange={(e) => setCategoryId(e.target.value)}
                                            className="w-full bg-[#0f0f1b] border border-gray-700 rounded-lg p-2 text-white text-sm"
                                        >
                                            <option value="">Selecionar categoria</option>
                                            {categories.map((cat) => (
                                                <option key={cat.id} value={cat.id}>
                                                    {cat.name}
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-500/50 text-white font-bold py-2 rounded-lg text-sm transition-all"
                                        >
                                            {submitting ? "Adicionando..." : "Adicionar"}
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
