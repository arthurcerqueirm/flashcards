'use client';

import { Check, Zap, Crown, ArrowRight } from 'lucide-react';
import StatsHeader from '@/components/StatsHeader';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function PricingPage() {
    const { data: session } = useSession();
    const [stats, setStats] = useState({ xp: 0, streak: 0, level: 1 });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/user/stats');
                const data = await res.json();
                if (!data.error) setStats(data);
            } catch (err) { }
        };
        fetchStats();
    }, []);

    const handleSubscribe = async (priceId: string) => {
        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ priceId }),
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                alert(data.error || 'Erro ao iniciar checkout');
            }
        } catch (err) {
            console.error('Checkout error:', err);
            alert('Erro de conexão ao processar pagamento.');
        }
    };

    return (
        <main className="min-h-screen bg-background relative overflow-hidden flex flex-col">
            <StatsHeader xp={stats.xp} streak={stats.streak} level={stats.level} />

            <div className="flex-1 max-w-7xl mx-auto w-full px-6 pt-12 pb-24 flex flex-col items-center">
                <div className="text-center mb-16">
                    <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter">
                        Escolha o seu <span className="text-primary">Plano</span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
                        Desbloqueie o poder total da IA e acelere seu aprendizado hoje mesmo.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
                    {/* Basic Plan */}
                    <div className="bg-card/40 backdrop-blur-xl border border-white/10 rounded-[48px] p-10 flex flex-col relative group hover:border-white/20 transition-all">
                        <div className="mb-8">
                            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-muted-foreground mb-6">
                                <Zap size={28} />
                            </div>
                            <h2 className="text-3xl font-black mb-2">Plano Básico</h2>
                            <p className="text-muted-foreground font-medium text-sm">Ideal para quem está começando.</p>
                        </div>

                        <div className="mb-10">
                            <span className="text-5xl font-black">Grátis</span>
                        </div>

                        <div className="space-y-4 mb-12">
                            {[
                                '3 gerações de IA por dia',
                                'Até 50 flashcards ativos',
                                'Estatísticas básicas',
                                'Suporte via comunidade'
                            ].map((feature, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="text-primary"><Check size={20} /></div>
                                    <span className="font-bold text-white/80">{feature}</span>
                                </div>
                            ))}
                        </div>

                        <button className="w-full py-6 bg-white/5 hover:bg-white/10 text-white rounded-[24px] font-black text-xl transition-all mt-auto border border-white/10">
                            Plano Atual
                        </button>
                    </div>

                    {/* Pro Plan */}
                    <div className="bg-gradient-to-br from-primary/10 to-accent/10 backdrop-blur-xl border-2 border-primary/50 rounded-[48px] p-10 flex flex-col relative group shadow-2xl shadow-primary/20">
                        <div className="absolute -top-4 right-10 bg-primary text-white px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest">
                            Recomendado
                        </div>

                        <div className="mb-8">
                            <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-white mb-6 shadow-xl shadow-primary/40">
                                <Crown size={28} />
                            </div>
                            <h2 className="text-3xl font-black mb-2">Plano Pro</h2>
                            <p className="text-muted-foreground font-medium text-sm">Para mestres na fluência.</p>
                        </div>

                        <div className="mb-10 flex items-baseline gap-2">
                            <span className="text-5xl font-black">R$ 29,90</span>
                            <span className="text-muted-foreground font-bold">/mês</span>
                        </div>

                        <div className="space-y-4 mb-12">
                            {[
                                'Gerações de IA Ilimitadas',
                                'Flashcards ilimitados',
                                'Dashboard avançado de progresso',
                                'Vozes de IA premium',
                                'Suporte priorizado 24/7'
                            ].map((feature, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="text-primary"><Check size={20} /></div>
                                    <span className="font-bold text-white">{feature}</span>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => handleSubscribe('pro_monthly')}
                            className="w-full py-6 bg-primary hover:bg-primary/80 text-white rounded-[24px] font-black text-xl transition-all mt-auto shadow-2xl shadow-primary/40 flex items-center justify-center gap-3 group"
                        >
                            Assinar Agora
                            <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>

                <p className="mt-12 text-muted-foreground text-sm font-medium">
                    Preços em Real (BRL). Cancele a qualquer momento.
                </p>
            </div>
        </main>
    );
}
