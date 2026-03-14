const { API_SECRET_TOKEN } = require('../../data/env');

/**
 * Middleware to authenticate incoming JSON requests.
 * Checks that the request body contains a valid `api_key` matching the server's API_SECRET_TOKEN.
 * Responds with 401 Unauthorized if the key is missing or invalid.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
const authGuard = (req, res, next) => {
	const { api_key } = req.body;

	if (!api_key || api_key !== API_SECRET_TOKEN) {
		res.status(401).json({
			success: false,
			message: 'Unauthorized: invalid or missing api_key',
			data: null,
		});
		return;
	}

	next();
};

module.exports = authGuard;
