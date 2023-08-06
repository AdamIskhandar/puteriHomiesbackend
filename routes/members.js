import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { verifyTokenLogout } from '../middleware/verifyToken.js';

dotenv.config();

const router = express.Router();

// User Collection from database
import Member from '../Models/Members.js';

// GET HOME => UI ✔
router.get('/', (req, res) => {
	res.send('register atau login');
});

// GET REGISTER => UI ✔
router.get('/register', (req, res) => {
	res.send('sila register');
});

// POST REGISTER
router.post('/register', async (req, res) => {
	const username = req.body.username;
	const password = req.body.password;

	// user credential validation
	if (!username || !password) {
		return res
			.status(403)
			.json({ status: 'error', message: 'Sila lengkapkan maklumat.' });
	}

	if (password.length < 6) {
		return res
			.status(403)
			.json({ status: 'error', message: 'Password mesti lebih dari 6.' });
	}
	// hash password
	const hashedPassword = await bcrypt.hash(password, 10);

	// save user to database
	const user = new Member({
		username: username,
		password: hashedPassword,
	});

	try {
		await user.save();

		return res.status(200).json({ status: 'ok', message: 'Members di save' });
	} catch (error) {
		if (error.code === 11000) {
			return res
				.status(400)
				.json({ status: 'error', message: 'Sila gunakan username yang lain.' });
		}

		return res
			.status(403)
			.json({ status: 'error', message: 'tidak boleh save user.' });
	}
});

// GET LOGIN => UI ✔
router.get('/login', (req, res) => {
	res.send('sila login');
});

// POST LOGIN
router.post('/login', async (req, res) => {
	const username = req.body.username;
	const password = req.body.password;

	// user credentials validation
	if (!username || !password) {
		return res
			.status(403)
			.json({ status: 'error', message: 'Sila lengkapkan maklumat.' });
	}

	// get password user from database
	try {
		const user = await Member.findOne({ username: username });

		if (!user) {
			return res
				.status(403)
				.json({ status: 'error', message: 'salah username atau password' });
		}

		// check password using bcrypt
		const checkPassword = await bcrypt.compare(password, user.password);

		if (!checkPassword) {
			return res
				.status(403)
				.json({ status: 'error', message: 'Salah username atau password' });
		}

		// create jwt token and send to Http Cookie
		const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
			expiresIn: '7d',
		});

		return res.status(200).json({
			status: 'ok',
			message: 'okayy anda berjaya login.',
			token: token,
			amna: user.id,
			sayang: user.username,
		});
	} catch (error) {
		console.log(error);
	}
});

// GET LOGOUT
router.post('/logout', verifyTokenLogout, (req, res) => {
	res.status(200).json({ status: 'ok', message: 'user logout' });
});

export default router;

// project presentation wil be at 3 - 5 july
