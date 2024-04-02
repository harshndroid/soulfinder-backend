const mongoose = require('mongoose');
require('dotenv').config();
// mongoose.connect('mongodb://127.0.0.1:27017/newdb');
mongoose.connect(process.env.MONGO_DB_URL);

const db = mongoose.connection;

db.on('connected', () => console.log('Connected to database!'));
db.on('disconnected', () => console.log('Databse Disconnected!'));
db.on('error', (err) => console.log('Connected failed!', err));