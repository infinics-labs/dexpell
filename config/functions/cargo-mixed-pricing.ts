// Mixed box pricing function - calls API route
export const cargoMixedPricing = async ({
  content,
  country,
  boxes,
}: {
  content: string;
  country: string;
  boxes: {
    weight: number;
    length: number;
    width: number;
    height: number;
    quantity?: number;
  }[];
}) => {
  try {
    const response = await fetch('/api/functions/cargo_mixed_pricing', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content,
        country,
        boxes,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    return {
      allowed: true,
      error: true,
      message: `Error calculating mixed box pricing: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
};
