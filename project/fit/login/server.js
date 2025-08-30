const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const app = express();

app.use(cors());
app.use(express.json());

const uri = 'mongodb://localhost:27017'; // अपने MongoDB का URI डालें
const client = new MongoClient(uri);
const dbName = 'fitdb';

async function main() {
    await client.connect();
    const db = client.db(dbName);
    const users = db.collection('users');
    const logins = db.collection('logins');

    // Login API
    app.post('/api/login', async (req, res) => {
        const { email, password } = req.body;
        const user = await users.findOne({ email, password });
        if (user) {
            // Login event save करो
            await logins.insertOne({
                userId: user._id,
                email: user.email,
                loginTime: new Date()
            });
            const { password, ...userData } = user;
            res.json({ success: true, user: userData });
        } else {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
    });

    app.listen(3010, () => console.log('Backend running at http://localhost:3010'));
}

main().catch(err => console.error(err));