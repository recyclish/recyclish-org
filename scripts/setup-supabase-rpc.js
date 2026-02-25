import pg from 'pg';

async function setupRpc() {
    const client = new pg.Client('postgresql://postgres.vraafuuipvxfxygkuvau:Mobi23&Walter23@aws-1-us-east-1.pooler.supabase.com:6543/postgres');
    await client.connect();

    const query = `
    CREATE OR REPLACE FUNCTION search_shelters(
      p_lat float, 
      p_lng float, 
      p_radius_miles float, 
      p_search_text text, 
      p_state_filter text, 
      p_city_filter text, 
      p_species_filter text[], 
      p_limit_count int, 
      p_offset_count int
    ) RETURNS TABLE (
      id uuid, 
      name text, 
      slug text, 
      address_line1 text, 
      city text, 
      state text, 
      zip text, 
      phone text, 
      email text, 
      website text, 
      shelter_type text, 
      species_served text[], 
      is_no_kill boolean, 
      verified boolean, 
      latitude float, 
      longitude float, 
      distance float
    ) LANGUAGE plpgsql AS $$
    BEGIN
      RETURN QUERY
      SELECT 
        s.id, s.name, s.slug, s.address_line1, s.city, s.state, s.zip, s.phone, s.email, s.website, s.shelter_type, s.species_served, s.is_no_kill, s.verified, s.latitude, s.longitude,
        (CASE 
          WHEN p_lat IS NOT NULL AND p_lng IS NOT NULL 
          THEN (ST_Distance(s.location, ST_MakePoint(p_lng, p_lat)::geography) / 1609.34)
          ELSE 0.0
        END)::float as distance
      FROM shelters s
      WHERE 
        s.active = true
        AND (p_search_text IS NULL OR s.name ILIKE '%' || p_search_text || '%' OR s.zip = p_search_text)
        AND (p_state_filter IS NULL OR s.state = p_state_filter)
        AND (p_city_filter IS NULL OR s.city = p_city_filter)
        AND (p_species_filter IS NULL OR s.species_served && p_species_filter)
        AND (p_lat IS NULL OR p_lng IS NULL OR p_radius_miles IS NULL OR ST_DWithin(s.location, ST_MakePoint(p_lng, p_lat)::geography, p_radius_miles * 1609.34))
      ORDER BY 
        CASE WHEN p_lat IS NOT NULL AND p_lng IS NOT NULL THEN (ST_Distance(s.location, ST_MakePoint(p_lng, p_lat)::geography)) ELSE NULL END,
        s.updated_at DESC
      LIMIT p_limit_count 
      OFFSET p_offset_count;
    END;
    $$;
  `;

    await client.query(query);
    console.log("RPC search_shelters created successfully.");
    await client.end();
}

setupRpc().catch(console.error);
