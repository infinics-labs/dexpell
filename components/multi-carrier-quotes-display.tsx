'use client';

// Removed unused imports
import { EnhancedPriceCard } from './enhanced-price-card';
import usePriceCardStore from '@/stores/usePriceCardStore';
import { useEffect } from 'react';


interface CarrierQuote {
  carrier: 'UPS' | 'DHL' | 'ARAMEX';
  pricePerBox?: number;
  totalPrice: number;
  available: boolean;
  region?: number | string;
  serviceType: string;
}

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

interface MultiCarrierQuotesDisplayProps {
  country: string;
  quotes: CarrierQuote[];
  quantity?: number;
  boxCalculations?: BoxCalculationResult[];
  dimensionalAnalysis?: DimensionalAnalysisResult;
  showDetailedAnalysis?: boolean;
  language?: 'en' | 'tr';
}

export function MultiCarrierQuotesDisplay({
  country,
  quotes,
  quantity = 1,
  boxCalculations,
  dimensionalAnalysis,
  showDetailedAnalysis = false,
  language = 'en',
}: MultiCarrierQuotesDisplayProps) {
  const { setPriceCardData } = usePriceCardStore();
  
  // Calculate final quantity with proper fallback logic for mixed boxes
  const finalQuantity = quantity ?? dimensionalAnalysis?.totalBoxes ?? 1;
  
  // Save price card data to store when component mounts (chat'i etkilemez)
  useEffect(() => {
    try {
      if (quotes && quotes.length > 0) {
        setPriceCardData({
          country,
          quotes,
          quantity: finalQuantity,
          totalWeight: dimensionalAnalysis?.chargeableWeightTotal,
          timestamp: Date.now(),
        });
      }
    } catch (error) {
      // Hata olursa sadece log yaz, chat'i etkileme
      console.log('Price card store error (non-critical):', error);
    }
  }, [country, quotes, finalQuantity, dimensionalAnalysis?.chargeableWeightTotal, setPriceCardData]);
  
  // Use the enhanced price card component
  return (
    <div className="w-full space-y-6">
      <EnhancedPriceCard
        country={country}
        quotes={quotes}
        boxCalculations={boxCalculations}
        dimensionalAnalysis={dimensionalAnalysis}
        quantity={finalQuantity}
        totalWeight={undefined}
        showDetailedAnalysis={showDetailedAnalysis}
        language={language}
      />
    </div>
  );
}

export default MultiCarrierQuotesDisplay;