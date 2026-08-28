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
 * Decode standard Google OAuth JWT ID token safely on client-side
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
 * Trigger Google Sign In Popup flow with Google Identity Services
 */
export function triggerGoogleSignIn(
  onSuccess: (googleData: { token: string; payload?: GoogleUserPayload }) => void,
  onError?: (err: any) => void
) {
  if (typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
    const google = (window as any).google;

    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response: any) => {
        if (response.credential) {
          const payload = decodeGoogleJwt(response.credential);
          onSuccess({ token: response.credential, payload: payload || undefined });
        } else {
          if (onError) onError(new Error('No credential returned from Google.'));
        }
      },
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        // Fallback to standard popup
        console.info('Google One-Tap dismissed or not displayed, user can click directly.');
      }
    });
  } else {
    console.info('Google GSI SDK loading or unavailable, using fallback flow.');
    if (onError) onError(new Error('Google SDK not loaded'));
  }
}
