import fs from 'fs/promises';
import path from 'path';

// Simple carrier detection function
function detectCarrier(content: string): 'UPS' | 'DHL' | 'ARAMEX' {
  const lowerContent = content.toLowerCase();
  if (lowerContent.includes('dhl')) return 'DHL';
  if (lowerContent.includes('aramex')) return 'ARAMEX';
  return 'UPS'; // Default to UPS
}

// Simple cargo category identification (not currently used but included for compatibility)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function identifyCargoCategory(content: string) {
  const lowerContent = content.toLowerCase();
  if (lowerContent.includes('general') || lowerContent.includes('fak')) {
    return { category: 'GENERAL_CARGO' };
  }
  return { category: 'UNKNOWN' };
}

// Normalize country name by removing special characters and converting to lowercase
export function normalizeCountryName(country: string): string {
  return country.toLowerCase().trim().replace(/[^a-z\s]/g, '').replace(/\s+/g, ' ');
}

// Common country name translations (English to Turkish)
const countryTranslations: Record<string, string> = {
  'germany': 'almanya',
  'france': 'fransa',
  'italy': 'italya',
  'spain': 'ispanya',
  'united kingdom': 'birlesik krallik',
  'uk': 'birlesik krallik',
  'england': 'ingiltere',
  'netherlands': 'hollanda',
  'belgium': 'belcika',
  'austria': 'avusturya',
  'switzerland': 'isvicre',
  'denmark': 'danimarka',
  'sweden': 'isvec',
  'norway': 'norvec',
  'finland': 'finlandiya',
  'poland': 'polonya',
  'czech republic': 'cek cumhuriyeti',
  'hungary': 'macaristan',
  'romania': 'romanya',
  'bulgaria': 'bulgaristan',
  'greece': 'yunanistan',
  'portugal': 'portekiz',
  'ireland': 'irlanda',
  'croatia': 'hirvatistan',
  'serbia': 'sirbistan',
  'slovenia': 'slovenya',
  'slovakia': 'slovakya',
  'lithuania': 'litvanya',
  'latvia': 'letonya',
  'estonia': 'estonya',
  'united states': 'amerika birlesik devletleri',
  'usa': 'amerika birlesik devletleri',
  'canada': 'kanada',
  'mexico': 'meksika',
  'china': 'cin',
  'japan': 'japonya',
  'south korea': 'guney kore',
  'australia': 'avustralya',
  'new zealand': 'yeni zelanda',
  'india': 'hindistan',
  'russia': 'rusya',
  'ukraine': 'ukrayna',
  'belarus': 'belarus',
  'kazakhstan': 'kazakistan',
  'uzbekistan': 'ozbekistan',
  'turkmenistan': 'turkmenistan',
  'azerbaijan': 'azerbaycan',
  'armenia': 'ermenistan',
  'georgia': 'gurcistan',
  'iran': 'iran',
  'iraq': 'irak',
  'syria': 'suriye',
  'lebanon': 'lubnan',
  'jordan': 'urdun',
  'israel': 'israil',
  'palestine': 'filistin',
  'saudi arabia': 'suudi arabistan',
  'united arab emirates': 'birleik arap emirlikleri',
  'uae': 'birleik arap emirlikleri',
  'dubai': 'birleik arap emirlikleri',
  'abu dhabi': 'birleik arap emirlikleri', 
  'sharjah': 'birleik arap emirlikleri',
  'emirates': 'birleik arap emirlikleri',
  'emirate': 'birleik arap emirlikleri',
  'dxb': 'birleik arap emirlikleri',
  'kuwait': 'kuveyt',
  'qatar': 'katar',
  'bahrain': 'bahreyn',
  'oman': 'umman',
  'yemen': 'yemen',
  'egypt': 'misir',
  'libya': 'libya',
  'tunisia': 'tunus',
  'algeria': 'cezayir',
  'morocco': 'fas',
  'south africa': 'guney afrika',
  'nigeria': 'nijerya',
  'kenya': 'kenya',
  'ethiopia': 'etiyopya',
  'ghana': 'gana',
  'brazil': 'brezilya',
  'argentina': 'arjantin',
  'chile': 'sili',
  'colombia': 'kolombiya',
  'peru': 'peru',
  'venezuela': 'venezuela',
  'ecuador': 'ekvador',
  'uruguay': 'uruguay',
  'paraguay': 'paraguay',
  'bolivia': 'bolivya'
};

