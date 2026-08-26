'use client';

import { Flame, Trophy } from 'lucide-react';

interface StreakBannerProps {
    streak: number;
    level: number;
    xp: number;
}

export function StreakBanner({ streak, level, xp }: StreakBannerProps) {
    // XP needed for next level: base 100 * level
    const xpNeeded = level * 1000;
    const progress = Math.min((xp / xpNeeded) * 100, 100);

    return (
        <div className="mx-6 mt-6 mb-2">
            <div className="relative overflow-hidden bg-gradient-to-r from-orange-500/10 to-purple-500/10 border border-orange-500/20 rounded-2xl p-4 flex items-center justify-between">

                {/* Streak Info */}
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="absolute inset-0 bg-orange-500 blur-lg opacity-20 animate-pulse"></div>
                        <div className="relative w-10 h-10 bg-orange-500/10 rounded-full flex items-center justify-center border border-orange-500/30">
                            <Flame className={`w-6 h-6 ${streak > 0 ? 'text-orange-500 fill-orange-500' : 'text-zinc-500'}`} />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-white font-bold text-lg">{streak} Dias</span>
                            <span className="text-orange-400 text-xs font-medium bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20">
                                🔥 Sequência
                            </span>
                        </div>
                        <p className="text-zinc-500 text-xs">Continue registrando para manter!</p>
                    </div>
                </div>

                {/* Level Info */}
                <div className="flex flex-col items-end gap-1 min-w-[100px]">
                    <div className="flex items-center gap-1.5 text-purple-400 font-bold text-sm">
                        <Trophy className="w-3.5 h-3.5" />
                        <span>Nível {level}</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-1000"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <span className="text-[10px] text-zinc-500">{xp} / {xpNeeded} XP</span>
                </div>

            </div>
        </div>
    );
}
