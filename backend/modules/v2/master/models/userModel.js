// models/UserModel.js
import { pool } from '../../../../app/database.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';


// @ { search, limit, page } bersifat opsinal (tidak wajib di isi)
const getAllUsers = async ({ post }) => {
    const client = await pool.connect();
    try {
        let { search, limit, page } = post;

        // Validasi dan set default limit
        if (!limit || limit <= 0 || isNaN(limit)) {
            limit = 10; // Nilai default
        } else if (limit > 200) {
            throw responseCode(
                400,
                'Maksimal limit yang dapat ditampilkan adalah 200 data',
            );
        }

        let offset = 0;
        page = parseInt(page);
        if (page && page > 1) {
            offset = (page - 1) * limit;
        }

        const values = [];
        let query = 'SELECT * FROM mst_users';
        if (search) {
            query += ` WHERE mu_username LIKE $1 OR mu_email LIKE $1`;
            values.push(`%${search}%`);
        }

        query += ` LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
        values.push(limit);
        values.push(offset);

        const { rows } = await client.query(query, values.length > 0 ? values : undefined);
        return rows;
    } catch (error) {
        console.error('Error : ', error);
        throw error;
    } finally {
        client.release();
    }
};

const getUserById = async (id) => {
    const client = await pool.connect();
    try {
        const { rows } = await client.query('SELECT * FROM mst_users WHERE mu_userid = $1', [id]);
        return rows[0];
    }catch (error) {
        console.error('Error : ', error);
        throw error;
    } finally {
        client.release();
    }
};

const createUser = async ({ post }) => {
    const client = await pool.connect();
    try {
        const { username, password, email, user_insert } = post;
        // Menggunakan bcrypt untuk menghash password
        const hashedPassword = await bcrypt.hash(password, 10); // 10 adalah cost factor untuk kekuatan hash

        const id = uuidv4();
        const queryText = `
            INSERT INTO mst_users(mu_userid, mu_username, mu_password, mu_email, mu_user_insert, mu_tgl_insert, mu_user_update, mu_tgl_update) 
            VALUES($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, $6, CURRENT_TIMESTAMP) 
            RETURNING *`;
        const values = [id, username, hashedPassword, email, user_insert, user_insert];
        const { rows } = await client.query(queryText, values);
        return rows[0];
    } catch (error) {
        console.error('Error : ', error);
        throw error;
    } finally {
        client.release();
    }
};


const updateUser = async (post, id) => {
    const client = await pool.connect();
    try {
        const { username, password, email, user_update } = post;
        let values = [username];
        let queryText = 'UPDATE mst_users SET mu_username = $1';
        
        // Jika password ada, tambahkan ke query dan values
        if (password && password.trim() !== '') {
            const hashedPassword = await bcrypt.hash(password, 10);
            queryText += ', mu_password = $2';
            values.push(hashedPassword);
        }

        if (email) {
            queryText += ', mu_email = $' + (values.length + 1);
            values.push(email);
        }

        queryText += ', mu_tgl_update = CURRENT_TIMESTAMP';

        queryText += ' WHERE mu_userid = $' + (values.length + 1) + ' RETURNING *';
        values.push(id);

        const { rows } = await client.query(queryText, values);
        return rows[0];
    } catch (error) {
        console.error('Error : ', error);
        throw error;
    } finally {
        client.release();
    }
};

const deleteUser = async (id) => {
    const client = await pool.connect();
    try {
        const { rows } = await client.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
        return rows[0];
    } catch (error) {
        console.error('Error : ', error);
        throw error;
    } finally {
        client.release();
    }
};

const checkUsername = async (post = null, id= null) => {
    const client = await pool.connect();
    try {
        const { username } = post;
        const queryText = 'SELECT * FROM mst_users WHERE LOWER(mu_username) = LOWER($1)';
        const { rows } = await client.query(queryText, [username]);
        return rows[0]; // Mengembalikan baris pertama dari hasil query
    } catch (error) {
        console.error('Error : ', error);
        throw error;
    } finally {
        client.release();
    }
};


export { getAllUsers, getUserById, createUser, updateUser, deleteUser, checkUsername };
