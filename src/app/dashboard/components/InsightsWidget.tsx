
'use client';

import { useEffect, useState } from 'react';
import { Brain, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function InsightsWidget() {
    const [insight, setInsight] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/insights')
            .then(res => res.json())
            .then(data => {
                if (data.tips && data.tips.length > 0) {
                    setInsight(data.tips[0]);
                } else if (data.forecast) {
                    setInsight(`Previsão de gastos para o próximo mês: R$ ${data.forecast.nextValue.toFixed(2)}`);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return null;

    if (!insight) return null;

    return (
        <div
            className="mb-8 p-4 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-transparent border-l-4 border-indigo-500 rounded-r-xl animate-in slide-in-from-bottom-2 fade-in duration-500"
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-indigo-500/20 rounded-lg mt-1">
                        <Brain className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-indigo-200 uppercase tracking-wider mb-1">
                            Insight Inteligente
                        </h3>
                        <p className="text-zinc-300 text-sm leading-relaxed">
                            {insight}
                        </p>
                    </div>
                </div>
                <Link
                    href="/insights"
                    className="flex items-center gap-2 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors bg-indigo-500/10 px-3 py-2 rounded-lg"
                >
                    Ver Análise Completa
                    <ArrowRight className="w-3.5 h-3.5" />
                </Link>
            </div>
        </div>
    );
}
