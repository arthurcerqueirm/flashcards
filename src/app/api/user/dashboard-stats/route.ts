import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Flashcard from '@/models/Flashcard';
import User from '@/models/User';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

        await dbConnect();
        const userId = session.user?.id;

        // 1. Get weekly progress (last 7 days including today)
        const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        const weeklyData = [];
        const now = new Date();
        now.setHours(23, 59, 59, 999);

        for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(now.getDate() - i);

            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            const count = await Flashcard.countDocuments({
                userId,
                learned: true,
                createdAt: { $gte: startOfDay, $lte: endOfDay }
            });

            weeklyData.push({
                name: days[date.getDay()],
                words: count
            });
        }

        // 2. Get daily average
        const user = await User.findById(userId);
        if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });

        const totalLearned = await Flashcard.countDocuments({ userId, learned: true });

        // Calculate days since account creation
        const accountCreated = user.createdAt || new Date();
        const diffTime = Math.abs(now.getTime() - accountCreated.getTime());
        const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

        const dailyAverage = Math.round(totalLearned / diffDays);

        return NextResponse.json({
            weeklyProgress: weeklyData,
            dailyAverage,
            totalLearned
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        return NextResponse.json({ error: 'Erro ao buscar estatísticas do dashboard' }, { status: 500 });
    }
}
