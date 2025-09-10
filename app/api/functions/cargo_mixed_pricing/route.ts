import { NextResponse } from 'next/server';
import { calculateMixedBoxPricing, BoxDetails } from '@/lib/cargo-pricing-core';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { content, country, boxes } = body;

    // Validate required fields
    if (!content) {
      return NextResponse.json({
        allowed: true,
        error: true,
        message: 'Content description is required.',
      });
    }

    if (!country) {
      return NextResponse.json({
        allowed: true,
        error: true,
        message: 'Destination country is required.',
      });
    }

    if (!boxes || !Array.isArray(boxes) || boxes.length === 0) {
      return NextResponse.json({
        allowed: true,
        error: true,
        message: 'Boxes array is required with at least one box.',
      });
    }

    // Validate each box
    for (let i = 0; i < boxes.length; i++) {
      const box = boxes[i];
      if (!box.weight || box.weight <= 0) {
        return NextResponse.json({
          allowed: true,
          error: true,
          message: `Box ${i + 1}: Weight is required and must be greater than 0.`,
        });
      }
      if (!box.length || !box.width || !box.height || box.length <= 0 || box.width <= 0 || box.height <= 0) {
        return NextResponse.json({
          allowed: true,
          error: true,
          message: `Box ${i + 1}: All dimensions (length, width, height) are required and must be greater than 0.`,
        });
      }
    }

    // Call the mixed box pricing function
    const result = await calculateMixedBoxPricing({
      content,
      country,
      boxes: boxes as BoxDetails[],
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Mixed box pricing error:', error);
    return NextResponse.json({
      allowed: true,
      error: true,
      message: `Error calculating mixed box pricing: ${error instanceof Error ? error.message : String(error)}`,
    });
  }
}

export async function GET() {
  // For backward compatibility, redirect GET requests to the original endpoint
  return NextResponse.json({
    allowed: true,
    error: true,
    message: 'Mixed box pricing requires POST request with box details array. Use /api/functions/cargo_multi_pricing for single box type shipments.',
  });
}
