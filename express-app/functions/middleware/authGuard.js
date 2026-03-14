const crypto = require('crypto');
const { API_SECRET_TOKEN } = require('../../data/env');


/**
 * Middleware to authenticate incoming JSON requests.
 * Checks that the request body contains a valid `api_key` matching the server's API_SECRET_TOKEN.
 * Uses timing-safe comparison to prevent timing-based side-channel attacks.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
const authGuard = (req, res, next) => {
	const { api_key } = req.body;

	// Reject early if api_key is missing or wrong length (no timing info leaked here)
	// API_SECRET_TOKEN is validated at startup by env.js, so it's guaranteed to be defined here
	const secret = /** @type {string} */ (API_SECRET_TOKEN);

	const isValid =
		typeof api_key === 'string' &&
		api_key.length === secret.length &&
		crypto.timingSafeEqual(Buffer.from(api_key), Buffer.from(secret));

	if (!isValid) {
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
