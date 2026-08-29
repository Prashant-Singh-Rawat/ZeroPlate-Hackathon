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
 * Ensures Google Identity SDK is loaded in DOM
 */
function ensureGoogleSdk(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && (window as any).google?.accounts?.oauth2) {
      resolve(true);
      return;
    }
    const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (!existing) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.head.appendChild(script);
    } else {
      setTimeout(() => {
        resolve(Boolean((window as any).google?.accounts?.oauth2));
      }, 500);
    }
  });
}

/**
 * Modern Google Identity Services token client popup flow with account choice prompt
 */
export async function launchGoogleOAuthPopup(
  role: string,
  onSuccess: (userData: { email: string; name: string; avatar?: string; token?: string }) => void,
  onError?: (err: any) => void
) {
  const sdkReady = await ensureGoogleSdk();

  if (sdkReady && typeof window !== 'undefined' && (window as any).google?.accounts?.oauth2) {
    try {
      const tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'openid email profile',
        prompt: 'select_account',
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
              console.warn('Failed to fetch Google userinfo', fetchErr);
            }
          }

          if (tokenResponse?.error) {
            if (onError) onError(new Error(tokenResponse.error_description || tokenResponse.error));
          }
        },
        error_callback: (nonOAuthError: any) => {
          console.warn('Google Identity error', nonOAuthError);
          if (onError) onError(nonOAuthError);
        },
      });

      // Force Google account selector popup dialog
      tokenClient.requestAccessToken({ prompt: 'select_account' });
      return;
    } catch (e) {
      console.warn('Error launching Google Token Client', e);
    }
  }

  // Direct OAuth popup window if SDK is blocked or unavailable
  try {
    const redirectUri = window.location.origin;
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&response_type=token&scope=openid%20email%20profile&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&prompt=select_account`;

    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      authUrl,
      'google_oauth_popup',
      `width=${width},height=${height},left=${left},top=${top},status=no,toolbar=no,menubar=no`
    );

    if (!popup) {
      if (onError) onError(new Error('Popup blocked. Please allow popups for localhost.'));
      return;
    }

    const interval = setInterval(async () => {
      try {
        if (popup.closed) {
          clearInterval(interval);
          return;
        }

        const popupUrl = popup.location?.href;
        if (popupUrl && popupUrl.includes('access_token=')) {
          clearInterval(interval);
          const hashParams = new URLSearchParams(popup.location.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          popup.close();

          if (accessToken) {
            const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${accessToken}` },
            });
            const userinfo = await userInfoRes.json();
            if (userinfo && userinfo.email) {
              onSuccess({
                email: userinfo.email,
                name: userinfo.name || userinfo.email.split('@')[0],
                avatar: userinfo.picture,
                token: accessToken,
              });
            }
          }
        }
      } catch (crossOriginErr) {
        // Expected while on accounts.google.com domain
      }
    }, 500);

    return;
  } catch (popupErr) {
    if (onError) onError(new Error('Could not open Google authentication window.'));
  }
}
