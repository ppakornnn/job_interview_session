const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');


// Load env vars
dotenv.config({ path: './config/config.env' });

// Connect to database
connectDB();

const app=express();

// Add Body Parser
app.use(express.json());
app.use((req, res, next) => {
    console.log("Incoming Request:", req.method, req.url);
    console.log("Headers:", req.headers);
    console.log("Body:", req.body); // Check if the body is received
    next();
});

// Route files
const companys = require('./routes/company');
const appointments = require('./routes/appointments');
const auth = require('./routes/auth');

// Log the type of each imported module
console.log('Type of companys:', typeof companys);

// Body parser
app.use('/api/v1/companys', companys);
app.use('/api/v1/appointments', appointments)
app.use('/api/v1/auth', auth)

const PORT = process.env.PORT || 5003;
const server = app.listen(PORT, console.log('Server running in ', process.env.NODE_ENV, ' mode on port ', PORT));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
});