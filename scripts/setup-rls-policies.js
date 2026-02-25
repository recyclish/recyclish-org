import pg from 'pg';

const DATABASE_URL = 'postgresql://postgres.vraafuuipvxfxygkuvau:Mobi23&Walter23@aws-1-us-east-1.pooler.supabase.com:6543/postgres';

async function main() {
    const client = new pg.Client({
        connectionString: DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log("Connected to database.");

        // 1. Ensure RLS is enabled on shelters
        console.log("Enabling RLS on shelters table...");
        await client.query('ALTER TABLE shelters ENABLE ROW LEVEL SECURITY;');

        // 2. Add Select policy for everyone
        console.log("Adding public select policy for shelters...");
        await client.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_policies WHERE tablename = 'shelters' AND policyname = 'Public Read Access'
                ) THEN
                    CREATE POLICY "Public Read Access" ON shelters FOR SELECT USING (true);
                END IF;
            END
            $$;
        `);

        // 3. Ensure RLS is enabled on facility_submissions
        console.log("Enabling RLS on facility_submissions...");
        await client.query('ALTER TABLE facility_submissions ENABLE ROW LEVEL SECURITY;');

        // 4. Add Insert policy for everyone (to allow anonymous submissions)
        console.log("Adding public insert policy for facility_submissions...");
        await client.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_policies WHERE tablename = 'facility_submissions' AND policyname = 'Public Insert Access'
                ) THEN
                    CREATE POLICY "Public Insert Access" ON facility_submissions FOR INSERT WITH CHECK (true);
                END IF;
            END
            $$;
        `);

        console.log("RLS Policies setup successfully!");
    } catch (err) {
        console.error("Failed to setup RLS policies:", err);
    } finally {
        await client.end();
    }
}

main();
