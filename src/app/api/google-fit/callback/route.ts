import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Google Fit OAuth 2.0 Callback
// Exchanges the authorization code for tokens and stores them in Supabase
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // user.id
    const error = searchParams.get('error');

    if (error) {
      console.error('Google OAuth error:', error);
      return NextResponse.redirect(new URL('/os/gym?fit_error=denied', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'));
    }

    if (!code || !state) {
      return NextResponse.redirect(new URL('/os/gym?fit_error=missing_code', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'));
    }

    const clientId = process.env.GOOGLE_FIT_CLIENT_ID!;
    const clientSecret = process.env.GOOGLE_FIT_CLIENT_SECRET!;
    const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/google-fit/callback`;

    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      const errData = await tokenRes.text();
      console.error('Token exchange failed:', errData);
      return NextResponse.redirect(new URL('/os/gym?fit_error=token_exchange', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'));
    }

    const tokens = await tokenRes.json();

    // Store tokens in Supabase
    const supabase = await createClient();

    const { error: upsertError } = await supabase
      .from('google_fit_tokens')
      .upsert({
        user_id: state,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || null,
        expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
        scope: tokens.scope,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    if (upsertError) {
      console.error('Failed to store tokens:', upsertError);
      return NextResponse.redirect(new URL('/os/gym?fit_error=storage', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'));
    }

    return NextResponse.redirect(new URL('/os/gym?fit_connected=true', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'));
  } catch (error) {
    console.error('Google Fit callback error:', error);
    return NextResponse.redirect(new URL('/os/gym?fit_error=unknown', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'));
  }
}
