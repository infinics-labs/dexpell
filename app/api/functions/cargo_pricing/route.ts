import { NextResponse } from 'next/server';
import { calculateUPSDHLPricing } from '@/lib/cargo-pricing-core';

export const maxDuration = 60;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  const content = searchParams.get('content') || '';
  const country = searchParams.get('country') || undefined;
  const weight = searchParams.get('weight') ? parseFloat(searchParams.get('weight')!) : undefined;
  const length = searchParams.get('length') ? parseFloat(searchParams.get('length')!) : undefined;
  const width = searchParams.get('width') ? parseFloat(searchParams.get('width')!) : undefined;
  const height = searchParams.get('height') ? parseFloat(searchParams.get('height')!) : undefined;
  const quantity = searchParams.get('quantity') ? parseInt(searchParams.get('quantity')!) : 1;

  try {
    // If no country is provided, return need info
    if (!country) {
      return NextResponse.json({
        allowed: true,
        needsInfo: true,
        message: 'Please provide the destination country to calculate shipping prices.',
      });
    }

    // Call the core pricing function
    const result = await calculateUPSDHLPricing({
      content,
      country,
      weight,
      length,
      width,
      height,
      quantity,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Cargo pricing error:', error);
    return NextResponse.json(
      { 
        allowed: true,
        error: true,
        message: `Error calculating shipping price: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 }
    );
  }
}