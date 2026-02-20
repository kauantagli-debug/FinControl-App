"use client";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback, Suspense } from "react";
import { DashboardHeader } from "./components/DashboardHeader";
import { StatsCards } from "./components/StatsCards";
import { StreakBanner } from "./components/StreakBanner";
import { InsightsWidget } from "./components/InsightsWidget";
import { TransactionForm } from "./components/TransactionForm";
import { TransactionList } from "./components/TransactionList";
import { SpendingChart } from "./components/SpendingChart";
import { BudgetProgress } from "./components/BudgetProgress";
import { BottomNav } from "./components/BottomNav";
import { DashboardData, Category, BudgetItem, ReportData, UserStats, Card } from "./types";

function DashboardContent() {
    const { status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [data, setData] = useState<DashboardData | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [cards, setCards] = useState<Card[]>([]);
    const [budgets, setBudgets] = useState<BudgetItem[]>([]);
    const [reportData, setReportData] = useState<ReportData | null>(null);
    const [userStats, setUserStats] = useState<UserStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);

    // Default to current date if params missing
    const now = new Date();
    const currentMonth = parseInt(searchParams.get("month") || (now.getMonth() + 1).toString());
    const currentYear = parseInt(searchParams.get("year") || now.getFullYear().toString());

    const fetchData = useCallback(async () => {
        try {
            const [transRes, catRes, budgetRes, reportRes, statsRes, cardsRes] = await Promise.all([
                fetch(`/api/transactions?month=${currentMonth}&year=${currentYear}`),
                fetch("/api/categories"),
                fetch(`/api/budgets?month=${currentMonth}&year=${currentYear}`),
                fetch(`/api/reports?month=${currentMonth}&year=${currentYear}`),
                fetch(`/api/stats`),
                fetch(`/api/cards`),
            ]);

            if (transRes.ok) setData(await transRes.json());
            if (catRes.ok) setCategories(await catRes.json());
            if (budgetRes.ok) setBudgets(await budgetRes.json());
            if (reportRes.ok) setReportData(await reportRes.json());
            if (statsRes.ok) setUserStats(await statsRes.json());
            if (cardsRes.ok) setCards(await cardsRes.json());
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setLoading(false);
        }
    }, [currentMonth, currentYear]);

    useEffect(() => {
        if (status === "unauthenticated") router.push("/login");
        else if (status === "authenticated") fetchData();
    }, [status, router, fetchData]);

    if (status === "loading" || loading) {
        return (
            <div className="min-h-screen bg-[#05050f] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 border-4 border-indigo-600 rounded-full animate-spin border-t-transparent"></div>
                    <span className="text-zinc-500 text-sm animate-pulse">Carregando seus dados...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#05050f] text-white font-sans pb-32">
            <DashboardHeader
                currentMonth={currentMonth}
                currentYear={currentYear}
            />

            {/* Gamification Banner */}
            {userStats && (
                <StreakBanner
                    streak={userStats.currentStreak}
                    level={userStats.level}
                    xp={userStats.xp}
                />
            )}

            <div className="mt-4 px-4 md:px-0">
                <InsightsWidget />
            </div>

            <div className="mt-4">
                <StatsCards
                    data={data || { totalBalance: 0, totalIncome: 0, totalExpense: 0, transactions: [] }}
                    comparison={reportData?.comparison || null}
                />
            </div>

            {/* Spending Chart */}
            {reportData && reportData.categoryBreakdown.length > 0 && (
                <SpendingChart
                    data={reportData.categoryBreakdown.map(c => ({
                        name: c.name,
                        total: c.total,
                        color: c.color,
                    }))}
                    totalExpense={reportData.totalExpense}
                />
            )}

            {/* Budget Progress */}
            <BudgetProgress budgets={budgets} />

            <TransactionForm
                categories={categories}
                cards={cards}
                onTransactionAdded={fetchData}
                currentMonth={currentMonth}
                currentYear={currentYear}
                isOpen={isTransactionModalOpen}
                onClose={() => setIsTransactionModalOpen(false)}
            />

            <TransactionList
                transactions={data?.transactions || []}
                onTransactionDeleted={fetchData}
            />

            <BottomNav onAddClick={() => setIsTransactionModalOpen(true)} />
        </div>
    );
}

export default function DashboardPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#05050f] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 border-4 border-indigo-600 rounded-full animate-spin border-t-transparent"></div>
                    <span className="text-zinc-500 text-sm animate-pulse">Carregando...</span>
                </div>
            </div>
        }>
            <DashboardContent />
        </Suspense>
    );
}
