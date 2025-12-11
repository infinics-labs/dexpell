import { create } from "zustand";

export interface CarrierQuote {
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

export interface PriceCardData {
  country: string;
  quotes: CarrierQuote[];
  quantity?: number;
  totalWeight?: number;
  timestamp: number;
}

interface PriceCardState {
  // Current price card data from chat
  currentPriceCardData: PriceCardData | null;
  
  // Selected carrier info for form
  selectedCarrier: string | null;
  selectedQuote: CarrierQuote | null;
  
  // Actions
  setPriceCardData: (data: PriceCardData) => void;
  setSelectedCarrier: (carrier: string, quote: CarrierQuote) => void;
  clearSelectedCarrier: () => void;
}

const usePriceCardStore = create<PriceCardState>((set) => ({
  currentPriceCardData: null,
  selectedCarrier: null,
  selectedQuote: null,

  setPriceCardData: (data: PriceCardData) => {
    set({
      currentPriceCardData: data,
    });
  },

  setSelectedCarrier: (carrier: string, quote: CarrierQuote) => {
    set({
      selectedCarrier: carrier,
      selectedQuote: quote,
    });
  },

  clearSelectedCarrier: () => {
    set({
      selectedCarrier: null,
      selectedQuote: null,
    });
  },
}));

export default usePriceCardStore;
