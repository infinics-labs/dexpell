-- Run this SQL query in your Supabase SQL Editor to get your table structure
-- Go to Supabase Dashboard → SQL Editor → New query
-- Copy and paste this query, then run it

SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default,
    ordinal_position
FROM 
    information_schema.columns 
WHERE 
    table_schema = 'public' 
    AND table_name NOT LIKE 'pg_%'
    AND table_name NOT IN ('spatial_ref_sys', 'geography_columns', 'geometry_columns')
ORDER BY 
    table_name, 
    ordinal_position;

-- Also run this to see your table names and row counts
SELECT 
    schemaname,
    tablename,
    n_tup_ins as total_rows
FROM 
    pg_stat_user_tables 
WHERE 
    schemaname = 'public'
ORDER BY 
    tablename;
