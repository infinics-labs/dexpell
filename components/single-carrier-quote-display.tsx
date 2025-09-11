'use client';

import { motion } from 'framer-motion';
import { 
  Package, 
  Scale, 
  Ruler, 
  DollarSign, 
  Truck,
  Globe,
  Info
} from 'lucide-react';

// Single carrier configuration with styling - matches Dexpellweb design
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

interface SingleCarrierQuoteDisplayProps {
  country: string;
  carrier: 'UPS' | 'DHL' | 'ARAMEX';
  pricePerBox?: number;
  totalPrice: number;
  quantity?: number;
  chargeableWeight: number;
  actualWeight?: number;
  volumetricWeight?: number;
  length?: number;
  width?: number;
  height?: number;
  content: string;
  region?: number;
  isDraft?: boolean;
}

export function SingleCarrierQuoteDisplay({
  country,
  carrier,
  pricePerBox,
  totalPrice,
  quantity = 1,
  chargeableWeight,
  actualWeight,
  volumetricWeight,
  length,
  width,
  height,
  content,
  region,
  isDraft = false,
}: SingleCarrierQuoteDisplayProps) {
  const config = CARRIER_CONFIG[carrier];
  const dimensions = length && width && height ? { length, width, height } : undefined;

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-3"
      >
        <h3 className="text-xl font-semibold flex items-center justify-center gap-2">
          <Truck className="size-5" />
          {isDraft ? 'Draft Shipping Quote' : 'Shipping Quote'}
        </h3>
        <div className="flex items-center justify-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Globe className="size-4 text-muted-foreground" />
            <span className="text-muted-foreground">To:</span>
            <span className="font-medium">{country}</span>
          </div>
          <div className="flex items-center gap-1">
            <Scale className="size-4 text-muted-foreground" />
            <span className="text-muted-foreground">Total Weight:</span>
            <span className="font-semibold text-primary">{chargeableWeight.toFixed(1)} kg</span>
          </div>
        </div>
      </motion.div>

      {/* Package Information */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-muted/50 rounded-lg p-4"
      >
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <Package className="size-4" />
          Shipment Details
        </h4>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="space-y-1">
            <p className="text-muted-foreground">Contents:</p>
            <p className="font-medium">{content}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-muted-foreground">Quantity:</p>
            <p className="font-medium">{quantity} box{quantity === 1 ? '' : 'es'}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-muted-foreground flex items-center gap-1">
              <Scale className="size-3" />
              Chargeable Weight:
            </p>
            <p className="font-medium">{chargeableWeight.toFixed(1)} kg</p>
          </div>
          
          {dimensions && (
            <div className="space-y-1">
              <p className="text-muted-foreground flex items-center gap-1">
                <Ruler className="size-3" />
                Dimensions:
              </p>
              <p className="font-medium">{dimensions.length}×{dimensions.width}×{dimensions.height} cm</p>
            </div>
          )}
        </div>

        {actualWeight && volumetricWeight && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Actual Weight: </span>
                <span className="font-medium">{actualWeight.toFixed(1)} kg per box</span>
              </div>
              <div>
                <span className="text-muted-foreground">Volumetric Weight: </span>
                <span className="font-medium">{volumetricWeight.toFixed(1)} kg per box</span>
              </div>
            </div>
            {volumetricWeight > (actualWeight || 0) && (
              <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                <div className="flex items-center gap-2 text-sm text-yellow-800 dark:text-yellow-200">
                  <Info className="size-4" />
                  <span>Pricing based on volumetric weight (higher than actual weight)</span>
                </div>
              </div>
            )}
          </div>
        )}

        {isDraft && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="p-2 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md">
              <div className="flex items-center gap-2 text-sm text-blue-800 dark:text-blue-200">
                <Info className="size-4" />
                <span>This is a draft price based on actual weight only. Final pricing will be calculated with dimensions.</span>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Carrier Quote */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`relative rounded-xl border-2 p-6 ${config.borderColor} ${config.bgColor} transition-all duration-200 hover:shadow-lg max-w-md mx-auto`}
      >
        {/* Carrier Header */}
        <div className="text-center mb-4">
          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r ${config.gradientFrom} ${config.gradientTo} text-white font-bold text-lg mb-2`}>
            {config.avatar}
          </div>
          <h4 className={`font-semibold ${config.textColor}`}>
            {config.name}
          </h4>
          {region && (
            <p className="text-xs text-muted-foreground mt-1">
              Region {region}
            </p>
          )}
        </div>

        {/* Pricing */}
        <div className="space-y-3">
          {quantity > 1 && pricePerBox && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Per box:</span>
              <span className="font-medium">${pricePerBox.toFixed(2)}</span>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="size-4 text-green-600 dark:text-green-400" />
              <span className="font-medium">
                {quantity > 1 ? 'Total:' : 'Price:'}
              </span>
            </div>
            <span className={`text-2xl font-bold ${config.priceColor}`}>
              ${totalPrice.toFixed(2)}
            </span>
          </div>
          
          {quantity > 1 && pricePerBox && (
            <p className="text-xs text-muted-foreground text-right">
              ({quantity} boxes × ${pricePerBox.toFixed(2)})
            </p>
          )}
          
          <p className="text-xs text-muted-foreground text-right">USD</p>
        </div>

        {/* Service Info */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Globe className="size-4" />
            <span>Express Service</span>
          </div>
        </div>
      </motion.div>

      {/* Footer Note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center text-sm text-muted-foreground"
      >
        <p>
          Price is in USD and includes express delivery service.
        </p>
      </motion.div>
    </div>
  );
}
