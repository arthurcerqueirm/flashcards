import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Flashcard from '@/models/Flashcard';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

        await dbConnect();
        const learnedCards = await Flashcard.find({
            userId: session.user?.id,
            learned: true
        }).sort({ createdAt: -1 });

        return NextResponse.json(learnedCards);
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao buscar palavras' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

        const cardData = await req.json();
        await dbConnect();

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        const newCard = await Flashcard.create({
            ...cardData,
            userId: session.user?.id,
            learned: true,
            nextReviewDate: tomorrow,
            interval: 1,
        });

        return NextResponse.json(newCard);
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao salvar palavra' }, { status: 500 });
    }
}
