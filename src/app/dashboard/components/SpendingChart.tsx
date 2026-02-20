'use client';

interface SpendingChartProps {
    data: { name: string; total: number; color: string }[];
    totalExpense: number;
}

const CHART_COLORS = [
    '#8b5cf6', '#ec4899', '#f59e0b', '#10b981',
    '#3b82f6', '#ef4444', '#06b6d4', '#f97316',
    '#6366f1', '#84cc16',
];

export function SpendingChart({ data, totalExpense }: SpendingChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-10 text-zinc-500">
                <p className="text-sm">Sem dados de gastos para exibir.</p>
            </div>
        );
    }

    // Build SVG donut chart
    const size = 180;
    const strokeWidth = 28;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    const { segments } = data.reduce((acc, item, index) => {
        const percent = totalExpense > 0 ? item.total / totalExpense : 0;
        const offset = circumference * (1 - acc.cumulative);
        const length = circumference * percent;

        acc.segments.push({
            ...item,
            color: CHART_COLORS[index % CHART_COLORS.length],
            offset,
            length,
            percent: Math.round(percent * 100),
        });

        acc.cumulative += percent;
        return acc;
    }, { segments: [] as (typeof data[0] & { color: string; offset: number; length: number; percent: number })[], cumulative: 0 });

    return (
        <div className="flex flex-col gap-5 px-6 mb-6">
            <h3 className="text-white font-bold text-lg">Gastos por Categoria</h3>
            <div className="flex items-center gap-6 bg-[#1c1c26]/60 backdrop-blur-md border border-white/5 rounded-3xl p-6">
                {/* Donut Chart */}
                <div className="relative flex-shrink-0">
                    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                        {/* Background circle */}
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="none"
                            stroke="rgba(255,255,255,0.05)"
                            strokeWidth={strokeWidth}
                        />
                        {/* Data segments */}
                        {segments.map((seg, i) => (
                            <circle
                                key={i}
                                cx={size / 2}
                                cy={size / 2}
                                r={radius}
                                fill="none"
                                stroke={seg.color}
                                strokeWidth={strokeWidth}
                                strokeDasharray={`${seg.length} ${circumference - seg.length}`}
                                strokeDashoffset={seg.offset}
                                strokeLinecap="round"
                                transform={`rotate(-90 ${size / 2} ${size / 2})`}
                                className="transition-all duration-700 ease-out"
                                style={{ filter: `drop-shadow(0 0 4px ${seg.color}40)` }}
                            />
                        ))}
                    </svg>
                    {/* Center text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xs text-zinc-400">Total</span>
                        <span className="text-lg font-bold text-white">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(totalExpense)}
                        </span>
                    </div>
                </div>

                {/* Legend */}
                <div className="flex flex-col gap-2 overflow-y-auto max-h-40 flex-1">
                    {segments.slice(0, 6).map((seg, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <div
                                className="w-3 h-3 rounded-full flex-shrink-0"
                                style={{ backgroundColor: seg.color }}
                            />
                            <span className="text-zinc-400 text-xs truncate flex-1">{seg.name}</span>
                            <span className="text-white text-xs font-medium">{seg.percent}%</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
