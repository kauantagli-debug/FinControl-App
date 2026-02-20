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

    // Date range for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const transactions = await prisma.transaction.findMany({
        where: {
            userId: session.user.id,
            date: {
                gte: startDate,
                lte: endDate,
            }
        },
        include: {
            category: true,
        },
        orderBy: {
            date: "desc",
        }
    });

    // Calculate totals
    const totals = transactions.reduce((acc, t) => {
        const amount = parseFloat(t.amount.toString());
        if (t.type === "INCOME") {
            acc.income += amount;
        } else {
            acc.expense += amount;
        }
        return acc;
    }, { income: 0, expense: 0 });

    // Category breakdown for chart
    const categoryData = transactions
        .filter(t => t.type === "EXPENSE")
        .reduce((acc, t) => {
            const catName = t.category?.name || "General";
            acc[catName] = (acc[catName] || 0) + parseFloat(t.amount.toString());
            return acc;
        }, {} as Record<string, number>);

    return NextResponse.json({
        transactions,
        totalIncome: totals.income,
        totalExpense: totals.expense,
        totalBalance: totals.income - totals.expense,
        categoryData: Object.entries(categoryData).map(([name, total]) => ({
            category__name: name,
            total
        }))
    });
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { amount, description, type, categoryId, date, cardId } = body;

        if (!amount || !description) {
            return NextResponse.json(
                { error: "Amount and description are required" },
                { status: 400 }
            );
        }

        const transaction = await (prisma as any).transaction.create({
            data: {
                amount: parseFloat(amount),
                description,
                type: type || "EXPENSE",
                source: "WEB",
                date: date ? new Date(date) : new Date(),
                userId: session.user.id,
                categoryId: categoryId || null,
                cardId: cardId || null,
            },
            include: { category: true }
        });

        // Gamification: Update Streak & XP
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const stats = await (prisma as any).userStats.findUnique({ where: { userId: session.user.id } });

        let newStreak = stats?.currentStreak || 0;
        const lastActivity = stats?.lastActivityAt ? new Date(stats.lastActivityAt) : null;

        if (lastActivity) lastActivity.setHours(0, 0, 0, 0);

        if (!lastActivity || lastActivity.getTime() < today.getTime()) {
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            if (lastActivity && lastActivity.getTime() === yesterday.getTime()) {
                // Continued streak
                newStreak += 1;
            } else if (!lastActivity || lastActivity.getTime() !== today.getTime()) {
                // Broken streak or first time (unless already logged today)
                if (!lastActivity || lastActivity.getTime() < yesterday.getTime()) {
                    newStreak = 1;
                }
            }
        }

        // Calculate Level Up
        const currentXP = stats?.xp || 0;
        const currentLevel = stats?.level || 1;
        const addedXP = 10;

        let newXP = currentXP + addedXP;
        let newLevel = currentLevel;

        while (true) {
            const threshold = newLevel * 1000;
            if (newXP >= threshold) {
                newXP -= threshold;
                newLevel += 1;
            } else {
                break;
            }
        }

        await (prisma as any).userStats.upsert({
            where: { userId: session.user.id },
            create: {
                userId: session.user.id,
                currentStreak: 1,
                longestStreak: 1,
                xp: 10,
                level: 1,
                lastActivityAt: new Date(),
            },
            update: {
                currentStreak: newStreak,
                longestStreak: Math.max(newStreak, stats?.longestStreak || 0),
                xp: newXP,
                level: newLevel,
                lastActivityAt: new Date(),
            }
        });

        return NextResponse.json(transaction);



    } catch (error) {
        console.error("Transaction creation error:", error);
        return NextResponse.json(
            { error: "Failed to create transaction" },
            { status: 500 }
        );
    }
}
