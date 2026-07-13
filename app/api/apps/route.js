import { NextResponse } from 'next/server';
import gplay from 'google-play-scraper';

export const dynamic = 'force-dynamic';

const GOOGLE_PLAY_DEVELOPER_ID = process.env.GOOGLE_PLAY_DEVELOPER_ID;
const APPLE_DEVELOPER_ID = process.env.APPLE_DEVELOPER_ID;

function toErrorResponse(message, status = 500) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const platform = searchParams.get('platform')?.toLowerCase() ?? 'android';

  try {
    if (platform === 'ios') {
      if (!APPLE_DEVELOPER_ID) {
        return toErrorResponse('APPLE_DEVELOPER_ID is not configured', 500);
      }

      const response = await fetch(
        `https://itunes.apple.com/lookup?id=${APPLE_DEVELOPER_ID}&entity=software`,
        { next: { revalidate: 3600 } }
      );

      if (!response.ok) {
        return toErrorResponse('Apple API request failed', response.status);
      }

      const data = await response.json();
      const apps = data.results
        .filter((item) => item.wrapperType === 'software')
        .map((app) => ({
          title: app.trackName,
          iconUrl: app.artworkUrl512 || app.artworkUrl100,
          storeUrl: app.trackViewUrl
        }));

      return NextResponse.json(apps);
    }

    if (platform !== 'android') {
      return toErrorResponse('platform must be either android or ios', 400);
    }

    if (!GOOGLE_PLAY_DEVELOPER_ID) {
      return toErrorResponse('GOOGLE_PLAY_DEVELOPER_ID is not configured', 500);
    }

    const apps = await gplay.developer({ devId: GOOGLE_PLAY_DEVELOPER_ID });
    const normalizedApps = apps.map((app) => ({
      title: app.title,
      iconUrl: app.icon,
      storeUrl: app.url
    }));

    return NextResponse.json(normalizedApps);
  } catch (error) {
    console.error('Failed to fetch application data:', error);
    return toErrorResponse('Failed to fetch application data');
  }
}
