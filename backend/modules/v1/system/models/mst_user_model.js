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
        const { username, kode_pegawai, password, stts_aktif, user_insert} = post.mst_user;
        const isActive = (stts_aktif === true || stts_aktif === 'true') ? 1 : 0;
        const kodePegawai = (kode_pegawai != "") ? kode_pegawai : null;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const mu_id = await makeID('MU', 'sc_mst_user');
        const insert_user_query = `
            INSERT INTO ${table} (mu_id, mst_peg_mpg_id, mu_username, mu_password, mu_is_aktif, mu_user_update, mu_tgl_update) 
            VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
            RETURNING mu_id, mu_username, mu_is_aktif, mu_user_update, mu_tgl_update`;
        const insert_user_value = [mu_id, kodePegawai, username, hashedPassword, isActive, user_insert];
        const result_mst_group_user = await client.query(insert_user_query, insert_user_value);

        // Eksekusi setiap privilege
        for (const group of post.mst_group) {
            const id_user_group = await makeID('MGU', 'sc_mst_group_user');
            // Query untuk memasukkan hak akses
            const group_user_query = `
                INSERT INTO mst_group_user (mgu_id, mst_group_mg_id, mst_user_mu_id, mgu_user_update, mgu_tgl_update) 
                VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)`;

            const group_user_value = [id_user_group, group, mu_id, user_insert];
            await client.query(group_user_query, group_user_value);
        }

        await client.query('COMMIT'); // Commit setelah semua berhasil
        return result_mst_group_user.rows[0]; 
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


const update_user_group = async ({id, post }) => {
    const client = await connectDb();
    try {
        await client.query('BEGIN'); // Mulai transaksi
        const { username, kode_pegawai, password, stts_aktif, user_insert, mu_id } = post.mst_user; // Pastikan mu_id ada di input
        const isActive = (stts_aktif === true || stts_aktif === 'true') ? 1 : 0;
        const kodePegawai = (kode_pegawai != "") ? kode_pegawai : null;

        // Query untuk mengupdate user
        let update_user_query = `
            UPDATE ${table} 
            SET mst_peg_mpg_id = $1, mu_username = $2, mu_is_aktif = $3, mu_user_update = $4, mu_tgl_update = CURRENT_TIMESTAMP 
            WHERE mu_id = $5
            RETURNING mu_id, mu_username, mu_is_aktif, mu_user_update, mu_tgl_update`;

        const update_user_value = [kodePegawai, username, isActive, user_insert, mu_id];

        if (password && password !== '') {
            update_user_query += ', mu_password = $6'; 
            update_user_value.push(await bcrypt.hash(password, 10));
        }

        // Mengambil hasil dari query UPDATE
        const result_mst_user = await client.query(update_user_query, update_user_value);
        if (result_mst_user.rows.length === 0) {
            throw responseCode(
                403,
                `Grup tidak ditemukan.`,
            );
        }
        for (const group of post.mst_group) {
            // check group sudah ada belum, jika sudah update, jika blm insert
            const check_group_exist_query = `SELECT * FROM mst_group_user WHERE mst_group_user = $1 AND mst_group_user = $2`;
            const check_group_exist = await client.query(check_group_exist_query, [group, id]);
            if(check_group_exist){
                //updaate
                const update_group_user_query = `
                    UPDATE mst_group_user 
                    SET mst_group_mg_id = $1, mgu_user_update = $2, mgu_tgl_update = CURRENT_TIMESTAMP 
                    WHERE mst_group_user = $3 AND mst_user_mu_id = $4
                    RETURNING mgu_id, mst_group_mg_id, mst_user_mu_id, mgu_user_update, mgu_tgl_update`;

                const update_group_user_value = [group, user_insert, group, id];
                const result_update = await client.query(update_group_user_query, update_group_user_value);
            }else{
                //insert
                const id_group_user = await makeID('MGU', 'sc_mst_group_user');
                const group_user_query = `
                    INSERT INTO mst_group_user (mgu_id, mst_group_mg_id, mst_user_mu_id, mgu_user_update, mgu_user_update) 
                    VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)`;

                const group_user_value = [id_group_user, group, id, user_insert];
                await client.query(group_user_query, group_user_value);
            }
        }
        await client.query('COMMIT');
        return result_mst_group.rows[0];
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Terjadi kesalahan:', error); // Debugging log
        throw responseCode(
            500,
            error
        );
    } finally {
        client.release(); // Mengembalikan koneksi
    }
};

const delete_user = async (id) => {
    const client = await connectDb();
    try {
        await client.query('BEGIN');
        
        const delete_user_query = `UPDATE ${table} SET mu_delete = CURRENT_TIMESTAMP WHERE mu_id = $1 RETURNING mu_id, mu_delete RETURNING mu_id, mu_username mu_delete`;
        const result_delete_user = await client.query(delete_user_query, [id]);
        const delete_group_user_query = `UPDATE mst_group_user SET mgu_delete = CURRENT_TIMESTAMP WHERE mst_user_mu_id = $1`;
        const result_delete_group = await client.query(delete_group_user_query, [id]);

        if (result_delete_user.rows.length === 0) {
            throw responseCode(
                403,
                `Gagal menghapus akun dengan username ${mu_username}.`
            );
        }

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw responseCode(
            500,
            error
        );
    } finally {
        client.release();
    }
};

export { 
    get_mst_user_all,
    count_mst_user,
    get_mst_user_by_id,
    check_check_username,
    create_user_group,
    update_user_group,
    delete_user
};