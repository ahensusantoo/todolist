import { pool, connectDb } from '../../../../app/database.js';

const login = async ({ username }) => {
    const client = await connectDb(); // Menggunakan await untuk mendapatkan client dari pool
    try {
        const queryText = `SELECT * FROM mst_users WHERE mu_username = $1 OR mu_email = $1`;
        const values = [username];
        
        const { rows } = await client.query(queryText, values);
        return rows[0];
    } catch (error) {
        console.error('Error dalam login:', error.message);
        throw error;
    } finally {
        client.release();
    }
};

export { login };
