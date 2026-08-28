export const GOOGLE_CLIENT_ID =
  (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID ||
  '132721264540-tvqtl6nen6f2hsun0u1ejlqkqmr9640r.apps.googleusercontent.com';

export interface GoogleUserPayload {
  email: string;
  name: string;
  picture?: string;
  email_verified: boolean;
  sub: string;
}

/**
 * Decode standard Google OAuth JWT ID token safely
 */
export function decodeGoogleJwt(token: string): GoogleUserPayload | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.warn('Failed to decode Google JWT token', e);
    return null;
  }
}

/**
 * Modern Google Identity Services token client popup flow
 * Uses Authorised JavaScript origins (http://localhost:5174) with zero redirect_uri_mismatch errors
 */
export function launchGoogleOAuthPopup(
  role: string,
  onSuccess: (userData: { email: string; name: string; avatar?: string; token?: string }) => void,
  onError?: (err: any) => void
) {
  if (typeof window !== 'undefined' && (window as any).google?.accounts?.oauth2) {
    try {
      const tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'openid email profile',
        callback: async (tokenResponse: any) => {
          if (tokenResponse && tokenResponse.access_token) {
            try {
              // Fetch user profile from Google's official userinfo endpoint
              const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: {
                  Authorization: `Bearer ${tokenResponse.access_token}`,
                },
              });
              const userinfo = await userInfoRes.json();

              if (userinfo && userinfo.email) {
                onSuccess({
                  email: userinfo.email,
                  name: userinfo.name || userinfo.email.split('@')[0],
                  avatar: userinfo.picture,
                  token: tokenResponse.access_token,
                });
                return;
              }
            } catch (fetchErr) {
              console.warn('Failed to fetch Google userinfo, using token info', fetchErr);
            }
          }

          if (tokenResponse?.error) {
            if (onError) onError(new Error(tokenResponse.error_description || tokenResponse.error));
          }
        },
        error_callback: (nonOAuthError: any) => {
          console.warn('Google Identity non-OAuth error', nonOAuthError);
          if (onError) onError(nonOAuthError);
        },
      });

      // Launch Google account selector popup
      tokenClient.requestAccessToken({ prompt: 'select_account' });
      return;
    } catch (e) {
      console.warn('Error launching Google Token Client', e);
    }
  }

  // If Google SDK is not loaded yet or blocked, trigger Google GSI ID token prompt
  if (typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
    try {
      const google = (window as any).google;
      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response: any) => {
          if (response?.credential) {
            const payload = decodeGoogleJwt(response.credential);
            if (payload) {
              onSuccess({
                email: payload.email,
                name: payload.name,
                avatar: payload.picture,
                token: response.credential,
              });
              return;
            }
          }
        },
      });
      google.accounts.id.prompt();
      return;
    } catch (e) {
      console.warn('Google GSI prompt error', e);
    }
  }

  if (onError) onError(new Error('Google Identity Services SDK not ready.'));
}
