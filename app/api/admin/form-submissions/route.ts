import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { resend, EMAIL_CONFIG, validateEmailConfig } from '@/lib/resend';
import { generateShipmentNotificationHTML } from '@/lib/email-templates/shipment-notification';

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
    console.log('🚀 POST /api/admin/form-submissions called');
    console.log('🔍 Supabase Admin exists:', !!supabaseAdmin);
    console.log('🔍 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    
    if (!supabaseAdmin) {
      console.error('❌ Supabase Admin not configured!');
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    console.log('📦 Received form data for:', body.sender_name, '→', body.destination);

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
    console.log('🔍 DEBUG: About to insert into Supabase...');
    console.log('🔍 DEBUG: Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('🔍 DEBUG: Has Service Key:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
    console.log('🔍 DEBUG: SupabaseAdmin type:', typeof supabaseAdmin);
    console.log('🔍 DEBUG: Inserting data for sender:', body.sender_name);
    
    let data, error;
    try {
      const result = await supabaseAdmin
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
        selected_quote: body.selected_quote || null, // Weight details stored here as JSON
        destination_country: body.destination_country || null,
        package_quantity: body.package_quantity || null,
        total_weight: body.total_weight || null,
        price_card_timestamp: body.price_card_timestamp || null,
        // Basic shipping details (without new weight columns to avoid schema cache issue)
        chargeable_weight: body.chargeable_weight || null,
        cargo_price: body.cargo_price || null,
        service_type: body.service_type || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
      
      data = result.data;
      error = result.error;
      
      console.log('🔍 DEBUG: Supabase insert completed');
      console.log('🔍 DEBUG: Has data:', !!data);
      console.log('🔍 DEBUG: Has error:', !!error);
    } catch (insertError: any) {
      console.error('❌ EXCEPTION during Supabase insert:', insertError);
      console.error('❌ EXCEPTION message:', insertError.message);
      console.error('❌ EXCEPTION stack:', insertError.stack);
      throw insertError;
    }

    if (error) {
      console.error('❌ ERROR creating form submission:', error);
      console.error('❌ ERROR details:', JSON.stringify(error, null, 2));
      console.error('❌ ERROR message:', error.message);
      console.error('❌ ERROR code:', error.code);
      return NextResponse.json(
        { error: 'Failed to create form submission', details: error.message },
        { status: 500 }
      );
    }
    
    console.log('✅ SUCCESS: Form submission created:', data.id);

    // Send email notification directly using Resend (don't block the response)
    // We do this after the database insert succeeds
    // This is completely optional - form will work even if email fails
    if (process.env.RESEND_API_KEY) {
      try {
        // Check if email is configured
        if (validateEmailConfig()) {
          console.log('📧 Preparing email with form data:');
          console.log('   Sender:', body.sender_name);
          console.log('   Receiver:', body.receiver_name);
          console.log('   Destination:', body.destination);
          console.log('   Carrier:', body.selected_carrier || 'Not selected');
          console.log('   Price:', body.cargo_price || 'Not available');
          console.log('   Submission ID:', data.id);
          
          // Generate email HTML
          const emailHTML = generateShipmentNotificationHTML({
            senderName: body.sender_name,
            senderTC: body.sender_tc,
            senderAddress: body.sender_address,
            senderContact: body.sender_contact,
            senderPhoneCode: body.sender_phone_code,
            receiverName: body.receiver_name,
            receiverAddress: body.receiver_address,
            cityPostal: body.city_postal,
            destination: body.destination,
            receiverContact: body.receiver_contact,
            receiverPhoneCode: body.receiver_phone_code,
            receiverEmail: body.receiver_email,
            contentDescription: body.content_description,
            contentValue: body.content_value,
            selectedCarrier: body.selected_carrier,
            cargoPrice: body.cargo_price,
            serviceType: body.service_type,
            packageQuantity: body.package_quantity,
            totalWeight: body.total_weight,
            actualWeight: body.actual_weight,
            volumetricWeight: body.volumetric_weight,
            chargeableWeight: body.chargeable_weight,
            calculationMethod: body.calculation_method,
            destinationCountry: body.destination_country,
            region: body.region,
            submissionId: data.id,
            submittedAt: data.created_at,
          });

          // Send email using Resend
          console.log('📤 Sending email to:', EMAIL_CONFIG.to);
          console.log('📤 From:', EMAIL_CONFIG.from);
          console.log('📤 Subject:', `🚚 New Shipment Request - ${body.sender_name} to ${body.destination}`);
          
          const emailResponse = await resend.emails.send({
            from: EMAIL_CONFIG.from,
            to: EMAIL_CONFIG.to,
            subject: `🚚 New Shipment Request - ${body.sender_name} to ${body.destination}`,
            html: emailHTML,
            replyTo: body.receiver_email,
          });

          console.log('✅ Email notification sent successfully!');
          console.log('📧 Email ID:', emailResponse.data?.id);
          console.log('📬 Email sent to:', EMAIL_CONFIG.to);
        }
      } catch (emailError) {
        // Log the error but don't fail the form submission
        console.error('❌ Error sending email notification:', emailError);
      }
    } else {
      console.log('ℹ️  Email notifications disabled (RESEND_API_KEY not configured)');
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
