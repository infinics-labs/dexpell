import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { identifyCargoCategory } from '@/config/cargo-terminology';

// Carrier type definition
type Carrier = 'UPS' | 'DHL' | 'ARAMEX';

// Define the paths to CSV files for each carrier
const CARRIER_FILES = {
  UPS: {
    regions: path.join(process.cwd(), 'data', 'regions.csv'),
    pricing: path.join(process.cwd(), 'data', 'pricing.csv'),
  },
  DHL: {
    regions: path.join(process.cwd(), 'data', 'dhl-regions.csv'),
    pricing: path.join(process.cwd(), 'data', 'dhl-pricing.csv'),
  },
  ARAMEX: {
    countries: path.join(process.cwd(), 'data', 'aramex-countries.csv'),
    pricing: path.join(process.cwd(), 'data', 'aramex-pricing.csv'),
  },
};

// Cache for parsed data by carrier
const carrierCache = {
  UPS: { regionsData: null as Map<string, number> | null, pricingData: null as Map<string, number> | null, weightList: null as number[] | null },
  DHL: { regionsData: null as Map<string, number> | null, pricingData: null as Map<string, number> | null, weightList: null as number[] | null },
  ARAMEX: { countriesData: null as Set<string> | null, pricingData: null as Map<string, number> | null, weightList: null as number[] | null },
};

// Common country name translations (English to Turkish)
const countryTranslations: Record<string, string> = {
  austria: 'avusturya', belgium: 'belçika', bulgaria: 'bulgaristan',
  switzerland: 'isviçre', denmark: 'danimarka', spain: 'ispanya',
  france: 'fransa', 'united kingdom': 'birleşik krallık', uk: 'birleşik krallık',
  greece: 'yunanistan', ireland: 'irlanda', italy: 'italya',
  germany: 'almanya', netherlands: 'hollanda', 'czech republic': 'çekya',
  finland: 'finlandiya', hungary: 'macaristan', norway: 'norveç',
  poland: 'polonya', portugal: 'portekiz', romania: 'romanya',
  sweden: 'isveç', slovenia: 'slovenya', slovakia: 'slovakya',
  'united arab emirates': 'birleşik arap emirlikleri',
  uae: 'birleşik arap emirlikleri',
  'united states': 'amerika birleşik devletleri',
  usa: 'amerika birleşik devletleri', us: 'amerika birleşik devletleri',
  china: 'çin', japan: 'japonya', korea: 'kore', 'south korea': 'kore',
  canada: 'kanada', mexico: 'meksika', australia: 'avustralya',
  'new zealand': 'yeni zelanda', brazil: 'brezilya', argentina: 'arjantin',
};

// Top strategic shipping cities mapped to countries
const strategicCityMapping: Record<string, string> = {
  london: 'united kingdom', manchester: 'united kingdom', paris: 'france',
  berlin: 'germany', munich: 'germany', madrid: 'spain', barcelona: 'spain',
  rome: 'italy', milan: 'italy', amsterdam: 'netherlands', brussels: 'belgium',
  vienna: 'austria', zurich: 'switzerland', stockholm: 'sweden', oslo: 'norway',
  copenhagen: 'denmark', tokyo: 'japan', osaka: 'japan', beijing: 'china',
  shanghai: 'china', 'hong kong': 'hong kong', singapore: 'singapore',
  bangkok: 'thailand', jakarta: 'indonesia', manila: 'philippines',
  seoul: 'south korea', istanbul: 'turkey', ankara: 'turkey',
  dubai: 'united arab emirates', 'abu dhabi': 'united arab emirates',
  riyadh: 'saudi arabia', doha: 'qatar', 'tel aviv': 'israel',
  'new york': 'united states', 'los angeles': 'united states',
  chicago: 'united states', houston: 'united states', miami: 'united states',
  toronto: 'canada', montreal: 'canada', vancouver: 'canada',
  'mexico city': 'mexico', 'sao paulo': 'brazil', 'rio de janeiro': 'brazil',
  'buenos aires': 'argentina', santiago: 'chile', sydney: 'australia',
  melbourne: 'australia', auckland: 'new zealand', johannesburg: 'south africa',
  'cape town': 'south africa', cairo: 'egypt', lagos: 'nigeria', nairobi: 'kenya',
};

