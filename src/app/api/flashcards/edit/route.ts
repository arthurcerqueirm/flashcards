import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Flashcard from '@/models/Flashcard';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const { cardId, word, translation, sentence, sentenceTranslation } = await req.json();

        if (!cardId) {
            return NextResponse.json({ error: 'ID do card é obrigatório' }, { status: 400 });
        }

        await dbConnect();

        const card = await Flashcard.findOneAndUpdate(
            { _id: cardId, userId: session.user?.id },
            { word, translation, sentence, sentenceTranslation },
            { new: true }
        );

        if (!card) {
            return NextResponse.json({ error: 'Card não encontrado ou não pertence ao usuário' }, { status: 404 });
        }

        return NextResponse.json({ success: true, card });
    } catch (error) {
        console.error('Edit flashcard error:', error);
        return NextResponse.json({ error: 'Erro ao editar flashcard' }, { status: 500 });
    }
}
