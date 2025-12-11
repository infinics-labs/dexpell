'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { 
  Package, 
  Scale, 
  Ruler, 
  Truck,
  CheckCircle,
  Globe,
  Info,
  Calculator,
  TrendingUp,
  TrendingDown,
  Box,
  Weight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Carrier configuration with enhanced styling
const CARRIER_CONFIG = {
  UPS: {
    name: 'UPS Express',
    gradientFrom: 'from-blue-500',
    gradientTo: 'to-indigo-500',
    borderColor: 'border-blue-200 dark:border-blue-800',
    bgColor: 'bg-blue-50 dark:bg-blue-950',
    textColor: 'text-blue-700 dark:text-blue-300',
    priceColor: 'text-blue-600 dark:text-blue-400',
    avatar: 'UPS',
    logoPath: '/logos/ups-logo.png'
  },
  DHL: {
    name: 'DHL Express',
    gradientFrom: 'from-orange-400',
    gradientTo: 'to-yellow-500',
    borderColor: 'border-orange-200 dark:border-orange-700',
    bgColor: 'bg-orange-50 dark:bg-orange-900',
    textColor: 'text-orange-700 dark:text-orange-300',
    priceColor: 'text-orange-600 dark:text-orange-400',
    avatar: 'DHL',
    logoPath: '/logos/dhl-logo.png'
  },
  ARAMEX: {
    name: 'ARAMEX Express',
    gradientFrom: 'from-orange-500',
    gradientTo: 'to-red-500',
    borderColor: 'border-orange-200 dark:border-orange-800',
    bgColor: 'bg-orange-50 dark:bg-orange-950',
    textColor: 'text-orange-700 dark:text-orange-300',
    priceColor: 'text-orange-600 dark:text-orange-400',
    avatar: 'ARX',
    logoPath: '/logos/aramex-logo.png'
  }
};

