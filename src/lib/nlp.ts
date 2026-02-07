interface Category {
    id: string;
    name: string;
}

interface ParsedMessage {
    amount: number;
    description: string;
    type: "EXPENSE" | "INCOME";
    categoryId: string | null;
}

export function parseMessage(text: string, categories: Category[]): ParsedMessage {
    text = text.toLowerCase().trim();

    let amount = 0;
    let description = "Despesa WhatsApp";
    let type: "EXPENSE" | "INCOME" = "EXPENSE";
    let categoryId: string | null = null;

    // 1. Extract Amount (R$ 50, 50.00, 50,00, 50)
    const amountMatch = text.match(/R?\$?\s*(\d+([.,]\d{1,2})?)/);
    if (amountMatch) {
        amount = parseFloat(amountMatch[1].replace(',', '.'));
        text = text.replace(amountMatch[0], '').trim();
    }

    // 2. Determine Type
    if (['recebi', 'ganhei', 'renda', 'deposito', 'salario'].some(k => text.includes(k))) {
        type = "INCOME";
        description = "Receita WhatsApp";
    } else if (['gastei', 'paguei', 'compra', 'saque'].some(k => text.includes(k))) {
        type = "EXPENSE";
    }

    // 3. Clean Description
    const stopwords = ['gastei', 'paguei', 'recebi', 'ganhei', ' com ', ' no ', ' na ', ' em '];
    let cleanText = text;
    stopwords.forEach(word => {
        cleanText = cleanText.replace(new RegExp(word, 'g'), '');
    });

    if (cleanText.trim()) {
        description = cleanText.trim()
            .split(' ')
            .filter(w => w.length > 0)
            .map(w => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');
    }

    // 4. Match Category
    for (const cat of categories) {
        if (description.toLowerCase().includes(cat.name.toLowerCase())) {
            categoryId = cat.id;
            break;
        }
    }

    // Fallback keyword matching
    if (!categoryId) {
        const keywords: Record<string, string[]> = {
            'food': ['comida', 'lanche', 'restaurante', 'ifood', 'mercado', 'pizza', 'almoço', 'janta'],
            'transport': ['uber', '99', 'taxi', 'bus', 'onibus', 'gasolina', 'posto', 'estacionamento'],
            'salary': ['salario', 'pagamento', 'freela', 'freelance'],
            'entertainment': ['cinema', 'jogo', 'steam', 'netflix', 'spotify'],
            'bills': ['luz', 'agua', 'internet', 'aluguel', 'conta']
        };

        for (const [catName, keys] of Object.entries(keywords)) {
            if (keys.some(k => description.toLowerCase().includes(k))) {
                const foundCat = categories.find(c => c.name.toLowerCase().includes(catName));
                if (foundCat) {
                    categoryId = foundCat.id;
                    break;
                }
            }
        }
    }

    return { amount, description, type, categoryId };
}
