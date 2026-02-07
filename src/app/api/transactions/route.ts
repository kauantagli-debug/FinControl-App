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
    const month = parseInt(searchParams.get("month") || new Date().getMonth().toString()) + 1;
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
        const { amount, description, type, categoryId, date } = body;

        if (!amount || !description) {
            return NextResponse.json(
                { error: "Amount and description are required" },
                { status: 400 }
            );
        }

        const transaction = await prisma.transaction.create({
            data: {
                amount: parseFloat(amount),
                description,
                type: type || "EXPENSE",
                source: "WEB",
                date: date ? new Date(date) : new Date(),
                userId: session.user.id,
                categoryId: categoryId || null,
            },
            include: {
                category: true,
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
