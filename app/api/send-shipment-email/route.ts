import { NextRequest, NextResponse } from 'next/server';
import { resend, EMAIL_CONFIG, validateEmailConfig } from '@/lib/resend';
import { generateShipmentNotificationHTML } from '@/lib/email-templates/shipment-notification';

export async function POST(request: NextRequest) {
  try {
    // Validate email configuration
    if (!validateEmailConfig()) {
      return NextResponse.json(
        { 
          error: 'Email service not configured. Please set RESEND_API_KEY environment variable.',
          success: false 
        },
        { status: 500 }
      );
    }

    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      'sender_name', 'sender_tc', 'sender_address', 'sender_contact',
      'receiver_name', 'receiver_address', 'city_postal', 'destination',
      'receiver_contact', 'receiver_email', 'content_description',
      'submission_id', 'submitted_at'
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}`, success: false },
          { status: 400 }
        );
      }
    }

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
      chargeableWeight: body.chargeable_weight,
      destinationCountry: body.destination_country,
      submissionId: body.submission_id,
      submittedAt: body.submitted_at,
    });

    // Send email using Resend
    const emailResponse = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: EMAIL_CONFIG.to,
      subject: `🚚 New Shipment Request - ${body.sender_name} to ${body.destination}`,
      html: emailHTML,
      // Add reply-to if receiver email is provided
      replyTo: body.receiver_email,
    });

    console.log('✅ Email sent successfully:', emailResponse);

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      emailId: emailResponse.data?.id,
    });
  } catch (error) {
    console.error('❌ Error sending email:', error);
    
    // Return more detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { 
        error: 'Failed to send email',
        details: errorMessage,
        success: false 
      },
      { status: 500 }
    );
  }
}

