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

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // Get budgets with their categories
    const budgets = await prisma.budget.findMany({
        where: {
            userId: session.user.id,
            month,
            year,
        },
        include: { category: true },
    });

    // Get actual spending per category for this month
    const spending = await prisma.transaction.groupBy({
        by: ["categoryId"],
        where: {
            userId: session.user.id,
            type: "EXPENSE",
            date: { gte: startDate, lte: endDate },
        },
        _sum: { amount: true },
    });

    const spendingMap = new Map(
        spending.map((s) => [s.categoryId, parseFloat(s._sum.amount?.toString() || "0")])
    );

    const result = budgets.map((b) => ({
        id: b.id,
        categoryId: b.categoryId,
        categoryName: b.category.name,
        categoryIcon: b.category.icon,
        categoryColor: b.category.color,
        budgetAmount: parseFloat(b.amount.toString()),
        spentAmount: spendingMap.get(b.categoryId) || 0,
        percentage: Math.round(
            ((spendingMap.get(b.categoryId) || 0) / parseFloat(b.amount.toString())) * 100
        ),
    }));

    return NextResponse.json(result);
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { amount, categoryId, month, year } = await request.json();

        if (!amount || !categoryId || !month || !year) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const budget = await prisma.budget.upsert({
            where: {
                userId_categoryId_month_year: {
                    userId: session.user.id,
                    categoryId,
                    month,
                    year,
                },
            },
            update: { amount: parseFloat(amount) },
            create: {
                amount: parseFloat(amount),
                month,
                year,
                userId: session.user.id,
                categoryId,
            },
            include: { category: true },
        });

        return NextResponse.json(budget);
    } catch (error) {
        console.error("Budget error:", error);
        return NextResponse.json({ error: "Failed to save budget" }, { status: 500 });
    }
}
