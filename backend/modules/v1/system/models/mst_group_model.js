// models/UserModel.js

import { pool, connectDb } from  '../../../../app/database.js'

import { buildWhereClause, makeID} from '../../../../helper/applicationHelper.js';
import { responseCode } from '../../../../helper/applicationHelper.js';


const table = 'mst_group';
const id_table = 'mg_id';



// @ { search, limit, page } bersifat opsinal (tidak wajib di isi)
const get_mst_group_all = async ({ where, limit, offset, search, single = false }) => {
    const client = await connectDb();
    try {
        const values = [];
        let query = `SELECT * FROM ${table}`;

        // Build WHERE clause and values
        const { conditions: whereConditions, values: whereValues } = buildWhereClause(where);

        // Add WHERE clause to the query
        if (whereConditions) {
            query += ` WHERE ${whereConditions}`;
            values.push(...whereValues);
        }

        // Handle search parameter
        if (search) {
            const searchCondition = `mg_nama_group LIKE $${values.length + 1}`;
            query += whereConditions ? ` AND (${searchCondition})` : ` WHERE ${searchCondition}`;
            values.push(`%${search}%`);
        }

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
const count_mst_group = async ({ where, search }) => {
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
            const searchCondition = `mg_nama_group LIKE $${values.length + 1}`;
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

const get_mst_group_by_id = async (id) => {
    const client = await connectDb();
    try {
        const { rows } = await client.query(`
            SELECT * 
            FROM mst_group mg 
            LEFT JOIN trans_action tac ON mg.mg_id = tac.mst_group_mg_id
            WHERE mg_id = $1`, [id]);
        return rows[0];
    }catch (error) {
        console.error('Error : ', error);
        throw error;
    } finally {
        client.release();
    }
};

const create_group_privileges = async ({ post }) => {
    const client = await connectDb();
    try {
        await client.query('BEGIN'); // Mulai transaksi
        const { nama_group, deskripsi_group, stts_aktif, user_update, aplikasi_default } = post.mst_group;
        const isActive = (stts_aktif === true || stts_aktif === 'true') ? 1 : 0;

        const id_group = await makeID('MG', 'sc_mst_group'); // Menghasilkan ID untuk grup
        const groupInsertQuery = `
            INSERT INTO ${table} (mg_id, mg_nama_group, mg_ket_group, mg_is_aktif, mg_user_update, mg_tgl_update, mst_aplikasi_ma_id) 
            VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, $6)
            RETURNING mg_id, mg_nama_group, mg_ket_group, mg_is_aktif, mg_user_update, mg_tgl_update, mst_aplikasi_ma_id`;

        const groupValues = [id_group, nama_group, deskripsi_group, isActive, user_update, aplikasi_default];
        
        // Mengambil hasil dari query INSERT
        const result_mst_group = await client.query(groupInsertQuery, groupValues);
        console.log('Data grup yang dimasukkan:', result_mst_group.rows[0]); // Debugging log

        // Eksekusi setiap privilege
        for (const privilege of post.privileges) {
            const id_trans_action = await makeID('TAC', 'sc_trans_action');
            
            // Memeriksa apakah hak akses sudah ada
            const existingTransAction = await check_trans_action(id_group, privilege);
            
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



const update_group_privileges = async ({ post }) => {
    const client = await connectDb();
    try {
        await client.query('BEGIN'); // Mulai transaksi

        // Mengambil data grup dari `post.mst_group`
        const { id_group, nama_group, deskripsi_group, stts_aktif, user_update, aplikasi_default } = post.mst_group;

        // Query untuk mengupdate grup
        const groupUpdateQuery = `
            UPDATE ${table} 
            SET mg_nama_group = $1, mg_ket_group = $2, mg_is_aktif = $3, mg_user_update = $4, mg_tgl_update = CURRENT_TIMESTAMP, mst_aplikasi_ma_id = $5 
            WHERE mg_id = $6
            RETURNING mg_id, mg_nama_group, mg_ket_group, mg_is_aktif, mg_user_update, mg_tgl_update, mst_aplikasi_ma_id`;

        const groupValues = [nama_group, deskripsi_group, stts_aktif, user_update, aplikasi_default, id_group];
        
        // Mengambil hasil dari query UPDATE
        const result_mst_group = await client.query(groupUpdateQuery, groupValues);
        if (result_mst_group.rows.length === 0) {
            throw responseCode(
                403,
                `Grup dengan ID ${id_group} tidak ditemukan.`,
            );
        }

        console.log('Data grup yang diperbarui:', result_mst_group.rows[0]); // Debugging log

        // Menghapus hak akses yang ada
        const deletePrivilegesQuery = `DELETE FROM trans_action WHERE mst_group_mg_id = $1`;
        await client.query(deletePrivilegesQuery, [id_group]);

        // Eksekusi setiap privilege yang baru
        for (const privilege of post.privileges) {
            const id_trans_action = await makeID('TAC', 'sc_trans_action');
            
            // Memeriksa apakah hak akses sudah ada
            const existingTransAction = await check_trans_action(id_group, privilege);
            
            if (existingTransAction) {
                await client.query('ROLLBACK');
                throw responseCode(
                    400,
                    `Untuk grup ${existingTransAction.mg_nama_group} ini sudah memiliki hak akses ${existingTransAction.mp_action}`,
                );
            }

            // Query untuk memasukkan hak akses baru
            const privilegeInsertQuery = `
                INSERT INTO trans_action (tac_id, mst_group_mg_id, mst_privileges_mp_id) 
                VALUES ($1, $2, $3)`;

            const privilegeValues = [id_trans_action, id_group, privilege];
            await client.query(privilegeInsertQuery, privilegeValues);
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



const check_trans_action = async ({ id_group, id_privileges, id_trans_privileges = null }) => {
    const client = await connectDb();
    try {
        const queryText = `
        SELECT tac.*, mg.mg_nama_group, mp.mp_action
        FROM trans_action tac
        LEFT JOIN mst_group mg ON tac.mst_group_mg_id=mg.mg_id
        LEFT JOIN mst_privileges mp ON tac.mst_privileges_mp_id=mp.mp_id
        WHERE mst_group_mg_id = $1 AND mst_privileges_mp_id = $2`;
        const { rows } = await client.query(queryText, [id_group, id_privileges]);
        return rows[0];
    } catch (error) {
        throw responseCode(
            500,
            error,
        );
    } finally {
        client.release(); // Mengembalikan koneksi
    }
};
 












// const updateUser = async (post, id) => {
//     const client = await pool.connect();
//     try {
//         const { username, password, email, user_update } = post;
//         let values = [username];
//         let queryText = 'UPDATE mst_user SET mu_username = $1';
        
//         // Jika password ada, tambahkan ke query dan values
//         if (password && password.trim() !== '') {
//             const hashedPassword = await bcrypt.hash(password, 10);
//             queryText += ', mu_password = $2';
//             values.push(hashedPassword);
//         }

//         if (email) {
//             queryText += ', mu_email = $' + (values.length + 1);
//             values.push(email);
//         }

//         queryText += ', mu_tgl_update = CURRENT_TIMESTAMP';

//         queryText += ' WHERE mu_userid = $' + (values.length + 1) + ' RETURNING *';
//         values.push(id);

//         const { rows } = await client.query(queryText, values);
//         return rows[0];
//     } catch (error) {
//         console.error('Error : ', error);
//         throw error;
//     } finally {
//         client.release();
//     }
// };

// const deleteUser = async (id) => {
//     const client = await pool.connect();
//     try {
//         const { rows } = await client.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
//         return rows[0];
//     } catch (error) {
//         console.error('Error : ', error);
//         throw error;
//     } finally {
//         client.release();
//     }
// };

const check_group_name = async (post = null, id= null) => {
    const client = await connectDb();
    try {
        const { nama_group } = post;
        const queryText = 'SELECT * FROM mst_group WHERE LOWER(mg_nama_group) = LOWER($1)';
        const { rows } = await client.query(queryText, [nama_group]);
        return rows[0];
    } catch (error) {
        throw responseCode(
            500,
            error,
        );
    } finally {
        client.release();
    }
};


export { 
    get_mst_group_all,
    count_mst_group,
    get_mst_group_by_id, 
    create_group_privileges, 
    update_group_privileges, 
    // deleteUser, 
    check_group_name 
};
