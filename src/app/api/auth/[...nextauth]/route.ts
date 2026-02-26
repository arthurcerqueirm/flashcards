import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Senha", type: "password" }
            },
            async authorize(credentials) {
                await dbConnect();

                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Email e senha são obrigatórios');
                }

                const user = await User.findOne({ email: credentials.email });

                if (!user) {
                    throw new Error('Usuário não encontrado');
                }

                const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);

                if (!isPasswordCorrect) {
                    throw new Error('Senha incorreta');
                }

                return {
                    id: user._id.toString(),
                    email: user.email,
                    name: user.username,
                    isPremium: user.isPremium || false,
                };
            }
        })
    ],
    callbacks: {
        async session({ session, token }: any) {
            if (token) {
                session.user.id = token.id;
                session.user.name = token.name;

                // Fetch fresh premium status from database
                await dbConnect();
                const user = await User.findById(token.id);
                session.user.isPremium = user?.isPremium || false;
            }
            return session;
        },
        async jwt({ token, user }: any) {
            if (user) {
                token.id = user.id;
                token.name = user.name;
                token.isPremium = user.isPremium;
            }
            return token;
        }
    },
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: 'jwt' as const,
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
