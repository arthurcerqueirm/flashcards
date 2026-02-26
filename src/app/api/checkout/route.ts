import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Stripe from 'stripe';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-02-24-preview' as any,
});

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

        const { priceId } = await req.json();

        await dbConnect();
        const user = await User.findOne({ email: session.user?.email });
        if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });

        // Check if user already has a Stripe customer ID, otherwise create one
        let stripeCustomerId = user.customerId;
        if (!stripeCustomerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                name: user.username,
            });
            stripeCustomerId = customer.id;
            user.customerId = stripeCustomerId;
            await user.save();
        }

        // Define the real price ID from Stripe dashboard here
        // For demonstration, map 'pro_monthly' to a placeholder if not provided in env
        const stripePriceId = priceId === 'pro_monthly'
            ? process.env.STRIPE_PRO_PRICE_ID
            : null;

        if (!stripePriceId) {
            return NextResponse.json({ error: 'ID do preço não configurado' }, { status: 400 });
        }

        const checkoutSession = await stripe.checkout.sessions.create({
            customer: stripeCustomerId,
            line_items: [
                {
                    price: stripePriceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${process.env.NEXTAUTH_URL}/dashboard?status=success`,
            cancel_url: `${process.env.NEXTAUTH_URL}/pricing?status=cancelled`,
            metadata: {
                userId: user._id.toString(),
            },
        });

        return NextResponse.json({ url: checkoutSession.url });
    } catch (error) {
        console.error('Stripe Checkout error:', error);
        return NextResponse.json({ error: 'Erro ao criar sessão de checkout' }, { status: 500 });
    }
}