// Prohibited items and brands
const prohibitedCategories = [
  'liquid', 'liquids', 'food', 'foods', 'chemical', 'chemicals',
  'cosmetic', 'cosmetics', 'perfume', 'perfumes', 'deodorant', 'deodorants',
  'spray', 'sprays', 'beverage', 'beverages', 'drink', 'drinks',
  'medicine', 'medicines', 'pharmaceutical', 'pharmaceuticals', 'drug', 'drugs',
];

const prohibitedBrands = [
  'nike', 'adidas', 'timberland', 'puma', 'reebok', 'new balance',
  'under armour', 'converse', 'vans', 'fila', 'champion', 'the north face',
  'columbia', 'patagonia', 'gucci', 'prada', 'louis vuitton', 'chanel',
  'dior', 'versace', 'armani', 'burberry', 'balenciaga', 'rolex',
  'apple', 'samsung', 'sony', 'microsoft', 'dell', 'hp', 'lenovo',
  'asus', 'acer', 'lg', 'panasonic', 'canon', 'nikon',
];

// Helper functions
function detectCarrier(content: string): Carrier {
  const contentLower = content.toLowerCase();
  if (contentLower.includes('dhl')) return 'DHL';
  if (contentLower.includes('aramex')) return 'ARAMEX';
  if (contentLower.includes('ups')) return 'UPS';
  return 'UPS'; // Default
}

function normalizeCountryName(country: string): string {
  return country.toLowerCase().trim();
}

async function resolveDestination(destination: string): Promise<{
  country: string;
  isCity: boolean;
  cityName?: string;
  confidence: 'high' | 'medium' | 'low';
} | null> {
  const normalized = normalizeCountryName(destination);
  
  // Check strategic city mapping
  const cityCountry = strategicCityMapping[normalized];
  if (cityCountry) {
    return {
      country: cityCountry,
      isCity: true,
      cityName: destination,
      confidence: 'high'
    };
  }
  
  // Check country translations
  const translatedCountry = countryTranslations[normalized];
  if (translatedCountry) {
    return {
      country: translatedCountry,
      isCity: false,
      confidence: 'high'
    };
  }
  
  return null;
}

function isProhibitedItem(content: string): boolean {
  const lowerContent = content.toLowerCase();
  for (const category of prohibitedCategories) {
    if (lowerContent.includes(category)) return true;
  }
  for (const brand of prohibitedBrands) {
    if (lowerContent.includes(brand)) return true;
  }
  return false;
}

// Parse regions CSV for region-based carriers (UPS, DHL)
async function parseRegions(carrier: 'UPS' | 'DHL'): Promise<Map<string, number>> {
  if (carrierCache[carrier].regionsData) return carrierCache[carrier].regionsData;

  const regionsFile = CARRIER_FILES[carrier].regions;
  const content = await fs.readFile(regionsFile, 'utf-8');
  const lines = content.split('\n');
  const countryToRegion = new Map<string, number>();

  let currentRegion = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const regionMatch = trimmed.match(/^(\d+)\.BÖLGE:/);
    if (regionMatch) {
      currentRegion = Number.parseInt(regionMatch[1]);
      const countriesStr = trimmed.substring(trimmed.indexOf(':') + 1);
      const countries = countriesStr.split(/[,;]/).map((c) => c.trim()).filter((c) => c && c !== '');

      for (const country of countries) {
        if (country && !country.match(/^\d+$/)) {
          countryToRegion.set(normalizeCountryName(country), currentRegion);
        }
      }
    } else if (currentRegion > 0 && !trimmed.includes('BÖLGE YAPISI')) {
      const countries = trimmed.split(/[,;]/).map((c) => c.trim()).filter((c) => c && c !== '');
      for (const country of countries) {
        if (country && !country.match(/^\d+$/)) {
          countryToRegion.set(normalizeCountryName(country), currentRegion);
        }
      }
    }
  }

  carrierCache[carrier].regionsData = countryToRegion;
  return countryToRegion;
}

