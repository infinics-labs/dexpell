// Cargo terminology recognition and mapping

interface CargoCategory {
  GENERAL_CARGO: 'GENERAL_CARGO';
  DOCUMENTS: 'DOCUMENTS';
  SPECIFIC_PRODUCT: 'SPECIFIC_PRODUCT';
  UNKNOWN: 'UNKNOWN';
}

interface TerminologyResult {
  category: keyof CargoCategory | null;
  matchedTerm: string | null;
  originalTerm: string;
}

// Common cargo terminology mappings
const cargoTerminology: Record<string, keyof CargoCategory> = {
  // English terms
  'freight all kinds': 'GENERAL_CARGO',
  'fak': 'GENERAL_CARGO',
  'general cargo': 'GENERAL_CARGO',
  'mixed cargo': 'GENERAL_CARGO',
  'various products': 'GENERAL_CARGO',
  'miscellaneous goods': 'GENERAL_CARGO',
  'assorted items': 'GENERAL_CARGO',
  'documents': 'DOCUMENTS',
  'docs': 'DOCUMENTS',
  'papers': 'DOCUMENTS',
  
  // Turkish terms
  'genel kargo': 'GENERAL_CARGO',
  'çeşitli ürünler': 'GENERAL_CARGO',
  'karışık kargo': 'GENERAL_CARGO',
  'evrak': 'DOCUMENTS',
  'döküman': 'DOCUMENTS',
  'belgeler': 'DOCUMENTS',
};

// Function to identify cargo category from content
export function identifyCargoCategory(content: string): TerminologyResult {
  const lowerContent = content.toLowerCase().trim();
  
  // Check each terminology pattern
  for (const [term, category] of Object.entries(cargoTerminology)) {
    if (lowerContent.includes(term)) {
      return {
        category,
        matchedTerm: term,
        originalTerm: content,
      };
    }
  }
  
  // Check abbreviations with word boundaries
  if (/\bfak\b/i.test(content)) {
    return {
      category: 'GENERAL_CARGO',
      matchedTerm: 'FAK',
      originalTerm: content,
    };
  }
  
  return {
    category: null,
    matchedTerm: null,
    originalTerm: content,
  };
}

// Get appropriate response based on cargo terminology
export function getCargoTerminologyResponse(
  category: keyof CargoCategory,
  matchedTerm: string,
  language: 'en' | 'tr' = 'en'
): string {
  const responses = {
    en: {
      GENERAL_CARGO: `I understand you want to ship "${matchedTerm}" (general cargo). This covers various non-prohibited products.`,
      DOCUMENTS: `I see you're shipping documents. Documents have simplified shipping requirements and don't need detailed content checks.`,
      SPECIFIC_PRODUCT: `I understand you want to ship specific products. Let me check if these items comply with our shipping regulations.`,
      UNKNOWN: `Please describe what you'd like to ship so I can check compliance and calculate the shipping cost.`,
    },
    tr: {
      GENERAL_CARGO: `"${matchedTerm}" (genel kargo) göndermek istediğinizi anlıyorum. Bu, yasaklı olmayan çeşitli ürünleri kapsar.`,
      DOCUMENTS: `Evrak gönderdiğinizi görüyorum. Evrakların basitleştirilmiş gönderim gereksinimleri vardır ve detaylı içerik kontrolü gerekmez.`,
      SPECIFIC_PRODUCT: `Belirli ürünler göndermek istediğinizi anlıyorum. Bu ürünlerin gönderim yönetmeliklerimize uygun olup olmadığını kontrol edeyim.`,
      UNKNOWN: `Göndermek istediğiniz ürünleri açıklayın, böylece uygunluğu kontrol edip kargo ücretini hesaplayabilirim.`,
    },
  };
  
  return responses[language][category];
}
