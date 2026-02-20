export interface Category {
    id: string;
    name: string;
    icon?: string;
    color?: string;
}

export interface Transaction {
    id: string;
    amount: number | string; // Handle Prisma Decimal serialized as string
    description: string;
    date: string;
    type: "INCOME" | "EXPENSE";
    category?: Category;
}

export interface DashboardData {
    totalBalance: number;
    totalIncome: number;
    totalExpense: number;
    transactions: Transaction[];
    categoryData?: { category__name: string; total: number }[];
}

export interface BudgetItem {
    id: string;
    categoryId: string;
    categoryName: string;
    categoryIcon: string | null;
    categoryColor: string;
    budgetAmount: number;
    spentAmount: number;
    percentage: number;
}

export interface ReportData {
    categoryBreakdown: {
        categoryId: string | null;
        name: string;
        icon: string | null;
        color: string;
        total: number;
    }[];
    totalExpense: number;
    monthlyTrend: {
        month: number;
        year: number;
        label: string;
        income: number;
        expense: number;
    }[];
    comparison: {
        incomeChange: number;
        expenseChange: number;
        prevIncome: number;
        prevExpense: number;
        currentIncome: number;
        currentExpense: number;
    };
    dailyData: { date: string; amount: number }[];
}

export interface UserStats {
    id: string;
    currentStreak: number;
    longestStreak: number;
    totalSaved: number; // Decimal string or number
    level: number;
    xp: number;
}

export interface Card {
    id: string;
    name: string;
    last4Digits: string;
    limit: number;
    balance: number;
    closingDate: number;
    dueDate: number;
}
