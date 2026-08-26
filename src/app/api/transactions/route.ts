import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

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
        const { amount, description, type, categoryId, date, cardId, installments } = body;

        if (!amount || !description) {
            return NextResponse.json(
                { error: "Amount and description are required" },
                { status: 400 }
            );
        }

        const totalAmount = parseFloat(amount);
        if (isNaN(totalAmount) || totalAmount <= 0) {
            return NextResponse.json(
                { error: "Invalid amount format" },
                { status: 400 }
            );
        }

        const numInstallments = installments ? parseInt(installments) : 1;
        const baseDate = date ? new Date(date) : new Date();
        const installmentAmount = totalAmount / numInstallments;
        
        const transactionsToCreate = Array.from({ length: numInstallments }).map((_, i) => {
            const txDate = new Date(baseDate);
            txDate.setMonth(txDate.getMonth() + i);
            return {
                amount: installmentAmount,
                description: numInstallments > 1 ? `${description} (${i + 1}/${numInstallments})` : description,
                type: type || "EXPENSE",
                source: "WEB",
                date: txDate,
                userId: session.user.id,
                categoryId: categoryId || null,
                cardId: cardId || null,
            };
        });

        // Prisma 6.x supports createManyAndReturn
        const transactions = await prisma.transaction.createManyAndReturn({
            data: transactionsToCreate,
            include: { category: true }
        });

        const transaction = transactions[0]; // Return the first one for the frontend compatibility

        // Gamification: Update Streak & XP
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const stats = await prisma.userStats.findUnique({ where: { userId: session.user.id } });

        let newStreak = stats?.currentStreak || 0;
        let streakBonusXP = 0;
        const lastActivity = stats?.lastActivityAt ? new Date(stats.lastActivityAt) : null;

        if (lastActivity) lastActivity.setHours(0, 0, 0, 0);

        if (!lastActivity || lastActivity.getTime() < today.getTime()) {
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            if (lastActivity && lastActivity.getTime() === yesterday.getTime()) {
                // Continued streak
                newStreak += 1;
                streakBonusXP = 25; // Bonus for maintaining streak
            } else if (!lastActivity || lastActivity.getTime() !== today.getTime()) {
                // Broken streak or first time
                if (!lastActivity || lastActivity.getTime() < yesterday.getTime()) {
                    newStreak = 1;
                }
            }
        }

        // Calculate Level Up
        const currentXP = stats?.xp || 0;
        const currentLevel = stats?.level || 1;
        const addedXP = 50 + streakBonusXP; // 50 XP per transaction + streak bonus

        let newXP = currentXP + addedXP;
        let newLevel = currentLevel;

        while (true) {
            const threshold = newLevel * 150;
            if (newXP >= threshold) {
                newXP -= threshold;
                newLevel += 1;
            } else {
                break;
            }
        }

        await prisma.userStats.upsert({
            where: { userId: session.user.id },
            create: {
                userId: session.user.id,
                currentStreak: 1,
                longestStreak: 1,
                xp: 50,
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
            { error: error instanceof Error ? error.message : "Failed to create transaction" },
            { status: 500 }
        );
    }
}
