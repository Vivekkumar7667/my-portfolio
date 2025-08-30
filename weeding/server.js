const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const SERVICES_FILE = './services.json';
const BOOKINGS_FILE = './bookings.json';

// Helper to read/write JSON files
function readJSON(file) {
    if (!fs.existsSync(file)) return [];
    return JSON.parse(fs.readFileSync(file, 'utf8'));
}
function writeJSON(file, data) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// Get all services
app.get('/api/services', (req, res) => {
    const services = readJSON(SERVICES_FILE);
    res.json(services);
});

// Add a new service (admin)
app.post('/api/services', (req, res) => {
    const services = readJSON(SERVICES_FILE);
    const newService = req.body;
    newService.id = services.length > 0 ? Math.max(...services.map(s => s.id)) + 1 : 1;
    services.push(newService);
    writeJSON(SERVICES_FILE, services);
    res.status(201).json(newService);
});

// Edit a service (admin)
app.put('/api/services/:id', (req, res) => {
    const services = readJSON(SERVICES_FILE);
    const id = parseInt(req.params.id);
    const idx = services.findIndex(s => s.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Service not found' });
    services[idx] = { ...services[idx], ...req.body, id };
    writeJSON(SERVICES_FILE, services);
    res.json(services[idx]);
});

// Delete a service (admin)
app.delete('/api/services/:id', (req, res) => {
    let services = readJSON(SERVICES_FILE);
    const id = parseInt(req.params.id);
    const before = services.length;
    services = services.filter(s => s.id !== id);
    if (services.length === before) return res.status(404).json({ error: 'Service not found' });
    writeJSON(SERVICES_FILE, services);
    res.json({ success: true });
});

// Book services (checkout)
app.post('/api/bookings', (req, res) => {
    const bookings = readJSON(BOOKINGS_FILE);
    const booking = req.body;
    booking.id = bookings.length > 0 ? Math.max(...bookings.map(b => b.id)) + 1 : 1;
    booking.date = new Date().toISOString();
    bookings.push(booking);
    writeJSON(BOOKINGS_FILE, bookings);
    res.status(201).json({ success: true, bookingId: booking.id });
});

// Get all bookings (admin)
app.get('/api/bookings', (req, res) => {
    const bookings = readJSON(BOOKINGS_FILE);
    res.json(bookings);
});

app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
