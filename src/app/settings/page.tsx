'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ArrowLeft, User, Mail, Shield, Bell, Moon, Globe } from 'lucide-react';
import StatsHeader from '@/components/StatsHeader';
import { useState, useEffect } from 'react';

export default function SettingsPage() {
    const { data: session } = useSession();
    const [stats, setStats] = useState({ xp: 0, streak: 0, level: 1 });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/user/stats');
                const data = await res.json();
                if (!data.error) {
                    setStats(data);
                }
            } catch (err) {
                console.error('Error fetching stats:', err);
            }
        };
        fetchStats();
    }, []);

    return (
        <main className="min-h-screen bg-background relative overflow-hidden flex flex-col">
            <StatsHeader xp={stats.xp} streak={stats.streak} level={stats.level} />

            <div className="flex-1 max-w-4xl mx-auto w-full px-6 pt-8 md:pt-12 pb-24">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-white transition-colors mb-8 group"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-bold uppercase tracking-widest text-sm">Voltar para Dashboard</span>
                </Link>

                <div className="flex flex-col gap-8">
                    <section>
                        <h1 className="text-4xl md:text-5xl font-black mb-2 tracking-tight">Configurações</h1>
                        <p className="text-muted-foreground">Gerencie sua conta e preferências de estudo.</p>
                    </section>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Profile Section */}
                        <div className="md:col-span-2 space-y-6">
                            <div className="bg-card/40 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 shadow-2xl">
                                <div className="flex items-center gap-6 mb-8">
                                    <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-3xl flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-primary/20">
                                        {session?.user?.name?.[0] || 'U'}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold">{session?.user?.name || 'Estudante'}</h2>
                                        <p className="text-muted-foreground">{session?.user?.email || 'carregando...'}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                                        <div className="p-2 bg-primary/20 text-primary rounded-lg">
                                            <User size={20} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Nome de Usuário</p>
                                            <p className="font-bold">{session?.user?.name || 'Não definido'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                                        <div className="p-2 bg-accent/20 text-accent rounded-lg">
                                            <Mail size={20} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">E-mail</p>
                                            <p className="font-bold">{session?.user?.email || 'Não definido'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-card/40 backdrop-blur-xl border border-white/10 rounded-[32px] p-8">
                                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                                    <Shield size={20} className="text-primary" />
                                    Segurança e Preferências
                                </h3>
                                <div className="space-y-2">
                                    {[
                                        { icon: <Bell size={18} />, label: 'Notificações de Estudo', active: true },
                                        { icon: <Moon size={18} />, label: 'Modo Escuro (Sempre Ativado)', active: true },
                                        { icon: <Globe size={18} />, label: 'Idioma da Interface', value: 'Português' },
                                    ].map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 hover:bg-white/5 rounded-2xl transition-colors cursor-pointer group">
                                            <div className="flex items-center gap-3">
                                                <div className="text-muted-foreground group-hover:text-white transition-colors">
                                                    {item.icon}
                                                </div>
                                                <span className="font-medium">{item.label}</span>
                                            </div>
                                            {item.value ? (
                                                <span className="text-sm font-bold text-primary">{item.value}</span>
                                            ) : (
                                                <div className={`w-10 h-6 rounded-full relative transition-colors ${item.active ? 'bg-primary' : 'bg-white/10'}`}>
                                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${item.active ? 'right-1' : 'left-1'}`} />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Stats Sidebar */}
                        <div className="space-y-6">
                            <div className="bg-gradient-to-br from-primary/20 to-accent/20 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 shadow-2xl relative overflow-hidden">
                                <div className="relative z-10">
                                    <p className="text-[10px] font-black uppercase text-primary tracking-[0.2em] mb-4">Seu Nível</p>
                                    <h3 className="text-6xl font-black mb-2">{stats.level}</h3>
                                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-4">
                                        <div className="h-full bg-primary" style={{ width: `${stats.xp % 100}%` }} />
                                    </div>
                                    <p className="text-xs text-muted-foreground font-medium">{100 - (stats.xp % 100)} XP para o próximo nível</p>
                                </div>
                                <div className="absolute -right-8 -bottom-8 lg:-right-4 lg:-bottom-4 opacity-10">
                                    <Shield size={160} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
