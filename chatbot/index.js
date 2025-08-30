const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from your own API!' });
});

app.listen(PORT, () => {
  console.log(`API running at http://localhost:${PORT}`);
});
