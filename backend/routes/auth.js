const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = "AURA_SUPER_SECRET_TOKEN_KEY_2026"; 


router.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;

       
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ success: false, message: "Email already registered!" });

        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({ name, email, password: hashedPassword });
        await user.save();

        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '24h' });
        res.status(201).json({ success: true, token, user: { name: user.name, email: user.email, id: user._id } });

    } catch (err) {
        res.status(500).json({ success: false, message: "Signup Server Error" });
    }
});


router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ success: false, message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ success: false, message: "Invalid credentials" });

        
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '24h' });
        res.status(200).json({ success: true, token, user: { name: user.name, email: user.email, id: user._id } });

    } catch (err) {
        res.status(500).json({ success: false, message: "Login Server Error" });
    }
});

module.exports = router;