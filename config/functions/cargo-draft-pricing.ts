// Client-side cargo draft pricing function - calls API route

// Draft cargo pricing function - calls API route
export const cargoDraftPricing = async ({
  content,
  country,
  weight,
  quantity = 1,
  carrier,
}: {
  content: string;
  country: string;
  weight: number;
  quantity?: number;
  carrier?: 'UPS' | 'DHL';
}) => {
  try {
    const params = new URLSearchParams();
    params.append('content', content);
    params.append('country', country);
    params.append('weight', weight.toString());
    params.append('quantity', quantity.toString());
    if (carrier) params.append('carrier', carrier);

    const response = await fetch(`/api/functions/cargo_draft_pricing?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    return {
      allowed: true,
      error: true,
      message: `Error calculating draft shipping price: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
};
