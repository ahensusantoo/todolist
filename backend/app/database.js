// app/database.js
import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const pool = new pg.Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function connectDb() {
    try {
        const client = await pool.connect();
        console.log(`Terhubung ke PostgreSQL dengan host: ${process.env.DB_HOST}:${process.env.DB_PORT} ~ ${process.env.DB_DATABASE}`);
        return client;
    } catch (err) {
        console.error('Koneksi gagal:', err.stack);
        throw err;
    }
}

// Ekspor pool jika diperlukan
export { pool, connectDb };
