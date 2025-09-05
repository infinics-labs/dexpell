// Cargo conversation detection utility

export interface CargoDetectionResult {
  isCargo: boolean;
  confidence: 'high' | 'medium' | 'low';
  detectedTerms: string[];
}

// Cargo-related keywords and phrases for detection
const CARGO_KEYWORDS = {
  // Shipping terms
  shipping: ['ship', 'shipping', 'shipment', 'export', 'import', 'send', 'delivery', 'courier'],
  
  // Cargo specific terms
  cargo: ['cargo', 'freight', 'fak', 'general cargo', 'package', 'parcel', 'box', 'boxes'],
  
  // Carriers
  carriers: ['ups', 'dhl', 'aramex', 'fedex', 'carrier'],
  
  // Destinations/geography
  destinations: ['to', 'destination', 'country', 'city', 'germany', 'usa', 'uk', 'turkey', 'europe', 'asia'],
  
  // Weight/dimensions
  measurements: ['kg', 'kilogram', 'weight', 'heavy', 'light', 'cm', 'centimeter', 'dimension', 'size'],
  
  // Pricing
  pricing: ['price', 'cost', 'quote', 'rate', 'calculate', 'pricing', 'cheap', 'expensive'],
  
  // Questions/intent
  intent: ['how much', 'can i', 'want to', 'need to', 'looking for', 'price for']
};

// High confidence patterns (very likely cargo conversations)
const HIGH_CONFIDENCE_PATTERNS = [
  /\b(ship|shipping|export|import)\b.*\b(to|destination)\b/i,
  /\bgeneral cargo\b/i,
  /\b(cargo|freight)\b.*\b(price|pricing|cost|quote)\b/i,
  /\b(ups|dhl|aramex)\b.*\b(ship|shipping)\b/i,
  /\bfak\b/i, // Freight All Kinds
  /\b(package|parcel|box)\b.*\b(to|destination)\b/i
];

// Medium confidence patterns
const MEDIUM_CONFIDENCE_PATTERNS = [
  /\b(ship|send|export)\b/i,
  /\b(cargo|freight|package|parcel)\b/i,
  /\b(ups|dhl|aramex|fedex)\b/i,
  /\bhow much.*\b(ship|send|delivery)\b/i,
  /\bweight.*\bkg\b/i
];

export function detectCargoConversation(message: string): CargoDetectionResult {
  const lowerMessage = message.toLowerCase();
  const detectedTerms: string[] = [];
  
  // Check for high confidence patterns
  for (const pattern of HIGH_CONFIDENCE_PATTERNS) {
    if (pattern.test(message)) {
      return {
        isCargo: true,
        confidence: 'high',
        detectedTerms: ['high confidence pattern match']
      };
    }
  }
  
  // Check for medium confidence patterns
  for (const pattern of MEDIUM_CONFIDENCE_PATTERNS) {
    if (pattern.test(message)) {
      // Continue to check for additional terms to boost confidence
      break;
    }
  }
  
  // Count keyword matches in different categories
  let totalMatches = 0;
  let categoryMatches = 0;
  
  for (const [category, keywords] of Object.entries(CARGO_KEYWORDS)) {
    let categoryFound = false;
    for (const keyword of keywords) {
      if (lowerMessage.includes(keyword)) {
        detectedTerms.push(keyword);
        totalMatches++;
        if (!categoryFound) {
          categoryMatches++;
          categoryFound = true;
        }
      }
    }
  }
  
  // Determine confidence based on matches
  if (categoryMatches >= 3 || totalMatches >= 4) {
    return {
      isCargo: true,
      confidence: 'high',
      detectedTerms
    };
  } else if (categoryMatches >= 2 || totalMatches >= 2) {
    return {
      isCargo: true,
      confidence: 'medium',
      detectedTerms
    };
  } else if (totalMatches >= 1) {
    return {
      isCargo: true,
      confidence: 'low',
      detectedTerms
    };
  }
  
  return {
    isCargo: false,
    confidence: 'low',
    detectedTerms: []
  };
}

// Check if a conversation history suggests cargo context
export function detectCargoInConversation(messages: any[]): CargoDetectionResult {
  let highestConfidence: 'high' | 'medium' | 'low' = 'low';
  let isCargo = false;
  const allDetectedTerms: string[] = [];
  
  // Check recent messages (last 5)
  const recentMessages = messages.slice(-5);
  
  for (const message of recentMessages) {
    if (message.role === 'user' && typeof message.content === 'string') {
      const detection = detectCargoConversation(message.content);
      
      if (detection.isCargo) {
        isCargo = true;
        allDetectedTerms.push(...detection.detectedTerms);
        
        // Update highest confidence
        if (detection.confidence === 'high') {
          highestConfidence = 'high';
        } else if (detection.confidence === 'medium' && highestConfidence !== 'high') {
          highestConfidence = 'medium';
        }
      }
    }
  }
  
  return {
    isCargo,
    confidence: highestConfidence,
    detectedTerms: [...new Set(allDetectedTerms)] // Remove duplicates
  };
}
