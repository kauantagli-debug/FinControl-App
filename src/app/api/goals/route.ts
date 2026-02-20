import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const goals = await (prisma as any).goal.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(goals);
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { name, targetAmount, deadline, icon, color } = body;

        const goal = await (prisma as any).goal.create({
            data: {
                name,
                targetAmount: parseFloat(targetAmount),
                deadline: deadline ? new Date(deadline) : null,
                icon,
                color,
                userId: session.user.id,
            },
        });

        return NextResponse.json(goal);
    } catch (error) {
        console.error("Goal creation error:", error);
        return NextResponse.json({ error: "Failed to create goal" }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { id, currentAmount } = body;

        const newAmount = parseFloat(currentAmount);

        if (isNaN(newAmount)) {
            return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
        }

        const existingGoal = await (prisma as any).goal.findUnique({
            where: { id, userId: session.user.id }
        });

        if (!existingGoal) {
            return NextResponse.json({ error: "Goal not found" }, { status: 404 });
        }

        const target = parseFloat(existingGoal.targetAmount.toString());
        const isCompleted = newAmount >= target;

        const updatedGoal = await (prisma as any).goal.update({
            where: { id },
            data: {
                currentAmount: newAmount,
                isCompleted
            },
        });

        return NextResponse.json(updatedGoal);
    } catch (error) {
        console.error("Goal update error:", error);
        return NextResponse.json({ error: "Failed to update goal" }, { status: 500 });
    }
}
