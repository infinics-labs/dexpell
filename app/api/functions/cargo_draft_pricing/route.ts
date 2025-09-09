import { NextResponse } from 'next/server';
import { calculateDraftPricing } from '@/lib/cargo-pricing-core';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  const content = searchParams.get('content') || '';
  const country = searchParams.get('country') || undefined;
  const weight = searchParams.get('weight') ? parseFloat(searchParams.get('weight')!) : undefined;
  const quantity = searchParams.get('quantity') ? parseInt(searchParams.get('quantity')!) : 1;
  const carrier = searchParams.get('carrier') as 'UPS' | 'DHL' | 'ARAMEX' | undefined;

  try {
    // Validate required parameters
    if (!country || !weight) {
      return NextResponse.json({
        allowed: true,
        needsInfo: true,
        message: 'Please provide both destination country and weight to calculate draft pricing.',
      });
    }

    // Call the draft pricing function
    const result = await calculateDraftPricing({
      content,
      country,
      weight,
      quantity,
      carrier,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Draft cargo pricing error:', error);
    return NextResponse.json(
      { 
        allowed: true,
        error: true,
        message: `Error calculating draft shipping price: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 }
    );
  }
}
