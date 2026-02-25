import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Flashcard from '@/models/Flashcard';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const includeUpcoming = searchParams.get('includeUpcoming') === 'true';

        await dbConnect();
        const today = new Date();

        const query: any = {
            userId: session.user?.id,
            learned: true
        };

        if (!includeUpcoming) {
            query.nextReviewDate = { $lte: today };
        }

        const reviewCards = await Flashcard.find(query).sort({ nextReviewDate: 1 });

        return NextResponse.json(reviewCards);
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao buscar revisões' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

        const { cardId, rating } = await req.json(); // rating: 'again', 'hard', 'good', 'easy'
        await dbConnect();

        const card = await Flashcard.findById(cardId);
        if (!card) return NextResponse.json({ error: 'Card não encontrado' }, { status: 404 });

        let { interval, easeFactor } = card;
        const today = new Date();

        if (rating === 'again') {
            interval = 0;
            easeFactor = Math.max(1.3, easeFactor - 0.2);
        } else if (rating === 'hard') {
            interval = Math.max(1, Math.floor(interval * 1.2));
            easeFactor = Math.max(1.3, easeFactor - 0.15);
        } else if (rating === 'good') {
            interval = interval === 0 ? 1 : Math.floor(interval * easeFactor);
        } else if (rating === 'easy') {
            interval = interval === 0 ? 4 : Math.floor(interval * easeFactor * 1.3);
            easeFactor += 0.15;
        }

        const nextReviewDate = new Date();
        nextReviewDate.setDate(today.getDate() + (interval || 1));

        card.interval = interval;
        card.easeFactor = easeFactor;
        card.nextReviewDate = nextReviewDate;
        await card.save();

        return NextResponse.json({ success: true, nextReviewDate });
    } catch (error) {
        console.error('SRS Update error:', error);
        return NextResponse.json({ error: 'Erro ao atualizar SRS' }, { status: 500 });
    }
}
