import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Google Fitness API OAuth 2.0 Authorization
// Uses the free Google Cloud Fitness API (no billing required)
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'));
    }

    const clientId = process.env.GOOGLE_FIT_CLIENT_ID;
    if (!clientId) {
      return NextResponse.json({ error: 'GOOGLE_FIT_CLIENT_ID is not configured' }, { status: 500 });
    }

    const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/google-fit/callback`;

    const scopes = [
      'https://www.googleapis.com/auth/fitness.activity.read',
      'https://www.googleapis.com/auth/fitness.body.read',
      'https://www.googleapis.com/auth/fitness.heart_rate.read',
    ].join(' ');

    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', scopes);
    authUrl.searchParams.set('access_type', 'offline');
    authUrl.searchParams.set('prompt', 'consent');
    authUrl.searchParams.set('state', user.id);

    return NextResponse.redirect(authUrl.toString());
  } catch (error) {
    console.error('Google Fit auth error:', error);
    return NextResponse.json({ error: 'Failed to initiate Google Fit auth' }, { status: 500 });
  }
}
