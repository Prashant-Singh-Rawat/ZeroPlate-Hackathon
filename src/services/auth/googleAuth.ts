export const GOOGLE_CLIENT_ID =
  (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID ||
  '405883976207-i3mp8dcshufiaebt8pmsegn0du6rbciv.apps.googleusercontent.com';

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
 * Modern Google Identity Services token client popup flow with account choice prompt
 */
export async function launchGoogleOAuthPopup(
  role: string,
  onSuccess: (userData: { email: string; name: string; avatar?: string; token?: string }) => void,
  onFallbackModalNeeded: () => void,
  onError?: (err: any) => void
) {
  // Check if Google Identity SDK is already available
  if (typeof window !== 'undefined' && (window as any).google?.accounts?.oauth2) {
    try {
      const tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'openid email profile',
        prompt: 'select_account',
        callback: async (tokenResponse: any) => {
          if (tokenResponse && tokenResponse.access_token) {
            try {
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
              console.warn('Failed to fetch Google userinfo', fetchErr);
            }
          }

          if (tokenResponse?.error) {
            console.warn('Token error, switching to Google chooser modal', tokenResponse.error);
            onFallbackModalNeeded();
          }
        },
        error_callback: (nonOAuthError: any) => {
          console.warn('Google Identity error, opening in-app Google Chooser', nonOAuthError);
          onFallbackModalNeeded();
        },
      });

      tokenClient.requestAccessToken({ prompt: 'select_account' });
      return;
    } catch (e) {
      console.warn('Error launching Google Token Client', e);
      onFallbackModalNeeded();
      return;
    }
  }

  // If SDK is not initialized or popup is blocked by browser, open the Google Account Chooser Modal
  onFallbackModalNeeded();
}
