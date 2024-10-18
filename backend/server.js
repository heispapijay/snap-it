import express from 'express';
import dotenv from 'dotenv';

import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.route.js';
import {connectDB} from './lib/db.js';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json()); //middleware to parse JSON data
app.use(cookieParser()); //middleware to parse cookies

app.use('/api/v1/auth', authRoutes);  //routes

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectDB();
});