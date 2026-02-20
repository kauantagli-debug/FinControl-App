import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let stats = await prisma.userStats.findUnique({
        where: { userId: session.user.id },
    });

    if (!stats) {
        stats = await prisma.userStats.create({
            data: {
                userId: session.user.id,
                level: 1,
                xp: 0,
                currentStreak: 0,
            },
        });
    }

    return NextResponse.json(stats);
}
