'use client';

import { useState, useEffect } from 'react';
import StatsHeader from '@/components/StatsHeader';
import { Search, BookMarked, ArrowLeft, LayoutGrid, List, Play, Plus, Sparkles, CheckSquare, Square, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Flashcard from '@/components/Flashcard';

export default function LearnedWordsPage() {
    const [words, setWords] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ xp: 0, streak: 0, level: 1 });
    const [activeTab, setActiveTab] = useState<'all' | 'decks' | 'custom'>('all');

    // Custom Deck states
    const [isCreatingDeck, setIsCreatingDeck] = useState(false);
    const [creationStep, setCreationStep] = useState<'choice' | 'ia' | 'select'>('choice');
    const [newDeckName, setNewDeckName] = useState('');
    const [selectedWords, setSelectedWords] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    // Quick Practice state
    const [practiceWords, setPracticeWords] = useState<any[]>([]);
    const [practiceIndex, setPracticeIndex] = useState(0);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
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

    const filteredWords = words.filter(w =>
        w.word.toLowerCase().includes(search.toLowerCase()) ||
        w.translation.toLowerCase().includes(search.toLowerCase())
    );

    // Filter by type
    const autoDecks = words.reduce((acc: any, word) => {
        if (!word.isCustomDeck) {
            const cat = word.deckName || word.category || 'Geral';
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(word);
        }
        return acc;
    }, {});

    const customDecks = words.reduce((acc: any, word) => {
        if (word.isCustomDeck) {
            const cat = word.deckName || 'Sem Nome';
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(word);
        }
        return acc;
    }, {});

    const handleBulkSave = async () => {
        if (!newDeckName || selectedWords.length === 0) return;
        setIsSaving(true);
        try {
            const res = await fetch('/api/flashcards/bulk-deck', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cardIds: selectedWords,
                    deckName: newDeckName,
                    isCustom: true // Implicit in the backend now
                })
            });
            if (res.ok) {
                setIsCreatingDeck(false);
                setNewDeckName('');
                setSelectedWords([]);
                fetchData();
            }
        } catch (err) {
            console.error('Error in bulk update:', err);
        } finally {
            setIsSaving(false);
        }
    };

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
                            <p className="text-muted-foreground font-medium">Focando em: {practiceWords[0].deckName || 'Deck'}</p>
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
                                key={practiceWords[practiceIndex]._id || practiceWords[practiceIndex].word}
                                id={practiceWords[practiceIndex]._id}
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
        <main className="min-h-screen bg-background relative overflow-hidden">
            {/* Background Decorative */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -mr-64 -mt-64 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] -ml-64 -mb-64 pointer-events-none" />

            <StatsHeader xp={stats.xp} streak={stats.streak} level={stats.level} />

            <div className="max-w-6xl mx-auto px-6 py-12 relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                    <div>
                        <Link href="/" className="text-sm font-bold text-primary flex items-center gap-2 hover:underline mb-4 group w-fit">
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            Voltar para o Estudo
                        </Link>
                        <h1 className="text-6xl font-black tracking-tighter flex items-center gap-4">
                            Sua Biblioteca
                            <span className="text-xl bg-primary/20 text-primary px-5 py-2 rounded-2xl border border-primary/10">{words.length}</span>
                        </h1>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative w-full md:w-80">
                            <input
                                type="text"
                                placeholder="Buscar palavra ou tradução..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-card/50 backdrop-blur-xl border border-white/10 focus:border-primary/50 rounded-2xl px-5 py-4 pl-12 shadow-xl outline-none transition-all placeholder:text-muted-foreground/30 font-medium"
                            />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40" size={20} />
                        </div>
                        <button
                            onClick={() => { setIsCreatingDeck(true); setCreationStep('choice'); }}
                            className="bg-primary text-white px-6 py-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                        >
                            <Plus size={20} />
                            Novo Deck
                        </button>
                    </div>
                </div>

                {/* Main Tabs UI */}
                <div className="flex gap-2 mb-10 bg-card/30 p-2 rounded-3xl w-fit border border-white/5 backdrop-blur-md shadow-inner">
                    {[
                        { id: 'all', label: 'Todos', icon: List },
                        { id: 'decks', label: 'Decks (Auto)', icon: LayoutGrid },
                        { id: 'custom', label: 'Personalizados', icon: BookMarked }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black transition-all ${activeTab === tab.id
                                ? 'bg-primary text-white shadow-xl shadow-primary/30 border border-primary/50'
                                : 'text-muted-foreground hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <tab.icon size={20} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="relative w-20 h-20 mb-8">
                            <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
                            <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                        <p className="text-2xl font-black tracking-tight text-white/80">Organizando seu conhecimento...</p>
                        <p className="text-muted-foreground mt-2">Personalizando sua biblioteca</p>
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        {activeTab === 'all' && (
                            <motion.div
                                key="all-words"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                            >
                                {filteredWords.map((item, index) => (
                                    <motion.div
                                        key={item._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.02 }}
                                        className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-[40px] p-8 hover:border-primary/40 transition-all group shadow-xl hover:shadow-primary/5 relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />
                                        <div className="flex justify-between items-start mb-6 relative">
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border ${item.isCustomDeck ? 'bg-accent/10 text-accent border-accent/20' : 'bg-primary/10 text-primary border-primary/20'
                                                }`}>
                                                {item.deckName || item.category || 'Geral'}
                                            </span>
                                            <BookMarked className="text-muted-foreground/20 group-hover:text-primary transition-colors" size={22} />
                                        </div>
                                        <h3 className="text-3xl font-black mb-1 group-hover:text-primary transition-colors tracking-tight">{item.word}</h3>
                                        <p className="text-xl font-bold text-muted-foreground mb-6">{item.translation}</p>
                                        <div className="bg-white/5 rounded-3xl p-5 group-hover:bg-white/[0.08] transition-all border border-white/5">
                                            <p className="text-sm italic text-muted-foreground mb-2 leading-relaxed">"{item.sentence}"</p>
                                            <p className="text-[11px] font-bold text-muted-foreground/30 uppercase tracking-widest">{item.sentenceTranslation}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}

                        {activeTab === 'decks' && (
                            <motion.div
                                key="decks-grid"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                            >
                                {Object.keys(autoDecks).length === 0 ? (
                                    <div className="col-span-full py-20 text-center opacity-50">Nenhum deck automático encontrado.</div>
                                ) : (
                                    Object.keys(autoDecks).map((cat, index) => (
                                        <motion.div
                                            key={cat}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="bg-card/40 backdrop-blur-xl border-2 border-white/5 rounded-[48px] p-10 flex flex-col items-center text-center group hover:border-primary/40 transition-all shadow-2xl relative overflow-hidden"
                                        >
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] -mr-12 -mt-12 transition-all group-hover:w-40 group-hover:h-40" />
                                            <div className="w-20 h-20 bg-primary/10 text-primary rounded-[28px] flex items-center justify-center mb-8 border border-primary/20 group-hover:scale-110 transition-transform">
                                                <LayoutGrid size={40} />
                                            </div>
                                            <h3 className="text-3xl font-black mb-3 tracking-tight">{cat}</h3>
                                            <p className="text-lg text-muted-foreground font-medium mb-10">
                                                {autoDecks[cat].length} {autoDecks[cat].length === 1 ? 'palavra' : 'palavras'}
                                            </p>
                                            <button
                                                onClick={() => startPractice(autoDecks[cat])}
                                                className="w-full bg-primary hover:bg-primary/80 text-white py-5 rounded-3xl font-black text-lg transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary/20"
                                            >
                                                <Play size={24} fill="currentColor" />
                                                Treino Rápido
                                            </button>
                                        </motion.div>
                                    ))
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'custom' && (
                            <motion.div
                                key="custom-decks-grid"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                            >
                                {Object.keys(customDecks).length === 0 ? (
                                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-center border-2 border-dashed border-white/5 rounded-[48px]">
                                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 text-muted-foreground/30">
                                            <BookMarked size={40} />
                                        </div>
                                        <h3 className="text-2xl font-black mb-2 opacity-50">Nenhum deck personalizado criado.</h3>
                                        <p className="text-muted-foreground max-w-sm mb-8">Crie suas próprias coleções para focar em áreas específicas do idioma.</p>
                                        <button
                                            onClick={() => { setIsCreatingDeck(true); setCreationStep('choice'); }}
                                            className="bg-accent text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-accent/20 hover:scale-105 active:scale-95 transition-all"
                                        >
                                            Criar Meu Primeiro Deck
                                        </button>
                                    </div>
                                ) : (
                                    Object.keys(customDecks).map((cat, index) => (
                                        <motion.div
                                            key={cat}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="bg-card/40 backdrop-blur-xl border-2 border-accent/20 rounded-[48px] p-10 flex flex-col items-center text-center group hover:border-accent/40 transition-all shadow-2xl relative overflow-hidden"
                                        >
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-bl-[100px] -mr-12 -mt-12 transition-all group-hover:w-40 group-hover:h-40" />
                                            <div className="w-20 h-20 bg-accent/10 text-accent rounded-[28px] flex items-center justify-center mb-8 border border-accent/20 group-hover:scale-110 transition-transform">
                                                <BookMarked size={40} />
                                            </div>
                                            <h3 className="text-3xl font-black mb-3 tracking-tight">{cat}</h3>
                                            <p className="text-lg text-muted-foreground font-medium mb-10">
                                                {customDecks[cat].length} {customDecks[cat].length === 1 ? 'palavra' : 'palavras'}
                                            </p>
                                            <button
                                                onClick={() => startPractice(customDecks[cat])}
                                                className="w-full bg-accent hover:bg-accent/80 text-white py-5 rounded-3xl font-black text-lg transition-all flex items-center justify-center gap-3 shadow-xl shadow-accent/20"
                                            >
                                                <Play size={24} fill="currentColor" />
                                                Praticar Agora
                                            </button>
                                        </motion.div>
                                    ))
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
            </div>

            {/* CREATION MODAL */}
            <AnimatePresence>
                {isCreatingDeck && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-6"
                    >
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsCreatingDeck(false)} />

                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-card w-full max-w-2xl border border-white/10 rounded-[48px] shadow-2xl overflow-hidden relative z-10"
                        >
                            <div className="p-10">
                                {creationStep === 'choice' && (
                                    <div className="text-center">
                                        <h2 className="text-4xl font-black mb-4 tracking-tighter">Criar Novo Deck</h2>
                                        <p className="text-muted-foreground mb-12 text-lg">Como você quer povoar seu novo deck personalizado?</p>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <button
                                                onClick={() => setCreationStep('ia')}
                                                className="bg-primary/10 border-2 border-primary/20 p-8 rounded-[40px] hover:bg-primary/20 transition-all group text-left"
                                            >
                                                <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                                                    <Sparkles size={28} />
                                                </div>
                                                <h3 className="text-2xl font-black mb-2">Com Inteligência Artificial</h3>
                                                <p className="text-sm text-muted-foreground font-medium">Gere palavras novas baseadas em um tema que você escolher.</p>
                                            </button>

                                            <button
                                                onClick={() => setCreationStep('select')}
                                                className="bg-accent/10 border-2 border-accent/20 p-8 rounded-[40px] hover:bg-accent/20 transition-all group text-left"
                                            >
                                                <div className="w-14 h-14 bg-accent text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-accent/20 group-hover:scale-110 transition-transform">
                                                    <List size={28} />
                                                </div>
                                                <h3 className="text-2xl font-black mb-2">Com Palavras Aprendidas</h3>
                                                <p className="text-sm text-muted-foreground font-medium">Selecione palavras que você já conhece e agrupe-as.</p>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {creationStep === 'ia' && (
                                    <div className="text-center">
                                        <Sparkles className="mx-auto mb-6 text-primary" size={64} />
                                        <h2 className="text-4xl font-black mb-4 tracking-tighter">Gerar com IA</h2>
                                        <p className="text-muted-foreground mb-10">Gere novos flashcards automáticos e salve-os em um deck personalizado.</p>
                                        <Link
                                            href="/"
                                            className="inline-flex items-center justify-center gap-2 bg-primary text-white px-10 py-5 rounded-2xl font-black text-xl shadow-xl shadow-primary/20 hover:scale-105 transition-all"
                                        >
                                            Ir para a Home e Criar
                                        </Link>
                                    </div>
                                )}

                                {creationStep === 'select' && (
                                    <div className="flex flex-col h-[600px]">
                                        <div className="flex justify-between items-center mb-6">
                                            <h2 className="text-3xl font-black tracking-tighter">Selecionar Palavras</h2>
                                            <span className="text-xs font-black uppercase tracking-widest bg-accent/20 text-accent px-4 py-2 rounded-xl">
                                                {selectedWords.length} Selecionadas
                                            </span>
                                        </div>

                                        <div className="mb-6">
                                            <input
                                                type="text"
                                                placeholder="Nome do Novo Deck Personalizado..."
                                                value={newDeckName}
                                                onChange={(e) => setNewDeckName(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-lg font-bold focus:border-accent/50 outline-none"
                                            />
                                        </div>

                                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                            <div className="grid grid-cols-1 gap-2">
                                                {words.map((word) => {
                                                    const isSelected = selectedWords.includes(word._id);
                                                    return (
                                                        <button
                                                            key={word._id}
                                                            onClick={() => {
                                                                if (isSelected) setSelectedWords(prev => prev.filter(id => id !== word._id));
                                                                else setSelectedWords(prev => [...prev, word._id]);
                                                            }}
                                                            className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${isSelected
                                                                ? 'bg-accent/10 border-accent/50'
                                                                : 'bg-white/5 border-white/5 hover:border-white/10'
                                                                }`}
                                                        >
                                                            <div className="text-left">
                                                                <p className="font-black text-lg leading-tight">{word.word}</p>
                                                                <p className="text-sm text-muted-foreground">{word.translation}</p>
                                                            </div>
                                                            {isSelected ? <CheckSquare className="text-accent" /> : <Square className="text-muted-foreground/30" />}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div className="mt-8 flex gap-4">
                                            <button
                                                onClick={() => setCreationStep('choice')}
                                                className="flex-1 py-5 rounded-3xl border border-white/10 font-black hover:bg-white/5 transition-all"
                                            >
                                                Voltar
                                            </button>
                                            <button
                                                disabled={!newDeckName || selectedWords.length === 0 || isSaving}
                                                onClick={handleBulkSave}
                                                className="flex-[2] bg-accent text-white py-5 rounded-3xl font-black text-lg shadow-xl shadow-accent/20 hover:opacity-90 active:scale-95 disabled:opacity-30 disabled:grayscale transition-all flex items-center justify-center gap-2"
                                            >
                                                {isSaving ? <Loader2 className="animate-spin" /> : <Save />}
                                                Salvar Deck Personalizado
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}
