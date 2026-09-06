import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const unsplashAccessKey = process.env.UNSPLASH_ACCESS_KEY;

  try {
    const { downloadLocation } = await req.json();
    if (!downloadLocation || !unsplashAccessKey) {
      return NextResponse.json({ success: false });
    }

    // Credentials must only reach the documented Unsplash download endpoint.
    const url = new URL(downloadLocation);
    if (url.protocol !== 'https:' || url.hostname !== 'api.unsplash.com' ||
        url.port || url.username || url.password ||
        !/^\/photos\/[A-Za-z0-9_-]+\/download$/.test(url.pathname)) {
      return NextResponse.json({ success: false }, { status: 400 });
    }
    // Never follow a redirect while attaching a server credential.
    const response = await fetch(url.toString(), {
      redirect: 'error',
      signal: AbortSignal.timeout(5000),
      headers: {
        Authorization: `Client-ID ${unsplashAccessKey}`,
      },
    });

    return NextResponse.json({ success: response.ok });
  } catch {
    return NextResponse.json({ success: false });
  }
}