interface BoxCalculationResult {
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

interface DimensionalAnalysisResult {
  scenario: 'identical' | 'mixed_weights' | 'mixed_dimensions' | 'completely_mixed';
  totalBoxes: number;
  actualWeightTotal: number;
  volumetricWeightTotal: number;
  chargeableWeightTotal: number;
  roundedWeightTotal: number;
  dimensionalAdvantage: number;
  recommendations: string[];
}

interface CarrierQuote {
  carrier: 'UPS' | 'DHL' | 'ARAMEX';
  pricePerBox?: number;
  totalPrice: number;
  available: boolean;
  region?: number | string;
  serviceType: string;
  actualWeight?: number;
  volumetricWeight?: number;
  chargeableWeight?: number;
  calculationMethod?: 'actual' | 'volumetric';
  isDimensionalWeight?: boolean;
}

interface EnhancedPriceCardProps {
  country: string;
  quotes: CarrierQuote[];
  boxCalculations?: BoxCalculationResult[];
  dimensionalAnalysis?: DimensionalAnalysisResult;
  quantity?: number;
  totalWeight?: number;
  showDetailedAnalysis?: boolean;
  language?: 'en' | 'tr';
}

export function EnhancedPriceCard({ 
  country, 
  quotes, 
  boxCalculations, 
  dimensionalAnalysis,
  quantity,
  totalWeight,
  showDetailedAnalysis = false,
  language = 'en'
}: EnhancedPriceCardProps) {
  // Calculate quantity automatically from dimensional analysis if not provided
  const finalQuantity = quantity ?? dimensionalAnalysis?.totalBoxes ?? 1;
  
  const availableQuotes = quotes.filter(q => q.available);

  // Sort quotes by price (lowest first)
  const sortedQuotes = [...availableQuotes].sort((a, b) => a.totalPrice - b.totalPrice);

  const getScenarioIcon = (scenario: string) => {
    switch (scenario) {
      case 'identical': return <Package className="w-4 h-4" />;
      case 'mixed_weights': return <Scale className="w-4 h-4" />;
      case 'mixed_dimensions': return <Ruler className="w-4 h-4" />;
      case 'completely_mixed': return <Box className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const getScenarioColor = (scenario: string) => {
    switch (scenario) {
      case 'identical': return 'text-green-600 dark:text-green-400';
      case 'mixed_weights': return 'text-blue-600 dark:text-blue-400';
      case 'mixed_dimensions': return 'text-yellow-600 dark:text-yellow-400';
      case 'completely_mixed': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getText = (key: string) => {
    const texts = {
      shippingTo: language === 'tr' ? `${country}'ya Gönderim` : `Shipping to ${country}`,
      packages: language === 'tr' ? 'paket' : 'packages',
      package: language === 'tr' ? 'paket' : 'package',
      totalWeight: language === 'tr' ? 'Toplam Ağırlık:' : 'Total Weight:',
      dimensionalAnalysis: language === 'tr' ? 'Boyutsal Analiz' : 'Dimensional Analysis',
      scenario: language === 'tr' ? 'Senaryo' : 'Scenario',
      identicalScenario: language === 'tr' ? 'Aynı Boyutlar' : 'Identical',
      mixedWeightsScenario: language === 'tr' ? 'Farklı Ağırlıklar' : 'Mixed Weights',
      mixedDimensionsScenario: language === 'tr' ? 'Farklı Boyutlar' : 'Mixed Dimensions',
      completelyMixedScenario: language === 'tr' ? 'Tamamen Karışık' : 'Completely Mixed',
      bestPrice: language === 'tr' ? 'En İyi Fiyat' : 'Best Price',
      totalPrice: language === 'tr' ? 'Toplam Fiyat' : 'Total Price',
      box: language === 'tr' ? 'kutu' : 'box',
      boxes: language === 'tr' ? 'kutu' : 'boxes',
      to: language === 'tr' ? `${country}'ya` : `To ${country}`,
      deliveryTime: language === 'tr' ? 'Teslimat süresi:' : 'Delivery time:',
      days: language === 'tr' ? 'gün' : 'days',
      finalPricing: language === 'tr' ? 'Fiyatlar tüm geçerli ücretleri içerir. Nihai fiyatlandırma depoda ölçüm sonrası teyit edilir.' : 'Prices include all applicable charges. Final pricing confirmed after measurement at warehouse.',
      actualWeight: language === 'tr' ? 'Gerçek Ağırlık' : 'Actual Weight',
      volumetricWeight: language === 'tr' ? 'Hacimsel Ağırlık' : 'Volumetric Weight',
      chargeableWeight: language === 'tr' ? 'Ücretlendirilen Ağırlık' : 'Chargeable Weight',
      usedForCalculation: language === 'tr' ? 'Fiyat hesaplamasında kullanıldı' : 'Used for calculation'
    };
    return texts[key as keyof typeof texts] || key;
  };

  return (
    <div className="space-y-6">
      {/* Header with destination and summary */}
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-2 text-lg font-semibold">
          <Globe className="w-5 h-5 text-blue-600" />
          <span>{getText('shippingTo')}</span>
        </div>
        <div className="flex items-center justify-center gap-4 text-sm">
          {finalQuantity > 1 && (
            <div className="flex items-center gap-1">
              <Package className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600 dark:text-gray-400">{finalQuantity} {getText('packages')}</span>
            </div>
          )}
          {(totalWeight || dimensionalAnalysis?.chargeableWeightTotal) && (
            <div className="flex items-center gap-1">
              <Scale className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600 dark:text-gray-400">{getText('totalWeight')}</span>
              <span className="font-semibold text-primary">
                {(totalWeight || dimensionalAnalysis?.chargeableWeightTotal)?.toFixed(1)}kg
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Dimensional Analysis Card */}
      {dimensionalAnalysis && showDetailedAnalysis && (
        <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calculator className="w-5 h-5" />
              {getText('dimensionalAnalysis')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Scenario type */}
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-2 ${getScenarioColor(dimensionalAnalysis.scenario)}`}>
                {getScenarioIcon(dimensionalAnalysis.scenario)}
                <span className="font-medium">
                  {dimensionalAnalysis.scenario === 'identical' ? getText('identicalScenario') :
                   dimensionalAnalysis.scenario === 'mixed_weights' ? getText('mixedWeightsScenario') :
                   dimensionalAnalysis.scenario === 'mixed_dimensions' ? getText('mixedDimensionsScenario') :
                   dimensionalAnalysis.scenario === 'completely_mixed' ? getText('completelyMixedScenario') :
                   dimensionalAnalysis.scenario} {getText('scenario')}
                </span>
              </div>
            </div>

            {/* Weight breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-center">
                <div className="text-xs text-gray-500 dark:text-gray-400">Actual Weight</div>
                <div className="font-semibold">{dimensionalAnalysis.actualWeightTotal}kg</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500 dark:text-gray-400">Volumetric Weight</div>
                <div className="font-semibold">{dimensionalAnalysis.volumetricWeightTotal}kg</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500 dark:text-gray-400">Chargeable Weight</div>
                <div className="font-semibold text-blue-600">{dimensionalAnalysis.chargeableWeightTotal}kg</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500 dark:text-gray-400">Rounded Weight</div>
                <div className="font-semibold text-green-600">{dimensionalAnalysis.roundedWeightTotal}kg</div>
              </div>
            </div>

            {/* Dimensional advantage indicator */}
            {dimensionalAnalysis.dimensionalAdvantage !== 0 && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950">
                {dimensionalAnalysis.dimensionalAdvantage > 0 ? (
                  <TrendingUp className="w-4 h-4 text-orange-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-green-600" />
                )}
                <span className="text-sm">
                  {dimensionalAnalysis.dimensionalAdvantage > 0 
                    ? `Volumetric weight is ${Math.abs(dimensionalAnalysis.dimensionalAdvantage)}kg higher`
                    : `Actual weight advantage of ${Math.abs(dimensionalAnalysis.dimensionalAdvantage)}kg`
                  }
                </span>
              </div>
            )}

            {/* Recommendations */}
            {dimensionalAnalysis.recommendations.length > 0 && (
              <div className="space-y-2">
                <div className="font-medium text-sm">Recommendations:</div>
                {dimensionalAnalysis.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Info className="w-3 h-3 mt-0.5 text-blue-500 flex-shrink-0" />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Box Calculations Detail */}
      {boxCalculations && showDetailedAnalysis && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Box className="w-5 h-5" />
              Box-by-Box Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {boxCalculations.map((box, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">Box {box.boxNumber} {box.quantity > 1 && `(×${box.quantity})`}</div>
                    <div className="text-sm text-gray-500">{box.dimensions}</div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-xs text-gray-500">Actual</div>
                      <div className="font-medium">{box.actualWeight}kg</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Volumetric</div>
                      <div className="font-medium">{box.volumetricWeight}kg</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Chargeable</div>
                      <div className={`font-medium ${box.isDimensionalWeight ? 'text-orange-600' : 'text-green-600'}`}>
                        {box.chargeableWeight}kg
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    <Weight className="w-3 h-3" />
                    <span className="text-xs text-gray-600">
                      Calculated by {box.calculationMethod} weight
                      {box.weightDifference !== 0 && (
                        <span className="ml-1">
                          (diff: {box.weightDifference > 0 ? '+' : ''}{box.weightDifference}kg)
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Carrier Quote Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sortedQuotes.map((quote, index) => {
          const config = CARRIER_CONFIG[quote.carrier];
          const isLowest = index === 0 && sortedQuotes.length > 1;

          return (
            <motion.div
              key={quote.carrier}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative ${isLowest ? 'ring-2 ring-green-500' : ''}`}
            >
              <Card className={`${config.borderColor} ${config.bgColor} relative overflow-hidden`}>
                {isLowest && (
                  <div className="absolute top-0 right-0 bg-green-500 text-white text-xs px-2 py-1 rounded-bl-lg">
                    {getText('bestPrice')}
                  </div>
                )}
                
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white border shadow-sm flex items-center justify-center p-1">
                        <Image
                          src={config.logoPath}
                          alt={`${quote.carrier} logo`}
                          width={quote.carrier === 'UPS' ? 36 : 32}
                          height={quote.carrier === 'UPS' ? 36 : 32}
                          className="object-contain"
                        />
                      </div>
                      <div>
                        <CardTitle className={`text-lg ${config.textColor}`}>
                          {config.name}
                        </CardTitle>
                        <div className="text-xs text-gray-500">
                          {quote.region && `Region ${quote.region}`}
                        </div>
                      </div>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Price display */}
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${config.priceColor}`}>
                      ${quote.totalPrice.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-500">{getText('totalPrice')}</div>
                  </div>

                  {/* Weight Details */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      {/* Actual Weight */}
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Scale className="w-3 h-3 text-gray-500" />
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          {getText('actualWeight')}
                        </div>
                        <div className={`font-semibold text-sm ${quote.calculationMethod === 'actual' ? 'text-green-600 dark:text-green-400' : ''}`}>
                          {quote.actualWeight ? `${quote.actualWeight}kg` : '-'}
                        </div>
                        {quote.calculationMethod === 'actual' && (
                          <div className="text-xs text-green-600 dark:text-green-400 mt-1">✓</div>
                        )}
                      </div>

                      {/* Volumetric Weight */}
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Ruler className="w-3 h-3 text-gray-500" />
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          {getText('volumetricWeight')}
                        </div>
                        <div className={`font-semibold text-sm ${quote.calculationMethod === 'volumetric' ? 'text-orange-600 dark:text-orange-400' : ''}`}>
                          {quote.volumetricWeight ? `${quote.volumetricWeight}kg` : '-'}
                        </div>
                        {quote.calculationMethod === 'volumetric' && (
                          <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">✓</div>
                        )}
                      </div>

                      {/* Chargeable Weight */}
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Weight className="w-3 h-3 text-gray-500" />
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          {getText('chargeableWeight')}
                        </div>
                        <div className="font-semibold text-sm text-blue-600 dark:text-blue-400">
                          {quote.chargeableWeight ? `${quote.chargeableWeight}kg` : '-'}
                        </div>
                        <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          {getText('usedForCalculation')}
                        </div>
                      </div>
                    </div>
                    
                    {/* Delivery time */}
                    <div className="flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400 pt-2 border-t border-gray-200 dark:border-gray-700">
                      <CheckCircle className="w-4 h-4" />
                      <span>
                        {language === 'tr' 
                          ? 'Tahmini kargo süresi 1-3 günüdür' 
                          : 'Delivery time: 1-3 days'
                        }
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}

      </div>

      {/* Summary note */}
      {sortedQuotes.length > 0 && (
        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          {getText('finalPricing')}
        </div>
      )}
    </div>
  );
}

export default EnhancedPriceCard;
