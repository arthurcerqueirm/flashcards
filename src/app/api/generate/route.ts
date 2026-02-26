import { NextResponse } from 'next/server';
import { model } from '@/lib/gemini';
import dbConnect from '@/lib/mongodb';
import Flashcard from '@/models/Flashcard';
import User from '@/models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    await dbConnect();
    const user = await User.findOne({ email: session.user?.email });
    if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });

    // Check usage limits for free users
    if (!user.isPremium) {
      const now = new Date();
      const lastUsage = user.lastGenerationDate ? new Date(user.lastGenerationDate) : null;

      const isNewDay = !lastUsage ||
        now.getDate() !== lastUsage.getDate() ||
        now.getMonth() !== lastUsage.getMonth() ||
        now.getFullYear() !== lastUsage.getFullYear();

      if (isNewDay) {
        user.dailyGenerationCount = 0;
        user.lastGenerationDate = now;
      }

      const FREE_LIMIT = 3;
      if (user.dailyGenerationCount >= FREE_LIMIT) {
        return NextResponse.json({
          error: 'Limite diário atingido',
          code: 'LIMIT_REACHED',
          message: 'Você atingiu o limite de 3 gerações por dia no plano grátis. Faça o upgrade para o Pro para gerações ilimitadas!'
        }, { status: 403 });
      }
    }

    const { theme, learnedWords = [], limit = 5 } = await req.json();

    if (!theme) {
      return NextResponse.json({ error: 'Tema é obrigatório' }, { status: 400 });
    }

    const exclusionList = learnedWords.length > 0
      ? `IMPORTANTE: Não gere nenhuma das seguintes palavras, pois o usuário já as aprendeu: ${learnedWords.join(', ')}.`
      : '';

    const prompt = `
      Você é um professor de inglês especializado para brasileiros.
      Gere ${limit} flashcards para o tema: "${theme}".
      
      ${exclusionList}
      
      Cada flashcard deve conter:
      1. "word": Uma palavra ou expressão comum em inglês sobre o tema.
      2. "translation": A tradução da palavra para o português.
      3. "sentence": Uma frase de exemplo curta e útil em inglês usando a palavra.
      4. "sentenceTranslation": A tradução da frase de exemplo para o português.
      5. "category": Uma categoria curta (ex: Viagem, Trabalho, Social, Saúde, Tecnologia, Geral) que melhor defina a palavra.

      Retorne APENAS um array JSON válido com EXATAMENTE ${limit} objetos, sem explicações ou Markdown formatado.
      Exemplo de formato:
      [
        {
          "word": "Airport",
          "translation": "Aeroporto",
          "sentence": "I am at the airport.",
          "sentenceTranslation": "Eu estou no aeroporto.",
          "category": "Viagem"
        }
      ]
    `;

    const result = await model().generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Clean up potential markdown formatting if Gemini includes it
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    const flashcardsData = JSON.parse(text);

    // Increment usage for free users
    if (!user.isPremium) {
      user.dailyGenerationCount += 1;
      await user.save();
    }

    return NextResponse.json(flashcardsData);
  } catch (error) {
    console.error('Error generating flashcards:', error);
    return NextResponse.json({ error: 'Erro ao gerar flashcards' }, { status: 500 });
  }
}
