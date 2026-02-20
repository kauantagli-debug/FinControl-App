
'use client';

import { useEffect, useState } from 'react';
import { Brain, TrendingUp, AlertTriangle, Calendar } from 'lucide-react';

export default function InsightsPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/insights')
            .then(res => res.json())
            .then(data => {
                setData(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="p-8 text-center text-zinc-400">
                <Brain className="w-12 h-12 mx-auto mb-4 animate-pulse text-purple-500" />
                <p>Analisando seus dados financeiros...</p>
            </div>
        );
    }

    if (!data || data.error) {
        return (
            <div className="p-8 text-center text-red-400">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
                <p>Erro ao carregar insights.</p>
            </div>
        );
    }

    const { forecast, anomalies, recurring, tips } = data;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <Brain className="w-8 h-8 text-purple-500" />
                    Inteligência Financeira
                </h1>
                <p className="text-zinc-400 mt-2">
                    Análise automática dos seus padrões de gastos e previsões para o futuro.
                </p>
            </header>

            {/* Tips Section */}
            {tips.length > 0 && (
                <section className="grid gap-4 md:grid-cols-2">
                    {tips.map((tip: string, i: number) => (
                        <div
                            key={i}
                            className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 p-4 rounded-xl flex items-start gap-3 animate-in slide-in-from-bottom-2 fade-in duration-500"
                            style={{ animationDelay: `${i * 100}ms` }}
                        >
                            <div className="p-2 bg-purple-500/20 rounded-lg">
                                <Brain className="w-5 h-5 text-purple-400" />
                            </div>
                            <p className="text-zinc-200 text-sm mt-1">{tip}</p>
                        </div>
                    ))}
                </section>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Forecast Card */}
                <div
                    className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-2xl p-6 animate-in slide-in-from-left-4 fade-in duration-500 delay-100"
                >
                    <div className="flex items-center gap-2 mb-6">
                        <TrendingUp className="w-5 h-5 text-green-500" />
                        <h2 className="text-xl font-bold text-white">Previsão de Gastos</h2>
                    </div>

                    <div className="text-center py-6">
                        <p className="text-zinc-400 text-sm mb-2">Para o próximo mês</p>
                        <div className="text-4xl font-bold text-white">
                            R$ {forecast.nextValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                        <div className={`mt-2 text-sm font-medium ${forecast.slope > 0 ? 'text-red-400' : 'text-green-400'}`}>
                            {forecast.slope > 0 ? 'Tendência de Alta 📈' : 'Tendência de Baixa 📉'}
                        </div>
                        <div className="mt-4 h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                            <div
                                className={`h-full ${forecast.slope > 0 ? 'bg-red-500' : 'bg-green-500'} transition-all duration-1000`}
                                style={{ width: `${Math.max(10, forecast.confidence * 100)}%` }}
                            />
                        </div>
                        <p className="text-xs text-zinc-600 mt-1">Confiabilidade do modelo: {(forecast.confidence * 100).toFixed(0)}%</p>
                    </div>
                </div>

                {/* Recurring Card */}
                <div
                    className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-2xl p-6 animate-in slide-in-from-bottom-4 fade-in duration-500 delay-200"
                >
                    <div className="flex items-center gap-2 mb-6">
                        <Calendar className="w-5 h-5 text-blue-500" />
                        <h2 className="text-xl font-bold text-white">Assinaturas Prováveis</h2>
                    </div>

                    <div className="space-y-4">
                        {recurring.length === 0 ? (
                            <p className="text-zinc-500 text-sm text-center">Nenhuma assinatura detectada.</p>
                        ) : (
                            recurring.map((rec: any, i: number) => (
                                <div key={i} className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/5">
                                    <div>
                                        <p className="font-medium text-white">{rec.description}</p>
                                        <p className="text-xs text-zinc-400">Próxima: {new Date(rec.nextPotentialDate).toLocaleDateString('pt-BR')}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-white font-bold">R$ {rec.avgAmount.toFixed(2)}</p>
                                        <span className="text-[10px] text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">{rec.frequency}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Anomalies Card */}
                <div
                    className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-2xl p-6 animate-in slide-in-from-right-4 fade-in duration-500 delay-300"
                >
                    <div className="flex items-center gap-2 mb-6">
                        <AlertTriangle className="w-5 h-5 text-orange-500" />
                        <h2 className="text-xl font-bold text-white">Alertas & Anomalias</h2>
                    </div>

                    <div className="space-y-4">
                        {anomalies.length === 0 ? (
                            <div className="text-center py-8">
                                <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <TrendingUp className="w-6 h-6 text-green-500" />
                                </div>
                                <p className="text-zinc-400 text-sm">Tudo parece normal!</p>
                            </div>
                        ) : (
                            anomalies.map((anom: any, i: number) => (
                                <div key={i} className="p-3 bg-orange-500/5 border border-orange-500/20 rounded-lg">
                                    <div className="flex justify-between items-start">
                                        <span className="text-xs font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full mb-1 inline-block">
                                            {anom.type === 'HIGH_SPEND' ? 'Gasto Alto' : 'Duplicata'}
                                        </span>
                                        <span className="text-xs text-zinc-500">Score: {anom.score.toFixed(1)}</span>
                                    </div>
                                    <p className="text-zinc-300 text-sm mt-1">{anom.details}</p>
                                    <p className="text-zinc-500 text-xs mt-2">ID: {anom.transactionId.substring(0, 8)}...</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
