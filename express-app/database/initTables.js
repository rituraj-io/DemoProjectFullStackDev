const fs = require('fs');
const path = require('path');
const { getClient } = require('./connect');


// Path to the folder containing .sql schema files
const SQL_DIR = path.join(__dirname, 'sql');


/**
 * Reads all .sql files from the sql/ directory and executes them sequentially.
 * Ensures all required tables and indexes exist before the app starts serving requests.
 * @returns {Promise<void>}
 */
const initTables = async () => {
	const files = fs.readdirSync(SQL_DIR).filter((f) => f.endsWith('.sql'));

	if (files.length === 0) {
		console.log('No .sql files found — skipping table initialization.');
		return;
	}

	const client = getClient();

	for (const file of files) {
		const filePath = path.join(SQL_DIR, file);
		const sql = fs.readFileSync(filePath, 'utf-8');

		await client.query(sql);
		console.log(`Executed: ${file}`);
	}

	console.log('All tables initialized successfully.');
};

module.exports = initTables;
