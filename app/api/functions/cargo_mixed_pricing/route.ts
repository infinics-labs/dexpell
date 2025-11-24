import { NextResponse } from 'next/server';
import { 
  calculateMixedBoxes, 
  calculateMixedBoxPricing, 
  isAramexSupported, 
  parseAramexPricing, 
  getAramexPrice,
  BoxDetails 
} from '@/lib/cargo-pricing-core';

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { content, country, boxes, language } = body;

    // Detect language from content if not explicitly provided
    const detectedLanguage = language || (content && content.match(/\b(kargo|gönderi|kutu|kilogram|boyut|fiyat|türkiye|almanya|gönderim|teslim|ücret|genel|tahmini)\b/i) ? 'tr' : 'en');

    // Validate required fields
    if (!content) {
      return NextResponse.json({
        allowed: true,
        error: true,
        message: 'Content description is required.',
      });
    }

    if (!country) {
      return NextResponse.json({
        allowed: true,
        error: true,
        message: 'Destination country is required.',
      });
    }

    if (!boxes || !Array.isArray(boxes) || boxes.length === 0) {
      return NextResponse.json({
        allowed: true,
        error: true,
        message: 'Boxes array is required with at least one box.',
      });
    }

    // Validate each box
    for (let i = 0; i < boxes.length; i++) {
      const box = boxes[i];
      if (!box.weight || box.weight <= 0) {
        return NextResponse.json({
          allowed: true,
          error: true,
          message: `Box ${i + 1}: Weight is required and must be greater than 0.`,
        });
      }
      if (!box.length || !box.width || !box.height || box.length <= 0 || box.width <= 0 || box.height <= 0) {
        return NextResponse.json({
          allowed: true,
          error: true,
          message: `Box ${i + 1}: All dimensions (length, width, height) are required and must be greater than 0.`,
        });
      }
    }

    // Calculate mixed box analysis
    const mixedCalculation = calculateMixedBoxes(boxes as BoxDetails[]);
    const quotes = [];

    // UPS Pricing
    try {
      const upsResult = await calculateMixedBoxPricing({
        content,
        country,
        boxes: boxes as BoxDetails[],
        carrier: 'UPS',
        language: detectedLanguage
      });
      
      if (upsResult.allowed && upsResult.success && upsResult.data) {
        quotes.push({
          carrier: 'UPS',
          available: true,
          totalPrice: upsResult.data.totalPrice,
          serviceType: upsResult.data.serviceType,
          region: upsResult.data.region,
          chargeableWeight: upsResult.data.chargeableWeight,
        });
      } else if (upsResult.skipCarrier) {
        // Skip UPS silently - don't add to quotes
      } else {
        quotes.push({
          carrier: 'UPS',
          available: false,
          totalPrice: 0,
          serviceType: 'UPS Express',
          message: upsResult.message || 'Not available'
        });
      }
    } catch (error) {
      console.error('UPS pricing error:', error);
      quotes.push({
        carrier: 'UPS',
        available: false,
        totalPrice: 0,
        serviceType: 'UPS Express',
        message: 'Calculation error'
      });
    }

    // DHL Pricing  
    try {
      const dhlResult = await calculateMixedBoxPricing({
        content,
        country,
        boxes: boxes as BoxDetails[],
        carrier: 'DHL',
        language: detectedLanguage
      });
      
      if (dhlResult.allowed && dhlResult.success && dhlResult.data) {
        quotes.push({
          carrier: 'DHL',
          available: true,
          totalPrice: dhlResult.data.totalPrice,
          serviceType: dhlResult.data.serviceType,
          region: dhlResult.data.region,
          chargeableWeight: dhlResult.data.chargeableWeight,
        });
      } else if (dhlResult.skipCarrier) {
        // Skip DHL silently - don't add to quotes
      } else {
        quotes.push({
          carrier: 'DHL',
          available: false,
          totalPrice: 0,
          serviceType: 'DHL Express',
          message: dhlResult.message || 'Not available'
        });
      }
    } catch (error) {
      console.error('DHL pricing error:', error);
      quotes.push({
        carrier: 'DHL',
        available: false,
        totalPrice: 0,
        serviceType: 'DHL Express',
        message: 'Calculation error'
      });
    }

    // ARAMEX Pricing
    try {
      const { supported, countryKey } = await isAramexSupported(country);
      
      if (!supported) {
        quotes.push({
          carrier: 'ARAMEX',
          available: false,
          totalPrice: 0,
          serviceType: 'ARAMEX Express',
          message: 'Country not supported'
        });
      } else {
        const { prices, weights } = await parseAramexPricing();
        const price = getAramexPrice(mixedCalculation.totalRoundedWeight, countryKey!, prices, weights);
        
        if (price) {
          quotes.push({
            carrier: 'ARAMEX',
            available: true,
            totalPrice: Math.round(price * 100) / 100,
            serviceType: 'ARAMEX Express',
            region: countryKey,
            chargeableWeight: mixedCalculation.totalRoundedWeight,
          });
        } else {
          quotes.push({
            carrier: 'ARAMEX',
            available: false,
            totalPrice: 0,
            serviceType: 'ARAMEX Express',
            message: 'Pricing not available'
          });
        }
      }
    } catch (error) {
      console.error('ARAMEX pricing error:', error);
      quotes.push({
        carrier: 'ARAMEX',
        available: false,
        totalPrice: 0,
        serviceType: 'ARAMEX Express',
        message: 'Calculation error'
      });
    }

    const result = {
      allowed: true,
      success: true,
      multiCarrier: true,
      scenario: 'mixed_boxes',
      data: {
        country,
        quotes,
        mixedBoxCalculation: mixedCalculation,
        boxCalculations: mixedCalculation.boxCalculations,
        dimensionalAnalysis: mixedCalculation.dimensionalAnalysis,
        summary: mixedCalculation.summary,
        content,
      },
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Mixed box pricing error:', error);
    return NextResponse.json({
      allowed: true,
      error: true,
      message: `Error calculating mixed box pricing: ${error instanceof Error ? error.message : String(error)}`,
    });
  }
}

export async function GET() {
  // For backward compatibility, redirect GET requests to the original endpoint
  return NextResponse.json({
    allowed: true,
    error: true,
    message: 'Mixed box pricing requires POST request with box details array. Use /api/functions/cargo_multi_pricing for single box type shipments.',
  });
}
