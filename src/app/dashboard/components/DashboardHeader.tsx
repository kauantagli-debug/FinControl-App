'use client';

import { ChevronDown, Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface DashboardHeaderProps {
    currentMonth: number;
    currentYear: number;
}

export function DashboardHeader({ currentMonth, currentYear }: DashboardHeaderProps) {
    const router = useRouter();
    const months = [
        { name: "Jan", val: 1 }, { name: "Fev", val: 2 }, { name: "Mar", val: 3 },
        { name: "Abr", val: 4 }, { name: "Mai", val: 5 }, { name: "Jun", val: 6 },
        { name: "Jul", val: 7 }, { name: "Ago", val: 8 }, { name: "Set", val: 9 },
        { name: "Out", val: 10 }, { name: "Nov", val: 11 }, { name: "Dez", val: 12 }
    ];

    const handleMonthChange = (monthVal: number) => {
        // Basic navigation - implies reload for now, but in Next.js it's client nav
        router.push(`/dashboard?month=${monthVal}&year=${currentYear}`);
    };

    return (
        <div className="flex flex-col gap-6 mb-6">
            <header className="flex justify-between items-center px-6 pt-8">
                <div className="flex flex-col">
                    <span className="text-zinc-400 text-sm">Bem vindo de volta,</span>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        Kauan <ChevronDown className="w-4 h-4 text-purple-400" />
                    </h1>
                </div>
                <button className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white active:scale-95 transition-transform hover:bg-white/10">
                    <Bell className="w-5 h-5" />
                </button>
            </header>

            {/* Month Selector */}
            <div className="flex overflow-x-auto px-6 gap-4 scrollbar-hide py-2">
                {months.map((m) => (
                    <button
                        key={m.val}
                        onClick={() => handleMonthChange(m.val)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${m.val === currentMonth
                                ? "bg-purple-600 text-white shadow-lg shadow-purple-900/40 scale-105"
                                : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-200"
                            }`}
                    >
                        {m.name}
                    </button>
                ))}
            </div>
        </div>
    );
}
