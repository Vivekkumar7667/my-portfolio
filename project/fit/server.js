
const express = require('express');
const fs = require('fs'); // Only for static files if needed
const jwt = require('jsonwebtoken');
const SECRET_KEY = 'your_secret_key'; // Change this in production
const cors = require('cors');
const path = require('path');
const { MongoClient } = require('mongodb');
const app = express();
// MongoDB setup
const MONGO_URL = 'mongodb://localhost:27017'; // Update if needed
const DB_NAME = 'fitapp';
let db;
MongoClient.connect(MONGO_URL, { useUnifiedTopology: true })
    .then(client => {
        db = client.db(DB_NAME);
        console.log('Connected to MongoDB');
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });


// User registration (MongoDB, with JWT)
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password required' });
    }
    try {
        const user = await db.collection('users').findOne({ username });
        if (user) {
            return res.status(409).json({ message: 'User already exists' });
        }
        await db.collection('users').insertOne({ username, password });
        const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
        res.status(201).json({ message: 'User registered successfully', token });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// User login (MongoDB, with JWT)
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password required' });
    }
    try {
        const user = await db.collection('users').findOne({ username, password });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ message: 'Login successful', token });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Middleware to verify JWT
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname))); // Static files (HTML, CSS, JS)


// Products API (MongoDB)
app.get('/api/products', async (req, res) => {
    try {
        const products = await db.collection('products').find().toArray();
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: 'Cannot fetch products' });
    }
});

// Users API (MongoDB, protected)
app.get('/api/users', authenticateToken, async (req, res) => {
    try {
        const users = await db.collection('users').find({}, { projection: { password: 0 } }).toArray();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Cannot fetch users' });
    }
});

// Orders API (MongoDB, protected)
app.get('/api/orders', authenticateToken, async (req, res) => {
    try {
        const orders = await db.collection('orders').find().toArray();
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: 'Cannot fetch orders' });
    }
});

// Add new order (MongoDB, protected)
app.post('/api/orders', authenticateToken, async (req, res) => {
    try {
        const newOrder = req.body;
        const result = await db.collection('orders').insertOne(newOrder);
        res.json({ ...newOrder, _id: result.insertedId });
    } catch (err) {
        res.status(500).json({ error: 'Cannot save order' });
    }
});

const PORT = 3010;
app.listen(PORT, () => console.log(`Backend running at http://localhost:${PORT}`));