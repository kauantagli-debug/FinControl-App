import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get("month") || (new Date().getMonth() + 1).toString());
    const year = parseInt(searchParams.get("year") || new Date().getFullYear().toString());

    // --- Category Breakdown (current month) ---
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const categorySpending = await prisma.transaction.groupBy({
        by: ["categoryId"],
        where: {
            userId: session.user.id,
            type: "EXPENSE",
            date: { gte: startDate, lte: endDate },
        },
        _sum: { amount: true },
    });

    // Fetch category details
    const categoryIds = categorySpending.map((c) => c.categoryId).filter(Boolean) as string[];
    const categories = await prisma.category.findMany({
        where: { id: { in: categoryIds } },
    });
    const catMap = new Map(categories.map((c) => [c.id, c]));

    const categoryBreakdown = categorySpending.map((cs) => {
        const cat = catMap.get(cs.categoryId || "");
        return {
            categoryId: cs.categoryId,
            name: cat?.name || "Sem categoria",
            icon: cat?.icon || null,
            color: cat?.color || "bg-gray-500",
            total: parseFloat(cs._sum.amount?.toString() || "0"),
        };
    }).sort((a, b) => b.total - a.total);

    const totalExpense = categoryBreakdown.reduce((s, c) => s + c.total, 0);

    // --- Monthly Trend (last 6 months) ---
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
        let m = month - i;
        let y = year;
        while (m <= 0) { m += 12; y--; }

        const mStart = new Date(y, m - 1, 1);
        const mEnd = new Date(y, m, 0, 23, 59, 59);

        const [incomeAgg, expenseAgg] = await Promise.all([
            prisma.transaction.aggregate({
                where: { userId: session.user.id, type: "INCOME", date: { gte: mStart, lte: mEnd } },
                _sum: { amount: true },
            }),
            prisma.transaction.aggregate({
                where: { userId: session.user.id, type: "EXPENSE", date: { gte: mStart, lte: mEnd } },
                _sum: { amount: true },
            }),
        ]);

        const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        monthlyTrend.push({
            month: m,
            year: y,
            label: `${monthNames[m - 1]}/${y.toString().slice(-2)}`,
            income: parseFloat(incomeAgg._sum.amount?.toString() || "0"),
            expense: parseFloat(expenseAgg._sum.amount?.toString() || "0"),
        });
    }

    // --- Previous Month Comparison ---
    let prevMonth = month - 1;
    let prevYear = year;
    if (prevMonth <= 0) { prevMonth = 12; prevYear--; }
    const prevStart = new Date(prevYear, prevMonth - 1, 1);
    const prevEnd = new Date(prevYear, prevMonth, 0, 23, 59, 59);

    const [prevIncome, prevExpense] = await Promise.all([
        prisma.transaction.aggregate({
            where: { userId: session.user.id, type: "INCOME", date: { gte: prevStart, lte: prevEnd } },
            _sum: { amount: true },
        }),
        prisma.transaction.aggregate({
            where: { userId: session.user.id, type: "EXPENSE", date: { gte: prevStart, lte: prevEnd } },
            _sum: { amount: true },
        }),
    ]);

    const currentIncome = monthlyTrend[monthlyTrend.length - 1]?.income || 0;
    const currentExpense = monthlyTrend[monthlyTrend.length - 1]?.expense || 0;
    const prevIncomeVal = parseFloat(prevIncome._sum.amount?.toString() || "0");
    const prevExpenseVal = parseFloat(prevExpense._sum.amount?.toString() || "0");

    const comparison = {
        incomeChange: prevIncomeVal > 0 ? Math.round(((currentIncome - prevIncomeVal) / prevIncomeVal) * 100) : 0,
        expenseChange: prevExpenseVal > 0 ? Math.round(((currentExpense - prevExpenseVal) / prevExpenseVal) * 100) : 0,
        prevIncome: prevIncomeVal,
        prevExpense: prevExpenseVal,
        currentIncome,
        currentExpense,
    };

    // --- Daily spending for the current month (for sparkline) ---
    const dailySpending = await prisma.transaction.groupBy({
        by: ["date"],
        where: {
            userId: session.user.id,
            type: "EXPENSE",
            date: { gte: startDate, lte: endDate },
        },
        _sum: { amount: true },
        orderBy: { date: "asc" },
    });

    const dailyData = dailySpending.map((d) => ({
        date: d.date.toISOString().split("T")[0],
        amount: parseFloat(d._sum.amount?.toString() || "0"),
    }));

    return NextResponse.json({
        categoryBreakdown,
        totalExpense,
        monthlyTrend,
        comparison,
        dailyData,
    });
}