// Parse pricing CSV
async function parsePricing(carrier: 'UPS' | 'DHL'): Promise<{
  prices: Map<string, number>;
  weights: number[];
}> {
  if (carrierCache[carrier].pricingData && carrierCache[carrier].weightList)
    return { prices: carrierCache[carrier].pricingData, weights: carrierCache[carrier].weightList };

  const pricingFile = CARRIER_FILES[carrier].pricing;
  const content = await fs.readFile(pricingFile, 'utf-8');
  const lines = content.split('\n');
  const prices = new Map<string, number>();
  const weights: number[] = [];

  for (const line of lines) {
    const parts = line.split(';').map((p) => p.trim());

    if (!parts[0] || parts[0] === 'KGDS/BÖLGE') continue;

    if (parts[0] === '70 kg+') {
      for (let region = 1; region <= 9; region++) {
        const priceStr = parts[region];
        if (priceStr) {
          const price = Number.parseFloat(priceStr.replace(',', '.'));
          if (!Number.isNaN(price)) {
            prices.set(`70+-${region}`, price);
          }
        }
      }
      continue;
    }

    if (!parts[0].match(/^\d/)) continue;

    const weightStr = parts[0].replace(' kg', '').replace(',', '.');
    const weight = Number.parseFloat(weightStr);
    if (Number.isNaN(weight)) continue;

    weights.push(weight);

    for (let region = 1; region <= 9; region++) {
      const priceStr = parts[region];
      if (priceStr) {
        const price = Number.parseFloat(priceStr.replace(',', '.'));
        if (!Number.isNaN(price)) {
          prices.set(`${weight}-${region}`, price);
        }
      }
    }
  }

  carrierCache[carrier].pricingData = prices;
  carrierCache[carrier].weightList = weights.sort((a, b) => a - b);
  return { prices, weights };
}

// Find the closest weight in the pricing table
function findClosestWeight(
  targetWeight: number,
  weights: number[],
): { lower: number | null; upper: number | null } {
  if (targetWeight <= weights[0]) {
    return { lower: null, upper: weights[0] };
  }
  if (targetWeight >= weights[weights.length - 1]) {
    return { lower: weights[weights.length - 1], upper: null };
  }

  for (let i = 0; i < weights.length - 1; i++) {
    if (weights[i] <= targetWeight && targetWeight <= weights[i + 1]) {
      return { lower: weights[i], upper: weights[i + 1] };
    }
  }

  return { lower: null, upper: null };
}

