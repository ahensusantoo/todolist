import { pool, connectDb } from '../../../../app/database.js';

const login = async ({ username }) => {
    const client = await connectDb(); // Menggunakan await untuk mendapatkan client dari pool
    try {
        const queryText = `SELECT * 
                            FROM mst_user mu
                            LEFT JOIN mst_group_user mgu ON mu.mu_id = mgu.mst_user_mu_id
                            LEFT JOIN mst_group mg ON mgu.mst_group_mg_id = mg.mg_id
                            LEFT JOIN mst_pegawai mpg ON mu.mst_peg_mpg_id = mpg.mpg_id
                            WHERE (mu_username = $1 OR mu_email = $1) AND mu_delete IS NULL`;
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
