import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useDashboard(month: number, year: number) {
    // SWR uses the URL as the cache key. When month/year change, it automatically fetches new data.
    const { data: transactions, mutate: mutateTransactions, isLoading: loadingTransactions } = useSWR(`/api/transactions?month=${month}&year=${year}`, fetcher);
    const { data: categories, isLoading: loadingCategories } = useSWR('/api/categories', fetcher);
    const { data: budgets, isLoading: loadingBudgets } = useSWR(`/api/budgets?month=${month}&year=${year}`, fetcher);
    const { data: reportData, isLoading: loadingReport } = useSWR(`/api/reports?month=${month}&year=${year}`, fetcher);
    const { data: stats, isLoading: loadingStats } = useSWR(`/api/stats`, fetcher);
    const { data: cards, isLoading: loadingCards } = useSWR(`/api/cards`, fetcher);

    const isLoading = loadingTransactions || loadingCategories || loadingBudgets || loadingReport || loadingStats || loadingCards;
    
    // Fallback empty data if not yet loaded
    const data = {
        transactions: transactions || { totalBalance: 0, totalIncome: 0, totalExpense: 0, transactions: [] },
        categories: categories || [],
        budgets: budgets || [],
        reportData: reportData || null,
        stats: stats || { currentStreak: 0, longestStreak: 0, totalSaved: 0, level: 1, xp: 0 },
        cards: cards || []
    };

    return {
        data,
        isLoading,
        mutateTransactions
    };
}
