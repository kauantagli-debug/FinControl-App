
import { Transaction } from "@/app/dashboard/types"; // Assuming shared types, or use generic

interface TransactionData {
    id: string;
    amount: number;
    description: string;
    date: Date;
    categoryId?: string | null;
}

export interface Anomaly {
    transactionId: string;
    score: number; // Z-score
    type: "HIGH_SPEND" | "DUPLICATE";
    details: string;
}

/**
 * Detects anomalies in a list of transactions using Z-Score (for outliers)
 * and exact matching (for duplicates).
 */
export function detectAnomalies(transactions: TransactionData[]): Anomaly[] {
    const anomalies: Anomaly[] = [];
    if (transactions.length < 5) return anomalies;

    // 1. Detect Outliers (High Spend)
    // Calculate Mean and StdDev
    const amounts = transactions.map(t => Math.abs(t.amount));
    const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;

    // Calculate Variance
    const variance = amounts.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / amounts.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev === 0) return anomalies;

    // Check each transaction
    for (const t of transactions) {
        const amount = Math.abs(t.amount);
        const zScore = (amount - mean) / stdDev;

        // Threshold: > 2.5 StdDev (99% probability usually)
        if (zScore > 2.5 && amount > 100) { // Ignore small amounts even if outlier
            anomalies.push({
                transactionId: t.id,
                score: zScore,
                type: "HIGH_SPEND",
                details: `Valor ${zScore.toFixed(1)}x acima da média (R$ ${mean.toFixed(2)})`
            });
        }
    }

    // 2. Detect Duplicates
    // Look for transactions with same amount and description within 24h
    // Simple O(N^2) for small N is fine, or sort for O(N log N)
    const sorted = [...transactions].sort((a, b) => a.date.getTime() - b.date.getTime());

    for (let i = 0; i < sorted.length - 1; i++) {
        const current = sorted[i];
        const next = sorted[i + 1];

        // Check time diff (within 24h)
        const timeDiff = Math.abs(next.date.getTime() - current.date.getTime());
        const isCloseTime = timeDiff < 24 * 60 * 60 * 1000;

        if (isCloseTime &&
            current.amount === next.amount &&
            current.description.toLowerCase().trim() === next.description.toLowerCase().trim()) {

            anomalies.push({
                transactionId: next.id, // Flag the later one
                score: 10, // High certainty
                type: "DUPLICATE",
                details: "Possível transação duplicada detectada"
            });
        }
    }

    return anomalies;
}
