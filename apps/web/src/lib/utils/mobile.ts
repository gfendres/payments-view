/**
 * Mobile browser detection and utilities
 */

/**
 * Check if the current device is a mobile device
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const userAgent = window.navigator.userAgent.toLowerCase();
  const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;

  return mobileRegex.test(userAgent);
}

/**
 * Check if the current device is iOS
 */
export function isIOS(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

/**
 * Check if the current device is Android
 */
export function isAndroid(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return /android/i.test(window.navigator.userAgent);
}

/**
 * Get the mobile browser name
 */
export function getMobileBrowser(): 'safari' | 'chrome' | 'firefox' | 'samsung' | 'other' | null {
  if (typeof window === 'undefined' || !isMobileDevice()) {
    return null;
  }

  const userAgent = window.navigator.userAgent.toLowerCase();

  if (isIOS()) {
    // Safari on iOS
    if (/safari/i.test(userAgent) && !/crios|fxios/i.test(userAgent)) {
      return 'safari';
    }
    // Chrome on iOS
    if (/crios/i.test(userAgent)) {
      return 'chrome';
    }
    // Firefox on iOS
    if (/fxios/i.test(userAgent)) {
      return 'firefox';
    }
  }

  if (isAndroid()) {
    // Chrome on Android
    if (/chrome/i.test(userAgent) && !/samsung/i.test(userAgent)) {
      return 'chrome';
    }
    // Samsung Internet
    if (/samsung/i.test(userAgent)) {
      return 'samsung';
    }
    // Firefox on Android
    if (/firefox/i.test(userAgent)) {
      return 'firefox';
    }
  }

  return 'other';
}

/**
 * Check if touch events are supported
 */
export function supportsTouchEvents(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * Validate if a deep link URL is properly formatted
 */
export function isValidDeepLink(url: string): boolean {
  try {
    // Deep links use custom schemes, not standard URLs
    // Check if URL starts with known wallet schemes
    return ['wc:', 'rainbow:', 'metamask:', 'cbwallet:'].some((scheme) =>
      url.startsWith(scheme)
    );
  } catch {
    return false;
  }
}

/**
 * Check if running in Safari simulator (macOS Safari simulating iOS)
 * Safari simulator doesn't support custom URL schemes for deep linking
 */
export function isSafariSimulator(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const userAgent = navigator.userAgent.toLowerCase();
  const isMacOS = /macintosh|mac os x/i.test(userAgent);
  const isSafari = /safari/i.test(userAgent) && !/chrome|crios|fxios/i.test(userAgent);
  const isSimulator = /simulator/i.test(userAgent);

  // Safari on macOS simulating iOS device
  return (isMacOS && isSafari) || isSimulator;
}

/**
 * Get device information for debugging
 */
export function getDeviceInfo(): {
  isMobile: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  browser: ReturnType<typeof getMobileBrowser>;
  supportsTouch: boolean;
  userAgent: string;
  isSafariSimulator: boolean;
} {
  return {
    isMobile: isMobileDevice(),
    isIOS: isIOS(),
    isAndroid: isAndroid(),
    browser: getMobileBrowser(),
    supportsTouch: supportsTouchEvents(),
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
    isSafariSimulator: isSafariSimulator(),
  };
}

