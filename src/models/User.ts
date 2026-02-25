import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    xp: {
        type: Number,
        default: 0,
    },
    streak: {
        type: Number,
        default: 0,
    },
    lastLogin: {
        type: Date,
        default: Date.now,
    },
    totalWordsLearned: {
        type: Number,
        default: 0,
    },
    level: {
        type: Number,
        default: 1,
    },
    achievements: {
        type: [String],
        default: [],
    },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
