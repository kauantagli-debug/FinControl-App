
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const userId = session.user.id;

        const data = await Promise.all([
            prisma.transaction.findMany({ where: { userId } }),
            prisma.budget.findMany({ where: { userId } }),
            prisma.goal.findMany({ where: { userId } }),
            prisma.creditCard.findMany({ where: { userId } }), // If exists
            prisma.category.findMany(), // Global or User specific? Standard ones are global.
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

        return new NextResponse(JSON.stringify(backup, null, 2), {
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': `attachment; filename="fincontrol-backup-${new Date().toISOString().split('T')[0]}.json"`
            }
        });
    } catch (error) {
        console.error("Backup Error:", error);
        return NextResponse.json({ error: "Failed to create backup" }, { status: 500 });
    }
}
