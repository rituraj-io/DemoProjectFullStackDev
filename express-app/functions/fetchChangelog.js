const { getClient } = require('../database/connect');

/**
 * Fetches the latest changelog entries from the database, sorted newest first.
 * @param {number} [limit=50] - Maximum number of entries to return
 * @returns {Promise<Array<{ id: number, field_name: string, old_value: number, new_value: number, action: string, created_at: string }>>}
 */
const fetchChangelog = async (limit = 50) => {
	const client = getClient();

	const result = await client.query(
		'SELECT id, field_name, old_value, new_value, action, created_at FROM changelog ORDER BY created_at DESC LIMIT $1',
		[limit]
	);

	return result.rows;
};

module.exports = fetchChangelog;
