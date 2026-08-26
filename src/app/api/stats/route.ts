import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let stats = await prisma.userStats.findUnique({
        where: { userId: session.user.id },
    });

    const txCount = await prisma.transaction.count({
        where: { userId: session.user.id }
    });

    let totalCalculatedXP = txCount * 50 + ((stats?.longestStreak || 1) * 25);
    let calculatedLevel = 1;
    let remainingXP = totalCalculatedXP;
    while (true) {
        const threshold = calculatedLevel * 150;
        if (remainingXP >= threshold) {
            remainingXP -= threshold;
            calculatedLevel += 1;
        } else {
            break;
        }
    }

    if (!stats) {
        stats = await prisma.userStats.create({
            data: {
                userId: session.user.id,
                level: calculatedLevel,
                xp: remainingXP,
                currentStreak: txCount > 0 ? 1 : 0,
            },
        });
    } else if (calculatedLevel > stats.level || (calculatedLevel === stats.level && remainingXP > stats.xp)) {
        stats = await prisma.userStats.update({
            where: { userId: session.user.id },
            data: {
                level: calculatedLevel,
                xp: remainingXP,
            }
        });
    }

    return NextResponse.json(stats);
}
