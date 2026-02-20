import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const achievements = await (prisma as any).achievement.findMany({
        where: { userId: session.user.id },
        orderBy: { unlockedAt: "desc" },
    });

    return NextResponse.json(achievements);
}

// Internal endpoint to trigger an achievement unlock
export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { type, name, description, icon } = await request.json();

        // Check if already unlocked
        const existing = await (prisma as any).achievement.findFirst({
            where: {
                userId: session.user.id,
                name: name,
            },
        });

        if (existing) {
            return NextResponse.json({ message: "Already unlocked" });
        }

        const achievement = await (prisma as any).achievement.create({
            data: {
                type,
                name,
                description,
                icon,
                userId: session.user.id,
            },
        });

        // Calculate Level Up
        const stats = await (prisma as any).userStats.findUnique({ where: { userId: session.user.id } });

        const currentXP = stats?.xp || 0;
        const currentLevel = stats?.level || 1;
        const addedXP = 100;

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
                xp: 100,
                level: 1,
                currentStreak: 0,
                longestStreak: 0,
            },
            update: {
                xp: newXP,
                level: newLevel,
            }
        });

        return NextResponse.json(achievement);

    } catch (error) {
        return NextResponse.json({ error: "Failed to unlock achievement" }, { status: 500 });
    }
}
