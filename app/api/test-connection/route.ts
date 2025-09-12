import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Test the connection by trying to fetch a few orders
    const { data, error, count } = await supabase
      .from('form_submissions')
      .select('*', { count: 'exact', head: true })
      .limit(1);

    if (error) {
      return NextResponse.json(
        { 
          success: false, 
          error: error.message,
          details: 'Failed to connect to Supabase'
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Supabase connection successful!',
      totalOrders: count,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Connection failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
