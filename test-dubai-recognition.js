// Quick test to verify Dubai is properly recognized as UAE
const { normalizeCountryName } = require('./lib/cargo-pricing-core.ts');

// Test cases
const testCases = [
  'Dubai',
  'dubai', 
  'DUBAI',
  'United Arab Emirates',
  'UAE',
  'uae',
  'Abu Dhabi',
  'Sharjah',
  'Emirates'
];

console.log('Testing Dubai/UAE country recognition:');
console.log('=====================================');

for (const testCase of testCases) {
  const normalized = normalizeCountryName(testCase);
  console.log(`Input: "${testCase}" → Normalized: "${normalized}"`);
}

// Test the country translations mapping
const countryTranslations = {
  'united arab emirates': 'birleik arap emirlikleri',
  'uae': 'birleik arap emirlikleri',
  'dubai': 'birleik arap emirlikleri',
  'abu dhabi': 'birleik arap emirlikleri', 
  'sharjah': 'birleik arap emirlikleri',
  'emirates': 'birleik arap emirlikleri',
  'emirate': 'birleik arap emirlikleri',
  'dxb': 'birleik arap emirlikleri'
};

console.log('\nTesting country translations:');
console.log('=============================');

for (const testCase of testCases) {
  const normalized = normalizeCountryName(testCase);
  const translated = countryTranslations[normalized];
  console.log(`"${testCase}" → "${normalized}" → "${translated || 'NO TRANSLATION'}"`);
}
