import mongoose from 'mongoose';

const FlashcardSchema = new mongoose.Schema({
    word: {
        type: String,
        required: true,
    },
    translation: {
        type: String,
        required: true,
    },
    sentence: {
        type: String,
        required: true,
    },
    sentenceTranslation: {
        type: String,
        required: true,
    },
    learned: {
        type: Boolean,
        default: false,
    },
    nextReviewDate: {
        type: Date,
        default: Date.now,
    },
    interval: {
        type: Number,
        default: 0, // Days
    },
    easeFactor: {
        type: Number,
        default: 2.5,
    },
    category: {
        type: String,
        default: 'Geral',
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.Flashcard || mongoose.model('Flashcard', FlashcardSchema);
