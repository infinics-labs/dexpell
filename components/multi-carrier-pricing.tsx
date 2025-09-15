'use client';

import { motion } from 'framer-motion';
import { 
  Package, 
  Truck,
  CheckCircle,
  Globe,
  Calculator,
  Info,
  DollarSign,
  Weight
} from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

// Carrier configuration with styling
const CARRIER_CONFIG = {
  UPS: {
    name: 'UPS Express',
    gradientFrom: 'from-blue-500',
    gradientTo: 'to-indigo-500',
    borderColor: 'border-blue-200 dark:border-blue-800',
    bgColor: 'bg-blue-50 dark:bg-blue-950',
    textColor: 'text-blue-700 dark:text-blue-300',
    priceColor: 'text-blue-600 dark:text-blue-400',
    avatar: 'UPS'
  },
  DHL: {
    name: 'DHL Express',
    gradientFrom: 'from-yellow-500',
    gradientTo: 'to-red-500',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950',
    textColor: 'text-yellow-700 dark:text-yellow-300',
    priceColor: 'text-yellow-600 dark:text-yellow-400',
    avatar: 'DHL'
  },
  ARAMEX: {
    name: 'ARAMEX Express',
    gradientFrom: 'from-orange-500',
    gradientTo: 'to-red-500',
    borderColor: 'border-orange-200 dark:border-orange-800',
    bgColor: 'bg-orange-50 dark:bg-orange-950',
    textColor: 'text-orange-700 dark:text-orange-300',
    priceColor: 'text-orange-600 dark:text-orange-400',
    avatar: 'ARX'
  }
};

// Sample pricing data (simplified for simulation)
const SAMPLE_PRICING = {
  regions: {
    'germany': 2,
    'france': 2,
    'usa': 7,
    'uk': 2,
    'italy': 2,
    'spain': 2,
    'netherlands': 2,
    'belgium': 2,
    'canada': 8,
    'australia': 9
  },
  ups: {
    1: { '1': 14.62, '5': 23.98, '10': 39.01, '20': 73.66 },
    2: { '1': 15.78, '5': 29.99, '10': 47.25, '20': 84.01 },
    7: { '1': 31.52, '5': 69.04, '10': 115.92, '20': 232.90 },
    8: { '1': 45.51, '5': 174.12, '10': 270.49, '20': 385.13 },
    9: { '1': 70.17, '5': 244.35, '10': 392.29, '20': 570.58 }
  },
  dhl: {
    1: { '1': 23.52, '5': 75.31, '10': 122.46, '20': 180.59 },
    2: { '1': 28.24, '5': 93.98, '10': 164.28, '20': 246.42 },
    7: { '1': 32.96, '5': 98.70, '10': 180.83, '20': 275.13 },
    8: { '1': 32.96, '5': 98.70, '10': 180.83, '20': 275.13 },
    9: { '1': 37.62, '5': 131.72, '10': 225.85, '20': 308.32 }
  },
  aramex: {
    'germany': { '1': 15.02, '5': 51.47, '10': 97.04, '20': 184.07 },
    'france': { '1': 12.49, '5': 31.00, '10': 54.13, '20': 100.27 },
    'usa': null, // Not supported
    'uk': { '1': 16.47, '5': 37.94, '10': 64.78, '20': 117.58 },
    'netherlands': null // Not supported
  }
};

interface CarrierQuote {
  carrier: 'UPS' | 'DHL' | 'ARAMEX';
  pricePerBox?: number;
  totalPrice: number;
  available: boolean;
  region?: number;
  serviceType: string;
  actualWeight?: number;
  chargeableWeight?: number;
}

interface PricingFormData {
  country: string;
  weight: number;
  quantity: number;
  length?: number;
  width?: number;
  height?: number;
  content: string;
}

interface PricingResult {
  quotes: CarrierQuote[];
  chargeableWeight: number;
  volumetricWeight?: number;
  dimensions?: { length: number; width: number; height: number };
}

