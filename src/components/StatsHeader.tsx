'use client';

import Link from 'next/link';
import { Trophy, Flame, Star, LogOut, BookMarked, Settings } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';

interface StatsHeaderProps {
    xp: number;
    streak: number;
    level: number;
}

export default function StatsHeader({ xp, streak, level }: StatsHeaderProps) {
    const { data: session } = useSession();
    const nextLevelXp = (level) * 100;
    const progress = (xp % 100);

    return (
        <div className="w-full bg-card/50 backdrop-blur-md border-b border-white/5 sticky top-0 z-50">
            <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                            <Star fill="currentColor" size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-tight">Nível {level}</p>
                            <div className="w-32 h-1.5 bg-white/5 rounded-full mt-1 overflow-hidden">
                                <div
                                    className="h-full bg-primary transition-all duration-500"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    </Link>

                    <div className="h-8 w-px bg-white/5 hidden md:block" />

                    <div className="hidden md:flex flex-col">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Estudante</p>
                        <p className="text-sm font-bold truncate max-w-[120px]">{session?.user?.name || 'Aventureiro'}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 md:gap-6">
                    <Link
                        href="/dashboard"
                        className="hidden sm:flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded-xl transition-all border border-primary/10"
                    >
                        <Trophy size={18} />
                        <span className="text-xs font-bold uppercase">Meu Progresso</span>
                    </Link>

                    <Link
                        href="/learned"
                        className="hidden sm:flex items-center gap-2 bg-accent/10 hover:bg-accent/20 text-accent px-4 py-2 rounded-xl transition-all border border-accent/10"
                    >
                        <BookMarked size={18} />
                        <span className="text-xs font-bold uppercase">Vocabulário</span>
                    </Link>

                    <div className="h-6 w-px bg-white/5 hidden sm:block" />

                    <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <Flame className="text-orange-500" fill="currentColor" size={22} />
                        <div>
                            <p className="text-lg font-black leading-none">{streak}</p>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Streak</p>
                        </div>
                    </Link>

                    <button
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-white/5 transition-all"
                        title="Configurações"
                    >
                        <Settings size={20} />
                    </button>

                    <button
                        onClick={() => signOut()}
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-all"
                        title="Sair"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}
