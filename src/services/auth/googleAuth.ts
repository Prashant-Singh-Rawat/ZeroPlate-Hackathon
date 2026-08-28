export const GOOGLE_CLIENT_ID =
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
 * Initialize and render the official Google Sign-In button
 */
export function renderGoogleButton(
  elementId: string,
  onSuccess: (googleData: { token: string; payload?: GoogleUserPayload }) => void,
  onError?: (err: any) => void
) {
  if (typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
    const google = (window as any).google;

    try {
      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response: any) => {
          if (response?.credential) {
            const payload = decodeGoogleJwt(response.credential);
            onSuccess({ token: response.credential, payload: payload || undefined });
          } else {
            if (onError) onError(new Error('No credential received from Google.'));
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      const buttonContainer = document.getElementById(elementId);
      if (buttonContainer) {
        buttonContainer.innerHTML = '';
        google.accounts.id.renderButton(buttonContainer, {
          theme: 'outline',
          size: 'large',
          type: 'standard',
          text: 'continue_with',
          shape: 'pill',
          logo_alignment: 'left',
          width: 380,
        });
      }
    } catch (e) {
      console.warn('Google render button error', e);
    }
  }
}

/**
 * Launch direct Google Cloud OAuth 2.0 Auth Dialog Popup
 */
export function launchGoogleOAuthPopup(
  role: string,
  onSuccess: (userData: { email: string; name: string; avatar?: string; token?: string }) => void,
  onError?: (err: any) => void
) {
  const redirectUri = window.location.origin + '/login';
  const state = encodeURIComponent(JSON.stringify({ role, timestamp: Date.now() }));
  const nonce = Math.random().toString(36).substring(7);

  const googleAuthUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${encodeURIComponent(GOOGLE_CLIENT_ID)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=token%20id_token` +
    `&scope=${encodeURIComponent('openid email profile')}` +
    `&state=${state}` +
    `&nonce=${nonce}` +
    `&prompt=select_account`;

  const width = 500;
  const height = 600;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;

  const popup = window.open(
    googleAuthUrl,
    'Google_OAuth_Sign_In',
    `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,status=1`
  );

  if (!popup || popup.closed) {
    if (onError) onError(new Error('Popup blocked by browser. Please allow popups for localhost.'));
    return;
  }

  // Poll for hash parameters in popup window
  const interval = setInterval(() => {
    try {
      if (!popup || popup.closed) {
        clearInterval(interval);
        return;
      }

      if (popup.location && popup.location.href.includes(window.location.origin)) {
        const hash = popup.location.hash;
        if (hash) {
          const params = new URLSearchParams(hash.replace('#', '?'));
          const idToken = params.get('id_token');
          const accessToken = params.get('access_token');

          if (idToken) {
            const decoded = decodeGoogleJwt(idToken);
            if (decoded) {
              clearInterval(interval);
              popup.close();
              onSuccess({
                email: decoded.email,
                name: decoded.name,
                avatar: decoded.picture,
                token: idToken,
              });
              return;
            }
          }

          if (accessToken) {
            // Fetch profile via Google UserInfo API
            fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${accessToken}` },
            })
              .then((res) => res.json())
              .then((userinfo) => {
                clearInterval(interval);
                popup.close();
                onSuccess({
                  email: userinfo.email,
                  name: userinfo.name,
                  avatar: userinfo.picture,
                  token: accessToken,
                });
              })
              .catch((err) => {
                clearInterval(interval);
                popup.close();
                if (onError) onError(err);
              });
            return;
          }
        }
      }
    } catch (e) {
      // Cross-origin access while on accounts.google.com is expected until redirect
    }
  }, 500);
}
