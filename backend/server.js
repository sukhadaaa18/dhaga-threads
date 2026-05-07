const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const dns = require('dns');

dns.setServers(['8.8.8.8']); // Force Google DNS
dotenv.config();

// mongoose.set('bufferCommands', false);

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173',
    process.env.FRONTEND_URL,        // Set this on Render to your Vercel URL
  ].filter(Boolean),
  credentials: true
}));
app.use(express.json());

// Routes
const settingsRoute = require('./routes/settings');
app.use('/api/site-settings', settingsRoute);
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/reservations', require('./routes/reservations'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/payments', require('./routes/payments'));

app.get('/', (req, res) => {
    res.send('Dhaga Backend API is running...');
});

// Connect to MongoDB with Optimized Settings
const connectionOptions = {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4
};

mongoose.connect(process.env.MONGODB_URI, connectionOptions)
    .then(() => {
        console.log('--- DATABASE STATUS ---');
        console.log('Connected to MongoDB Atlas');
        console.log('Database Name:', mongoose.connection.name);
        console.log('Host:', mongoose.connection.host);
        console.log('Connection State:', mongoose.connection.readyState); 
        console.log('------------------------');
    })
    .catch(err => {
        console.error('CRITICAL: MongoDB connection error');
        console.error(err.message);
        process.exit(1); // Exit if DB connection fails to alert the user
    });

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
