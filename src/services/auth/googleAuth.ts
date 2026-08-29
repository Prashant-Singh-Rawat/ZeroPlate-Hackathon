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
 * Launch native official Google Cloud OAuth flow
 */
export function launchGoogleOAuthPopup(
  role: string,
  onSuccess: (userData: { email: string; name: string; avatar?: string; token?: string }) => void,
  onError?: (err: any) => void
) {
  // 1. Try Google Identity Services Token Client if available
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
            console.warn('Google token error, redirecting to accounts.google.com', tokenResponse.error);
            openNativeGoogleAuthWindow(role, onSuccess, onError);
          }
        },
        error_callback: (nonOAuthError: any) => {
          console.warn('Google Identity error, redirecting to accounts.google.com:', nonOAuthError);
          openNativeGoogleAuthWindow(role, onSuccess, onError);
        },
      });

      tokenClient.requestAccessToken({ prompt: 'select_account' });
      return;
    } catch (e) {
      console.warn('Falling back to native Google redirect flow', e);
    }
  }

  // 2. Direct native Google Accounts OAuth 2.0 window or redirect
  openNativeGoogleAuthWindow(role, onSuccess, onError);
}

/**
 * Opens official accounts.google.com OAuth dialog, falling back to full redirect if popups are blocked
 */
function openNativeGoogleAuthWindow(
  role: string,
  onSuccess: (userData: { email: string; name: string; avatar?: string; token?: string }) => void,
  onError?: (err: any) => void
) {
  try {
    const redirectUri = window.location.origin;
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&response_type=token&scope=openid%20email%20profile&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&prompt=select_account&state=${encodeURIComponent(role)}`;

    const width = 500;
    const height = 650;
    const left = window.screenX + Math.max(0, (window.outerWidth - width) / 2);
    const top = window.screenY + Math.max(0, (window.outerHeight - height) / 2);

    const popup = window.open(
      authUrl,
      'google_oauth_popup',
      `width=${width},height=${height},left=${left},top=${top},status=no,toolbar=no,menubar=no`
    );

    // If browser popup blocker intercepts the popup, seamlessly redirect the page to accounts.google.com
    if (!popup) {
      window.location.href = authUrl;
      return;
    }

    // Listen for OAuth token in redirect hash
    const interval = setInterval(async () => {
      try {
        if (popup.closed) {
          clearInterval(interval);
          return;
        }

        const popupUrl = popup.location?.href;
        if (popupUrl && popupUrl.includes('access_token=')) {
          clearInterval(interval);
          const hash = popup.location.hash.substring(1);
          const params = new URLSearchParams(hash);
          const accessToken = params.get('access_token');
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
        // Cross-origin restriction while user is on accounts.google.com
      }
    }, 400);
  } catch (err: any) {
    if (onError) onError(err);
  }
}
