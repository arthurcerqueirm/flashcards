'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, RotateCcw, Volume2, Pencil, Save } from 'lucide-react';

interface FlashcardProps {
    id?: string;
    word: string;
    translation: string;
    sentence: string;
    sentenceTranslation: string;
    onKnown: () => void;
    onUnknown: () => void;
    onSrsUpdate?: (rating: 'again' | 'hard' | 'good' | 'easy') => void;
    interval?: number;
    easeFactor?: number;
}

export default function Flashcard({
    id,
    word: initialWord,
    translation: initialTranslation,
    sentence: initialSentence,
    sentenceTranslation: initialSentenceTranslation,
    onKnown,
    onUnknown,
    onSrsUpdate,
    interval: currentInterval = 0,
    easeFactor = 2.5,
}: FlashcardProps) {
    const [isFlipped, setIsFlipped] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Edit state
    const [word, setWord] = useState(initialWord);
    const [translation, setTranslation] = useState(initialTranslation);
    const [sentence, setSentence] = useState(initialSentence);
    const [sentenceTranslation, setSentenceTranslation] = useState(initialSentenceTranslation);
    const [isSaving, setIsSaving] = useState(false);

    const handleFlip = () => {
        if (!isEditing) setIsFlipped(!isFlipped);
    };

    const speak = (text: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
    };

    const handleSave = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!id) return;
        setIsSaving(true);
        try {
            const res = await fetch('/api/flashcards/edit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cardId: id,
                    word,
                    translation,
                    sentence,
                    sentenceTranslation
                })
            });
            if (res.ok) {
                setIsEditing(false);
            }
        } catch (err) {
            console.error('Error saving card:', err);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto">
            <div
                className={`relative w-full aspect-[3/4] ${!isEditing && 'cursor-pointer'} perspective-1000`}
                onClick={handleFlip}
            >
                <motion.div
                    className="w-full h-full relative flashcard-inner"
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.4, type: 'spring', stiffness: 300, damping: 25 }}
                    style={{ transformStyle: 'preserve-3d' }}
                >
                    {/* Front */}
                    <div className="absolute inset-0 w-full h-full backface-hidden bg-card border-2 border-primary/20 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-2xl overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-primary/20" />

                        <div className="absolute top-6 right-6 flex gap-2">
                            <button
                                onClick={(e) => { e.stopPropagation(); setIsEditing(!isEditing); }}
                                className={`p-3 rounded-xl transition-all active:scale-95 ${isEditing ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}
                            >
                                {isEditing ? <X size={20} /> : <Pencil size={20} />}
                            </button>
                            {!isEditing && (
                                <button
                                    onClick={(e) => speak(word, e)}
                                    className="p-3 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl transition-all active:scale-95"
                                >
                                    <Volume2 size={20} />
                                </button>
                            )}
                        </div>

                        {isEditing ? (
                            <div className="w-full space-y-4" onClick={(e) => e.stopPropagation()}>
                                <div className="text-left w-full">
                                    <label className="text-[10px] uppercase font-black text-primary tracking-widest ml-1">Palavra</label>
                                    <input
                                        value={word}
                                        onChange={(e) => setWord(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-lg font-bold focus:border-primary/50 outline-none"
                                    />
                                </div>
                                <div className="text-left w-full">
                                    <label className="text-[10px] uppercase font-black text-primary tracking-widest ml-1">Tradução</label>
                                    <input
                                        value={translation}
                                        onChange={(e) => setTranslation(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-lg font-bold focus:border-primary/50 outline-none"
                                    />
                                </div>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="w-full py-4 bg-primary text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center gap-2 hover:bg-primary/80 transition-all disabled:opacity-50"
                                >
                                    <Save size={18} />
                                    {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                                </button>
                            </div>
                        ) : (
                            <>
                                <span className="text-sm font-medium text-primary uppercase tracking-widest mb-4">Palavra</span>
                                <h2 className="text-4xl font-bold mb-2">{word}</h2>
                                <p className="text-muted-foreground text-sm mt-4 animate-pulse">Clique para ver a tradução</p>
                            </>
                        )}
                    </div>

                    {/* Back */}
                    <div className="absolute inset-0 w-full h-full backface-hidden bg-card border-2 border-accent/20 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-2xl rotate-y-180 overflow-hidden"
                        style={{ transform: 'rotateY(180deg)' }}>
                        <div className="absolute top-0 left-0 w-full h-1 bg-accent/20" />

                        <div className="absolute top-6 right-6 flex flex-col gap-2">
                            <button
                                onClick={(e) => { e.stopPropagation(); setIsEditing(!isEditing); }}
                                className={`p-2.5 rounded-xl transition-all active:scale-95 ${isEditing ? 'bg-red-500/10 text-red-500' : 'bg-accent/10 text-accent hover:bg-accent/20'}`}
                            >
                                {isEditing ? <X size={18} /> : <Pencil size={18} />}
                            </button>
                            {!isEditing && (
                                <button
                                    onClick={(e) => speak(word, e)}
                                    className="p-2.5 bg-accent/10 hover:bg-accent/20 text-accent rounded-xl transition-all active:scale-95"
                                    title="Pronunciar palavra"
                                >
                                    <Volume2 size={18} />
                                </button>
                            )}
                        </div>

                        {isEditing ? (
                            <div className="w-full space-y-4" onClick={(e) => e.stopPropagation()}>
                                <div className="text-left w-full">
                                    <label className="text-[10px] uppercase font-black text-accent tracking-widest ml-1">Frase de Exemplo</label>
                                    <textarea
                                        value={sentence}
                                        onChange={(e) => setSentence(e.target.value)}
                                        rows={2}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-medium focus:border-accent/50 outline-none resize-none"
                                    />
                                </div>
                                <div className="text-left w-full">
                                    <label className="text-[10px] uppercase font-black text-accent tracking-widest ml-1">Tradução da Frase</label>
                                    <textarea
                                        value={sentenceTranslation}
                                        onChange={(e) => setSentenceTranslation(e.target.value)}
                                        rows={2}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-medium focus:border-accent/50 outline-none resize-none"
                                    />
                                </div>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="w-full py-4 bg-accent text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-accent/20 flex items-center justify-center gap-2 hover:bg-accent/80 transition-all disabled:opacity-50"
                                >
                                    <Save size={18} />
                                    {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                                </button>
                            </div>
                        ) : (
                            <>
                                <span className="text-sm font-medium text-accent uppercase tracking-widest mb-2">Tradução</span>
                                <h3 className="text-3xl font-bold mb-6 text-accent">{translation}</h3>

                                <div className="w-full h-px bg-border my-4" />

                                <div className="flex flex-col items-center">
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-2">Exemplo</span>
                                    <div className="flex items-center gap-2 mb-2">
                                        <p className="text-lg italic">&quot;{sentence}&quot;</p>
                                        <button
                                            onClick={(e) => speak(sentence, e)}
                                            className="p-1.5 hover:bg-white/5 text-muted-foreground hover:text-white rounded-lg transition-colors"
                                        >
                                            <Volume2 size={16} />
                                        </button>
                                    </div>
                                    <p className="text-sm text-muted-foreground">({sentenceTranslation})</p>
                                </div>
                            </>
                        )}
                    </div>
                </motion.div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 md:gap-3 w-full justify-center px-2">
                {onSrsUpdate ? (
                    <div className="grid grid-cols-2 sm:flex gap-2 md:gap-3 w-full">
                        <button
                            onClick={(e) => { e.stopPropagation(); onSrsUpdate('again'); setIsFlipped(false); }}
                            className="px-3 py-3 md:px-4 md:py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold rounded-2xl border border-red-500/20 transition-all active:scale-95 text-sm md:text-base flex flex-col items-center justify-center"
                        >
                            <span>Errei</span>
                            <span className="text-[10px] opacity-70 font-medium">1 dia</span>
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onSrsUpdate('good'); setIsFlipped(false); }}
                            className="px-3 py-3 md:px-4 md:py-3 bg-primary/10 hover:bg-primary/20 text-primary font-bold rounded-2xl border border-primary/20 transition-all active:scale-95 text-sm md:text-base flex flex-col items-center justify-center"
                        >
                            <span>Acertei</span>
                            <span className="text-[10px] opacity-70 font-medium">
                                {currentInterval === 0 ? '1 dia' : `${Math.floor(currentInterval * easeFactor)} dias`}
                            </span>
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onSrsUpdate('easy'); setIsFlipped(false); }}
                            className="col-span-2 sm:col-span-1 px-3 py-3 md:px-4 md:py-3 bg-green-500/10 hover:bg-green-500/20 text-green-500 font-bold rounded-2xl border border-green-500/20 transition-all active:scale-95 shadow-lg shadow-green-500/10 text-sm md:text-base flex flex-col items-center justify-center"
                        >
                            <span>Fácil</span>
                            <span className="text-[10px] opacity-70 font-medium">
                                {currentInterval === 0 ? '4 dias' : `${Math.floor(currentInterval * easeFactor * 1.3)} dias`}
                            </span>
                        </button>
                    </div>
                ) : (
                    <div className="flex gap-2 md:gap-3 w-full">
                        <button
                            onClick={(e) => { e.stopPropagation(); onUnknown(); setIsFlipped(false); }}
                            className="flex-1 flex items-center justify-center gap-2 py-3 md:py-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold rounded-2xl border border-red-500/20 transition-all active:scale-95 text-sm md:text-base"
                        >
                            <X size={18} className="md:w-5 md:h-5" />
                            Não sei
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onKnown(); setIsFlipped(false); }}
                            className="flex-1 flex items-center justify-center gap-2 py-3 md:py-4 bg-accent/10 hover:bg-accent/20 text-accent font-bold rounded-2xl border border-accent/20 transition-all active:scale-95 shadow-lg shadow-accent/10 text-sm md:text-base"
                        >
                            <Check size={18} className="md:w-5 md:h-5" />
                            Já sei!
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
