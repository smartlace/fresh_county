import { NextRequest, NextResponse } from 'next/server';
// Remove unused env import

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    
    if (!url) {
      return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
    }

    // Allow localhost:3001 URLs and trusted external image sources
    const allowedDomains = [
      'https://freshcounty.com/api/',
      'https://images.unsplash.com/',
      'https://unsplash.com/',
      'https://via.placeholder.com/'
    ];
    
    const isAllowed = allowedDomains.some(domain => url.startsWith(domain));
    
    if (!isAllowed) {
      return NextResponse.json({ error: 'URL domain not allowed' }, { status: 400 });
    }

    // Fetch the image from the backend
    const response = await fetch(url);
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    const arrayBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/png';

    // Return the image with proper headers
    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  } catch (error) {
    console.error('Error proxying image:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}