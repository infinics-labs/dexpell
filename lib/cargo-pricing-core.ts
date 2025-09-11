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

// Extract and normalize country name, handling "City, Country" format
export function normalizeCountryName(country: string): string {
  let normalizedCountry = country.toLowerCase().trim();
  
  // Handle "City, Country" format by extracting the part after the comma
  if (normalizedCountry.includes(',')) {
    const parts = normalizedCountry.split(',');
    if (parts.length >= 2) {
      // Take the last part as it's most likely the country
      normalizedCountry = parts[parts.length - 1].trim();
    }
  }
  
  // Normalize Turkish characters to ASCII equivalents
  normalizedCountry = normalizedCountry
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/İ/g, 'i')
    .replace(/Ğ/g, 'g')
    .replace(/Ü/g, 'u')
    .replace(/Ş/g, 's')
    .replace(/Ö/g, 'o')
    .replace(/Ç/g, 'c');
  
  // Clean up remaining special characters and normalize spaces
  return normalizedCountry.replace(/[^a-z\s]/g, '').replace(/\s+/g, ' ').trim();
}

// Common country name translations (English to Turkish)
const countryTranslations: Record<string, string> = {
  'germany': 'almanya',
  'france': 'fransa',
  'italy': 'italya',
  'spain': 'ispanya',
  'united kingdom': 'ingiltere',
  'uk': 'ingiltere',
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

// Calculate chargeable weight per box with enhanced dimensional analysis
export function calculateChargeableWeight(
  actualWeight?: number,
  length?: number,
  width?: number,
  height?: number
): { 
  chargeableWeight: number;
  volumetricWeight: number;
  calculationMethod: 'actual' | 'volumetric' | 'none';
  dimensions?: string;
  isDimensionalWeight: boolean;
} {
  const volumetricWeight = length && width && height ? (length * width * height) / 5000 : 0;
  const dimensions = length && width && height ? `${length}×${width}×${height}cm` : undefined;
  
  let chargeableWeight = 0;
  let calculationMethod: 'actual' | 'volumetric' | 'none' = 'none';
  let isDimensionalWeight = false;
  
  if (actualWeight && volumetricWeight) {
    if (volumetricWeight > actualWeight) {
      chargeableWeight = volumetricWeight;
      calculationMethod = 'volumetric';
      isDimensionalWeight = true;
    } else {
      chargeableWeight = actualWeight;
      calculationMethod = 'actual';
      isDimensionalWeight = false;
    }
  } else if (actualWeight) {
    chargeableWeight = actualWeight;
    calculationMethod = 'actual';
    isDimensionalWeight = false;
  } else if (volumetricWeight) {
    chargeableWeight = volumetricWeight;
    calculationMethod = 'volumetric';
    isDimensionalWeight = true;
  }
  
  return {
    chargeableWeight,
    volumetricWeight,
    calculationMethod,
    dimensions,
    isDimensionalWeight
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

// Interface for box calculation result with enhanced analysis
export interface BoxCalculationResult {
  boxNumber: number;
  actualWeight: number;
  volumetricWeight: number;
  chargeableWeight: number;
  quantity: number;
  totalChargeableWeight: number;
  dimensions: string;
  calculationMethod: 'actual' | 'volumetric';
  isDimensionalWeight: boolean;
  weightDifference: number;
}

// Interface for dimensional analysis result
export interface DimensionalAnalysisResult {
  scenario: 'identical' | 'mixed_weights' | 'mixed_dimensions' | 'completely_mixed';
  totalBoxes: number;
  actualWeightTotal: number;
  volumetricWeightTotal: number;
  chargeableWeightTotal: number;
  roundedWeightTotal: number;
  dimensionalAdvantage: number;
  recommendations: string[];
}

// Calculate mixed boxes with enhanced dimensional analysis
export function calculateMixedBoxes(boxes: BoxDetails[]): {
  totalChargeableWeight: number;
  totalRoundedWeight: number;
  boxCalculations: BoxCalculationResult[];
  summary: {
    totalBoxes: number;
    totalActualWeight: number;
    totalVolumetricWeight: number;
  };
  dimensionalAnalysis: DimensionalAnalysisResult;
} {
  const boxCalculations: BoxCalculationResult[] = [];
  let totalChargeableWeightSum = 0;
  let totalActualWeight = 0;
  let totalVolumetricWeight = 0;
  let totalBoxCount = 0;
  
  // Track unique dimensions and weights for scenario analysis
  const uniqueWeights = new Set<number>();
  const uniqueDimensions = new Set<string>();

  boxes.forEach((box, index) => {
    // Calculate enhanced chargeable weight
    const weightCalc = calculateChargeableWeight(box.weight, box.length, box.width, box.height);
    
    // Calculate quantity (default 1 if not specified)
    const quantity = box.quantity || 1;
    
    // Calculate total chargeable weight for this box type
    const totalChargeableWeightForBoxType = weightCalc.chargeableWeight * quantity;
    
    // Add to running sum
    totalChargeableWeightSum += totalChargeableWeightForBoxType;
    totalActualWeight += box.weight * quantity;
    totalVolumetricWeight += weightCalc.volumetricWeight * quantity;
    totalBoxCount += quantity;
    
    // Track unique characteristics
    uniqueWeights.add(box.weight);
    uniqueDimensions.add(`${box.length}×${box.width}×${box.height}`);

    // Store enhanced calculation details
    boxCalculations.push({
      boxNumber: index + 1,
      actualWeight: box.weight,
      volumetricWeight: Math.round(weightCalc.volumetricWeight * 100) / 100,
      chargeableWeight: Math.round(weightCalc.chargeableWeight * 100) / 100,
      quantity: quantity,
      totalChargeableWeight: Math.round(totalChargeableWeightForBoxType * 100) / 100,
      dimensions: weightCalc.dimensions || `${box.length}×${box.width}×${box.height}cm`,
      calculationMethod: weightCalc.calculationMethod as 'actual' | 'volumetric',
      isDimensionalWeight: weightCalc.isDimensionalWeight,
      weightDifference: Math.round((weightCalc.volumetricWeight - box.weight) * 100) / 100
    });
  });

  // Analyze dimensional scenario
  const dimensionalAnalysis = analyzeDimensionalScenario(
    uniqueWeights,
    uniqueDimensions,
    totalBoxCount,
    totalActualWeight,
    totalVolumetricWeight,
    totalChargeableWeightSum
  );

  return {
    totalChargeableWeight: Math.round(totalChargeableWeightSum * 100) / 100,
    totalRoundedWeight: Math.ceil(totalChargeableWeightSum),
    boxCalculations,
    summary: {
      totalBoxes: totalBoxCount,
      totalActualWeight: Math.round(totalActualWeight * 100) / 100,
      totalVolumetricWeight: Math.round(totalVolumetricWeight * 100) / 100,
    },
    dimensionalAnalysis
  };
}

// Analyze dimensional scenario and provide recommendations
function analyzeDimensionalScenario(
  uniqueWeights: Set<number>,
  uniqueDimensions: Set<string>,
  totalBoxes: number,
  actualWeightTotal: number,
  volumetricWeightTotal: number,
  chargeableWeightTotal: number
): DimensionalAnalysisResult {
  let scenario: 'identical' | 'mixed_weights' | 'mixed_dimensions' | 'completely_mixed';
  const recommendations: string[] = [];
  
  // Determine scenario
  if (uniqueWeights.size === 1 && uniqueDimensions.size === 1) {
    scenario = 'identical';
    recommendations.push('All boxes are identical - optimal for bulk shipping rates');
  } else if (uniqueWeights.size > 1 && uniqueDimensions.size === 1) {
    scenario = 'mixed_weights';
    recommendations.push('Same dimensions but different weights - consider weight distribution');
  } else if (uniqueWeights.size === 1 && uniqueDimensions.size > 1) {
    scenario = 'mixed_dimensions';
    recommendations.push('Same weight but different dimensions - volumetric weight impact varies');
  } else {
    scenario = 'completely_mixed';
    recommendations.push('Mixed weights and dimensions - complex pricing scenario');
  }
  
  // Calculate dimensional advantage/disadvantage
  const dimensionalAdvantage = Math.round((actualWeightTotal - volumetricWeightTotal) * 100) / 100;
  
  if (dimensionalAdvantage > 0) {
    recommendations.push(`Volumetric weight is ${Math.abs(dimensionalAdvantage).toFixed(1)}kg higher - consider compact packaging`);
  } else if (dimensionalAdvantage < 0) {
    recommendations.push(`Actual weight advantage of ${Math.abs(dimensionalAdvantage).toFixed(1)}kg - dense cargo benefits`);
  } else {
    recommendations.push('Actual and volumetric weights are balanced');
  }
  
  // Volume efficiency recommendation
  const volumeEfficiency = (actualWeightTotal / volumetricWeightTotal) * 100;
  if (volumeEfficiency < 50) {
    recommendations.push('Low volume efficiency - consider consolidation or smaller packaging');
  } else if (volumeEfficiency > 80) {
    recommendations.push('High volume efficiency - well optimized packaging');
  }

  return {
    scenario,
    totalBoxes,
    actualWeightTotal: Math.round(actualWeightTotal * 100) / 100,
    volumetricWeightTotal: Math.round(volumetricWeightTotal * 100) / 100,
    chargeableWeightTotal: Math.round(chargeableWeightTotal * 100) / 100,
    roundedWeightTotal: Math.ceil(chargeableWeightTotal),
    dimensionalAdvantage,
    recommendations
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

// Parse ARAMEX pricing data
export async function parseAramexPricing(): Promise<{
  prices: Map<string, number>;
  weights: number[];
}> {
  if (carrierCache.ARAMEX.pricingData && carrierCache.ARAMEX.weightList) {
    return { prices: carrierCache.ARAMEX.pricingData!, weights: carrierCache.ARAMEX.weightList! };
  }

  const pricingFile = CARRIER_FILES.ARAMEX.pricing;
  const content = await fs.readFile(pricingFile, 'utf-8');
  const lines = content.split('\n');
  const prices = new Map<string, number>();
  const weights: number[] = [];

  for (const line of lines) {
    const parts = line.split(';').map((p) => p.trim());

    if (!parts[0] || parts[0] === 'WEIGHT/COUNTRY') continue;

    const weightStr = parts[0].replace(' kg', '').replace(',', '.');
    const weight = Number.parseFloat(weightStr);
    if (Number.isNaN(weight)) continue;

    weights.push(weight);

    // Countries: BAHRAIN, JORDAN, KUWAIT, QATAR, UAE, SAUDI ARABIA, OMAN, LEBANON, EGYPT
    const countries = ['BAHRAIN', 'JORDAN', 'KUWAIT', 'QATAR', 'UAE', 'SAUDI ARABIA', 'OMAN', 'LEBANON', 'EGYPT'];
    
    countries.forEach((country, index) => {
      const priceStr = parts[index + 1];
      if (priceStr) {
        const price = Number.parseFloat(priceStr.replace(',', '.'));
        if (!Number.isNaN(price)) {
          prices.set(`${weight}-${country}`, price);
        }
      }
    });
  }

  carrierCache.ARAMEX.pricingData = prices;
  carrierCache.ARAMEX.weightList = weights.sort((a, b) => a - b);
  return { prices, weights };
}

// Check if ARAMEX supports a country
export async function isAramexSupported(country: string): Promise<{ supported: boolean; countryKey?: string }> {
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
  
  return {
    supported: !!aramexCountryKey,
    countryKey: aramexCountryKey
  };
}

// Get ARAMEX price for specific weight and country
export function getAramexPrice(
  weight: number,
  countryKey: string,
  prices: Map<string, number>,
  weights: number[]
): number | null {
  // Check for exact match
  const exactPrice = prices.get(`${weight}-${countryKey}`);
  if (exactPrice !== undefined) return exactPrice;

  // Find closest weights
  const { lower, upper } = findClosestWeight(weight, weights);

  if (!lower && upper) {
    return prices.get(`${upper}-${countryKey}`) || null;
  }

  if (lower && !upper) {
    return prices.get(`${lower}-${countryKey}`) || null;
  }

  if (lower && upper) {
    const lowerPrice = prices.get(`${lower}-${countryKey}`);
    const upperPrice = prices.get(`${upper}-${countryKey}`);

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
      // Enhanced dimensional analysis data
      boxCalculations: mixedBoxCalculation.boxCalculations,
      dimensionalAnalysis: mixedBoxCalculation.dimensionalAnalysis,
      summary: mixedBoxCalculation.summary,
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

// Enhanced Multi-Carrier Pricing Function with full ARAMEX, UPS, DHL support
export async function calculateEnhancedMultiCarrierPricing(params: {
  content: string;
  country: string;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  quantity?: number;
  boxes?: BoxDetails[];
  carriers?: ('UPS' | 'DHL' | 'ARAMEX')[];
}) {
  const { content, country, weight, length, width, height, quantity = 1, boxes, carriers = ['UPS', 'DHL', 'ARAMEX'] } = params;
  
  // Check for prohibited items first
  if (isProhibitedItem(content)) {
    return {
      allowed: false,
      message: 'We apologize, but we cannot ship this type of product. We do not accept liquids, food items, chemicals, cosmetics (including perfumes and deodorants), medicines, or branded products from companies like Nike, Adidas, Timberland, and other major brands. Please contact us if you have any questions about acceptable items.',
    };
  }

  const quotes = [];

  // Handle mixed boxes scenario
  if (boxes && boxes.length > 0) {
    try {
      // Calculate mixed box analysis
      const mixedCalculation = calculateMixedBoxes(boxes);

      // Get quotes for each carrier
      for (const carrier of carriers) {
        if (carrier === 'ARAMEX') {
          // ARAMEX mixed box pricing
          const { supported, countryKey } = await isAramexSupported(country);
          if (!supported) {
            quotes.push({
              carrier: 'ARAMEX',
              available: false,
              totalPrice: 0,
              serviceType: 'ARAMEX Express',
              message: 'Country not supported'
            });
            continue;
          }

          try {
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
            }
          } catch (error) {
            console.error('ARAMEX mixed box pricing error:', error);
          }
        } else {
          // UPS/DHL mixed box pricing
          try {
            const result = await calculateMixedBoxPricing({
              content,
              country,
              boxes,
              carrier: carrier as 'UPS' | 'DHL',
            });

            if (result.allowed && result.success && result.data) {
              quotes.push({
                carrier: result.data.carrier,
                available: true,
                totalPrice: result.data.totalPrice,
                serviceType: result.data.serviceType,
                region: result.data.region,
                chargeableWeight: result.data.chargeableWeight,
              });
            }
          } catch (error) {
            console.error(`${carrier} mixed box pricing error:`, error);
          }
        }
      }

      return {
        allowed: true,
        success: true,
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
    } catch (error) {
      console.error('Mixed box calculation error:', error);
      return {
        allowed: true,
        error: true,
        message: 'Error calculating mixed box pricing',
      };
    }
  }

  // Handle single box type with multiple quantities
  if (!weight || weight <= 0) {
    return {
      allowed: true,
      needsInfo: true,
      message: 'Please provide the actual weight of the package.',
    };
  }

  // Calculate enhanced weight information
  const weightCalc = calculateChargeableWeight(weight, length, width, height);
  const totalChargeableWeight = calculateTotalChargeableWeight(weightCalc.chargeableWeight, quantity);

  // Get quotes from all carriers
  for (const carrier of carriers) {
    if (carrier === 'ARAMEX') {
      const { supported, countryKey } = await isAramexSupported(country);
      if (!supported) {
        quotes.push({
          carrier: 'ARAMEX',
          available: false,
          totalPrice: 0,
          serviceType: 'ARAMEX Express',
          message: 'Country not supported'
        });
        continue;
      }

      try {
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
      // UPS/DHL pricing
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
        });

        if (result.allowed && result.success && result.data) {
          quotes.push({
            carrier: result.data.carrier,
            available: true,
            pricePerBox: result.data.pricePerBox,
            totalPrice: result.data.totalPrice,
            serviceType: result.data.serviceType,
            region: result.data.region,
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
        } else if (result.allowed && result.error) {
          quotes.push({
            carrier: carrier as 'UPS' | 'DHL',
            available: false,
            totalPrice: 0,
            serviceType: `${carrier} Express`,
            message: result.message || 'Pricing not available'
          });
        }
      } catch (error) {
        console.error(`${carrier} pricing error:`, error);
      }
    }
  }

  return {
    allowed: true,
    success: true,
    scenario: 'single_type',
    data: {
      country,
      quotes,
      quantity,
      chargeableWeight: totalChargeableWeight,
      chargeableWeightPerBox: weightCalc.chargeableWeight,
      actualWeight: weight,
      volumetricWeight: weightCalc.volumetricWeight,
      calculationMethod: weightCalc.calculationMethod,
      isDimensionalWeight: weightCalc.isDimensionalWeight,
      dimensions: weightCalc.dimensions,
      length,
      width,
      height,
      content,
    },
  };
}
