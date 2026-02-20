
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateTrend } from "@/lib/ai/forecasting";
import { detectAnomalies } from "@/lib/ai/anomalies";
import { detectRecurring } from "@/lib/ai/patterns";

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Fetch last 6 months of transactions for analysis
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const transactions = await prisma.transaction.findMany({
            where: {
                userId: session.user.id,
                date: { gte: sixMonthsAgo }
            },
            orderBy: { date: "asc" }
        });

        // 1. Forecasting (Monthly Spending)
        // Group by month
        const monthlyTotals: Record<string, number> = {};
        transactions.forEach(t => {
            if (t.type === "EXPENSE") {
                const monthKey = new Date(t.date).getMonth(); // 0-11. Simple key.
                monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + Number(t.amount);
            }
        });

        const forecastData = Object.entries(monthlyTotals).map(([month, total]) => ({
            x: parseInt(month) + 1, // 1-based index for regression
            y: total
        }));

        const forecast = calculateTrend(forecastData);

        // 2. Anomalies (Recent transactions only, e.g. last 30 days)
        const recentTransactions = transactions.filter(t => {
            const diff = new Date().getTime() - new Date(t.date).getTime();
            return diff < 30 * 24 * 60 * 60 * 1000;
        }).map(t => ({
            id: t.id,
            amount: Number(t.amount),
            description: t.description,
            date: new Date(t.date),
            categoryId: t.categoryId
        }));

        const anomalies = detectAnomalies(recentTransactions);

        // 3. Patterns (All history)
        const transactionObjects = transactions.map(t => ({
            ...t,
            amount: Number(t.amount),
            date: new Date(t.date) // Ensure Date object
        })); // Cast to correct type structure if needed

        const recurring = detectRecurring(transactionObjects as any);

        // 4. Generate Tips
        const tips: string[] = [];
        if (forecast.slope > 0) {
            tips.push(`⚠️ Seus gastos estão subindo cerca de R$ ${forecast.slope.toFixed(2)} por mês.`);
        } else if (forecast.slope < 0) {
            tips.push(`✅ Parabéns! Você está reduzindo seus gastos em R$ ${Math.abs(forecast.slope).toFixed(2)} ao mês.`);
        }

        if (recurring.length > 0) {
            const totalFixed = recurring.reduce((acc, r) => acc + r.avgAmount, 0);
            tips.push(`📅 Detectamos ${recurring.length} assinaturas prováveis, totalizando R$ ${totalFixed.toFixed(2)}/mês.`);
        }

        return NextResponse.json({
            forecast,
            anomalies,
            recurring,
            tips
        });

    } catch (error) {
        console.error("AI Insights Error:", error);
        return NextResponse.json({ error: "Failed to generate insights" }, { status: 500 });
    }
}
