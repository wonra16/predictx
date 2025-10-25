import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400 }
      );
    }

    // Fetch the image
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }

    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();

    // Return the image with proper headers
    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error proxying avatar:', error);
    
    // Return fallback avatar
    return NextResponse.redirect(
      `https://api.dicebear.com/7.x/identicon/svg?seed=${Date.now()}`
    );
  }
}
