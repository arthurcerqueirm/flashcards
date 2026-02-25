import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.warn('GEMINI_API_KEY is not defined in .env');
}

const genAI = new GoogleGenerativeAI(apiKey || '');

export const model = (name = 'gemini-2.0-flash') => genAI.getGenerativeModel({ model: name });
