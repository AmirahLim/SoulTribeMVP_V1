import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const unsplashAccessKey = process.env.UNSPLASH_ACCESS_KEY;

  try {
    const { downloadLocation } = await req.json();
    if (!downloadLocation || !unsplashAccessKey) {
      return NextResponse.json({ success: false });
    }

    // Trigger download location GET request per Unsplash API terms
    await fetch(downloadLocation, {
      headers: {
        Authorization: `Client-ID ${unsplashAccessKey}`,
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false });
  }
}
