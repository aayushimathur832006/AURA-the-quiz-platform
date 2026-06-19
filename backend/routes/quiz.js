const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const QuizSession = require('../models/QuizSession');
const Score = require('../models/Score');


router.post('/generate', async (req, res) => {
    try {
        console.log("Incoming Request from Frontend:", req.body);
        const { domain, totalQuestions, topic } = req.body;
        
        if (!domain) {
            return res.status(400).json({ success: false, message: "Domain is required" });
        }

        const limit = parseInt(totalQuestions, 10) || 20;
        
       
        let matchQuery = { domain: domain.trim().toLowerCase() };
        if (topic && topic !== "null" && topic !== "undefined" && topic !== "") {
            matchQuery.topic = topic.trim();
        }

        console.log("🔍 Running DB Query with constraints:", matchQuery);

        let questions = await Question.find(matchQuery).limit(limit);

        console.log(` Database found exactly ${questions.length} questions.`);

       
        if (!questions || questions.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: `No questions found for domain: ${domain} and topic: ${topic}` 
            });
        }

        let sessionId = "MOCK_SESS_" + Date.now();
        try {
            const newSession = new QuizSession({
                userId: req.body.userId || "665719a9f140a324b89dc123",
                domain: domain,
                questions: questions.map(q => q._id),
                durationMinutes: 10
            });
            const savedSession = await newSession.save();
            sessionId = savedSession._id;
            console.log("Session saved successfully in DB!");
        } catch (sessionError) {
            console.log("Session Schema validation bypassed:", sessionError.message);
        }

       
        return res.status(200).json({
            success: true,
            sessionId: sessionId,
            quizDeck: questions
        });

    } catch (error) {
        console.error("CRITICAL UNCAUGHT ROUTE ERROR:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Internal Server Error in core compiler script.", 
            error: error.message 
        });
    }
});


router.post('/submit', async (req, res) => {
    try {
        const { sessionId, answers, userId } = req.body;
        
        if (String(sessionId).startsWith("MOCK_SESS_")) {
            return res.status(200).json({ 
                success: true, 
                score: 0, 
                total: 20, 
                percentage: 0, 
                message: "Mock Session bypass active" 
            });
        }

        const session = await QuizSession.findById(sessionId).populate('questions');
        if (!session) return res.status(404).json({ success: false, message: "Session not found" });

        let correctCount = 0;
        session.questions.forEach(q => {
            const correctAns = q.correctOptionIndex !== undefined ? q.correctOptionIndex : q.a;
            if (answers[q._id] !== undefined && parseInt(answers[q._id]) === correctAns) {
                correctCount++;
            }
        });

        const finalPercentage = parseFloat(((correctCount / session.questions.length) * 100).toFixed(2));

        try {
            await new Score({
                userId: userId || session.userId,
                domain: session.domain,
                totalQuestions: session.questions.length,
                correctAnswers: correctCount,
                scorePercentage: finalPercentage
            }).save();

            session.isCompleted = true;
            await session.save();
        } catch (e) {
            console.log("⚠️ Score logging skipped:", e.message);
        }

        res.status(200).json({ success: true, score: correctCount, total: session.questions.length, percentage: finalPercentage });
    } catch (error) {
        res.status(500).json({ success: false, message: "Submission error" });
    }
});

module.exports = router;