'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { 
  Package, 
  CheckCircle,
  Globe,
  Weight,
  Scale,
  Ruler
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Carrier configuration with enhanced styling
const CARRIER_CONFIG = {
  UPS: {
    name: 'UPS Express',
    borderColor: 'border-blue-200 dark:border-blue-800',
    bgColor: 'bg-blue-50 dark:bg-blue-950',
    textColor: 'text-blue-700 dark:text-blue-300',
    priceColor: 'text-blue-600 dark:text-blue-400',
    logoPath: '/logos/ups-logo.png'
  },
  DHL: {
    name: 'DHL Express',
    borderColor: 'border-orange-200 dark:border-orange-700',
    bgColor: 'bg-orange-50 dark:bg-orange-900',
    textColor: 'text-orange-700 dark:text-orange-300',
    priceColor: 'text-orange-600 dark:text-orange-400',
    logoPath: '/logos/dhl-logo.png'
  },
  ARAMEX: {
    name: 'ARAMEX Express',
    borderColor: 'border-orange-200 dark:border-orange-800',
    bgColor: 'bg-orange-50 dark:bg-orange-950',
    textColor: 'text-orange-700 dark:text-orange-300',
    priceColor: 'text-orange-600 dark:text-orange-400',
    logoPath: '/logos/aramex-logo.png'
  }
};

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

interface SelectablePriceCardProps {
  country: string;
  quotes: CarrierQuote[];
  quantity?: number;
  totalWeight?: number;
  language?: 'en' | 'tr';
  selectedCarrier?: string;
  onCarrierSelect?: (carrier: string, quote: CarrierQuote) => void;
}

