// Client-side cargo pricing function - calls API route

// Main cargo pricing function - calls API route
export const cargoPricing = async ({
  content,
  country,
  weight,
  length,
  width,
  height,
  quantity = 1,
}: {
  content: string;
  country?: string;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  quantity?: number;
}) => {
  try {
    const params = new URLSearchParams();
    params.append('content', content);
    if (country) params.append('country', country);
    if (weight !== undefined) params.append('weight', weight.toString());
    if (length !== undefined) params.append('length', length.toString());
    if (width !== undefined) params.append('width', width.toString());
    if (height !== undefined) params.append('height', height.toString());
    if (quantity !== undefined) params.append('quantity', quantity.toString());

    const response = await fetch(`/api/functions/cargo_pricing?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    return {
      allowed: true,
      error: true,
      message: `Error calculating shipping price: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
};
