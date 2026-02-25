import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Flashcard from '@/models/Flashcard';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

        const { cardIds, deckName } = await req.json();

        if (!cardIds || !Array.isArray(cardIds) || !deckName) {
            return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
        }

        await dbConnect();

        // Update all selected cards for this user
        await Flashcard.updateMany(
            {
                _id: { $in: cardIds },
                userId: session.user?.id
            },
            { $set: { deckName, isCustomDeck: true } }
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Bulk deck update error:', error);
        return NextResponse.json({ error: 'Erro ao atualizar decks' }, { status: 500 });
    }
}
