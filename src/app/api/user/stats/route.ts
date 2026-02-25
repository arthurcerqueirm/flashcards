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

        // Automated Streak Logic
        const now = new Date();
        const lastLogin = user.lastLogin ? new Date(user.lastLogin) : null;
        let currentStreak = user.streak || 0;

        if (lastLogin) {
            const diffInMs = now.getTime() - lastLogin.getTime();
            const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

            if (diffInDays === 1) {
                // Participou no dia anterior, incrementa streak
                currentStreak += 1;
            } else if (diffInDays > 1) {
                // Falhou por mais de um dia, reseta para 1
                currentStreak = 1;
            } else if (currentStreak === 0) {
                // Primeiro dia
                currentStreak = 1;
            }
            // Se diffInDays === 0 (mesmo dia), mantém a streak
        } else {
            currentStreak = 1;
        }

        // Always update lastLogin and potentially the streak in DB
        user.lastLogin = now;
        user.streak = currentStreak;
        await user.save();

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
