import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Call the single carrier pricing API
async function callCargoPricing(params: {
  content: string;
  country?: string;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  quantity?: number;
}) {
  const searchParams = new URLSearchParams();
  searchParams.append('content', params.content);
  if (params.country) searchParams.append('country', params.country);
  if (params.weight !== undefined) searchParams.append('weight', params.weight.toString());
  if (params.length !== undefined) searchParams.append('length', params.length.toString());
  if (params.width !== undefined) searchParams.append('width', params.width.toString());
  if (params.height !== undefined) searchParams.append('height', params.height.toString());
  if (params.quantity !== undefined) searchParams.append('quantity', params.quantity.toString());

  const response = await fetch(`http://localhost:3000/api/functions/cargo_pricing?${searchParams.toString()}`);
  if (!response.ok) throw new Error(`API Error: ${response.status}`);
  return await response.json();
}

// Parse ARAMEX countries CSV
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
  
  const normalizedCountry = country.toLowerCase();
  
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

  try {
    // If only content is provided, delegate to single carrier function
    if (!country && !weight && !length && !width && !height) {
      return NextResponse.json(await callCargoPricing({ content, quantity }));
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

        // Calculate ARAMEX pricing
        try {
          // Calculate chargeable weight
          let chargeableWeightPerBox = weight || 0;
          if (length && width && height) {
            const volumetricWeight = (length * width * height) / 5000;
            chargeableWeightPerBox = weight ? Math.max(weight, volumetricWeight) : volumetricWeight;
          }

          if (!chargeableWeightPerBox || chargeableWeightPerBox === 0) {
            continue;
          }

          const totalChargeableWeight = Math.ceil(chargeableWeightPerBox * quantity);
          
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
            });
          }
        } catch (error) {
          console.error('ARAMEX pricing error:', error);
        }
      } else {
        // Get UPS/DHL pricing
        const result = await callCargoPricing({
          content,
          country,
          weight,
          length,
          width,
          height,
          quantity,
        });

        if (result.success && result.data) {
          // Override carrier if specific one was requested
          const actualCarrier = carrier as 'UPS' | 'DHL';
          result.data.carrier = actualCarrier;
          
          quotes.push({
            carrier: actualCarrier,
            available: true,
            pricePerBox: result.data.pricePerBox,
            totalPrice: result.data.totalPrice,
            serviceType: `${actualCarrier} Express`,
            region: result.data.region,
          });
        } else if (result.error && result.message?.includes('not found in the')) {
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
      return NextResponse.json(await callCargoPricing({ content, country, weight, length, width, height, quantity }));
    }

    // Calculate volumetric weight for display
    const volumetricWeight = length && width && height ? (length * width * height) / 5000 : undefined;
    const chargeableWeightPerBox = weight && volumetricWeight ? Math.max(weight, volumetricWeight) : (weight || volumetricWeight || 0);
    const totalChargeableWeight = Math.ceil(chargeableWeightPerBox * quantity);

    return NextResponse.json({
      allowed: true,
      success: true,
      multiCarrier: true,
      data: {
        country,
        quotes,
        quantity,
        chargeableWeight: totalChargeableWeight,
        chargeableWeightPerBox,
        actualWeight: weight,
        volumetricWeight,
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
