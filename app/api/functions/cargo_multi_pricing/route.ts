import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Import the shared pricing logic
import { calculateUPSDHLPricing, calculateChargeableWeight, calculateTotalChargeableWeight } from '@/lib/cargo-pricing-core';

// Parse ARAMEX countries CSV
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function parseAramexCountries(): Promise<Set<string>> {
  const countriesFile = path.join(process.cwd(), 'data', 'aramex-countries.csv');
  const content = await fs.readFile(countriesFile, 'utf-8');
  const lines = content.split('\n');
  const supportedCountries = new Set<string>();

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.includes('ARAMEX SUPPORTED COUNTRIES')) continue;
    
    const country = trimmed.replace(/;+/g, '').trim();
    if (country) {
      supportedCountries.add(country.toLowerCase());
    }
  }

  return supportedCountries;
}

// Parse ARAMEX pricing CSV
async function parseAramexPricing(): Promise<{
  prices: Map<string, number>;
  weights: number[];
  countries: string[];
}> {
  const pricingFile = path.join(process.cwd(), 'data', 'aramex-pricing.csv');
  const content = await fs.readFile(pricingFile, 'utf-8');
  const lines = content.split('\n');
  const prices = new Map<string, number>();
  const weights: number[] = [];
  const countries = ['BAHRAIN', 'JORDAN', 'KUWAIT', 'QATAR', 'UAE', 'SAUDI ARABIA', 'OMAN', 'LEBANON', 'EGYPT'];

  for (const line of lines) {
    const parts = line.split(';').map((p) => p.trim());

    if (!parts[0] || parts[0] === 'WEIGHT/COUNTRY' || !parts[0].match(/^\d/))
      continue;

    const weightStr = parts[0].replace(' kg', '').replace(',', '.');
    const weight = Number.parseFloat(weightStr);
    if (Number.isNaN(weight)) continue;

    weights.push(weight);

    for (let countryIndex = 0; countryIndex < countries.length; countryIndex++) {
      const priceStr = parts[countryIndex + 1];
      if (priceStr) {
        const price = Number.parseFloat(priceStr.replace(',', '.'));
        if (!Number.isNaN(price)) {
          prices.set(`${weight}-${countries[countryIndex]}`, price);
        }
      }
    }
  }

  return { prices, weights: weights.sort((a, b) => a - b), countries };
}

// Get ARAMEX price with interpolation
function getAramexPrice(
  weight: number,
  country: string,
  prices: Map<string, number>,
  weights: number[],
): number | null {
  // Check for exact match
  const exactPrice = prices.get(`${weight}-${country}`);
  if (exactPrice !== undefined) return exactPrice;

  // Find closest weights
  let lower: number | null = null;
  let upper: number | null = null;

  if (weight <= weights[0]) {
    upper = weights[0];
  } else if (weight >= weights[weights.length - 1]) {
    lower = weights[weights.length - 1];
  } else {
    for (let i = 0; i < weights.length - 1; i++) {
      if (weights[i] <= weight && weight <= weights[i + 1]) {
        lower = weights[i];
        upper = weights[i + 1];
        break;
      }
    }
  }

  if (!lower && upper) {
    return prices.get(`${upper}-${country}`) || null;
  }

  if (lower && !upper) {
    return prices.get(`${lower}-${country}`) || null;
  }

  if (lower && upper) {
    const lowerPrice = prices.get(`${lower}-${country}`);
    const upperPrice = prices.get(`${upper}-${country}`);

    if (lowerPrice !== undefined && upperPrice !== undefined) {
      const ratio = (weight - lower) / (upper - lower);
      return lowerPrice + (upperPrice - lowerPrice) * ratio;
    }
  }

  return null;
}