// Get price with interpolation if needed
function getPrice(
  weight: number,
  region: number,
  prices: Map<string, number>,
  weights: number[],
): number | null {
  // Check if weight is above 70kg - use per-kg pricing
  if (weight > 70) {
    const perKgRate = prices.get(`70+-${region}`);
    if (perKgRate !== undefined) {
      return weight * perKgRate;
    }
  }

  // Check for exact match
  const exactPrice = prices.get(`${weight}-${region}`);
  if (exactPrice !== undefined) return exactPrice;

  // Find closest weights
  const { lower, upper } = findClosestWeight(weight, weights);

  if (!lower && upper) {
    return prices.get(`${upper}-${region}`) || null;
  }

  if (lower && !upper) {
    return prices.get(`${lower}-${region}`) || null;
  }

  if (lower && upper) {
    const lowerPrice = prices.get(`${lower}-${region}`);
    const upperPrice = prices.get(`${upper}-${region}`);

    if (lowerPrice !== undefined && upperPrice !== undefined) {
      const ratio = (weight - lower) / (upper - lower);
      return lowerPrice + (upperPrice - lowerPrice) * ratio;
    }
  }

  return null;
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
    // Detect the carrier from the content
    const carrier = detectCarrier(content);

    // First, check for cargo terminology recognition
    const terminologyResult = identifyCargoCategory(content);

    // Check if the cargo content is prohibited
    if (isProhibitedItem(content)) {
      return NextResponse.json({
        allowed: false,
        message:
          'We apologize, but we cannot ship this type of product. We do not accept liquids, food items, chemicals, cosmetics (including perfumes and deodorants), medicines, or branded products from companies like Nike, Adidas, Timberland, and other major brands. Please contact us if you have any questions about acceptable items.',
      });
    }

    // Handle recognized cargo terminology
    if (terminologyResult.category === 'GENERAL_CARGO') {
      if (!country && !weight && !length && !width && !height) {
        return NextResponse.json({
          allowed: true,
          contentApproved: true,
          terminologyRecognized: true,
          recognizedTerm: terminologyResult.matchedTerm,
          category: 'GENERAL_CARGO',
          message: `I understand you want to ship "${terminologyResult.matchedTerm}" (general cargo). This covers various non-prohibited products. Please provide the destination country and weight to calculate pricing.`,
        });
      }
    }

    // If only content is provided (content checking mode), return approval
    if (!country && !weight && !length && !width && !height) {
      return NextResponse.json({
        allowed: true,
        contentApproved: true,
        message: 'This item can be shipped. Please provide the destination country and weight to calculate pricing.',
      });
    }

    // If country is not provided but weight is
    if (!country) {
      return NextResponse.json({
        allowed: true,
        needsInfo: true,
        message: 'Please provide the destination country to calculate shipping prices.',
      });
    }

    // Resolve the destination country
    const destinationResolution = await resolveDestination(country);

    if (!destinationResolution) {
      return NextResponse.json({
        allowed: true,
        error: true,
        message: `Country or city "${country}" not found. Please check the country name and try again.`,
      });
    }

    const resolvedCountry = destinationResolution.country;
    const isCity = destinationResolution.isCity;
    const cityName = destinationResolution.cityName;

    // Calculate chargeable weight per box
    let chargeableWeightPerBox = weight || 0;

    if (length && width && height) {
      const volumetricWeight = (length * width * height) / 5000;

      if (weight) {
        chargeableWeightPerBox = Math.max(weight, volumetricWeight);
      } else {
        chargeableWeightPerBox = volumetricWeight;
      }
    }

    // Validate that we have either weight or dimensions
    if (!chargeableWeightPerBox || chargeableWeightPerBox === 0) {
      return NextResponse.json({
        allowed: true,
        needsInfo: true,
        message:
          'Please provide either the actual weight of the package or its dimensions (length, width, height in cm).',
      });
    }

    // Calculate total chargeable weight for all boxes and round up to next integer
    const totalChargeableWeight = Math.ceil(chargeableWeightPerBox * quantity);

    // Parse data files for the carrier and find pricing
    if (carrier !== 'UPS' && carrier !== 'DHL') {
      return NextResponse.json({
        allowed: true,
        error: true,
        message: 'This function only supports UPS and DHL carriers. For ARAMEX, please use the multi-carrier pricing function.',
      });
    }

    const countryToRegion = await parseRegions(carrier);
    const { prices, weights } = await parsePricing(carrier);

    // Find region for the country
    let region = countryToRegion.get(normalizeCountryName(resolvedCountry));

    if (!region) {
      const translatedCountry = countryTranslations[normalizeCountryName(resolvedCountry)];
      if (translatedCountry) {
        region = countryToRegion.get(translatedCountry);
      }
    }

    if (!region) {
      return NextResponse.json({
        allowed: true,
        error: true,
        message: `Country "${resolvedCountry}" not found in the ${carrier} shipping regions. Please check the country name and try again.`,
      });
    }

    // Get price for the total chargeable weight and region
    const price = getPrice(totalChargeableWeight, region, prices, weights);

    if (price === null) {
      return NextResponse.json({
        allowed: true,
        error: true,
        message: `Could not find pricing for ${totalChargeableWeight}kg to ${resolvedCountry} via ${carrier}.`,
      });
    }

    const totalPrice = Math.round(price * 100) / 100;

    // Calculate volumetric weight if dimensions provided
    const volumetricWeight =
      length && width && height
        ? (length * width * height) / 5000
        : undefined;

    return NextResponse.json({
      allowed: true,
      success: true,
      data: {
        country: resolvedCountry,
        city: isCity ? cityName : undefined,
        region,
        carrier,
        pricePerBox: Math.round((totalPrice / quantity) * 100) / 100,
        totalPrice: totalPrice,
        quantity: quantity,
        chargeableWeight: totalChargeableWeight,
        chargeableWeightPerBox: chargeableWeightPerBox,
        actualWeight: weight,
        volumetricWeight,
        length,
        width,
        height,
        content,
      },
    });
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