// Carrier type definition
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

// Prohibited items list (simplified version)
const prohibitedItems = [
  'liquid', 'alcohol', 'weapon', 'food', 'perfume', 'cosmetic', 'medicine',
  'chemical', 'battery', 'powder', 'magnetic', 'jewelry', 'tobacco',
  'nike', 'adidas', 'timberland', 'brand'
];

function isProhibitedItem(content: string): boolean {
  const lowerContent = content.toLowerCase();
  return prohibitedItems.some(item => lowerContent.includes(item));
}

// Calculate chargeable weight per box (WITHOUT rounding individual boxes)
export function calculateChargeableWeight(
  actualWeight?: number,
  length?: number,
  width?: number,
  height?: number
): { 
  chargeableWeight: number;
  volumetricWeight: number;
} {
  const volumetricWeight = length && width && height ? (length * width * height) / 5000 : 0;
  
  let chargeableWeight = 0;
  if (actualWeight && volumetricWeight) {
    chargeableWeight = Math.max(actualWeight, volumetricWeight);
  } else if (actualWeight) {
    chargeableWeight = actualWeight;
  } else if (volumetricWeight) {
    chargeableWeight = volumetricWeight;
  }
  
  return {
    chargeableWeight,
    volumetricWeight
  };
}

// Calculate total chargeable weight with proper rounding
export function calculateTotalChargeableWeight(
  chargeableWeightPerBox: number,
  quantity: number
): number {
  // Calculate total first, then round up
  const totalChargeableWeight = chargeableWeightPerBox * quantity;
  return Math.ceil(totalChargeableWeight);
}

// Interface for individual box details
export interface BoxDetails {
  weight: number;
  length: number;
  width: number;
  height: number;
  quantity?: number;
}

// Interface for box calculation result
export interface BoxCalculationResult {
  boxNumber: number;
  actualWeight: number;
  volumetricWeight: number;
  chargeableWeight: number;
  quantity: number;
  totalChargeableWeight: number;
  dimensions: string;
}

// Calculate mixed boxes with different dimensions and weights
export function calculateMixedBoxes(boxes: BoxDetails[]): {
  totalChargeableWeight: number;
  totalRoundedWeight: number;
  boxCalculations: BoxCalculationResult[];
  summary: {
    totalBoxes: number;
    totalActualWeight: number;
    totalVolumetricWeight: number;
  };
} {
  const boxCalculations: BoxCalculationResult[] = [];
  let totalChargeableWeightSum = 0;
  let totalActualWeight = 0;
  let totalVolumetricWeight = 0;
  let totalBoxCount = 0;

  boxes.forEach((box, index) => {
    // Calculate volumetric weight for this box
    const volumetricWeight = (box.length * box.width * box.height) / 5000;
    
    // Find chargeable weight (max of actual vs volumetric)
    const chargeableWeight = Math.max(box.weight, volumetricWeight);
    
    // Calculate quantity (default 1 if not specified)
    const quantity = box.quantity || 1;
    
    // Calculate total chargeable weight for this box type
    const totalChargeableWeightForBoxType = chargeableWeight * quantity;
    
    // Add to running sum
    totalChargeableWeightSum += totalChargeableWeightForBoxType;
    totalActualWeight += box.weight * quantity;
    totalVolumetricWeight += volumetricWeight * quantity;
    totalBoxCount += quantity;

    // Store calculation details
    boxCalculations.push({
      boxNumber: index + 1,
      actualWeight: box.weight,
      volumetricWeight: Math.round(volumetricWeight * 100) / 100,
      chargeableWeight: Math.round(chargeableWeight * 100) / 100,
      quantity: quantity,
      totalChargeableWeight: Math.round(totalChargeableWeightForBoxType * 100) / 100,
      dimensions: `${box.length}×${box.width}×${box.height}cm`
    });
  });

  return {
    totalChargeableWeight: Math.round(totalChargeableWeightSum * 100) / 100,
    totalRoundedWeight: Math.ceil(totalChargeableWeightSum),
    boxCalculations,
    summary: {
      totalBoxes: totalBoxCount,
      totalActualWeight: Math.round(totalActualWeight * 100) / 100,
      totalVolumetricWeight: Math.round(totalVolumetricWeight * 100) / 100,
    }
  };
}

