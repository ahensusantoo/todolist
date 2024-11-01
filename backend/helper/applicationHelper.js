import { pool } from '../app/database.js';

const responseCode = (statusCode, label_message, validasi_data = null, data = null) => {
    const error = new Error(label_message);
    error.statusCode = statusCode;
    error.label_message = label_message;
    error.validasi_data = validasi_data;
    error.data = data;
    return error;
};

// Function to build WHERE clause and values from an object
const buildWhereClause = (where) => {
    const values = [];
    let conditions = [];

    if (where && typeof where === 'object') {
        conditions = Object.entries(where).map(([key, value], index) => {
            if (value === 'IS NULL') {
                return `${key} IS NULL`;
            } else if (value === 'IS NOT NULL') {
                return `${key} IS NOT NULL`;
            } else if (value === null) {
                return `${key} IS NULL`;
            } else {
                // Handle other values and add to values array
                values.push(value);
                return `${key} = $${values.length}`; // Ganti index dengan length dari values
            }
        }).filter(condition => condition !== ''); // Filter kondisi kosong jika ada
    }

    return { conditions: conditions.join(' AND '), values };
};


const makeID = async (table, kode, id_column_name) => {
    // Validasi parameter
    if (typeof table !== 'string' || typeof kode !== 'string' || typeof id_column_name !== 'string') {
        throw responseCode(403, 'Parameter membuat ID harus berupa string dan tidak boleh kosong');
    }

    // Query untuk memanggil fungsi PostgreSQL
    const query = `
        SELECT makeID($1, $2, $3) AS id
    `;

    try {
        const result = await pool.query(query, [table, kode, id_column_name]);
        
        // Pastikan result.rows tidak kosong sebelum mengakses
        if (result.rows.length === 0) {
            throw responseCode(404, 'ID tidak ditemukan');
        }

        return result.rows[0].id; // Mengembalikan ID yang dihasilkan
    } catch (error) {
        console.error('Error executing query:', error.stack);
        throw responseCode(400, 'Gagal membuat ID');
    }
};

const executeWithTransaction = async (client, operations) => {
    const successfulOperations = [];
    const failedOperations = [];

    // Pertama, coba jalankan semua operasi
    for (const operation of operations) {
        const { query, values, table, idGenerator } = operation;

        // try {
            // Jika ada idGenerator, generate ID baru
            if (idGenerator) {
                const newID = await makeID(table, idGenerator.prefix, idGenerator.column);
                // values = [newID, ...values];
                console.log(newID)
            }

            // await client.query(query, values);
            // successfulOperations.push(operation); // Simpan semua yang berhasil
            // await client.query('COMMIT'); // Commit setiap query yang berhasil
        // } catch (error) {
        //     console.error('Query failed:', { query, values, error });
        //     failedOperations.push(operation); // Simpan query yang gagal
            
        //     // Rollback semua perubahan yang sudah disimpan
        //     await client.query('ROLLBACK');
        //     throw new Error('Transaction failed. All changes rolled back.'); // Lempar error
        // }
    }

    // Jika ada operasi yang gagal, coba ulang
    // for (const operation of failedOperations) {
    //     const { query, values, table } = operation;

    //     try {
    //         await client.query(query, values);
            // successfulOperations.push(operation); // Simpan jika berhasil
    //         await client.query('COMMIT'); // Commit untuk operasi yang berhasil
    //     } catch (error) {
    //         console.error('Retry failed:', error);
    //         // Jika gagal lagi, rollback semua yang berhasil
    //         await rollbackSuccessfulInserts(client, successfulOperations);
    //         throw error; // Lempar error jika gagal
    //     }
    // }
};

const rollbackSuccessfulInserts = async (client, operations) => {
    if (operations.length > 0) {
        for (const operation of operations) {
            const { table, id } = operation;
            const deleteQuery = `DELETE FROM ${table} WHERE id = $1`; // Ganti 'id' sesuai dengan kolom ID yang sesuai
            try {
                await client.query(deleteQuery, [id]);
            } catch (rollbackError) {
                console.error('Rollback failed:', rollbackError);
                // Anda bisa menambahkan logika tambahan di sini jika rollback gagal
            }
        }
    }
};


export {
    responseCode,
    buildWhereClause,
    makeID,
    executeWithTransaction,
    rollbackSuccessfulInserts
}