export function SelectablePriceCard({ 
  country, 
  quotes, 
  quantity = 1,
  totalWeight,
  language = 'en',
  selectedCarrier,
  onCarrierSelect
}: SelectablePriceCardProps) {
  // Calculate final quantity with proper fallback logic
  const finalQuantity = quantity ?? 1;
  
  const availableQuotes = quotes.filter(q => q.available);

  // Sort quotes by price (lowest first)
  const sortedQuotes = [...availableQuotes].sort((a, b) => a.totalPrice - b.totalPrice);

  const getText = (key: string) => {
    const texts = {
      shippingTo: language === 'tr' ? `${country}'ya Gönderim` : `Shipping to ${country}`,
      packages: language === 'tr' ? 'paket' : 'packages',
      package: language === 'tr' ? 'paket' : 'package',
      totalWeight: language === 'tr' ? 'Toplam Ağırlık:' : 'Total Weight:',
      bestPrice: language === 'tr' ? 'En İyi Fiyat' : 'Best Price',
      totalPrice: language === 'tr' ? 'Toplam Fiyat' : 'Total Price',
      box: language === 'tr' ? 'kutu' : 'box',
      boxes: language === 'tr' ? 'kutu' : 'boxes',
      to: language === 'tr' ? `${country}'ya` : `To ${country}`,
      selected: language === 'tr' ? 'Seçildi' : 'Selected',
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
        <div className="flex items-center justify-center gap-2 text-lg font-semibold text-white">
          <Globe className="w-5 h-5 text-blue-400" />
          <span>{getText('shippingTo')}</span>
        </div>
        <div className="flex items-center justify-center gap-4 text-sm">
          {quantity > 1 && (
            <div className="flex items-center gap-1">
              <Package className="w-4 h-4 text-gray-400" />
              <span className="text-gray-300">{quantity} {getText('packages')}</span>
            </div>
          )}
          {totalWeight && (
            <div className="flex items-center gap-1">
              <Weight className="w-4 h-4 text-gray-400" />
              <span className="text-gray-300">{getText('totalWeight')}</span>
              <span className="font-semibold text-blue-400">
                {totalWeight}kg
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Carrier Quote Cards */}
      <div className="space-y-3">
        {sortedQuotes.map((quote, index) => {
          const config = CARRIER_CONFIG[quote.carrier];
          const isLowest = index === 0 && sortedQuotes.length > 1;
          const isSelected = selectedCarrier === quote.carrier;

          return (
            <motion.div
              key={quote.carrier}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative cursor-pointer transition-all duration-200 ${
                isSelected ? 'ring-2 ring-blue-500 scale-[1.02]' : 
                isLowest ? 'ring-2 ring-green-500' : ''
              }`}
              onClick={() => onCarrierSelect?.(quote.carrier, quote)}
            >
              <Card className={`
                ${isSelected 
                  ? 'bg-blue-900/30 border-blue-500' 
                  : 'bg-slate-800/50 border-gray-600 hover:bg-slate-700/50'
                } 
                relative overflow-hidden transition-all duration-200
              `}>
                {isLowest && !isSelected && (
                  <div className="absolute top-0 right-0 bg-green-500 text-white text-xs px-2 py-1 rounded-bl-lg">
                    {getText('bestPrice')}
                  </div>
                )}
                
                {isSelected && (
                  <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs px-2 py-1 rounded-bl-lg">
                    {getText('selected')}
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
                        <CardTitle className={`text-lg ${isSelected ? 'text-blue-300' : 'text-white'}`}>
                          {config.name}
                        </CardTitle>
                        <div className="text-xs text-gray-400">
                          {quote.region && `Region ${quote.region}`}
                        </div>
                      </div>
                    </div>
                    <CheckCircle className={`w-5 h-5 ${isSelected ? 'text-blue-400' : 'text-green-400'}`} />
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Price display */}
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${isSelected ? 'text-blue-400' : config.priceColor}`}>
                      ${quote.totalPrice.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-400">{getText('totalPrice')}</div>
                  </div>

                  {/* Weight Details */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2 p-3 bg-gray-800/50 rounded-lg">
                      {/* Actual Weight */}
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Scale className="w-3 h-3 text-gray-400" />
                        </div>
                        <div className="text-xs text-gray-400 mb-1">
                          {getText('actualWeight')}
                        </div>
                        <div className={`font-semibold text-sm ${quote.calculationMethod === 'actual' ? 'text-green-400' : 'text-gray-300'}`}>
                          {quote.actualWeight ? `${quote.actualWeight}kg` : '-'}
                        </div>
                        {quote.calculationMethod === 'actual' && (
                          <div className="text-xs text-green-400 mt-1">✓</div>
                        )}
                      </div>

                      {/* Volumetric Weight */}
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Ruler className="w-3 h-3 text-gray-400" />
                        </div>
                        <div className="text-xs text-gray-400 mb-1">
                          {getText('volumetricWeight')}
                        </div>
                        <div className={`font-semibold text-sm ${quote.calculationMethod === 'volumetric' ? 'text-orange-400' : 'text-gray-300'}`}>
                          {quote.volumetricWeight ? `${quote.volumetricWeight}kg` : '-'}
                        </div>
                        {quote.calculationMethod === 'volumetric' && (
                          <div className="text-xs text-orange-400 mt-1">✓</div>
                        )}
                      </div>

                      {/* Chargeable Weight */}
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Weight className="w-3 h-3 text-gray-400" />
                        </div>
                        <div className="text-xs text-gray-400 mb-1">
                          {getText('chargeableWeight')}
                        </div>
                        <div className="font-semibold text-sm text-blue-400">
                          {quote.chargeableWeight ? `${quote.chargeableWeight}kg` : '-'}
                        </div>
                        <div className="text-xs text-blue-400 mt-1">
                          {getText('usedForCalculation')}
                        </div>
                      </div>
                    </div>
                    
                    {/* Delivery time */}
                    <div className="flex items-center gap-2 text-sm font-medium text-green-400 pt-2 border-t border-gray-600">
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
    </div>
  );
}

export default SelectablePriceCard;
