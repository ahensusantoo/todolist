import { pool, connectDb } from '../../../../app/database.js';
import { buildWhereClause } from '../../../../helper/applicationHelper.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';


const table = 'mst_user';
const id_table = 'mu_id';

// @ { search, limit, page } bersifat opsinal (tidak wajib di isi)
const get_mst_user_all = async ({ where, limit, offset, search, single = false }) => {
    const client = await connectDb();
    try {
        const values = [];
        let query = `
            SELECT * 
            FROM ${table} mu
            LEFT JOIN mst_group_user mgu ON mu.mu_id = mgu.mst_user_mu_id
            LEFT JOIN mst_group mg ON mgu.mst_group_mg_id = mg.mg_id
            LEFT JOIN mst_pegawai mpg ON mu.mst_peg_mpg_id = mpg.mpg_id
        `;

        // Build WHERE clause and values
        const { conditions: whereConditions, values: whereValues } = buildWhereClause(where);

        // Add WHERE clause to the query
        if (whereConditions) {
            query += ` WHERE ${whereConditions}`;
            values.push(...whereValues);
        }

        // Handle search parameter
        if (search) {
            const searchCondition = `mu_username LIKE $${values.length + 1}`;
            query += whereConditions ? ` AND (${searchCondition})` : ` WHERE ${searchCondition}`;
            values.push(`%${search}%`);
        }

        query += ' ORDER BY mu_username ASC';

        // Append limit and offset
        query += ` LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
        values.push(limit);
        values.push(offset);
        // Execute query
        const { rows } = await client.query(query, values.length > 0 ? values : []);
        const record = single ? rows[0] : rows;
        return record;
    } catch (error) {
        console.error('Error : ', error);
        throw error;
    } finally {
        client.release();
    }
};

// Fungsi untuk menghitung jumlah grup
const count_mst_user = async ({ where, search }) => {
    const client = await connectDb();
    try {
        const values = [];
        let query = `SELECT COUNT(*) AS count FROM ${table}`;

        // Build WHERE clause and values
        const { conditions: whereConditions, values: whereValues } = buildWhereClause(where);

        // Add WHERE clause to the query
        if (whereConditions) {
            query += ` WHERE ${whereConditions}`;
            values.push(...whereValues);
        }

        // Handle search parameter
        if (search) {
            const searchCondition = `mu_username LIKE $${values.length + 1}`;
            query += whereConditions ? ` AND (${searchCondition})` : ` WHERE ${searchCondition}`;
            values.push(`%${search}%`);
        }

        // Execute query
        const { rows } = await client.query(query, values);
        return rows[0].count;
    } catch (error) {
        console.error('Error : ', error);
        throw error;
    } finally {
        client.release();
    }
};

//get user by id
const get_mst_user_by_id = async (id) => {
    const client = await connectDb();
    try {
        const { rows } = await client.query(`
            SELECT * 
            FROM mst_user mu 
            LEFT JOIN mst_group_user mgu ON mu.mu_id = mgu.mst_user_mu_id
            LEFT JOIN mst_group mg ON mgu.mst_group_mg_id = mg.mg_id
            LEFT JOIN mst_pegawai mpg ON mu.mst_peg_mpg_id = mpg.mpg_id
            WHERE mu_id = $1`, [id]);
        return rows;
    }catch (error) {
        console.error('Error : ', error);
        throw error;
    } finally {
        client.release();
    }
};

const check_check_username = async (id= null, post = null) => {
    const client = await pool.connect();
    try {
        const { nama_group } = post;
        let queryText = 'SELECT * FROM mst_user WHERE LOWER(mu_username) = LOWER($1)';
        let queryParams = [nama_group];

        //check jika proses update cari yang selain id dia sendiri
        if (id && id !== '') {
            queryText += ' AND mu_id != $2';
            queryParams.push(id);
        }
        const { rows } = await client.query(queryText, queryParams);
        return rows[0];
    } catch (error) {
        console.error('Error : ', error);
        throw error;
    } finally {
        client.release();
    }
};

const create_user_group = async ({ post }) => {
    const client = await connectDb();
    try {
        await client.query('BEGIN'); // Mulai transaksi
        const { username, kode_pegawai, password, stts_aktif, user_ip } = post.mst_user;
        const isActive = (stts_aktif === true || stts_aktif === 'true') ? 1 : 0;
        const kodePegawai = (kode_pegawai != "") ? kode_pegawai : null;
        const userIp = (user_ip != "") ? user_ip : null;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const mu_id = await makeID('MU', 'sc_mst_user'); // Menghasilkan ID untuk grup
        const userInsertQuery = `
            INSERT INTO ${table} (mu_id, mst_peg_mpg_id, mu_username, mu_password, mu_is_aktif, mu_ip_login, mu_tgl_last_activity, mu_delete, mu_tgl_last_login) 
            VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, $7, CURRENT_TIMESTAMP)
            RETURNING mu_id, mu_username, mu_is_aktif`;
        const userValues = [mu_id, kodePegawai, username, hashedPassword, isActive, userIp, null];
        // Mengambil hasil dari query INSERT
        const result_mst_group = await client.query(userInsertQuery, userValues);

        // Eksekusi setiap privilege
        for (const group of post.mst_group) {
            const id_user_group = await makeID('MGU', 'sc_mst_group_user');
            
            // Memeriksa apakah hak akses sudah ada
            const existingTransAction = await check_user_group(id_group, privilege);
            
            if (existingTransAction) {
                await client.query('ROLLBACK');
                throw responseCode(
                    400,
                    `Untuk grup ${existingTransAction.mg_nama_group} ini sudah memiliki hak akses ${existingTransAction.mp_action}`,
                );
            }

            // Query untuk memasukkan hak akses
            const privilegeInsertQuery = `
                INSERT INTO trans_action (tac_id, mst_group_mg_id, mst_privileges_mp_id) 
                VALUES ($1, $2, $3)`;

            const privilegeValues = [id_trans_action, id_group, privilege];
            await client.query(privilegeInsertQuery, privilegeValues);
        }

        await client.query('COMMIT'); // Commit setelah semua berhasil
        return result_mst_group.rows[0]; // Mengembalikan data grup yang dimasukkan
    } catch (error) {
        await client.query('ROLLBACK');
        throw responseCode(
            500,
            error
        );
    } finally {
        client.release(); // Mengembalikan koneksi
    }
};



export { 
    get_mst_user_all,
    count_mst_user,
    get_mst_user_by_id,
    check_check_username,
    create_user_group
};