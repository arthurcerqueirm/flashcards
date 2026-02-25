'use client';

import { useState, useEffect } from 'react';
import StatsHeader from '@/components/StatsHeader';
import { Search, BookMarked, ArrowLeft, LayoutGrid, List, Play } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Flashcard from '@/components/Flashcard';

export default function LearnedWordsPage() {
    const [words, setWords] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ xp: 0, streak: 0, level: 1 });
    const [activeTab, setActiveTab] = useState<'all' | 'categories'>('all');

    // Quick Practice state
    const [practiceWords, setPracticeWords] = useState<any[]>([]);
    const [practiceIndex, setPracticeIndex] = useState(0);

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

    const categories = words.reduce((acc: any, word) => {
        const cat = word.category || 'Geral';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(word);
        return acc;
    }, {});

    const startPractice = (categoryWords: any[]) => {
        setPracticeWords(categoryWords);
        setPracticeIndex(0);
    };

    if (practiceWords.length > 0) {
        return (
            <main className="min-h-screen bg-background flex flex-col">
                <StatsHeader xp={stats.xp} streak={stats.streak} level={stats.level} />
                <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-background to-accent/5">
                    <div className="w-full max-w-md mb-8 flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-black">Treino Rápido</h2>
                            <p className="text-muted-foreground font-medium">Focando em: {practiceWords[0].category}</p>
                        </div>
                        <button
                            onClick={() => setPracticeWords([])}
                            className="text-sm font-bold text-red-500 uppercase hover:underline"
                        >
                            Sair
                        </button>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`practice-${practiceWords[practiceIndex].word}`}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="w-full max-w-md"
                        >
                            <Flashcard
                                {...practiceWords[practiceIndex]}
                                onKnown={() => {
                                    if (practiceIndex < practiceWords.length - 1) setPracticeIndex(p => p + 1);
                                    else setPracticeWords([]);
                                }}
                                onUnknown={() => {
                                    if (practiceIndex < practiceWords.length - 1) setPracticeIndex(p => p + 1);
                                    else setPracticeWords([]);
                                }}
                            />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-background">
            <StatsHeader xp={stats.xp} streak={stats.streak} level={stats.level} />

            <div className="max-w-5xl mx-auto px-6 py-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <Link href="/" className="text-sm font-bold text-primary flex items-center gap-1 hover:underline mb-2 group">
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            Voltar para os estudos
                        </Link>
                        <h1 className="text-5xl font-black tracking-tight flex items-center gap-4">
                            Vocabulário
                            <span className="text-lg bg-primary/20 text-primary px-4 py-1 rounded-2xl">{words.length}</span>
                        </h1>
                    </div>

                    <div className="relative w-full md:w-96">
                        <input
                            type="text"
                            placeholder="Buscar palavra..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-card border border-white/10 focus:border-primary/50 rounded-2xl px-5 py-4 pl-12 shadow-xl outline-none transition-all"
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-8 bg-card/30 p-1.5 rounded-2xl w-fit border border-white/5 shadow-inner">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'all' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:bg-white/5'
                            }`}
                    >
                        <List size={20} />
                        Todos
                    </button>
                    <button
                        onClick={() => setActiveTab('categories')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'categories' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:bg-white/5'
                            }`}
                    >
                        <LayoutGrid size={20} />
                        Categorias
                    </button>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6" />
                        <p className="text-xl font-bold">Organizando seu conhecimento...</p>
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        {activeTab === 'all' ? (
                            <motion.div
                                key="all-words"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                            >
                                {filteredWords.map((item, index) => (
                                    <motion.div
                                        key={item._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.03 }}
                                        className="bg-card border border-white/5 rounded-[32px] p-6 hover:border-primary/30 transition-all group shadow-xl hover:shadow-primary/5"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="text-[10px] font-black text-accent uppercase tracking-widest bg-accent/10 px-3 py-1.5 rounded-xl">
                                                {item.category || 'Geral'}
                                            </span>
                                            <BookMarked className="text-muted-foreground/30 group-hover:text-primary transition-colors" size={20} />
                                        </div>
                                        <h3 className="text-2xl font-black mb-1 group-hover:text-primary transition-colors">{item.word}</h3>
                                        <p className="text-lg font-bold text-muted-foreground mb-4">{item.translation}</p>
                                        <div className="bg-white/5 rounded-2xl p-4 group-hover:bg-white/[0.08] transition-colors">
                                            <p className="text-sm italic text-muted-foreground mb-1">"{item.sentence}"</p>
                                            <p className="text-[11px] font-medium text-muted-foreground/40">{item.sentenceTranslation}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="categories-grid"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                            >
                                {Object.keys(categories).map((cat, index) => (
                                    <motion.div
                                        key={cat}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="bg-card border-2 border-white/5 rounded-[40px] p-8 flex flex-col items-center text-center group hover:border-primary/40 transition-all shadow-2xl relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-[100px] -mr-8 -mt-8 transition-all group-hover:w-32 group-hover:h-32" />

                                        <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                            <BookMarked size={32} />
                                        </div>

                                        <h3 className="text-2xl font-black mb-2">{cat}</h3>
                                        <p className="text-muted-foreground font-medium mb-8">
                                            {categories[cat].length} {categories[cat].length === 1 ? 'palavra aprendida' : 'palavras aprendidas'}
                                        </p>

                                        <button
                                            onClick={() => startPractice(categories[cat])}
                                            className="w-full bg-primary hover:bg-primary/80 text-white py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-primary/20"
                                        >
                                            <Play size={20} fill="currentColor" />
                                            Treino Rápido
                                        </button>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
            </div>
        </main>
    );
}
