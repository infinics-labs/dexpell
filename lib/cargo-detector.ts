// Cargo conversation detection utility

export interface CargoDetectionResult {
  isCargo: boolean;
  confidence: 'high' | 'medium' | 'low';
  detectedTerms: string[];
}

// Cargo-related keywords and phrases for detection
const CARGO_KEYWORDS = {
  // Shipping terms (English + Turkish)
  shipping: [
    // English
    'ship', 'shipping', 'shipment', 'export', 'import', 'send', 'delivery', 'courier',
    // Turkish
    'kargo', 'gönderi', 'gönderim', 'sevkiyat', 'teslimat', 'kurye', 'gönder', 'göndermek', 'yolla', 'yollamak'
  ],
  
  // Cargo specific terms (English + Turkish)
  cargo: [
    // English
    'cargo', 'freight', 'fak', 'general cargo', 'package', 'parcel', 'box', 'boxes',
    // Turkish
    'kargo', 'yük', 'genel kargo', 'paket', 'kutu', 'koliler', 'koli', 'ambalaj'
  ],
  
  // Carriers (same for both languages)
  carriers: ['ups', 'dhl', 'aramex', 'fedex', 'carrier', 'taşıyıcı'],
  
  // Destinations/geography (English + Turkish)
  destinations: [
    // English
    'to', 'destination', 'country', 'city', 'germany', 'usa', 'uk', 'turkey', 'europe', 'asia',
    // Turkish
    'ülke', 'şehir', 'almanya', 'amerika', 'ingiltere', 'türkiye', 'avrupa', 'asya', 'varış', 'hedef', 'nereye', 'hangi ülke'
  ],
  
  // Weight/dimensions (English + Turkish)
  measurements: [
    // English
    'kg', 'kilogram', 'weight', 'heavy', 'light', 'cm', 'centimeter', 'dimension', 'size',
    // Turkish
    'kg', 'kilogram', 'ağırlık', 'ağır', 'hafif', 'cm', 'santimetre', 'boyut', 'ebat', 'ölçü', 'büyüklük'
  ],
  
  // Pricing (English + Turkish)
  pricing: [
    // English
    'price', 'cost', 'quote', 'rate', 'calculate', 'pricing', 'cheap', 'expensive',
    // Turkish
    'fiyat', 'maliyet', 'teklif', 'ücret', 'hesapla', 'fiyatlandırma', 'ucuz', 'pahalı', 'ne kadar', 'kaç para'
  ],
  
  // Questions/intent (English + Turkish)
  intent: [
    // English
    'how much', 'can i', 'want to', 'need to', 'looking for', 'price for',
    // Turkish
    'ne kadar', 'istiyorum', 'ihtiyacım var', 'arıyorum', 'için fiyat', 'göndermek istiyorum', 'yollamak istiyorum'
  ]
};

// High confidence patterns (very likely cargo conversations)
const HIGH_CONFIDENCE_PATTERNS = [
  // English patterns
  /\b(ship|shipping|export|import)\b.*\b(to|destination)\b/i,
  /\bgeneral cargo\b/i,
  /\b(cargo|freight)\b.*\b(price|pricing|cost|quote)\b/i,
  /\b(ups|dhl|aramex)\b.*\b(ship|shipping)\b/i,
  /\bfak\b/i, // Freight All Kinds
  /\b(package|parcel|box)\b.*\b(to|destination)\b/i,
  
  // Turkish patterns
  /\b(kargo|gönderi|gönderim)\b.*\b(fiyat|teklif|ücret)\b/i,
  /\bgenel kargo\b/i,
  /\b(kargo|paket)\b.*\b(göndermek|yollamak)\b/i,
  /\b(ups|dhl|aramex)\b.*\b(kargo|gönderi)\b/i,
  /\b(paket|kutu|koli)\b.*\b(nereye|hangi ülke)\b/i,
  /\bkargo.*istiyorum\b/i,
  /\bgöndermek istiyorum\b/i
];

// Medium confidence patterns
const MEDIUM_CONFIDENCE_PATTERNS = [
  // English patterns
  /\b(ship|send|export)\b/i,
  /\b(cargo|freight|package|parcel)\b/i,
  /\b(ups|dhl|aramex|fedex)\b/i,
  /\bhow much.*\b(ship|send|delivery)\b/i,
  /\bweight.*\bkg\b/i,
  
  // Turkish patterns
  /\b(kargo|gönderi|paket)\b/i,
  /\b(gönder|göndermek|yolla|yollamak)\b/i,
  /\b(ups|dhl|aramex|fedex)\b/i,
  /\bne kadar.*\b(kargo|gönderi|teslimat)\b/i,
  /\bağırlık.*\bkg\b/i,
  /\bfiyat.*\b(kargo|gönderi)\b/i
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
  
  for (const [, keywords] of Object.entries(CARGO_KEYWORDS)) {
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
