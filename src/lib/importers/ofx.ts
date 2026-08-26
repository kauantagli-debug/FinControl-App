
export interface ImportedTransaction {
    date: Date;
    amount: number;
    description: string;
    fitId: string; // Financial Institution Transaction ID
    type: "INCOME" | "EXPENSE";
}

export function parseOFX(ofxContent: string): ImportedTransaction[] {
    const transactions: ImportedTransaction[] = [];

    // Normalize line endings
    const content = ofxContent.replace(/\r\n/g, '\n');

    // Regex to find STMTTRN blocks
    const transactionRegex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/g;
    let match;

    while ((match = transactionRegex.exec(content)) !== null) {
        const block = match[1];

        const amountMatch = /<TRNAMT>([\d\.\-\+]+)/.exec(block);
        const dateMatch = /<DTPOSTED>(\d{8})/.exec(block); // YYYYMMDD
        const memoMatch = /<MEMO>(.*)/.exec(block);
        const fitIdMatch = /<FITID>(.*)/.exec(block);

        if (amountMatch && dateMatch && memoMatch) {
            const amount = parseFloat(amountMatch[1]);
            const dateStr = dateMatch[1];
            const description = memoMatch[1].trim();
            const fitId = fitIdMatch ? fitIdMatch[1].trim() : `${dateStr}-${Math.random()}`;

            // Parse Date (YYYYMMDD)
            const year = parseInt(dateStr.substring(0, 4));
            const month = parseInt(dateStr.substring(4, 6)) - 1; // 0-indexed
            const day = parseInt(dateStr.substring(6, 8));
            const date = new Date(year, month, day);

            transactions.push({
                date,
                amount: Math.abs(amount), // We store absolutes, type defines sign
                description,
                fitId,
                type: amount < 0 ? "EXPENSE" : "INCOME"
            });
        }
    }

    return transactions;
}
