require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Main API routes
app.use('/api', apiRoutes);

// Health check
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

const server = app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
server.on('error', (err) => {
    console.error('Server error:', err);
});
server.on('close', () => {
    console.log('Server connection closed');
});
