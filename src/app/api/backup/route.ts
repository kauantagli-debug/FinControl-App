
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const userId = session.user.id;

        const data = await Promise.all([
            (prisma as any).transaction.findMany({ where: { userId } }),
            (prisma as any).budget.findMany({ where: { userId } }),
            (prisma as any).goal.findMany({ where: { userId } }),
            (prisma as any).creditCard.findMany({ where: { userId } }), // If exists
            (prisma as any).category.findMany(), // Global or User specific? Standard ones are global.
        ]);

        const backup = {
            timestamp: new Date().toISOString(),
            user: {
                name: session.user.name,
                email: session.user.email
            },
            transactions: data[0],
            budgets: data[1],
            goals: data[2],
            cards: data[3],
            // categories: data[4] // Don't export global categories unless user created them
        };

        return NextResponse.json(backup);
    } catch (error) {
        console.error("Backup Error:", error);
        return NextResponse.json({ error: "Failed to create backup" }, { status: 500 });
    }
}
