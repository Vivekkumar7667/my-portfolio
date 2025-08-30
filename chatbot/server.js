// server.js (Express-based backend)
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fetch from 'node-fetch'; // or global fetch if Node 18+

const app = express();
const PORT = 3000;
const API_KEY = "YOUR_GEMINI_API_KEY";

app.use(cors());
app.use(bodyParser.json());

app.post('/chat', async (req, res) => {
    try {
        const payload = req.body;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        const data = await response.json();
        res.json(data);
    } catch (err) {
        console.error("Backend error:", err);
        res.status(500).json({ error: "Server Error" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
