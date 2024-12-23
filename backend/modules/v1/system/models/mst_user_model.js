import { pool, connectDb } from '../../../../app/database.js';
import { buildWhereClause } from '../../../../helper/applicationHelper.js';


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



export { 
    get_mst_user_all,
    count_mst_user,
    get_mst_user_by_id
};