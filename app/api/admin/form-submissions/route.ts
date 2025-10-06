import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Check if Supabase is configured
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase not configured. Please set up your environment variables.' },
        { status: 500 }
      );
    }
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Calculate offset
    const offset = (page - 1) * pageSize;

    // Build query
    let query = supabaseAdmin
      .from('form_submissions')
      .select('*', { count: 'exact' });

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(`sender_name.ilike.%${search}%,receiver_name.ilike.%${search}%,id.ilike.%${search}%`);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    query = query.range(offset, offset + pageSize - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching form submissions:', error);
      return NextResponse.json(
        { error: 'Failed to fetch form submissions' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      submissions: data || [],
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize)
    });
  } catch (error) {
    console.error('Error in form submissions API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Create new form submission
export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      'sender_name', 'sender_tc', 'sender_address', 'sender_contact',
      'receiver_name', 'receiver_address', 'city_postal', 'destination',
      'receiver_contact', 'receiver_email', 'content_description'
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Insert form submission
    const { data, error } = await supabaseAdmin
      .from('form_submissions')
      .insert({
        sender_name: body.sender_name,
        sender_tc: body.sender_tc,
        sender_address: body.sender_address,
        sender_contact: body.sender_contact,
        sender_phone_code: body.sender_phone_code || null,
        receiver_name: body.receiver_name,
        receiver_address: body.receiver_address,
        city_postal: body.city_postal,
        destination: body.destination,
        receiver_contact: body.receiver_contact,
        receiver_phone_code: body.receiver_phone_code || null,
        receiver_email: body.receiver_email,
        content_description: body.content_description,
        content_value: body.content_value || null,
        user_type: body.user_type || 'guest',
        user_email: body.user_email || null,
        user_id: body.user_id || null,
        status: body.status || 'pending',
        // Price card information
        selected_carrier: body.selected_carrier || null,
        selected_quote: body.selected_quote || null,
        destination_country: body.destination_country || null,
        package_quantity: body.package_quantity || null,
        total_weight: body.total_weight || null,
        price_card_timestamp: body.price_card_timestamp || null,
        // Enhanced shipping details
        chargeable_weight: body.chargeable_weight || null,
        cargo_price: body.cargo_price || null,
        service_type: body.service_type || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating form submission:', error);
      return NextResponse.json(
        { error: 'Failed to create form submission' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      submission: data,
      message: 'Form submission created successfully'
    });
  } catch (error) {
    console.error('Error in create form submission API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update form submission status
export async function PATCH(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }
    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('form_submissions')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating form submission:', error);
      return NextResponse.json(
        { error: 'Failed to update form submission' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      submission: data
    });
  } catch (error) {
    console.error('Error in update API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
