

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());


// --- Simple file-based user DB ---
const USERS_FILE = path.join(process.cwd(), 'server', 'users.json');
function readUsers() {
  if (!fs.existsSync(USERS_FILE)) return [];
  return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
}
function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// --- Auth Routes ---
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const users = readUsers();
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
  res.json({ success: true, token: 'dummy-token', user: { name: user.name, email: user.email, balance: user.balance } });
});

app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'All fields required' });
  }
  let users = readUsers();
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ success: false, message: 'Email already registered' });
  }
  const newUser = { name, email, password, balance: 1000, deposited: 0, withdrawn: 0 };
  users.push(newUser);
  writeUsers(users);
  res.json({ success: true, token: 'dummy-token', user: { name, email, balance: 1000 } });
});



// --- Wallet Routes (require email in body) ---
// Health check and root route for backend visibility
// Serve a simple HTML page for root route to avoid "Cannot GET /" confusion
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head><meta charset="UTF-8"><title>BetMaster Backend</title></head>
    <body style="font-family:sans-serif;text-align:center;padding:2em;">
      <h1>BetMaster backend server is running.</h1>
      <p>API endpoints are available at <code>/api/...</code></p>
    </body>
    </html>
  `);
});

app.get('/api/wallet', (req, res) => {
  const { email } = req.query;
  const users = readUsers();
  const user = users.find(u => u.email === email);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ balance: user.balance, deposited: user.deposited, withdrawn: user.withdrawn });
});

app.post('/api/wallet/deposit', (req, res) => {
  const { email, amount } = req.body;
  if (!amount || amount < 100) {
    return res.status(400).json({ success: false, message: 'Minimum deposit is ₹100' });
  }
  let users = readUsers();
  const user = users.find(u => u.email === email);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  user.balance += amount;
  user.deposited += amount;
  writeUsers(users);
  res.json({ success: true, balance: user.balance });
});

app.post('/api/wallet/withdraw', (req, res) => {
  const { email, amount } = req.body;
  if (!amount || amount < 100) {
    return res.status(400).json({ success: false, message: 'Minimum withdrawal is ₹100' });
  }
  let users = readUsers();
  const user = users.find(u => u.email === email);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  if (user.balance < amount) {
    return res.status(400).json({ success: false, message: 'Insufficient balance' });
  }
  user.balance -= amount;
  user.withdrawn += amount;
  writeUsers(users);
  res.json({ success: true, balance: user.balance });
});



// --- Game Routes (require email in body) ---
app.post('/api/games/coin-flip', (req, res) => {
  const { email, bet, choice } = req.body;
  if (!email || !bet || bet < 10) return res.status(400).json({ success: false, message: 'Invalid bet or user' });
  let users = readUsers();
  const user = users.find(u => u.email === email);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  if (user.balance < bet) return res.status(400).json({ success: false, message: 'Insufficient balance' });
  user.balance -= bet;
  const win = Math.random() < 0.5;
  let amount = 0;
  if (win) {
    amount = bet * 2;
    user.balance += amount;
  }
  writeUsers(users);
  res.json({ result: win ? 'win' : 'lose', amount });
});

app.post('/api/games/number-guess', (req, res) => {
  const { email, bet, guess } = req.body;
  if (!email || !bet || bet < 10) return res.status(400).json({ success: false, message: 'Invalid bet or user' });
  let users = readUsers();
  const user = users.find(u => u.email === email);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  if (user.balance < bet) return res.status(400).json({ success: false, message: 'Insufficient balance' });
  user.balance -= bet;
  const number = Math.floor(Math.random() * 10) + 1;
  const win = guess == number;
  let amount = 0;
  if (win) {
    amount = bet * 10;
    user.balance += amount;
  }
  writeUsers(users);
  res.json({ result: win ? 'win' : 'lose', number, amount });
});

app.post('/api/games/slot-machine', (req, res) => {
  const { email, bet } = req.body;
  if (!email || !bet || bet < 20) return res.status(400).json({ success: false, message: 'Invalid bet or user' });
  let users = readUsers();
  const user = users.find(u => u.email === email);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  if (user.balance < bet) return res.status(400).json({ success: false, message: 'Insufficient balance' });
  user.balance -= bet;
  const symbols = ['🍒', '🍋', '🔔', '⭐', '7'];
  const reels = [
    symbols[Math.floor(Math.random() * symbols.length)],
    symbols[Math.floor(Math.random() * symbols.length)],
    symbols[Math.floor(Math.random() * symbols.length)]
  ];
  const win = reels[0] === reels[1] && reels[1] === reels[2];
  let amount = 0;
  if (win) {
    amount = bet * 25;
    user.balance += amount;
  }
  writeUsers(users);
  res.json({ result: win ? 'win' : 'lose', reels, amount });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
