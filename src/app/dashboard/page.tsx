'use client';

import { useState, useEffect } from 'react';
import StatsHeader from '@/components/StatsHeader';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import { BookOpen, TrendingUp, Award, Calendar } from 'lucide-react';
import Link from 'next/link';

const mockData = [
    { name: 'Seg', words: 12 },
    { name: 'Ter', words: 18 },
    { name: 'Qua', words: 15 },
    { name: 'Qui', words: 25 },
    { name: 'Sex', words: 30 },
    { name: 'Sáb', words: 20 },
    { name: 'Dom', words: 40 },
];

export default function Dashboard() {
    const [stats, setStats] = useState({
        xp: 0,
        streak: 0,
        level: 1,
        totalLearned: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/user/stats');
                const data = await res.json();
                if (!data.error) {
                    setStats(data);
                }
            } catch (err) {
                console.error('Error fetching dashboard stats:', err);
            }
        };
        fetchStats();
    }, []);

    return (
        <main className="min-h-screen bg-background">
            <StatsHeader xp={stats.xp} streak={stats.streak} level={stats.level} />

            <div className="max-w-5xl mx-auto px-6 py-12">
                <div className="flex items-center justify-between mb-12">
                    <h1 className="text-4xl font-black tracking-tight">Seu Progresso</h1>
                    <Link
                        href="/"
                        className="bg-primary hover:bg-primary/80 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/20"
                    >
                        Estudar Agora
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-card border border-white/5 rounded-3xl p-8 shadow-xl">
                        <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary mb-6">
                            <BookOpen size={24} />
                        </div>
                        <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">Total de Palavras</p>
                        <h2 className="text-5xl font-black">{stats.totalLearned}</h2>
                        <p className="text-xs text-muted-foreground mt-2 font-medium">Palavras aprendidas no total</p>
                    </div>

                    <div className="bg-card border border-white/5 rounded-3xl p-8 shadow-xl">
                        <div className="w-12 h-12 bg-accent/20 rounded-2xl flex items-center justify-center text-accent mb-6">
                            <TrendingUp size={24} />
                        </div>
                        <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">Média Diária</p>
                        <h2 className="text-5xl font-black">22</h2>
                        <p className="text-xs text-muted-foreground mt-2 font-medium">Novas palavras por dia</p>
                    </div>

                    <div className="bg-card border border-white/5 rounded-3xl p-8 shadow-xl">
                        <div className="w-12 h-12 bg-yellow-500/20 rounded-2xl flex items-center justify-center text-yellow-500 mb-6">
                            <Award size={24} />
                        </div>
                        <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">Nível Atual</p>
                        <h2 className="text-5xl font-black">Lvl {stats.level}</h2>
                        <p className="text-xs text-muted-foreground mt-2 font-medium">Próximo nível em {100 - (stats.xp % 100)} XP</p>
                    </div>
                </div>

                <div className="bg-card border border-white/5 rounded-[40px] p-10 shadow-2xl">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-2xl font-bold mb-1">Progresso Semanal</h3>
                            <p className="text-muted-foreground">Palavras aprendidas nos últimos 7 dias</p>
                        </div>
                        <Calendar className="text-muted-foreground" size={24} />
                    </div>

                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={mockData}>
                                <defs>
                                    <linearGradient id="colorWords" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#71717a', fontSize: 12, fontWeight: 600 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#71717a', fontSize: 12, fontWeight: 600 }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#18181b',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '16px',
                                        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
                                    }}
                                    itemStyle={{ color: 'var(--primary)', fontWeight: 'bold' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="words"
                                    stroke="var(--primary)"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorWords)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </main>
    );
}
