import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }

    // Try to get all tables in the public schema
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_schema_tables')
      .catch(() => ({ data: null, error: 'RPC not available' }));

    // Alternative method: try common table names
    const possibleTableNames = [
      'orders',
      'order',
      'shipments', 
      'shipping_orders',
      'cargo_orders',
      'submissions',
      'form_submissions'
    ];

    const tableResults = {};
    
    for (const tableName of possibleTableNames) {
      try {
        const { data, error, count } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true })
          .limit(1);
          
        if (!error) {
          tableResults[tableName] = {
            exists: true,
            count: count || 0,
            error: null
          };
        } else {
          tableResults[tableName] = {
            exists: false,
            count: 0,
            error: error.message
          };
        }
      } catch (err) {
        tableResults[tableName] = {
          exists: false,
          count: 0,
          error: err instanceof Error ? err.message : 'Unknown error'
        };
      }
    }

    return NextResponse.json({
      success: true,
      possibleTables: tableResults,
      tables: tables || 'Unable to fetch schema',
      tablesError: tablesError?.message || null
    });

  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
