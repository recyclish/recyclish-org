
import pg from 'pg';
const { Client } = pg;

async function dropTables() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        console.log('Connected to database');
        const tables = [
            'facility_reports',
            'facility_reviews',
            'facility_submissions',
            'newsletter_subscribers',
            'review_helpful_votes',
            'shelters',
            'user_favorites',
            'users',
            'shelter_corrections'
        ];

        for (const table of tables) {
            console.log(`Dropping table ${table}...`);
            await client.query(`DROP TABLE IF EXISTS ${table} CASCADE;`);
        }

        const sequences = [
            'facility_reports_id_seq',
            'facility_reviews_id_seq',
            'facility_submissions_id_seq',
            'newsletter_subscribers_id_seq',
            'review_helpful_votes_id_seq',
            'user_favorites_id_seq',
            'users_id_seq'
        ];

        for (const seq of sequences) {
            console.log(`Dropping sequence ${seq}...`);
            await client.query(`DROP SEQUENCE IF EXISTS ${seq} CASCADE;`);
        }

        console.log('Tables dropped successfully');
    } catch (err) {
        console.error('Error dropping tables:', err);
    } finally {
        await client.end();
    }
}

dropTables();
