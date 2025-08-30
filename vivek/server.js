const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Get all products
app.get('/api/products', (req, res) => {
  fs.readFile('products.json', (err, data) => {
    if (err) return res.status(500).json({ error: 'Cannot read products' });
    res.json(JSON.parse(data));
  });
});

// Get all users
app.get('/api/users', (req, res) => {
  fs.readFile('users.json', (err, data) => {
    if (err) return res.status(500).json({ error: 'Cannot read users' });
    res.json(JSON.parse(data));
  });
});

// Get all orders
app.get('/api/orders', (req, res) => {
  fs.readFile('orders.json', (err, data) => {
    if (err) return res.status(500).json({ error: 'Cannot read orders' });
    res.json(JSON.parse(data));
  });
});

// Add new order
app.post('/api/orders', (req, res) => {
  fs.readFile('orders.json', (err, data) => {
    if (err) return res.status(500).json({ error: 'Cannot read orders' });
    let orders = JSON.parse(data);
    const newOrder = req.body;
    newOrder.id = orders.length + 1;
    orders.push(newOrder);
    fs.writeFile('orders.json', JSON.stringify(orders, null, 2), err => {
      if (err) return res.status(500).json({ error: 'Cannot save order' });
      res.json(newOrder);
    });
  });
});

app.get('/', (req, res) => {
  res.send('Welcome to the API! Available routes: /api/products, /api/users, /api/orders');
});


const PORT = 3002;
app.listen(PORT, () => console.log(`Backend running at http://localhost:${PORT}`));