import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseMessage } from "@/lib/nlp";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { text, user_email } = body;

        if (!text) {
            return NextResponse.json({ error: "No text provided" }, { status: 400 });
        }

        if (!user_email) {
            return NextResponse.json({ error: "No user email provided" }, { status: 400 });
        }

        // Find user by email (case insensitive)
        const user = await prisma.user.findFirst({
            where: {
                email: {
                    equals: user_email,
                    mode: "insensitive"
                }
            }
        });

        if (!user) {
            return NextResponse.json(
                { error: `User ${user_email} not found` },
                { status: 404 }
            );
        }

        // Get all categories for NLP matching
        const categories = await prisma.category.findMany();

        // Parse the message
        const parsed = parseMessage(text, categories);

        // Create transaction
        const transaction = await prisma.transaction.create({
            data: {
                amount: parsed.amount,
                description: parsed.description,
                type: parsed.type,
                source: "WHATSAPP",
                date: new Date(),
                userId: user.id,
                categoryId: parsed.categoryId,
            }
        });

        return NextResponse.json({
            status: "success",
            description: transaction.description,
            amount: transaction.amount.toString(),
            type: transaction.type,
        });

    } catch (error) {
        console.error("WhatsApp API error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
