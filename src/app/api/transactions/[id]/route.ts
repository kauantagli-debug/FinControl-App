import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    try {
        // Make sure transaction belongs to user
        const transaction = await prisma.transaction.findFirst({
            where: {
                id,
                userId: session.user.id,
            }
        });

        if (!transaction) {
            return NextResponse.json(
                { error: "Transaction not found" },
                { status: 404 }
            );
        }

        await prisma.transaction.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Transaction deletion error:", error);
        return NextResponse.json(
            { error: "Failed to delete transaction" },
            { status: 500 }
        );
    }
}
