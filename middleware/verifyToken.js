import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const verifyToken = async (req, res, next) => {
	const token = req.body.tokenUser;

	if (!token) {
		return res
			.status(200)
			.json({ status: 'error', message: 'tiada token', error: 'token' });
	}
	jwt.verify(token, process.env.JWT_SECRET, (err, complete) => {
		if (err) {
			res
				.status(200)
				.json({ status: 'error', message: 'token tak valid', error: 'token' });
		}

		if (complete) {
			return next();
		}
	});
};

export const verifyTokenLogout = (req, res, next) => {
	const token = req.body.tokenUser;

	if (!token) {
		return res.status(403).json({ message: 'you dont have token ' });
	}

	const checkToken = jwt.verify(token, process.env.JWT_SECRET);

	if (!checkToken) {
		return res.status(403).json({ message: 'your token is not valid' });
	} else {
		return next();
	}
};
