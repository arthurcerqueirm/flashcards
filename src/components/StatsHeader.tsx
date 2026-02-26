'use client';

import Link from 'next/link';
import { Trophy, Flame, Star, LogOut, BookMarked, Settings, Brain, Crown } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';

interface StatsHeaderProps {
    xp: number;
    streak: number;
    level: number;
}

export default function StatsHeader({ xp, streak, level }: StatsHeaderProps) {
    const { data: session } = useSession();
    const [reviewCount, setReviewCount] = useState(0);
    const progress = (xp % 100);

    useEffect(() => {
        const fetchReviewCount = async () => {
            try {
                const res = await fetch('/api/flashcards/review');
                const data = await res.json();
                if (Array.isArray(data)) {
                    setReviewCount(data.length);
                }
            } catch (err) {
                console.error('Error fetching review count:', err);
            }
        };
        fetchReviewCount();
    }, []);

    return (
        <div className="w-full sticky top-0 bg-background/80 backdrop-blur-xl border-b border-white/10 z-[100] p-4 md:p-6 transition-all">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                {/* Brand & Progress */}
                <div className="flex items-center gap-3 bg-card/40 backdrop-blur-xl border border-white/10 p-2 md:p-2.5 rounded-2xl md:rounded-[24px] shadow-2xl shadow-primary/10">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-primary to-accent rounded-xl md:rounded-[20px] flex items-center justify-center text-white shadow-lg shadow-primary/30">
                            <Star fill="currentColor" size={20} className="md:w-6 md:h-6" />
                        </div>
                        <div className="hidden sm:flex flex-col pr-4">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{session?.user?.name || `Nível ${level}`}</span>
                                {session?.user?.isPremium && (
                                    <span className="text-[8px] bg-primary text-white px-1.5 py-0.5 rounded-md font-black">PRO</span>
                                )}
                                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            </div>
                            <div className="w-24 md:w-32 h-1.5 bg-white/10 rounded-full mt-1.5 overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-700 ease-out"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden lg:flex items-center gap-1 bg-card/40 backdrop-blur-xl border border-white/10 p-2 rounded-[20px] shadow-2xl shadow-primary/5 pointer-events-auto">
                    <Link
                        href="/pricing"
                        className="flex items-center gap-2 px-4 py-2 hover:bg-primary/10 rounded-xl transition-all group"
                    >
                        <Crown size={18} className="text-primary animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary group-hover:text-white transition-colors">Seja Pro</span>
                    </Link>
                    <div className="w-px h-4 bg-white/10 mx-1" />
                    <Link
                        href="/learned"
                        className="flex items-center gap-2 px-4 py-2 hover:bg-white/5 rounded-xl transition-all group"
                    >
                        <BookMarked size={18} className="text-muted-foreground group-hover:text-accent transition-colors" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-white transition-colors">Vocabulário</span>
                    </Link>
                    <div className="w-px h-4 bg-white/10 mx-1" />
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 px-4 py-2 hover:bg-white/5 rounded-xl transition-all group"
                    >
                        <Trophy size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-white transition-colors">Progresso</span>
                    </Link>
                </div>

                {/* Stats & Actions */}
                <div className="flex items-center gap-2 md:gap-3 bg-card/40 backdrop-blur-xl border border-white/10 p-2 md:p-2.5 rounded-2xl md:rounded-[24px] shadow-2xl shadow-primary/10">
                    <div className="flex items-center gap-2 md:gap-4 px-2 md:px-4">
                        <div className="flex items-center gap-2 group cursor-pointer">
                            <div className="bg-orange-500/20 p-2 rounded-xl text-orange-500 group-hover:scale-110 transition-transform">
                                <Flame fill="currentColor" size={18} className="md:w-5 md:h-5" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm md:text-base font-black leading-none">{streak}</span>
                                <span className="text-[8px] md:text-[10px] font-bold text-muted-foreground uppercase hidden xs:block">Dias</span>
                            </div>
                        </div>

                        <div className="h-8 w-px bg-white/10" />

                        <div className="flex items-center gap-2 group cursor-pointer">
                            <div className="bg-primary/20 p-2 rounded-xl text-primary group-hover:scale-110 transition-transform">
                                <Trophy size={18} className="md:w-5 md:h-5" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm md:text-base font-black leading-none">{Math.floor(xp / 100) * 100 + progress}</span>
                                <span className="text-[8px] md:text-[10px] font-bold text-muted-foreground uppercase hidden xs:block">XP</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-8 w-px bg-white/10 hidden md:block" />

                    <div className="hidden md:flex items-center gap-2 pl-2">
                        <Link href="/settings" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground hover:bg-primary/20 hover:text-primary transition-all cursor-pointer">
                            <Settings size={20} />
                        </Link>
                        <div
                            onClick={() => signOut()}
                            className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                        >
                            <LogOut size={20} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
