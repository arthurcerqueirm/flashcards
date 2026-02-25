import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        await dbConnect();
        const user = await User.findOne({ email: session.user?.email });

        if (!user) {
            return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
        }

        return NextResponse.json({
            xp: user.xp,
            streak: user.streak,
            level: user.level,
            totalLearned: user.totalWordsLearned,
        });
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao buscar estatísticas' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const { xp, streak, level, totalLearned } = await req.json();

        await dbConnect();
        const user = await User.findOneAndUpdate(
            { email: session.user?.email },
            { xp, streak, level, totalWordsLearned: totalLearned },
            { new: true }
        );

        return NextResponse.json({ success: true, user });
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao atualizar estatísticas' }, { status: 500 });
    }
}