// Check if destination is supported by ARAMEX
async function isAramexSupported(country: string): Promise<{ supported: boolean; countryKey?: string }> {
  const { countries: pricingCountries } = await parseAramexPricing();
  
  // First try to resolve city to country, then normalize
  const { resolveCityToCountry, normalizeCountryName } = await import('@/lib/cargo-pricing-core');
  const resolvedCountry = resolveCityToCountry(country);
  const normalizedCountry = normalizeCountryName(resolvedCountry).toLowerCase();
  
  // Check pricing countries first (these are the main supported ones)
  for (const pricingCountry of pricingCountries) {
    if (normalizedCountry.includes(pricingCountry.toLowerCase()) ||
        pricingCountry.toLowerCase().includes(normalizedCountry)) {
      return { supported: true, countryKey: pricingCountry };
    }
  }
  
  // Special mappings for ARAMEX countries
  const aramexMappings: Record<string, string> = {
    'united arab emirates': 'UAE',
    'birleşik arap emirlikleri': 'UAE',
    'uae': 'UAE',
    'dubai': 'UAE',
    'abu dhabi': 'UAE',
    'sharjah': 'UAE',
    'emirates': 'UAE',
    'saudi arabia': 'SAUDI ARABIA',
    'suudi arabistan': 'SAUDI ARABIA',
    'lebanon': 'LEBANON',
    'lübnan': 'LEBANON',
    'egypt': 'EGYPT',
    'mısır': 'EGYPT',
    'jordan': 'JORDAN',
    'ürdün': 'JORDAN',
    'kuwait': 'KUWAIT',
    'kuveyt': 'KUWAIT',
    'qatar': 'QATAR',
    'katar': 'QATAR',
    'bahrain': 'BAHRAIN',
    'bahreyn': 'BAHRAIN',
    'oman': 'OMAN',
    'umman': 'OMAN',
  };
  
  const mappedCountry = aramexMappings[normalizedCountry];
  if (mappedCountry) {
    return { supported: true, countryKey: mappedCountry };
  }
  
  return { supported: false };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  const content = searchParams.get('content') || '';
  const country = searchParams.get('country') || undefined;
  const weight = searchParams.get('weight') ? parseFloat(searchParams.get('weight')!) : undefined;
  const length = searchParams.get('length') ? parseFloat(searchParams.get('length')!) : undefined;
  const width = searchParams.get('width') ? parseFloat(searchParams.get('width')!) : undefined;
  const height = searchParams.get('height') ? parseFloat(searchParams.get('height')!) : undefined;
  const quantity = searchParams.get('quantity') ? parseInt(searchParams.get('quantity')!) : 1;
  const language = searchParams.get('language') as 'en' | 'tr' || 'en';

  // Detect language from content if not explicitly provided
  const detectedLanguage = language === 'en' && content ? 
    (content.match(/\b(kargo|gönderi|kutu|kilogram|boyut|fiyat|türkiye|almanya|gönderim|teslim|ücret|genel|tahmini)\b/i) ? 'tr' : 'en') : 
    language;

  try {
    // If only content is provided, just return content check result
    if (!country && !weight && !length && !width && !height) {
      // Simple content check without pricing
      if (content.toLowerCase().includes('perfume') || content.toLowerCase().includes('liquid')) {
        return NextResponse.json({
          allowed: false,
          message: 'We apologize, but we cannot ship this type of product. We do not accept liquids, food items, chemicals, cosmetics (including perfumes and deodorants), medicines, or branded products.',
        });
      }
      return NextResponse.json({
        allowed: true,
        needsInfo: true,
        message: 'Please provide the destination country to calculate shipping prices.',
      });
    }

    // If country is not provided, return need info
    if (!country) {
      return NextResponse.json({
        allowed: true,
        needsInfo: true,
        message: 'Please provide the destination country to calculate shipping prices.',
      });
    }

    // Check which carrier is requested in content (if any)
    const contentLower = content.toLowerCase();
    const requestedCarrier = contentLower.includes('dhl') ? 'DHL' :
                            contentLower.includes('aramex') ? 'ARAMEX' :
                            contentLower.includes('ups') ? 'UPS' : null;

    // Get quotes from all carriers (or just the requested one)
    const quotes = [];
    const carriers = requestedCarrier ? [requestedCarrier] : ['UPS', 'DHL', 'ARAMEX'];

    for (const carrier of carriers) {
      if (carrier === 'ARAMEX') {
        // Check if ARAMEX supports this country
        const { supported, countryKey } = await isAramexSupported(country);
        
        if (!supported) {
          quotes.push({
            carrier: 'ARAMEX',
            available: false,
            totalPrice: 0,
            serviceType: 'ARAMEX Express',
          });
          continue;
        }

        // Calculate ARAMEX pricing with enhanced dimensional analysis
        try {
          // Calculate chargeable weight using enhanced logic
          const weightCalc = calculateChargeableWeight(weight, length, width, height);

          if (!weightCalc.chargeableWeight || weightCalc.chargeableWeight === 0) {
            continue;
          }

          // Calculate total chargeable weight and round UP the total
          const totalChargeableWeight = calculateTotalChargeableWeight(weightCalc.chargeableWeight, quantity);
          
          const { prices, weights } = await parseAramexPricing();
          const price = getAramexPrice(totalChargeableWeight, countryKey!, prices, weights);

          if (price) {
            quotes.push({
              carrier: 'ARAMEX',
              available: true,
              pricePerBox: Math.round((price / quantity) * 100) / 100,
              totalPrice: Math.round(price * 100) / 100,
              serviceType: 'ARAMEX Express',
              region: countryKey,
              // Enhanced dimensional data
              actualWeight: weight,
              volumetricWeight: Math.round(weightCalc.volumetricWeight * 100) / 100,
              chargeableWeight: Math.round(totalChargeableWeight * 100) / 100,
              chargeableWeightPerBox: Math.round(weightCalc.chargeableWeight * 100) / 100,
              calculationMethod: weightCalc.calculationMethod,
              isDimensionalWeight: weightCalc.isDimensionalWeight,
              dimensions: weightCalc.dimensions,
            });
          }
        } catch (error) {
          console.error('ARAMEX pricing error:', error);
        }
      } else {
        // Get UPS/DHL pricing using shared core logic
        try {
          const result = await calculateUPSDHLPricing({
            content,
            country,
            weight,
            length,
            width,
            height,
            quantity,
            carrier: carrier as 'UPS' | 'DHL',
            language: detectedLanguage,
          });

          if (result.success && result.data) {
            quotes.push({
              carrier: result.data.carrier,
              available: true,
              pricePerBox: result.data.pricePerBox,
              totalPrice: result.data.totalPrice,
              serviceType: result.data.serviceType,
              region: result.data.region,
              // Enhanced dimensional data
              actualWeight: result.data.actualWeight,
              volumetricWeight: result.data.volumetricWeight,
              chargeableWeight: result.data.chargeableWeight,
              chargeableWeightPerBox: result.data.chargeableWeightPerBox,
              calculationMethod: result.data.volumetricWeight && result.data.actualWeight ? 
                (result.data.volumetricWeight > result.data.actualWeight ? 'volumetric' : 'actual') : 'actual',
              isDimensionalWeight: result.data.volumetricWeight ? result.data.volumetricWeight > (result.data.actualWeight || 0) : false,
              dimensions: result.data.length && result.data.width && result.data.height ? 
                `${result.data.length}×${result.data.width}×${result.data.height}cm` : undefined,
            });
          } else if (result.skipCarrier) {
            // Skip this carrier silently - don't add to quotes
            continue;
          } else if (result.error && result.message?.includes('not found in the')) {
            quotes.push({
              carrier: carrier as 'UPS' | 'DHL',
              available: false,
              totalPrice: 0,
              serviceType: `${carrier} Express`,
            });
          }
        } catch (error) {
          console.error(`${carrier} pricing error:`, error);
          quotes.push({
            carrier: carrier as 'UPS' | 'DHL',
            available: false,
            totalPrice: 0,
            serviceType: `${carrier} Express`,
          });
        }
      }
    }

    // If no quotes were obtained, return the base result
    if (quotes.length === 0) {
      const fallbackResult = await calculateUPSDHLPricing({ content, country, weight, length, width, height, quantity, language: detectedLanguage });
      return NextResponse.json(fallbackResult);
    }

    // Calculate weights using shared logic
    const weightCalc = calculateChargeableWeight(weight, length, width, height);
    const totalChargeableWeight = calculateTotalChargeableWeight(weightCalc.chargeableWeight, quantity);

    return NextResponse.json({
      allowed: true,
      success: true,
      multiCarrier: true,
      data: {
        country,
        quotes,
        quantity,
        chargeableWeight: totalChargeableWeight,
        chargeableWeightPerBox: weightCalc.chargeableWeight,
        actualWeight: weight,
        volumetricWeight: weightCalc.volumetricWeight,
        length,
        width,
        height,
        content,
      },
    });
  } catch (error) {
    console.error('Multi-carrier pricing error:', error);
    return NextResponse.json(
      { 
        allowed: true,
        error: true,
        message: `Error calculating multi-carrier pricing: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 }
    );
  }
}
