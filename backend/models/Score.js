const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    domain: { type: String, required: true },
    totalQuestions: { type: Number, required: true },
    correctAnswers: { type: Number, required: true },
    scorePercentage: { type: Number, required: true },
    dateTaken: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Score', scoreSchema);