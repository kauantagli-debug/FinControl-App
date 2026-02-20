
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
        const cards = await (prisma as any).creditCard.findMany({
            where: { userId: session.user.id },
            include: {
                transactions: {
                    orderBy: { date: "desc" },
                    take: 50 // Optimize
                }
            }
        });

        // Calculate Virtual Invoice for each card
        const cardsWithInvoice = cards.map((card: any) => {
            const today = new Date();
            const closingDay = card.closingDay;

            let startDate: Date;
            let endDate: Date;

            if (today.getDate() <= closingDay) {
                // Example: Today 5th, Closing 10th. 
                // Current open bill started last month 11th.
                startDate = new Date(today.getFullYear(), today.getMonth() - 1, closingDay + 1);
                endDate = new Date(today.getFullYear(), today.getMonth(), closingDay);
            } else {
                // Example: Today 15th, Closing 10th.
                // Current open bill started this month 11th.
                startDate = new Date(today.getFullYear(), today.getMonth(), closingDay + 1);
                endDate = new Date(today.getFullYear(), today.getMonth() + 1, closingDay);
            }

            // Set times to cover full days
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(23, 59, 59, 999);

            const currentInvoice = card.transactions.reduce((sum: number, t: any) => {
                const tDate = new Date(t.date);
                if (tDate >= startDate && tDate <= endDate) {
                    return sum + parseFloat(t.amount.toString());
                }
                return sum;
            }, 0);

            return {
                ...card,
                currentInvoice,
                invoicePeriod: {
                    start: startDate,
                    end: endDate
                }
            };
        });

        return NextResponse.json(cardsWithInvoice);

    } catch (error) {
        console.error("Cards Fetch Error:", error);
        return NextResponse.json({ error: "Failed to fetch cards" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { name, last4Digits, limit, closingDay, dueDay, color } = body;

        if (!name || !limit || !closingDay || !dueDay) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const card = await (prisma as any).creditCard.create({
            data: {
                name,
                last4Digits: last4Digits || "0000",
                limit: parseFloat(limit),
                closingDay: parseInt(closingDay),
                dueDay: parseInt(dueDay),
                color: color || "from-gray-700 to-gray-900",
                userId: session.user.id
            }
        });

        return NextResponse.json(card);
    } catch (error) {
        console.error("Card Creation Error:", error);
        return NextResponse.json({ error: "Failed to create card" }, { status: 500 });
    }
}
