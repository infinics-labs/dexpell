import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Check if Supabase is properly configured
    if (!supabase) {
      console.error('Supabase client not initialized - check environment variables');
      return NextResponse.json(
        { 
          error: 'Database not configured. Please check environment variables.',
          details: 'NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required'
        },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');
    const searchTerm = searchParams.get('search') || '';
    const statusFilter = searchParams.get('status') || 'all';

    let query = supabase
      .from('form_submissions')
      .select('*', { count: 'exact' });

    // Apply search filter
    if (searchTerm) {
      query = query.or(`sender_name.ilike.%${searchTerm}%,receiver_name.ilike.%${searchTerm}%,destination.ilike.%${searchTerm}%,sender_tc.ilike.%${searchTerm}%,id.ilike.%${searchTerm}%`);
    }

    // Apply status filter
    if (statusFilter && statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    // Apply pagination and ordering
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    
    query = query
      .range(from, to)
      .order('created_at', { ascending: false });

    const { data: orders, error, count } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      orders: orders || [],
      total: count || 0,
      totalPages: Math.ceil((count || 0) / pageSize),
      currentPage: page
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Check if Supabase is properly configured
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json(
        { error: 'Order ID and status are required' },
        { status: 400 }
      );
    }

    const { data: updatedOrder, error } = await supabase
      .from('form_submissions')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to update order' },
        { status: 500 }
      );
    }

    return NextResponse.json({ order: updatedOrder });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
