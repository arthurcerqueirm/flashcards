'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, RotateCcw } from 'lucide-react';

interface FlashcardProps {
    word: string;
    translation: string;
    sentence: string;
    sentenceTranslation: string;
    onKnown: () => void;
    onUnknown: () => void;
    onSrsUpdate?: (rating: 'again' | 'hard' | 'good' | 'easy') => void;
}

export default function Flashcard({
    word,
    translation,
    sentence,
    sentenceTranslation,
    onKnown,
    onUnknown,
    onSrsUpdate,
}: FlashcardProps) {
    const [isFlipped, setIsFlipped] = useState(false);

    const handleFlip = () => setIsFlipped(!isFlipped);

    return (
        <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto">
            <div
                className="relative w-full aspect-[3/4] cursor-pointer perspective-1000"
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
                        <span className="text-sm font-medium text-primary uppercase tracking-widest mb-4">Palavra</span>
                        <h2 className="text-4xl font-bold mb-2">{word}</h2>
                        <p className="text-muted-foreground text-sm mt-4 animate-pulse">Clique para ver a tradução</p>
                    </div>

                    {/* Back */}
                    <div className="absolute inset-0 w-full h-full backface-hidden bg-card border-2 border-accent/20 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-2xl rotate-y-180 overflow-hidden"
                        style={{ transform: 'rotateY(180deg)' }}>
                        <div className="absolute top-0 left-0 w-full h-1 bg-accent/20" />
                        <span className="text-sm font-medium text-accent uppercase tracking-widest mb-2">Tradução</span>
                        <h3 className="text-3xl font-bold mb-6 text-accent">{translation}</h3>

                        <div className="w-full h-px bg-border my-4" />

                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-2">Exemplo</span>
                        <p className="text-lg italic mb-2">"{sentence}"</p>
                        <p className="text-sm text-muted-foreground">({sentenceTranslation})</p>
                    </div>
                </motion.div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 md:gap-3 w-full justify-center px-2">
                {onSrsUpdate ? (
                    <div className="grid grid-cols-2 sm:flex gap-2 md:gap-3 w-full">
                        <button
                            onClick={(e) => { e.stopPropagation(); onSrsUpdate('again'); setIsFlipped(false); }}
                            className="px-3 py-3 md:px-4 md:py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold rounded-2xl border border-red-500/20 transition-all active:scale-95 text-sm md:text-base"
                        >
                            Errei
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onSrsUpdate('good'); setIsFlipped(false); }}
                            className="px-3 py-3 md:px-4 md:py-3 bg-primary/10 hover:bg-primary/20 text-primary font-bold rounded-2xl border border-primary/20 transition-all active:scale-95 text-sm md:text-base"
                        >
                            Acertei
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onSrsUpdate('easy'); setIsFlipped(false); }}
                            className="col-span-2 sm:col-span-1 px-3 py-3 md:px-4 md:py-3 bg-green-500/10 hover:bg-green-500/20 text-green-500 font-bold rounded-2xl border border-green-500/20 transition-all active:scale-95 shadow-lg shadow-green-500/10 text-sm md:text-base"
                        >
                            Fácil
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
