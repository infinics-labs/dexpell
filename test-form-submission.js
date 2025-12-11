// Test Form Submission Script
// Run this with: node test-form-submission.js

const testSubmission = async () => {
  console.log('🧪 Testing Form Submission...\n');

  const formData = {
    // Sender Information
    sender_name: 'Test User',
    sender_tc: '12345678901',
    sender_address: 'Test Address, Istanbul, Turkey',
    sender_contact: '5551234567',
    sender_phone_code: '+90',
    
    // Receiver Information
    receiver_name: 'Test Receiver',
    city_postal: 'Berlin 10115',
    receiver_address: 'Test Strasse 123, Berlin, Germany',
    destination: 'Germany',
    receiver_contact: '1234567890',
    receiver_phone_code: '+49',
    receiver_email: 'test@example.com',
    
    // Shipment Information
    content_description: 'General cargo - test items',
    content_value: '100',
    
    // User & Status
    user_type: 'guest',
    status: 'pending',
    
    // Price Card Information (simulating Germany 10kg quote)
    selected_carrier: 'UPS',
    destination_country: 'Germany',
    package_quantity: 1,
    total_weight: 10,
    
    // Basic shipping details
    chargeable_weight: 10,
    cargo_price: 63.89,
    service_type: 'UPS Express',
    
    // Quote object (as JSON)
    selected_quote: {
      carrier: 'UPS',
      totalPrice: 63.89,
      available: true,
      region: 1,
      serviceType: 'UPS Express',
      actualWeight: 10,
      volumetricWeight: 1.6,
      chargeableWeight: 10,
      calculationMethod: 'actual',
      isDimensionalWeight: false
    },
    
    price_card_timestamp: Date.now()
  };

  try {
    console.log('📤 Sending request to API...');
    console.log('URL: http://localhost:3000/api/admin/form-submissions');
    console.log('Method: POST');
    console.log('\n📦 Form Data:');
    console.log(JSON.stringify(formData, null, 2));
    console.log('\n⏳ Waiting for response...\n');

    const response = await fetch('http://localhost:3000/api/admin/form-submissions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ SUCCESS! Form submitted successfully!\n');
      console.log('📝 Response:');
      console.log(JSON.stringify(result, null, 2));
      console.log('\n🎉 Check your Supabase dashboard to see the new entry!');
      console.log('   Table: form_submissions');
      console.log('   ID:', result.submission?.id);
      
      if (result.submission) {
        console.log('\n📊 Saved Data:');
        console.log('   - Sender:', result.submission.sender_name);
        console.log('   - Receiver:', result.submission.receiver_name);
        console.log('   - Destination:', result.submission.destination);
        console.log('   - Carrier:', result.submission.selected_carrier);
        console.log('   - Chargeable Weight:', result.submission.chargeable_weight, 'kg');
        console.log('   - Price:', '$' + result.submission.cargo_price);
        console.log('   - Service Type:', result.submission.service_type);
        console.log('   - Full Quote (JSON):', JSON.stringify(result.submission.selected_quote));
      }
    } else {
      console.log('❌ ERROR! Form submission failed!\n');
      console.log('Status:', response.status);
      console.log('Error:', JSON.stringify(result, null, 2));
      
      if (result.error && result.error.includes('schema cache')) {
        console.log('\n⚠️  SCHEMA CACHE ISSUE DETECTED!');
        console.log('   Solution: Restart your Supabase project');
        console.log('   1. Go to Supabase Dashboard');
        console.log('   2. Settings → General');
        console.log('   3. Pause Project → Wait 10s → Resume Project');
        console.log('   4. Wait 1 minute and try again');
      }
    }
  } catch (error) {
    console.log('❌ NETWORK ERROR!\n');
    console.log('Error:', error.message);
    console.log('\nMake sure:');
    console.log('1. Server is running (npm run dev)');
    console.log('2. Server is accessible at http://localhost:3000');
  }
};

// Run the test
testSubmission();
