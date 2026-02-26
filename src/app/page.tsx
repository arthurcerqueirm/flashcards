'use client';

import { useState, useEffect } from 'react';
import { Search, Loader2, Brain, Trophy, TrendingUp } from 'lucide-react';
import StatsHeader from '@/components/StatsHeader';
import Flashcard from '@/components/Flashcard';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [theme, setTheme] = useState('');
  const [loading, setLoading] = useState(false);
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [learnedWords, setLearnedWords] = useState<string[]>([]);
  const [reviewCards, setReviewCards] = useState<any[]>([]);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [showFinished, setShowFinished] = useState(false);
  const [reviewStats, setReviewStats] = useState({ count: 0, xpGained: 0 });
  const [cardCount, setCardCount] = useState(10);
  const [upcomingSchedule, setUpcomingSchedule] = useState<any[]>([]);
  const [deckName, setDeckName] = useState('Padrão');

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

        const reviewRes = await fetch('/api/flashcards/review');
        const reviewData = await reviewRes.json();
        if (!reviewData.error) {
          setReviewCards(reviewData);
        }

        // Fetch all learned cards to calculate schedule
        const allLearnedRes = await fetch('/api/flashcards/learned');
        const allLearnedData = await allLearnedRes.json();
        if (!allLearnedData.error) {
          calculateSchedule(allLearnedData);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    fetchStats();
  }, []);

  const calculateSchedule = (cards: any[]) => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const schedule = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now);
      date.setDate(now.getDate() + i);
      const dayName = days[date.getDay()];
      const count = cards.filter(c => {
        if (!c.nextReviewDate) return false;
        const reviewDate = new Date(c.nextReviewDate);
        reviewDate.setHours(0, 0, 0, 0);
        return reviewDate.getTime() === date.getTime();
      }).length;
      return { day: i === 0 ? 'Hoje' : dayName, count };
    });
    setUpcomingSchedule(schedule);
  };

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
        body: JSON.stringify({ theme, learnedWords, limit: cardCount }),
      });
      const data = await res.json();
      if (data.error) {
        if (data.code === 'LIMIT_REACHED') {
          alert(data.message);
          window.location.href = '/pricing';
          return;
        }
        throw new Error(data.error);
      }
      setFlashcards(data);
    } catch (err) {
      console.error('Generation error:', err);
      alert('Erro ao gerar flashcards. Se você estiver no plano grátis, pode ter atingido o limite diário.');
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

    // Save learned card to DB with category
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

  const handleSrsUpdate = async (rating: 'again' | 'hard' | 'good' | 'easy') => {
    const currentCard = isReviewMode ? reviewCards[currentIndex] : flashcards[currentIndex];

    // Se não tiver _id, é um card novo que ainda não está no banco
    if (!currentCard._id) {
      try {
        const res = await fetch('/api/flashcards/learned', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(currentCard),
        });
        const savedCard = await res.json();

        // Se o usuário já deu um rating (good/easy), vamos atualizar o SRS desse novo card
        if (rating !== 'good' && savedCard._id) {
          await fetch('/api/flashcards/review', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cardId: savedCard._id, rating }),
          });
        }

        const newLearnedCount = totalLearned + 1;
        setTotalLearned(newLearnedCount);
        setLearnedWords(prev => [...prev, currentCard.word]);

        const ratingXp = rating === 'again' ? 0 : 10; // New card learning gives more XP
        const newXp = xp + ratingXp;
        setXp(newXp);
        updateStats(newXp, newLearnedCount);
      } catch (err) {
        console.error('Error saving new card:', err);
      }
    } else {
      // É uma revisão de um card já existente
      try {
        await fetch('/api/flashcards/review', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cardId: currentCard._id, rating }),
        });

        const ratingXp = rating === 'again' ? 0 : 5;
        const newXp = xp + ratingXp;
        setXp(newXp);
        setReviewStats(prev => ({ ...prev, xpGained: prev.xpGained + ratingXp }));
        updateStats(newXp, totalLearned);
      } catch (err) {
        console.error('Error updating SRS:', err);
      }
    }

    nextCard();
  };

  const nextCard = () => {
    const currentList = isReviewMode ? reviewCards : flashcards;
    if (currentIndex < currentList.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      if (isReviewMode) {
        setReviewStats(prev => ({ ...prev, count: reviewCards.length }));
        setReviewCards([]);
        setIsReviewMode(false);
        setShowFinished(true);
      } else {
        setFlashcards([]);
      }
      setCurrentIndex(0);
      setTheme('');
    }
  };

  const startReview = () => {
    if (reviewCards.length > 0) {
      setIsReviewMode(true);
      setCurrentIndex(0);
      setFlashcards([]); // Clear search results if any
    }
  };

  const startAdvanceReview = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/flashcards/review?includeUpcoming=true');
      const data = await res.json();
      if (Array.isArray(data)) {
        if (data.length > 0) {
          setReviewCards(data);
          setIsReviewMode(true);
          setCurrentIndex(0);
          setShowFinished(false);
          setFlashcards([]);
        } else {
          alert('Você não tem palavras aprendidas para antecipar!');
        }
      }
    } catch (err) {
      console.error('Error fetching upcoming reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={`min-h-screen flex flex-col transition-colors duration-1000 ${isReviewMode ? 'bg-[#120b2e]' : 'bg-background'} relative overflow-hidden`}>
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />

      <StatsHeader xp={xp} streak={streak} level={level} />

      <div className="flex-1 max-w-7xl mx-auto w-full px-6 pt-8 md:pt-12 pb-24 md:pb-12 h-full flex flex-col">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="flex-1 flex flex-col items-center justify-center py-20"
            >
              <div className="relative w-24 h-24 mb-6">
                <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
                <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <Brain className="absolute inset-0 m-auto text-primary animate-pulse" size={32} />
              </div>
              <p className="text-2xl font-black tracking-tight text-white/80">O Gemini está gerando sua jornada...</p>
              <p className="text-muted-foreground mt-2">Personalizando flashcards para você</p>
            </motion.div>
          ) : (isReviewMode ? reviewCards : flashcards).length > 0 ? (
            <motion.div
              key="flashcards-active"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="flex-1 flex flex-col items-center justify-center"
            >
              <div className="w-full max-w-md">
                <div className="mb-6 flex justify-between items-end px-2">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-2 h-2 rounded-full ${isReviewMode ? 'bg-accent animate-pulse' : 'bg-primary'}`} />
                      <span className={`text-xs font-black uppercase tracking-widest ${isReviewMode ? 'text-accent' : 'text-primary'}`}>
                        {isReviewMode ? 'Modo Foco' : 'Novos Cards'}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-muted-foreground uppercase opacity-60 tracking-wider">
                      Card {currentIndex + 1} de {(isReviewMode ? reviewCards : flashcards).length}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (isReviewMode) setIsReviewMode(false);
                      else setFlashcards([]);
                      setCurrentIndex(0);
                    }}
                    className="p-2 hover:bg-red-500/10 rounded-xl transition-colors group"
                  >
                    <span className="text-xs font-black text-red-500 uppercase tracking-widest group-hover:underline">Encerrar</span>
                  </button>
                </div>
                <Flashcard
                  key={(isReviewMode ? reviewCards : flashcards)[currentIndex]?._id || (isReviewMode ? reviewCards : flashcards)[currentIndex]?.word}
                  id={(isReviewMode ? reviewCards : flashcards)[currentIndex]?._id}
                  {...(isReviewMode ? reviewCards : flashcards)[currentIndex]}
                  onKnown={handleKnown}
                  onUnknown={nextCard}
                  onSrsUpdate={handleSrsUpdate}
                  interval={(isReviewMode ? reviewCards : flashcards)[currentIndex]?.interval}
                  easeFactor={(isReviewMode ? reviewCards : flashcards)[currentIndex]?.easeFactor}
                />
              </div>
            </motion.div>
          ) : showFinished ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col items-center justify-center py-10"
            >
              <div className="w-full max-w-xl bg-card/60 backdrop-blur-2xl border-2 border-primary/20 rounded-[56px] p-10 md:p-14 text-center shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 opacity-50" />
                <div className="relative z-10">
                  <div className="w-28 h-28 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white mx-auto mb-8 shadow-xl shadow-primary/40 rotate-12">
                    <Trophy size={56} />
                  </div>
                  <h2 className="text-5xl font-black mb-3 tracking-tight text-white">Excelente!</h2>
                  <p className="text-xl text-muted-foreground mb-10 font-medium">Você concluiu sua sessão de hoje.</p>

                  <div className="grid grid-cols-2 gap-4 md:gap-6 mb-12">
                    <div className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-[32px] hover:bg-white/10 transition-colors">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">Palavras</p>
                      <p className="text-4xl md:text-5xl font-black text-primary leading-none">{reviewStats.count}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-[32px] hover:bg-white/10 transition-colors">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">XP Ganho</p>
                      <p className="text-4xl md:text-5xl font-black text-accent leading-none">+{reviewStats.xpGained}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setShowFinished(false);
                      setReviewStats({ count: 0, xpGained: 0 });
                    }}
                    className="w-full bg-primary hover:bg-primary/80 text-white py-6 rounded-[28px] font-black text-xl transition-all shadow-2xl shadow-primary/40 active:scale-[0.98]"
                  >
                    Continuar Jornada
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16 items-start">
              {/* Left Column: Action Hero */}
              <div className="lg:col-span-12 xl:col-span-8 flex flex-col pt-10 md:pt-20">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="mb-12"
                >
                  <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter leading-[0.9]">
                    Domine o Inglês <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary animate-gradient-x">do Seu Jeito.</span>
                  </h1>
                  <p className="text-xl md:text-2xl text-muted-foreground font-medium max-w-xl leading-relaxed">
                    Sua jornada personalizada. Digite qualquer tema e o Gemini cria seus estudos.
                  </p>
                </motion.div>

                <motion.form
                  onSubmit={handleSearch}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="w-full max-w-3xl relative p-2 bg-card/40 backdrop-blur-xl border border-white/10 rounded-[40px] shadow-2xl"
                >
                  <div className="relative flex items-center">
                    <Search className="absolute left-6 text-muted-foreground w-6 h-6 md:w-8 md:h-8" />
                    <input
                      type="text"
                      value={theme}
                      onChange={(e) => setTheme(e.target.value)}
                      placeholder="Ex: Futurismo, Culinária, Business..."
                      className="w-full bg-transparent border-none rounded-[32px] pl-16 md:pl-20 pr-32 md:pr-40 py-6 md:py-8 text-xl md:text-2xl font-black outline-none placeholder:text-muted-foreground/30 text-white"
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="absolute right-3 bg-gradient-to-r from-primary to-accent hover:opacity-90 disabled:opacity-50 text-white px-6 md:px-10 py-4 md:py-5 rounded-[24px] font-black text-lg transition-all shadow-lg active:scale-95 flex items-center gap-2"
                    >
                      {loading ? <Loader2 className="animate-spin" size={24} /> : 'Começar'}
                    </button>
                  </div>

                  {/* Quantity Control Inside Search */}
                  <div className="px-10 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-t border-white/5 mt-2">
                    <div className="flex items-center gap-4 flex-1">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] whitespace-nowrap">Cards: {cardCount}</span>
                      <input
                        type="range"
                        min="5"
                        max="30"
                        step="5"
                        value={cardCount}
                        onChange={(e) => setCardCount(parseInt(e.target.value))}
                        className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-primary"
                      />
                    </div>

                    <div className="flex items-center gap-2 flex-1 md:max-w-[200px]">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] whitespace-nowrap">Deck:</span>
                      <input
                        type="text"
                        value={deckName}
                        onChange={(e) => setDeckName(e.target.value)}
                        placeholder="Nome do Deck"
                        className="w-full bg-white/5 border border-white/5 rounded-xl px-3 py-2 text-xs font-bold focus:border-primary/50 outline-none text-white placeholder:text-muted-foreground/30"
                      />
                    </div>
                    <div className="flex gap-2">
                      {['Travel', 'Food', 'Work'].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setTheme(t)}
                          className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-muted-foreground hover:text-white"
                        >
                          #{t}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.form>
              </div>

              {/* Right/Bottom Section: Dash Widgets */}
              <div className="lg:col-span-12 xl:col-span-4 flex flex-col gap-6 h-full">
                {/* HUD Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-6">
                  {/* Status Card 1 */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="p-8 bg-card/40 backdrop-blur-xl border border-white/10 rounded-[40px] flex flex-col justify-between group overflow-hidden relative"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-primary/20 transition-colors" />
                    <div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">Mente Expandida</p>
                      <h3 className="text-6xl font-black text-white leading-none tracking-tighter">{totalLearned}</h3>
                    </div>
                    <p className="text-sm font-medium text-muted-foreground mt-4 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      Palavras masterizadas
                    </p>
                  </motion.div>

                  {/* Status Card 2 (Reviews) */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className={`p-8 rounded-[40px] flex flex-col justify-between group transition-all border ${reviewCards.length > 0
                      ? 'bg-primary/10 border-primary/20 cursor-pointer shadow-2xl shadow-primary/5 hover:bg-primary/20'
                      : 'bg-card/40 border-white/10 opacity-60'
                      }`}
                  >
                    <div onClick={reviewCards.length > 0 ? startReview : undefined} className="flex-1">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">Revisão Pendente</p>
                      <h3 className="text-6xl font-black text-white leading-none tracking-tighter">{reviewCards.length}</h3>
                    </div>
                    {reviewCards.length > 0 ? (
                      <div className="mt-4 flex flex-col gap-3">
                        <div onClick={startReview} className="flex items-center justify-between group/btn cursor-pointer">
                          <span className="text-xs font-black uppercase text-primary tracking-widest group-hover/btn:underline">Revisar Agora</span>
                          <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                            <Brain size={20} />
                          </div>
                        </div>
                        <button
                          onClick={startAdvanceReview}
                          className="text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest hover:text-white transition-colors"
                        >
                          + Antecipar Próximas
                        </button>
                      </div>
                    ) : (
                      <div className="mt-4 flex flex-col gap-3">
                        <p className="text-xs font-black text-green-500 uppercase tracking-widest">Tudo em dia!</p>
                        <button
                          onClick={startAdvanceReview}
                          className="flex items-center gap-2 text-[10px] font-black uppercase text-primary tracking-widest hover:scale-105 transition-transform w-fit"
                        >
                          <TrendingUp size={14} />
                          Antecipar Ciclo
                        </button>
                      </div>
                    )}
                  </motion.div>
                </div>

                {/* Schedule Widget */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="p-8 bg-card/40 backdrop-blur-xl border border-white/10 rounded-[40px]"
                >
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-6">Próximos 7 Dias</p>
                  <div className="grid grid-cols-7 gap-3">
                    {upcomingSchedule.map((item, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-2">
                        <div className={`w-full aspect-square rounded-2xl flex items-center justify-center border transition-all ${item.count > 0 ? 'bg-primary/20 border-primary/30' : 'bg-white/5 border-white/5 opacity-30 shadow-inner'
                          }`}>
                          <span className={`text-lg font-black ${item.count > 0 ? 'text-white' : 'text-white/20'}`}>{item.count}</span>
                        </div>
                        <span className="text-[8px] font-black uppercase text-muted-foreground/60 tracking-tighter">{item.day}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