// Calculate DRAFT pricing based on actual weight only (no dimensions)
export async function calculateDraftPricing(params: {
  content: string;
  country: string;
  weight: number;
  quantity?: number;
  carrier?: 'UPS' | 'DHL' | 'ARAMEX';
}) {
  const { content, country, weight, quantity = 1, carrier } = params;
  
  // Detect the carrier if not specified
  const selectedCarrier = carrier || detectCarrier(content) as ('UPS' | 'DHL' | 'ARAMEX');
  
  // Check for prohibited items
  if (isProhibitedItem(content)) {
    return {
      allowed: false,
      message: 'We apologize, but we cannot ship this type of product. We do not accept liquids, food items, chemicals, cosmetics (including perfumes and deodorants), medicines, or branded products from companies like Nike, Adidas, Timberland, and other major brands. Please contact us if you have any questions about acceptable items.',
    };
  }

  if (!weight || weight <= 0) {
    return {
      allowed: true,
      needsInfo: true,
      message: 'Please provide the actual weight of the package.',
    };
  }

  // Calculate total weight based on actual weight only (no volumetric calculation)
  const totalActualWeight = Math.ceil(weight * quantity);

  // Handle ARAMEX separately since it uses different CSV structure
  if (selectedCarrier === 'ARAMEX') {
    // For ARAMEX draft pricing, we need to check the country mapping
    const aramexMappings: Record<string, string> = {
      'united arab emirates': 'UAE',
      'uae': 'UAE',
      'dubai': 'UAE',
      'abu dhabi': 'UAE',
      'sharjah': 'UAE',
      'emirates': 'UAE',
      'saudi arabia': 'SAUDI ARABIA',
      'lebanon': 'LEBANON',
      'egypt': 'EGYPT',
      'jordan': 'JORDAN',
      'kuwait': 'KUWAIT',
      'qatar': 'QATAR',
      'bahrain': 'BAHRAIN',
      'oman': 'OMAN',
    };
    
    const normalizedCountry = normalizeCountryName(country);
    const aramexCountryKey = aramexMappings[normalizedCountry];
    
    if (!aramexCountryKey) {
      return {
        allowed: true,
        error: true,
        message: `Country "${country}" is not supported by ARAMEX. Please try UPS or DHL.`,
      };
    }

    // For now, return a standard ARAMEX estimate since it's just a draft
    // Real ARAMEX pricing would use the CSV parsing
    const estimatedPrice = totalActualWeight * 12; // Rough estimate $12 per kg
    
    return {
      allowed: true,
      success: true,
      isDraft: true,
      data: {
        country,
        carrier: 'ARAMEX',
        pricePerBox: Math.round((estimatedPrice / quantity) * 100) / 100,
        totalPrice: Math.round(estimatedPrice * 100) / 100,
        quantity: quantity,
        actualWeight: weight,
        totalActualWeight: totalActualWeight,
        serviceType: 'ARAMEX Express',
        message: `Draft pricing based on actual weight only. Final pricing will be calculated after providing dimensions.`,
      },
    };
  }

  // Parse data files for UPS/DHL carriers and find pricing
  const countryToRegion = await parseRegions(selectedCarrier as 'UPS' | 'DHL');
  const { prices, weights } = await parsePricing(selectedCarrier as 'UPS' | 'DHL');

  // Find region for the country (with translation logic)
  const normalizedCountry = normalizeCountryName(country);
  let region = countryToRegion.get(normalizedCountry);

  if (!region) {
    const translatedCountry = countryTranslations[normalizedCountry];
    if (translatedCountry) {
      region = countryToRegion.get(translatedCountry);
    }
  }

  // Fuzzy matching if still not found
  if (!region) {
    for (const [csvCountry, csvRegion] of countryToRegion.entries()) {
      if (csvCountry.includes(normalizedCountry) || normalizedCountry.includes(csvCountry)) {
        region = csvRegion;
        break;
      }
    }
  }

  if (!region) {
    return {
      allowed: true,
      error: true,
      message: `Country "${country}" not found in the ${selectedCarrier} shipping regions. Please check the country name and try again.`,
    };
  }

  // Get price for the total actual weight and region
  const price = getPrice(totalActualWeight, region, prices, weights);

  if (price === null) {
    return {
      allowed: true,
      error: true,
      message: `Unable to calculate draft price for ${totalActualWeight}kg to region ${region}. Please contact support.`,
    };
  }

  const totalPrice = Math.round(price * 100) / 100;

  return {
    allowed: true,
    success: true,
    isDraft: true,
    data: {
      country,
      region,
      carrier: selectedCarrier,
      pricePerBox: Math.round((totalPrice / quantity) * 100) / 100,
      totalPrice: totalPrice,
      quantity: quantity,
      actualWeight: weight,
      totalActualWeight: totalActualWeight,
      serviceType: `${selectedCarrier} Express`,
      message: `Draft pricing based on actual weight only. Final pricing will be calculated after providing dimensions.`,
    },
  };
}

