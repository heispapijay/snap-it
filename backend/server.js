import express from 'express';
import dotenv from 'dotenv';

import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.route.js';
import userRoutes from './routes/user.route.js';
import itemRoutes from './routes/item.route.js';

import {connectDB} from './lib/db.js';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json()); //middleware to parse JSON data
app.use(cookieParser()); //middleware to parse cookies

app.use('/api/v1/auth', authRoutes);  //routes
app.use('/api/v1/user', userRoutes);  //route for user
app.use('/api/v1/item', itemRoutes);  //route for item

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectDB();
});
