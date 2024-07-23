import { pool } from '../../../app/database.js';

const login = async ({ username }) => {
    const client = await pool.connect(); // Menggunakan await untuk mendapatkan client dari pool
    try {
        const queryText = `SELECT * FROM mst_users WHERE mu_username = $1 OR mu_email = $1`;
        const values = [username];
        
        const { rows } = await client.query(queryText, values);
        return rows[0]; // Mengembalikan user pertama yang ditemukan
    } catch (error) {
        // Menghandle kesalahan yang terjadi selama eksekusi query atau di dalam blok try
        console.error('Error dalam login:', error.message);
        throw error; // Melempar kembali error untuk ditangani di lapisan yang lebih tinggi
    } finally {
        client.release(); // Melepaskan koneksi client ke pool setelah selesai
    }
};

export { login };
