require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();

app.use(cors());
app.use(express.json());


const MONGO_URI = "mongodb://127.0.0.1:27017/aura_db";

mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log("🌐 MongoDB Status: Connected Successfully");
})
.catch((err) => {
    console.error("⚠️ MongoDB Connection Error:", err);
});


const questionSchema = new mongoose.Schema({
    domain: String,
    q: String,
    o: Array,
    a: Number
}, { collection: 'questions' });

const Question = mongoose.model('Question', questionSchema);


const users = [
    { email: "aayushimathur5071@gmail.com", password: "12345678", name: "AURA Admin" }
];

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        return res.status(200).json({ 
            success: true, 
            message: "Login Successful!",
            token: "MOCK_JWT_TOKEN_AURA_ELITE_XT20" 
        });
    } else {
        return res.status(400).json({ success: false, message: "Invalid Email or Password" });
    }
});

app.post('/api/signup', (req, res) => {
    const { name, email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email and Password required!" });
    }
    const userExists = users.find(u => u.email === email);
    if (userExists) {
        return res.status(400).json({ success: false, message: "Node already exists with this email!" });
    }
    users.push({ name, email, password });
    return res.status(201).json({ 
        success: true, 
        message: "Account created successfully!",
        token: "MOCK_JWT_TOKEN_AURA_ELITE_XT20" 
    });
});


app.post('/api/generate', async (req, res) => {
    try {
        console.log("Incoming Request from Frontend:", req.body);
        const { domain, totalQuestions, topic } = req.body;
        
        if (!domain) {
            return res.status(400).json({ success: false, message: "Domain is required" });
        }

        const limit = parseInt(totalQuestions, 10) || 20;
        let matchQuery = { domain: domain.trim().toLowerCase() };

        console.log(" Running Direct DB Query with:", matchQuery);

        let questions = await Question.find(matchQuery).limit(limit);

        console.log(` Database found exactly ${questions.length} questions.`);

        if (!questions || questions.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: `No questions found for domain: ${domain}` 
            });
        }

        return res.status(200).json({
            success: true,
            sessionId: "MOCK_SESS_" + Date.now(),
            quizDeck: questions
        });

    } catch (error) {
        console.error(" CRITICAL UNCAUGHT ROUTE ERROR:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Internal Server Error in mainframe script." 
        });
    }
});


app.post('/api/submit', async (req, res) => {
    try {
        const { sessionId, answers } = req.body;
        if (String(sessionId).startsWith("MOCK_SESS_")) {
            return res.status(200).json({ 
                success: true, 
                score: 5, 
                total: 10, 
                percentage: 50.00, 
                message: "Mock Processing Active" 
            });
        }
        return res.status(200).json({ success: true, score: 0, total: 0, percentage: 0 });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Submission error" });
    }
});
app.get('/api/test', async (req, res) => {
  try {
    const count = await Question.countDocuments();
    res.json({
      success: true,
      count
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
