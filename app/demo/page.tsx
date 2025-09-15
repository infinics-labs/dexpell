'use client';

import { MultiCarrierQuotesDisplay } from '@/components/multi-carrier-quotes-display';
import { SingleCarrierQuoteDisplay } from '@/components/single-carrier-quote-display';

// Sample data that matches the actual API response structure from your terminal
const sampleMultiCarrierData = {
  country: "Australia",
  quotes: [
    {
      carrier: "UPS" as const,
      available: true,
      pricePerBox: 147.98,
      totalPrice: 295.95,
      serviceType: "UPS Express",
      region: 7
    },
    {
      carrier: "DHL" as const,
      available: true,
      pricePerBox: 202.03,
      totalPrice: 404.05,
      serviceType: "DHL Express",
      region: 8
    },
    {
      carrier: "ARAMEX" as const,
      available: false,
      totalPrice: 0,
      serviceType: "ARAMEX Express"
    }
  ],
  quantity: 2,
  chargeableWeight: 32,
  chargeableWeightPerBox: 16,
  actualWeight: 5,
  volumetricWeight: 16,
  length: 40,
  width: 40,
  height: 50,
  content: "general cargo"
};

const sampleSingleCarrierData = {
  country: "Australia",
  carrier: "UPS" as const,
  pricePerBox: 57.96,
  totalPrice: 115.92,
  quantity: 2,
  chargeableWeight: 10,
  actualWeight: 5,
  content: "general cargo",
  region: 7,
  isDraft: true
};

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-background p-6 space-y-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-2">Price Card Demo</h1>
        <p className="text-muted-foreground text-center mb-8">
          Demonstrating the price card system with real data from cargo_multi_pricing API
        </p>

        {/* Multi-Carrier Example */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Multi-Carrier Quotes</h2>
          <p className="text-muted-foreground">
            This is the exact data structure returned by cargo_multi_pricing for 2 boxes to Sydney, Australia (5kg each, 40×40×50 cm)
          </p>
          <MultiCarrierQuotesDisplay {...sampleMultiCarrierData} />
        </div>

        {/* Single Carrier Example */}

        {/* API Response Preview */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">API Response Structure</h2>
          <p className="text-muted-foreground">
            This is the actual JSON structure from your cargo_multi_pricing API call:
          </p>
          <div className="bg-muted/50 rounded-lg p-4 overflow-x-auto">
            <pre className="text-sm">
{JSON.stringify({
  "allowed": true,
  "success": true,
  "multiCarrier": true,
  "data": sampleMultiCarrierData
}, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
