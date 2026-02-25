'use client';

import Link from 'next/link';
import { Home, BookMarked, Trophy, LogOut } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { motion } from 'framer-motion';

export default function BottomNav() {
    const pathname = usePathname();

    const navItems = [
        { icon: Home, label: 'Início', href: '/' },
        { icon: BookMarked, label: 'Palavras', href: '/learned' },
        { icon: Trophy, label: 'Progresso', href: '/dashboard' },
    ];

    return (
        <div className="lg:hidden fixed bottom-6 left-6 right-6 bg-card/40 backdrop-blur-2xl border border-white/10 py-4 px-8 rounded-[32px] flex items-center justify-between z-[100] shadow-2xl overflow-hidden pointer-events-auto">
            <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
            {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`relative flex flex-col items-center gap-1.5 transition-all outline-none ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-white'
                            }`}
                    >
                        <Icon size={24} className={isActive ? 'animate-pulse scale-110' : 'transition-transform hover:scale-110'} />
                        <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                            {item.label}
                        </span>
                        {isActive && (
                            <motion.div
                                layoutId="active-tab"
                                className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)]"
                            />
                        )}
                    </Link>
                );
            })}
            <button
                onClick={() => signOut()}
                className="flex flex-col items-center gap-1.5 text-muted-foreground hover:text-red-500 transition-all outline-none"
            >
                <LogOut size={24} className="hover:scale-110 transition-transform" />
                <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-60">Sair</span>
            </button>
        </div>
    );
}