// Parse regions CSV for region-based carriers (UPS, DHL)
async function parseRegions(carrier: 'UPS' | 'DHL'): Promise<Map<string, number>> {
  if (carrierCache[carrier].regionsData) return carrierCache[carrier].regionsData!;

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
    return { prices: carrierCache[carrier].pricingData!, weights: carrierCache[carrier].weightList! };

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
  if (weights.length === 0) return { lower: null, upper: null };
  
  // If weight is less than the smallest weight
  if (targetWeight <= weights[0]) {
    return { lower: null, upper: weights[0] };
  }
  
  // If weight is greater than the largest weight
  if (targetWeight >= weights[weights.length - 1]) {
    return { lower: weights[weights.length - 1], upper: null };
  }
  
  // Find the weight range
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

// Mixed box pricing calculation function for UPS/DHL
export async function calculateMixedBoxPricing(params: {
  content: string;
  country: string;
  boxes: BoxDetails[];
  carrier?: 'UPS' | 'DHL';
}) {
  const { content, country, boxes } = params;
  
  // Detect the carrier from the content if not specified
  const carrier = params.carrier || detectCarrier(content) as ('UPS' | 'DHL');
  
  // Check for prohibited items
  if (isProhibitedItem(content)) {
    return {
      allowed: false,
      message: 'We apologize, but we cannot ship this type of product. We do not accept liquids, food items, chemicals, cosmetics (including perfumes and deodorants), medicines, or branded products from companies like Nike, Adidas, Timberland, and other major brands. Please contact us if you have any questions about acceptable items.',
    };
  }

  // Validate boxes array
  if (!boxes || boxes.length === 0) {
    return {
      allowed: true,
      needsInfo: true,
      message: 'Please provide box details (weight and dimensions for each box).',
    };
  }

  // Calculate mixed boxes
  const mixedBoxCalculation = calculateMixedBoxes(boxes);
  
  // Parse data files for the carrier and find pricing
  if (carrier !== 'UPS' && carrier !== 'DHL') {
    return {
      allowed: true,
      error: true,
      message: 'This function only supports UPS and DHL carriers. For ARAMEX, please use the multi-carrier pricing function.',
    };
  }

  const countryToRegion = await parseRegions(carrier);
  const { prices, weights } = await parsePricing(carrier);

  // Find region for the country
  const normalizedCountry = normalizeCountryName(country);
  let region = countryToRegion.get(normalizedCountry);

  if (!region) {
    // Try translation from English to Turkish
    const translatedCountry = countryTranslations[normalizedCountry];
    if (translatedCountry) {
      region = countryToRegion.get(translatedCountry);
    }
  }

  // If still not found, try fuzzy matching
  if (!region) {
    for (const [csvCountry, csvRegion] of countryToRegion.entries()) {
      if (csvCountry.includes(normalizedCountry) || normalizedCountry.includes(csvCountry)) {
        region = csvRegion;
        break;
      }
      
      // Special UAE matching
      if ((normalizedCountry.includes('emirat') || normalizedCountry.includes('uae') || normalizedCountry.includes('dubai')) &&
          (csvCountry.includes('emirlik') || csvCountry.includes('arap'))) {
        region = csvRegion;
        break;
      }
    }
  }

  if (!region) {
    return {
      allowed: true,
      error: true,
      message: `Country "${country}" not found in the ${carrier} shipping regions. Please check the country name and try again.`,
    };
  }

  // Get price for the total rounded chargeable weight and region
  const price = getPrice(mixedBoxCalculation.totalRoundedWeight, region, prices, weights);

  if (price === null) {
    return {
      allowed: true,
      error: true,
      message: `Unable to calculate price for ${mixedBoxCalculation.totalRoundedWeight}kg to region ${region}. Please contact support.`,
    };
  }

  const totalPrice = Math.round(price * 100) / 100;

  return {
    allowed: true,
    success: true,
    data: {
      country,
      region,
      carrier,
      totalPrice: totalPrice,
      mixedBoxCalculation,
      chargeableWeight: mixedBoxCalculation.totalRoundedWeight,
      content,
      serviceType: `${carrier} Express`,
    },
  };
}

// Core pricing calculation function for UPS/DHL
export async function calculateUPSDHLPricing(params: {
  content: string;
  country: string;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  quantity?: number;
  carrier?: 'UPS' | 'DHL';
}) {
  const { content, country, weight, length, width, height, quantity = 1 } = params;
  
  // Detect the carrier from the content if not specified
  const carrier = params.carrier || detectCarrier(content) as ('UPS' | 'DHL');
  
  // Check for prohibited items
  if (isProhibitedItem(content)) {
    return {
      allowed: false,
      message: 'We apologize, but we cannot ship this type of product. We do not accept liquids, food items, chemicals, cosmetics (including perfumes and deodorants), medicines, or branded products from companies like Nike, Adidas, Timberland, and other major brands. Please contact us if you have any questions about acceptable items.',
    };
  }

  // Calculate chargeable weight per box (without rounding)
  const weightCalc = calculateChargeableWeight(weight, length, width, height);
  
  if (!weightCalc.chargeableWeight || weightCalc.chargeableWeight === 0) {
    return {
      allowed: true,
      needsInfo: true,
      message: 'Please provide either the actual weight of the package or its dimensions (length, width, height in cm).',
    };
  }

  // Calculate total chargeable weight and round UP the total
  const totalChargeableWeight = calculateTotalChargeableWeight(weightCalc.chargeableWeight, quantity);

  // Parse data files for the carrier and find pricing
  if (carrier !== 'UPS' && carrier !== 'DHL') {
    return {
      allowed: true,
      error: true,
      message: 'This function only supports UPS and DHL carriers. For ARAMEX, please use the multi-carrier pricing function.',
    };
  }

  const countryToRegion = await parseRegions(carrier);
  const { prices, weights } = await parsePricing(carrier);

  // Find region for the country
  const normalizedCountry = normalizeCountryName(country);
  let region = countryToRegion.get(normalizedCountry);

  if (!region) {
    // Try translation from English to Turkish
    const translatedCountry = countryTranslations[normalizedCountry];
    if (translatedCountry) {
      region = countryToRegion.get(translatedCountry);
    }
  }

  // If still not found, try fuzzy matching
  if (!region) {
    for (const [csvCountry, csvRegion] of countryToRegion.entries()) {
      if (csvCountry.includes(normalizedCountry) || normalizedCountry.includes(csvCountry)) {
        region = csvRegion;
        break;
      }
      
      // Special UAE matching
      if ((normalizedCountry.includes('emirat') || normalizedCountry.includes('uae') || normalizedCountry.includes('dubai')) &&
          (csvCountry.includes('emirlik') || csvCountry.includes('arap'))) {
        region = csvRegion;
        break;
      }
    }
  }

  if (!region) {
    return {
      allowed: true,
      error: true,
      message: `Country "${country}" not found in the ${carrier} shipping regions. Please check the country name and try again.`,
    };
  }

  // Get price for the total chargeable weight and region
  const price = getPrice(totalChargeableWeight, region, prices, weights);

  if (price === null) {
    return {
      allowed: true,
      error: true,
      message: `Unable to calculate price for ${totalChargeableWeight}kg to region ${region}. Please contact support.`,
    };
  }

  const totalPrice = Math.round(price * 100) / 100;

  return {
    allowed: true,
    success: true,
    data: {
      country,
      region,
      carrier,
      pricePerBox: Math.round((totalPrice / quantity) * 100) / 100,
      totalPrice: totalPrice,
      quantity: quantity,
      chargeableWeight: totalChargeableWeight,
      chargeableWeightPerBox: weightCalc.chargeableWeight,
      actualWeight: weight,
      volumetricWeight: weightCalc.volumetricWeight,
      length,
      width,
      height,
      content,
      serviceType: `${carrier} Express`,
    },
  };
}
