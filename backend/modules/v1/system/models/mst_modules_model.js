import { pool } from '../../../../app/database.js';
import { buildWhereClause } from '../../../../helper/applicationHelper.js';

// @ { search, limit, page } bersifat opsional (tidak wajib di isi)
const get_mst_modules_all = async ({ where, limit, offset, search, single = false }) => {
    const client = await pool.connect();
    try {
        const values = [];
        let query = 'SELECT * FROM mst_modules LEFT JOIN mst_privileges ON mm_modulesid = mst_modules_mm_id';

        // Build WHERE clause and values
        const { conditions: whereConditions, values: whereValues } = buildWhereClause(where);

        // Add WHERE clause to the query
        if (whereConditions) {
            query += ` WHERE ${whereConditions}`;
            values.push(...whereValues);
        }

        // Handle search parameter
        if (search) {
            const searchCondition = `mm_nama LIKE $${values.length + 1}`;
            query += whereConditions ? ` AND ${searchCondition}` : ` WHERE ${searchCondition}`;
            values.push(`%${search}%`);
        }

        // Add ORDER BY clause
        query += ' ORDER BY mm_nama ASC';

        // Handle limit and offset
        if (limit !== null && offset !== null) {
            query += ` LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
            values.push(limit, offset);
        }
        
        // Execute query
        const { rows } = await client.query(query, values);
        const record = single ? rows[0] : rows;
        return record;
    } catch (error) {
        console.error('Error : ', error);
        throw error;
    } finally {
        client.release();
    }
};

export { 
    get_mst_modules_all,
};
