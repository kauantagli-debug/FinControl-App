'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Plus, BarChart3, CreditCard, Settings, Home, Target } from 'lucide-react';

interface BottomNavProps {
    onAddClick: () => void;
}

export function BottomNav({ onAddClick }: BottomNavProps) {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    return (
        <div className="fixed bottom-0 left-0 w-full bg-[#0b0b14]/90 backdrop-blur-xl border-t border-white/5 px-6 pb-6 pt-2 z-50">
            <div className="flex justify-between items-end max-w-lg mx-auto relative">
                {/* Background Glow */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-20 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>

                {/* Left Side Items */}
                <Link
                    href="/dashboard"
                    className={`flex flex-col items-center gap-1 p-2 transition-colors ${isActive('/dashboard') ? 'text-indigo-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    <Home className="w-6 h-6" />
                    <span className="text-[10px] font-bold">Início</span>
                </Link>

                <Link
                    href="/reports"
                    className={`flex flex-col items-center gap-1 p-2 transition-colors ${isActive('/reports') ? 'text-indigo-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    <BarChart3 className="w-6 h-6" />
                    <span className="text-[10px] font-semibold">Relatórios</span>
                </Link>

                {/* FAB (Center) */}
                <div className="relative -top-6">
                    <button
                        onClick={onAddClick}
                        className="w-16 h-16 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-2xl shadow-indigo-500/40 border-4 border-[#0b0b14] transform hover:scale-105 active:scale-95 transition-all group"
                    >
                        <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                </div>

                {/* Right Side Items */}
                <Link
                    href="/goals"
                    className={`flex flex-col items-center gap-1 p-2 transition-colors ${isActive('/goals') ? 'text-indigo-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    <Target className="w-6 h-6" />
                    <span className="text-[10px] font-semibold">Metas</span>
                </Link>

                <Link
                    href="/settings"
                    className={`flex flex-col items-center gap-1 p-2 transition-colors ${isActive('/settings') ? 'text-indigo-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    <Settings className="w-6 h-6" />
                    <span className="text-[10px] font-semibold">Ajustes</span>
                </Link>
            </div>
        </div>
    );
}
