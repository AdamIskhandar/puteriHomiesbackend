import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { MongoClient, ServerApiVersion } from 'mongodb';
import mongoose from 'mongoose';

// config dotenv
dotenv.config();

//PORT
const PORT = 8001;
const app = express();

// connect to database
mongoose.connect(process.env.MONGO_URL);

const db = mongoose.connection;

try {
	db.on('connected', () => {
		console.log('Connected to database..');
	});
} catch (error) {
	db.on('error', () => {
		console.log('error to connect database..');
	});
}

// middleware
app.use(
	cors({
		credentials: true,
		origin: ['https://puterihomies.netlify.app', 'http://localhost:3000'],
	})
);

app.use(express.json());
app.use(cookieParser());

// routes
import homeRoutes from './routes/home.js';
import membersRoutes from './routes/members.js';

// route for home and everyone posts
app.use('/', homeRoutes);
// route for register and login only => auth
app.use('/auth', membersRoutes);

app.listen(PORT, () => {
	console.log('Your server is running! ' + PORT);
});
