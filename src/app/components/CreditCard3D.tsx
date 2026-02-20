
'use client';

import { useState, useRef, MouseEvent } from 'react';
import { CreditCard as CardIcon, Wifi } from 'lucide-react';

interface CreditCard3DProps {
    name: string;
    last4Digits: string;
    limit: number;
    currentInvoice: number;
    color: string; // Tailwind gradient classes e.g "from-purple-600 to-blue-600"
    closingDay: number;
    dueDay: number;
}

export function CreditCard3D({ name, last4Digits, limit, currentInvoice, color, closingDay, dueDay }: CreditCard3DProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [rotate, setRotate] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;

        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -10; // Max 10deg
        const rotateY = ((x - centerX) / centerX) * 10;

        setRotate({ x: rotateX, y: rotateY });
    };

    const handleMouseLeave = () => {
        setRotate({ x: 0, y: 0 });
    };

    const usagePercentage = Math.min((currentInvoice / limit) * 100, 100);

    return (
        <div
            className="perspective-1000 w-full max-w-sm h-56 mx-auto cursor-pointer group"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            <div
                ref={cardRef}
                className={`w-full h-full rounded-2xl p-6 relative shadow-2xl transition-transform duration-200 ease-out preserve-3d bg-gradient-to-br ${color}`}
                style={{
                    transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
                    transformStyle: 'preserve-3d'
                }}
            >
                {/* Glare Effect */}
                <div
                    className="absolute inset-0 bg-white/10 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                        background: `linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 60%)`
                    }}
                />

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-between h-full text-white transform translate-z-10">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-7 bg-white/20 rounded-md backdrop-blur-sm border border-white/30 flex items-center justify-center">
                                <div className="w-6 h-4 border border-white/40 rounded flex flex-col justify-center gap-[2px] p-[2px]">
                                    <div className="h-full w-1 border-r border-white/40"></div>
                                </div>
                            </div>
                            <Wifi className="w-6 h-6 rotate-90 opacity-70" />
                        </div>
                        <span className="font-mono text-lg tracking-widest opacity-80">
                            •••• {last4Digits}
                        </span>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-[10px] uppercase tracking-widest opacity-70 mb-1">Titular</p>
                                <p className="font-medium tracking-wide">{name.toUpperCase()}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] uppercase tracking-widest opacity-70 mb-1">Fatura Atual</p>
                                <p className="text-xl font-bold">R$ {currentInvoice.toFixed(2)}</p>
                            </div>
                        </div>

                        {/* Limit Bar */}
                        <div>
                            <div className="flex justify-between text-[10px] opacity-70 mb-1">
                                <span>Limite Utilizado</span>
                                <span>{usagePercentage.toFixed(0)}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-black/20 rounded-full overflow-hidden backdrop-blur-sm">
                                <div
                                    className={`h-full rounded-full transition-all duration-1000 ${usagePercentage > 90 ? 'bg-red-400' : 'bg-white'}`}
                                    style={{ width: `${usagePercentage}%` }}
                                ></div>
                            </div>
                            <div className="flex justify-between text-[10px] opacity-50 mt-1">
                                <span>Fecha dia {closingDay}</span>
                                <span>Vence dia {dueDay}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Decorative Circles */}
                <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
                <div className="absolute -top-12 -left-12 w-32 h-32 bg-black/10 rounded-full blur-xl pointer-events-none"></div>
            </div>
        </div>
    );
}
