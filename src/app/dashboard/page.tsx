"use client";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { DashboardHeader } from "./components/DashboardHeader";
import { StatsCards } from "./components/StatsCards";
import { StreakBanner } from "./components/StreakBanner";
import { InsightsWidget } from "./components/InsightsWidget";
import { TransactionForm } from "./components/TransactionForm";
import { TransactionList } from "./components/TransactionList";
import { SpendingChart } from "./components/SpendingChart";
import { BudgetProgress } from "./components/BudgetProgress";
import { BottomNav } from "./components/BottomNav";
import { useDashboard } from "@/lib/hooks/useDashboard";

function DashboardContent() {
    const { status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);

    // Default to current date if params missing
    const now = new Date();
    const currentMonth = parseInt(searchParams.get("month") || (now.getMonth() + 1).toString());
    const currentYear = parseInt(searchParams.get("year") || now.getFullYear().toString());

    // Use custom hook to fetch all dashboard data via SWR
    const { data, isLoading, mutateTransactions } = useDashboard(currentMonth, currentYear);

    useEffect(() => {
        if (status === "unauthenticated") router.push("/login");
    }, [status, router]);

    if (status === "loading" || isLoading) {
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
            {data.stats && (
                <StreakBanner
                    streak={data.stats.currentStreak}
                    level={data.stats.level}
                    xp={data.stats.xp}
                />
            )}

            <div className="mt-4 px-4 md:px-0">
                <InsightsWidget />
            </div>

            <div className="mt-4">
                <StatsCards
                    data={data.transactions || { totalBalance: 0, totalIncome: 0, totalExpense: 0, transactions: [] }}
                    comparison={data.reportData?.comparison || null}
                />
            </div>

            {/* Spending Chart */}
            {data.reportData && data.reportData.categoryBreakdown.length > 0 && (
                <SpendingChart
                    data={data.reportData.categoryBreakdown.map((c: { name: string, total: number, color: string }) => ({
                        name: c.name,
                        total: c.total,
                        color: c.color,
                    }))}
                    totalExpense={data.reportData.totalExpense}
                />
            )}

            {/* Budget Progress */}
            <BudgetProgress budgets={data.budgets} />

            <TransactionForm
                categories={data.categories}
                cards={data.cards}
                onTransactionAdded={mutateTransactions}
                currentMonth={currentMonth}
                currentYear={currentYear}
                isOpen={isTransactionModalOpen}
                onClose={() => setIsTransactionModalOpen(false)}
            />

            <TransactionList
                transactions={data.transactions?.transactions || []}
                onTransactionDeleted={mutateTransactions}
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