export function MultiCarrierPricing() {
  const [formData, setFormData] = useState<PricingFormData>({
    country: '',
    weight: 1,
    quantity: 1,
    content: 'General cargo'
  });
  const [result, setResult] = useState<PricingResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Simulate pricing calculation
  const calculatePricing = async (): Promise<PricingResult> => {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay

    const country = formData.country.toLowerCase();
    const region = SAMPLE_PRICING.regions[country as keyof typeof SAMPLE_PRICING.regions];
    
    // Calculate volumetric weight if dimensions provided
    let volumetricWeight: number | undefined;
    let chargeableWeight = formData.weight;
    
    if (formData.length && formData.width && formData.height) {
      volumetricWeight = (formData.length * formData.width * formData.height) / 5000;
      chargeableWeight = Math.max(formData.weight, volumetricWeight);
    }

    const totalChargeableWeight = Math.ceil(chargeableWeight * formData.quantity);
    
    const quotes: CarrierQuote[] = [];

    // UPS Pricing
    if (region) {
      const upsRegionPricing = SAMPLE_PRICING.ups[region as keyof typeof SAMPLE_PRICING.ups];
      if (upsRegionPricing) {
        const price = interpolatePrice(totalChargeableWeight, upsRegionPricing);
        quotes.push({
          carrier: 'UPS',
          pricePerBox: formData.quantity > 1 ? price / formData.quantity : undefined,
          totalPrice: price,
          available: true,
          region,
          serviceType: 'UPS Express',
          actualWeight: formData.weight * formData.quantity,
          chargeableWeight: totalChargeableWeight
        });
      }
    }

    // DHL Pricing
    if (region) {
      const dhlRegionPricing = SAMPLE_PRICING.dhl[region as keyof typeof SAMPLE_PRICING.dhl];
      if (dhlRegionPricing) {
        const price = interpolatePrice(totalChargeableWeight, dhlRegionPricing);
        quotes.push({
          carrier: 'DHL',
          pricePerBox: formData.quantity > 1 ? price / formData.quantity : undefined,
          totalPrice: price,
          available: true,
          region,
          serviceType: 'DHL Express',
          actualWeight: formData.weight * formData.quantity,
          chargeableWeight: totalChargeableWeight
        });
      }
    }

    // ARAMEX Pricing (country-specific)
    const aramexPricing = SAMPLE_PRICING.aramex[country as keyof typeof SAMPLE_PRICING.aramex];
    if (aramexPricing) {
      const price = interpolatePrice(totalChargeableWeight, aramexPricing);
      quotes.push({
        carrier: 'ARAMEX',
        pricePerBox: formData.quantity > 1 ? price / formData.quantity : undefined,
        totalPrice: price,
        available: true,
        serviceType: 'ARAMEX Express',
        actualWeight: formData.weight * formData.quantity,
        chargeableWeight: totalChargeableWeight
      });
    }

    return {
      quotes: quotes.filter(q => q.available).sort((a, b) => a.totalPrice - b.totalPrice),
      chargeableWeight,
      volumetricWeight,
      dimensions: formData.length && formData.width && formData.height 
        ? { length: formData.length, width: formData.width, height: formData.height }
        : undefined
    };
  };

  // Simple interpolation for pricing
  const interpolatePrice = (weight: number, pricing: Record<string, number>): number => {
    const weights = Object.keys(pricing).map(Number).sort((a, b) => a - b);
    
    if (weight <= weights[0]) return pricing[weights[0]];
    if (weight >= weights[weights.length - 1]) return pricing[weights[weights.length - 1]];
    
    for (let i = 0; i < weights.length - 1; i++) {
      const lower = weights[i];
      const upper = weights[i + 1];
      
      if (weight >= lower && weight <= upper) {
        const ratio = (weight - lower) / (upper - lower);
        return pricing[lower] + (pricing[upper] - pricing[lower]) * ratio;
      }
    }
    
    return pricing[weights[0]];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const pricingResult = await calculatePricing();
      setResult(pricingResult);
    } catch (error) {
      console.error('Error calculating pricing:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof PricingFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Calculator className="size-8 text-blue-600" />
          Multi-Carrier Shipping Calculator
        </h1>
        <p className="text-muted-foreground">
          Compare shipping rates from UPS, DHL, and ARAMEX carriers
        </p>
      </div>

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="size-5" />
            Shipment Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">Destination Country</Label>
                <Input
                  id="country"
                  placeholder="e.g., Germany, USA, France"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="weight">Weight per box (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={formData.weight}
                  onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || 0)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="quantity">Number of boxes</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="length">Length (cm) - Optional</Label>
                <Input
                  id="length"
                  type="number"
                  placeholder="Length"
                  value={formData.length || ''}
                  onChange={(e) => handleInputChange('length', parseFloat(e.target.value) || 0)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="width">Width (cm) - Optional</Label>
                <Input
                  id="width"
                  type="number"
                  placeholder="Width"
                  value={formData.width || ''}
                  onChange={(e) => handleInputChange('width', parseFloat(e.target.value) || 0)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm) - Optional</Label>
                <Input
                  id="height"
                  type="number"
                  placeholder="Height"
                  value={formData.height || ''}
                  onChange={(e) => handleInputChange('height', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Package Contents</Label>
              <Input
                id="content"
                placeholder="Describe what you're shipping"
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Calculating...
                </>
              ) : (
                <>
                  <Calculator className="size-4 mr-2" />
                  Calculate Shipping Rates
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Package Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="size-5" />
                Shipment Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Destination:</p>
                  <p className="font-medium">{formData.country}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Quantity:</p>
                  <p className="font-medium">{formData.quantity} box{formData.quantity > 1 ? 'es' : ''}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Chargeable Weight:</p>
                  <p className="font-medium">{result.chargeableWeight.toFixed(1)} kg</p>
                </div>
                {result.dimensions && (
                  <div>
                    <p className="text-muted-foreground">Dimensions:</p>
                    <p className="font-medium">
                      {result.dimensions.length}×{result.dimensions.width}×{result.dimensions.height} cm
                    </p>
                  </div>
                )}
              </div>
              
              {result.volumetricWeight && (
                <div className="mt-4 pt-4 border-t">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Actual Weight: </span>
                      <span className="font-medium">{formData.weight.toFixed(1)} kg</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Volumetric Weight: </span>
                      <span className="font-medium">{result.volumetricWeight.toFixed(1)} kg</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Carrier Quotes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {result.quotes.map((quote, index) => {
              const config = CARRIER_CONFIG[quote.carrier];
              const isLowest = index === 0;
              
              return (
                <motion.div
                  key={quote.carrier}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.1 }}
                  className={`relative rounded-xl border-2 p-6 ${config.borderColor} ${config.bgColor} transition-all duration-200 hover:shadow-lg ${isLowest ? 'ring-2 ring-green-500/50' : ''}`}
                >
                  {/* Best Price Badge */}
                  {isLowest && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <CheckCircle className="size-3" />
                        Best Price
                      </div>
                    </div>
                  )}

                  {/* Carrier Header */}
                  <div className="text-center mb-6">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r ${config.gradientFrom} ${config.gradientTo} text-white font-bold text-sm mb-3`}>
                      {config.avatar}
                    </div>
                    <h3 className={`font-semibold ${config.textColor}`}>
                      {config.name}
                    </h3>
                    {quote.region && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Region {quote.region}
                      </p>
                    )}
                  </div>

                  {/* Pricing */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="size-4 text-green-600 dark:text-green-400" />
                        <span className="font-medium">Total Price:</span>
                      </div>
                      <span className={`text-2xl font-bold ${config.priceColor}`}>
                        ${quote.totalPrice.toFixed(2)}
                      </span>
                    </div>
                    
                    <p className="text-xs text-muted-foreground text-right">USD</p>
                  </div>

                  {/* Service Info */}
                  <div className="mt-4 pt-4 border-t border-border space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Globe className="size-4" />
                      <span>Express Service</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Package className="size-4" />
                      <span>{formData.quantity} box{formData.quantity !== 1 ? 'es' : ''}</span>
                    </div>
                    {(quote.actualWeight || quote.chargeableWeight) && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Weight className="size-4" />
                        <span>{quote.actualWeight || quote.chargeableWeight} kg total</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground space-y-2">
            {result.quotes.length < 3 && (
              <p>
                ARAMEX service may not be available for this destination.
              </p>
            )}
            <p>All prices are in USD and include express delivery service.</p>
          </div>
        </motion.div>
      )}

      {/* No Results */}
      {result && result.quotes.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <Truck className="size-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No carriers available</h3>
          <p className="text-muted-foreground">
            Sorry, no shipping options are available for this destination.
            Please check your country name and try again.
          </p>
        </motion.div>
      )}
    </div>
  );
}
