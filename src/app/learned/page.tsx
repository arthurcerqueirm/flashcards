'use client';

import { useState, useEffect } from 'react';
import StatsHeader from '@/components/StatsHeader';
import { Search, BookMarked, ArrowLeft, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function LearnedWordsPage() {
    const [words, setWords] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ xp: 0, streak: 0, level: 1 });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const statsRes = await fetch('/api/user/stats');
                const statsData = await statsRes.json();
                if (!statsData.error) setStats(statsData);

                const learnedRes = await fetch('/api/flashcards/learned');
                const learnedData = await learnedRes.json();
                if (!learnedData.error) setWords(learnedData);
            } catch (err) {
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredWords = words.filter(w =>
        w.word.toLowerCase().includes(search.toLowerCase()) ||
        w.translation.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <main className="min-h-screen bg-background">
            <StatsHeader xp={stats.xp} streak={stats.streak} level={stats.level} />

            <div className="max-w-5xl mx-auto px-6 py-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <Link href="/" className="text-sm font-bold text-primary flex items-center gap-1 hover:underline mb-2">
                            <ArrowLeft size={16} />
                            Voltar para os estudos
                        </Link>
                        <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
                            Seu Vocabulário
                            <span className="text-xl bg-accent/20 text-accent px-3 py-1 rounded-full">{words.length}</span>
                        </h1>
                    </div>

                    <div className="relative w-full md:w-96">
                        <input
                            type="text"
                            placeholder="Buscar palavra ou tradução..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-card border border-white/5 focus:border-primary/50 rounded-2xl px-5 py-4 pl-12 outline-none transition-all shadow-xl"
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                        <p className="text-muted-foreground font-medium">Carregando seu progresso...</p>
                    </div>
                ) : filteredWords.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <AnimatePresence>
                            {filteredWords.map((item, index) => (
                                <motion.div
                                    key={item._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-card border border-white/5 rounded-3xl p-6 hover:border-primary/30 transition-all group"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="text-xs font-bold text-accent uppercase tracking-widest bg-accent/10 px-2 py-1 rounded-lg">Aprendida</span>
                                        <BookMarked className="text-muted-foreground/30 group-hover:text-primary transition-colors" size={20} />
                                    </div>
                                    <h3 className="text-2xl font-black mb-1">{item.word}</h3>
                                    <p className="text-primary font-bold mb-4">{item.translation}</p>
                                    <div className="bg-white/5 rounded-2xl p-4">
                                        <p className="text-sm italic text-muted-foreground mb-1">"{item.sentence}"</p>
                                        <p className="text-xs text-muted-foreground/60">{item.sentenceTranslation}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="text-center py-20 bg-card/30 border border-dashed border-white/10 rounded-[40px]">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-muted-foreground">
                            <BookMarked size={40} />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">
                            {search ? 'Nenhuma palavra encontrada' : 'Você ainda não aprendeu palavras'}
                        </h3>
                        <p className="text-muted-foreground mb-8">
                            {search ? 'Tente buscar por outro termo.' : 'Comece a estudar para ver sua lista crescer!'}
                        </p>
                        {!search && (
                            <Link
                                href="/"
                                className="bg-primary hover:bg-primary/80 text-white px-8 py-4 rounded-2xl font-bold transition-all inline-block"
                            >
                                Começar a Estudar
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}
