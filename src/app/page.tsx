'use client';

import { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import StatsHeader from '@/components/StatsHeader';
import Flashcard from '@/components/Flashcard';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [theme, setTheme] = useState('');
  const [loading, setLoading] = useState(false);
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [learnedWords, setLearnedWords] = useState<string[]>([]);

  // Stats state
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [level, setLevel] = useState(1);
  const [totalLearned, setTotalLearned] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const statsRes = await fetch('/api/user/stats');
        const statsData = await statsRes.json();
        if (!statsData.error) {
          setXp(statsData.xp);
          setStreak(statsData.streak);
          setLevel(statsData.level);
          setTotalLearned(statsData.totalLearned);
        }

        const learnedRes = await fetch('/api/flashcards/learned');
        const learnedData = await learnedRes.json();
        if (!learnedData.error) {
          setLearnedWords(learnedData.map((c: any) => c.word));
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    fetchStats();
  }, []);

  const updateStats = async (newXp: number, newLearned: number) => {
    const newLevel = Math.floor(newXp / 100) + 1;
    try {
      await fetch('/api/user/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ xp: newXp, streak, level: newLevel, totalLearned: newLearned }),
      });
      if (newLevel !== level) setLevel(newLevel);
    } catch (err) {
      console.error('Error updating stats:', err);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!theme) return;

    setLoading(true);
    setFlashcards([]);
    setCurrentIndex(0);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme, learnedWords }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setFlashcards(data);
    } catch (err) {
      alert('Erro ao gerar flashcards. Verifique sua chave da API Gemini.');
    } finally {
      setLoading(false);
    }
  };

  const handleKnown = async () => {
    const currentCard = flashcards[currentIndex];
    const newXp = xp + 10;
    const newLearnedCount = totalLearned + 1;

    setXp(newXp);
    setTotalLearned(newLearnedCount);
    setLearnedWords(prev => [...prev, currentCard.word]);

    updateStats(newXp, newLearnedCount);

    // Save learned card to DB
    try {
      await fetch('/api/flashcards/learned', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentCard),
      });
    } catch (err) {
      console.error('Error saving learned card:', err);
    }

    nextCard();
  };

  const nextCard = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setFlashcards([]);
      setTheme('');
    }
  };

  return (
    <main className="min-h-screen flex flex-col">
      <StatsHeader xp={xp} streak={streak} level={level} />

      <div className="flex-1 max-w-5xl mx-auto w-full px-6 py-12 flex flex-col items-center">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black mb-4 tracking-tight">
            O que vamos <span className="text-primary">aprender</span> hoje?
          </h1>
          <p className="text-muted-foreground text-lg">
            Digite um tema e o Gemini criará flashcards personalizados para você.
          </p>
        </div>

        <form onSubmit={handleSearch} className="w-full max-w-2xl relative mb-16">
          <input
            type="text"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder="Ex: Viagem, Restaurante, Negócios..."
            className="w-full bg-card border-2 border-white/5 focus:border-primary/50 rounded-2xl px-6 py-5 pl-14 text-xl outline-none transition-all shadow-xl"
          />
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground" size={24} />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-primary hover:bg-primary/80 disabled:bg-primary/50 text-white px-6 py-3 rounded-xl font-bold transition-all"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Gerar Cards'}
          </button>
        </form>

        <div className="w-full flex justify-center">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center"
              >
                <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-xl font-medium">Gemini está criando seus cards...</p>
              </motion.div>
            ) : flashcards.length > 0 ? (
              <motion.div
                key={`card-${flashcards[currentIndex].word}`}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="w-full max-w-md"
              >
                <div className="mb-4 flex justify-between items-end px-2">
                  <p className="text-sm font-bold text-muted-foreground uppercase">Card {currentIndex + 1} de {flashcards.length}</p>
                  <button
                    onClick={() => setFlashcards([])}
                    className="text-xs font-bold text-red-500 uppercase hover:underline"
                  >
                    Cancelar
                  </button>
                </div>
                <Flashcard
                  {...flashcards[currentIndex]}
                  onKnown={handleKnown}
                  onUnknown={nextCard}
                />
              </motion.div>
            ) : theme === '' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full"
              >
                {['Viagem', 'Trabalho', 'Hobbies'].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setTheme(suggestion)}
                    className="p-6 bg-card border border-white/5 rounded-2xl hover:border-primary/50 transition-all text-left group"
                  >
                    <p className="text-sm text-muted-foreground font-bold uppercase mb-1">Sugestão</p>
                    <p className="text-xl font-bold group-hover:text-primary">{suggestion}</p>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
