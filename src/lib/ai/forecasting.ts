
export interface DataPoint {
    x: number; // Time index (e.g., month 1, 2, 3...)
    y: number; // Value (e.g., total spending)
}

export interface ForecastResult {
    nextValue: number;
    slope: number; // Growth trend (positive = increasing spending)
    confidence: number; // Simplified R-squared
}

/**
 * Calculates a simple linear regression (y = mx + b)
 * to predict the next value in the series.
 */
export function calculateTrend(data: DataPoint[]): ForecastResult {
    if (data.length < 2) {
        return {
            nextValue: data.length === 1 ? data[0].y : 0,
            slope: 0,
            confidence: 0
        };
    }

    const n = data.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;

    for (const point of data) {
        sumX += point.x;
        sumY += point.y;
        sumXY += point.x * point.y;
        sumXX += point.x * point.x;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Calculate R-squared for confidence
    let ssTot = 0;
    let ssRes = 0;
    const meanY = sumY / n;

    for (const point of data) {
        const prediction = slope * point.x + intercept;
        ssTot += Math.pow(point.y - meanY, 2);
        ssRes += Math.pow(point.y - prediction, 2);
    }

    const rSquared = ssTot === 0 ? 0 : 1 - (ssRes / ssTot);

    // Predict next value (X = n + 1, assuming 1-based index or just next step)
    // If input x are 1,2,3... next is max(x) + 1
    const nextX = Math.max(...data.map(d => d.x)) + 1;
    const nextValue = slope * nextX + intercept;

    return {
        nextValue: Math.max(0, nextValue), // Spending can't be negative, usually
        slope,
        confidence: rSquared
    };
}
