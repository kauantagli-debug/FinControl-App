
import { Transaction } from "@/app/dashboard/types";

interface RecurringPattern {
    description: string;
    avgAmount: number;
    frequency: string; // "Monthly", "Weekly"
    nextPotentialDate: Date;
    confidence: number;
}

/**
 * Detects recurring patterns in transactions to identify subscriptions
 * or regular bills.
 */
export function detectRecurring(transactions: Transaction[]): RecurringPattern[] {
    const patterns: RecurringPattern[] = [];
    if (transactions.length < 5) return patterns;

    // Group by normalized description
    const groups: Record<string, Transaction[]> = {};

    for (const t of transactions) {
        // Normalize: "Netflix.com" -> "netflix"
        // Also remove numbers? No, "Spotify Premium" is key.
        const key = t.description.toLowerCase().trim().replace(/[0-9]/g, '');
        if (!groups[key]) groups[key] = [];
        groups[key].push(t);
    }

    // Analyze each group
    for (const [key, group] of Object.entries(groups)) {
        if (group.length < 2) continue;

        // Sort by date
        group.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // Check intervals
        let sumInterval = 0;
        let countIntervals = 0;
        let isconsistent = true;

        for (let i = 0; i < group.length - 1; i++) {
            const diff = Math.abs(new Date(group[i + 1].date).getTime() - new Date(group[i].date).getTime());
            const days = diff / (1000 * 60 * 60 * 24);

            // Monthly is roughly 28-32 days
            if (days < 25 || days > 35) {
                isconsistent = false;
                break;
            }
            sumInterval += days;
            countIntervals++;
        }

        if (isconsistent && countIntervals > 0) {
            // Calculate average amount
            const avgAmount = group.reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0) / group.length;

            // Predict next date
            const lastDate = new Date(group[group.length - 1].date);
            const nextDate = new Date(lastDate);
            nextDate.setDate(lastDate.getDate() + 30); // Approx valid for next month

            patterns.push({
                description: group[0].description, // Use original casing
                avgAmount,
                frequency: "Mensal",
                nextPotentialDate: nextDate,
                confidence: 0.8 + (group.length * 0.05) // Higher count = higher confidence
            });
        }
    }

    return patterns;
}
