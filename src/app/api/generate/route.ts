import { NextResponse } from 'next/server';
import { model } from '@/lib/gemini';
import dbConnect from '@/lib/mongodb';
import Flashcard from '@/models/Flashcard';

export async function POST(req: Request) {
  try {
    const { theme, learnedWords = [] } = await req.json();

    if (!theme) {
      return NextResponse.json({ error: 'Tema é obrigatório' }, { status: 400 });
    }

    const exclusionList = learnedWords.length > 0
      ? `IMPORTANTE: Não gere nenhuma das seguintes palavras, pois o usuário já as aprendeu: ${learnedWords.join(', ')}.`
      : '';

    const prompt = `
      Você é um professor de inglês especializado para brasileiros.
      Gere 5 flashcards para o tema: "${theme}".
      
      ${exclusionList}
      
      Cada flashcard deve conter:
      1. "word": Uma palavra ou expressão comum em inglês sobre o tema.
      2. "translation": A tradução da palavra para o português.
      3. "sentence": Uma frase de exemplo curta e útil em inglês usando a palavra.
      4. "sentenceTranslation": A tradução da frase de exemplo para o português.

      Retorne APENAS um array JSON válido com os 5 objetos, sem explicações ou Markdown formatado (apenas o texto JSON puro).
      Exemplo de formato:
      [
        {
          "word": "Airport",
          "translation": "Aeroporto",
          "sentence": "I am at the airport.",
          "sentenceTranslation": "Eu estou no aeroporto."
        }
      ]
    `;

    const result = await model().generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Clean up potential markdown formatting if Gemini includes it
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    const flashcardsData = JSON.parse(text);

    await dbConnect();

    // We can optionally save them as "pending" or just return them
    // For now, let's just return them to the frontend

    return NextResponse.json(flashcardsData);
  } catch (error) {
    console.error('Error generating flashcards:', error);
    return NextResponse.json({ error: 'Erro ao gerar flashcards' }, { status: 500 });
  }
}
