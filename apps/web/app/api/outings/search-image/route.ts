import { NextResponse } from 'next/server';
import { extractDistinctiveQuery } from '../../../../lib/coverSearchQuery';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const unsplashAccessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!unsplashAccessKey) {
    return NextResponse.json(
      { error: 'UNSPLASH_ACCESS_KEY environment variable is not configured.' },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    const { title, pitch, interestNode, category } = body || {};

    const query = extractDistinctiveQuery(title, pitch, interestNode, category);
    if (!query) {
      return NextResponse.json({ results: [], query: '' });
    }

    const unsplashUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&content_filter=high&per_page=10`;
    const res = await fetch(unsplashUrl, {
      headers: {
        Authorization: `Client-ID ${unsplashAccessKey}`,
      },
    });

    if (!res.ok) {
      return NextResponse.json({ results: [], query, status: res.status });
    }

    const data = await res.json();
    const rawResults = data.results || [];

    const formatted = rawResults.map((photo: any) => ({
      cover_image_url: photo.urls?.regular || photo.urls?.full,
      cover_image_thumb_url: photo.urls?.small || photo.urls?.thumb,
      cover_image_alt: photo.alt_description || photo.description || query,
      cover_photographer_name: photo.user?.name || photo.user?.username || 'Unsplash Photographer',
      cover_photographer_url: photo.user?.links?.html
        ? `${photo.user.links.html}?utm_source=soul_tribe&utm_medium=referral`
        : 'https://unsplash.com/?utm_source=soul_tribe&utm_medium=referral',
      cover_download_location: photo.links?.download_location || null,
    }));

    return NextResponse.json({ results: formatted, query });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Failed to execute Unsplash image search.' },
      { status: 500 }
    );
  }
}
