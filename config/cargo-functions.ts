// Cargo pricing functions for Dexpell
import { cargoPricing } from './functions/cargo-pricing';
import { cargoMultiPricing } from './functions/cargo-multi-pricing';
import { cargoMixedPricing } from './functions/cargo-mixed-pricing';

export const cargoFunctions = {
  cargo_pricing: cargoPricing,
  cargo_multi_pricing: cargoMultiPricing,
  cargo_mixed_pricing: cargoMixedPricing,
};

// Export the function definitions for the Responses API
export const cargoFunctionDefinitions = [
  {
    type: 'function' as const,
    name: 'cargo_pricing',
    description: 'Get cargo shipping price based on destination country, cargo content, and weight/dimensions. Recognizes cargo terminology like "Freight All Kinds (FAK)" as general cargo. It can be used in two modes: 1) Content checking only (provide just content), 2) Full pricing calculation (provide all parameters).',
    parameters: {
      type: 'object',
      properties: {
        content: {
          type: 'string',
          description: 'Description of what is being shipped (supports cargo terminology like "FAK", "Freight All Kinds", "General Cargo")',
        },
        country: {
          type: 'string',
          description: 'The destination country - optional for content checking',
        },
        weight: {
          type: 'number',
          description: 'The actual weight of a single package in kilograms',
        },
        length: {
          type: 'number',
          description: 'Length of a single package in centimeters',
        },
        width: {
          type: 'number',
          description: 'Width of a single package in centimeters',
        },
        height: {
          type: 'number',
          description: 'Height of a single package in centimeters',
        },
        quantity: {
          type: 'number',
          description: 'Number of identical boxes/packages (default is 1)',
        },
        language: {
          type: 'string',
          enum: ['en', 'tr'],
          description: 'Language for error messages and responses (en for English, tr for Turkish)',
        },
      },
      required: ['content'],
      additionalProperties: false,
    },
  },
  {
    type: 'function' as const,
    name: 'cargo_multi_pricing',
    description: 'Get cargo shipping prices from multiple carriers (UPS, DHL, ARAMEX) based on destination country or city, cargo content, and weight/dimensions. The system automatically resolves major city names to their countries (e.g., "London" → "United Kingdom", "Tokyo" → "Japan"). The carrier is automatically detected from the content (e.g., "send via DHL", "using ARAMEX", "UPS shipping"). If no carrier is mentioned, it gets quotes from all available carriers.',
    parameters: {
      type: 'object',
      properties: {
        content: {
          type: 'string',
          description: 'Description of what is being shipped (supports cargo terminology like "FAK", "Freight All Kinds", "General Cargo"). Can also include carrier preference like "send via DHL" or "using ARAMEX"',
        },
        country: {
          type: 'string',
          description: 'The destination country OR city name (system will automatically resolve cities to countries) - optional for content checking',
        },
        weight: {
          type: 'number',
          description: 'The actual weight of a single package in kilograms',
        },
        length: {
          type: 'number',
          description: 'Length of a single package in centimeters',
        },
        width: {
          type: 'number',
          description: 'Width of a single package in centimeters',
        },
        height: {
          type: 'number',
          description: 'Height of a single package in centimeters',
        },
        quantity: {
          type: 'number',
          description: 'Number of identical boxes/packages (default is 1)',
        },
        language: {
          type: 'string',
          enum: ['en', 'tr'],
          description: 'Language for error messages and responses (en for English, tr for Turkish)',
        },
      },
      required: ['content'],
      additionalProperties: false,
    },
  },
  {
    type: 'function' as const,
    name: 'cargo_mixed_pricing',
    description: 'Calculate shipping prices for multiple boxes with different dimensions and weights. Use this when customer has boxes of different sizes/weights. Each box is calculated individually (weight vs volumetric weight) then summed for final pricing.',
    parameters: {
      type: 'object',
      properties: {
        content: {
          type: 'string',
          description: 'Description of what is being shipped',
        },
        country: {
          type: 'string',
          description: 'The destination country',
        },
        boxes: {
          type: 'array',
          description: 'Array of box details with different dimensions and weights',
          items: {
            type: 'object',
            properties: {
              weight: {
                type: 'number',
                description: 'Actual weight of this box in kilograms',
              },
              length: {
                type: 'number',
                description: 'Length of this box in centimeters',
              },
              width: {
                type: 'number',
                description: 'Width of this box in centimeters',
              },
              height: {
                type: 'number',
                description: 'Height of this box in centimeters',
              },
              quantity: {
                type: 'number',
                description: 'Number of identical boxes of this type (default 1)',
              },
            },
            required: ['weight', 'length', 'width', 'height'],
            additionalProperties: false,
          },
        },
        language: {
          type: 'string',
          enum: ['en', 'tr'],
          description: 'Language for error messages and responses (en for English, tr for Turkish)',
        },
      },
      required: ['content', 'country', 'boxes'],
      additionalProperties: false,
    },
  },
];
