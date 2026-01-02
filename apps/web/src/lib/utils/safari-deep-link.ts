/**
 * Safari-specific deep link handling
 * Safari blocks custom URL schemes (wc://, rainbow://, etc.) so we need special handling
 * This also handles Safari on macOS simulating iOS devices
 *
 * IMPORTANT: Safari on macOS (including iPhone simulator) may not support custom URL schemes
 * for deep linking. If deep links fail, users should use the QR code option instead.
 */

import { isIOS, getMobileBrowser, isSafariSimulator } from './mobile';

/**
 * Check if we're in Safari (including macOS Safari simulating iOS)
 */
function isSafari(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  const browser = getMobileBrowser();
  return browser === 'safari' || (isIOS() && /safari/i.test(navigator.userAgent));
}

/**
 * Safely open a deep link URL on Safari
 * Uses a hidden anchor tag which Safari handles better than window.location
 * In Safari simulator, this will fail, so we prevent it entirely
 */
export function openDeepLinkSafari(url: string): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('[Safari Deep Link] Attempting to open:', url);
    console.log('[Safari Deep Link] User agent:', navigator.userAgent);
    console.log('[Safari Deep Link] Is iOS:', isIOS());
    console.log('[Safari Deep Link] Is Safari:', isSafari());
    console.log('[Safari Deep Link] Is Safari Simulator:', isSafariSimulator());
  }

  // In Safari simulator, deep links don't work - prevent the attempt
  if (isSafariSimulator()) {
    console.warn(
      '[Safari Deep Link] Blocked deep link attempt in Safari simulator. URL:', url
    );
    console.warn(
      '[Safari Deep Link] Please use the QR code option in the WalletConnect modal instead.'
    );

    // Try to find and show QR code option in WalletConnect modal
    setTimeout(() => {
      const qrCodeButton = document.querySelector('[data-testid="walletconnect-qr"]') ||
                          document.querySelector('button[aria-label*="QR"]') ||
                          document.querySelector('button:has-text("QR")') ||
                          Array.from(document.querySelectorAll('button')).find(btn =>
                            btn.textContent?.toLowerCase().includes('qr') ||
                            btn.textContent?.toLowerCase().includes('scan')
                          );

      if (qrCodeButton) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[Safari Deep Link] Found QR code button, clicking it');
        }
        (qrCodeButton as HTMLElement).click();
      } else {
        console.warn('[Safari Deep Link] QR code button not found. Please manually select QR code option.');
      }
    }, 500);

    return false;
  }

  try {
    // Validate URL format
    if (!url || typeof url !== 'string') {
      console.error('[Safari Deep Link] Invalid URL:', url);
      return false;
    }

    // Check if URL is a valid deep link scheme
    const validSchemes = ['wc:', 'rainbow:', 'metamask:', 'cbwallet:'];
    const isValidScheme = validSchemes.some((scheme) => url.startsWith(scheme));

    if (!isValidScheme) {
      console.warn('[Safari Deep Link] URL does not match known schemes:', url);
      // Still try to open it, might be a valid custom scheme
    }

    // Create a hidden anchor element
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.style.display = 'none';
    anchor.target = '_self';
    anchor.rel = 'noopener noreferrer';

    // Add to DOM temporarily
    document.body.appendChild(anchor);

    // Trigger click
    anchor.click();

    // Remove after a short delay
    setTimeout(() => {
      try {
        if (document.body.contains(anchor)) {
          document.body.removeChild(anchor);
        }
      } catch {
        // Ignore cleanup errors
      }
    }, 100);

    if (process.env.NODE_ENV === 'development') {
      console.log('[Safari Deep Link] Successfully triggered:', url);
    }
    return true;
  } catch (error) {
    console.error('[Safari Deep Link] Failed to open:', url, error);
    return false;
  }
}

/**
 * Intercept and fix WalletConnect deep link URLs for Safari
 */
export function fixDeepLinkForSafari(url: string): string {
  if (!isIOS()) {
    return url;
  }

  // WalletConnect URLs sometimes have issues on Safari
  // Ensure the URL is properly formatted
  let fixedUrl = url;

  // If URL starts with wc://, ensure it's properly formatted
  if (url.startsWith('wc://')) {
    // WalletConnect URLs should work as-is, but Safari might need them wrapped
    fixedUrl = url;
  }

  // If URL starts with rainbow://, ensure it's properly formatted
  if (url.startsWith('rainbow://')) {
    fixedUrl = url;
  }

  // If URL starts with metamask://, ensure it's properly formatted
  if (url.startsWith('metamask://')) {
    fixedUrl = url;
  }

  return fixedUrl;
}

/**
 * Setup Safari deep link interceptor
 * This intercepts attempts to open deep links and handles them properly
 * Works for both iOS Safari and macOS Safari simulating iOS
 */
export function setupSafariDeepLinkInterceptor(): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  // Only setup for Safari (including macOS Safari simulating iOS)
  if (!isSafari() && !isIOS()) {
    return () => {};
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('[Safari Deep Link] Setting up interceptor for Safari');
  }

  // Note: We cannot intercept window.location.href directly in Safari
  // because it's not configurable. Instead, we intercept other methods
  // and monitor for deep link attempts through other means.

  // Also intercept window.open calls that might be deep links
  const originalWindowOpen = window.open;
  window.open = function (url?: string | URL, target?: string, features?: string) {
    const urlString = typeof url === 'string' ? url : url?.toString();

    if (
      urlString &&
      (urlString.startsWith('wc:') ||
        urlString.startsWith('rainbow:') ||
        urlString.startsWith('metamask:') ||
        urlString.startsWith('cbwallet:'))
    ) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Safari Deep Link] Intercepted window.open:', urlString);
      }

      if (isSafariSimulator()) {
        console.warn('[Safari Deep Link] Blocked window.open deep link in Safari simulator');
        return null;
      }

      const fixedUrl = fixDeepLinkForSafari(urlString);
      openDeepLinkSafari(fixedUrl);
      return null;
    }

    return originalWindowOpen.call(window, url, target, features);
  };

  // Monitor all link clicks that might be deep links
  const handleLinkClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    const anchor = target.closest('a');
    if (anchor) {
      const href = anchor.getAttribute('href');
      if (
        href &&
        (href.startsWith('wc:') ||
          href.startsWith('rainbow:') ||
          href.startsWith('metamask:') ||
          href.startsWith('cbwallet:'))
      ) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[Safari Deep Link] Intercepted link click:', href);
        }

        if (isSafariSimulator()) {
          console.warn('[Safari Deep Link] Blocked deep link click in Safari simulator');
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
          return false;
        }

        event.preventDefault();
        event.stopPropagation();
        const fixedUrl = fixDeepLinkForSafari(href);
        openDeepLinkSafari(fixedUrl);
      }
    }
  };

  // Monitor all navigation attempts
  const handleBeforeUnload = () => {
    const currentUrl = window.location.href;
    if (
      currentUrl.startsWith('wc:') ||
      currentUrl.startsWith('rainbow:') ||
      currentUrl.startsWith('metamask:') ||
      currentUrl.startsWith('cbwallet:')
    ) {
      console.log('[Safari Deep Link] Intercepted navigation:', currentUrl);
    }
  };

  document.addEventListener('click', handleLinkClick, true);
  window.addEventListener('beforeunload', handleBeforeUnload);

  // Watch for dynamically created elements with deep link URLs
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as HTMLElement;

          // Check for links with deep link hrefs
          const links = element.querySelectorAll?.('a[href]') || [];
          links.forEach((link) => {
            const href = link.getAttribute('href');
            if (
              href &&
              (href.startsWith('wc:') ||
                href.startsWith('rainbow:') ||
                href.startsWith('metamask:') ||
                href.startsWith('cbwallet:'))
            ) {
              if (process.env.NODE_ENV === 'development') {
                console.log('[Safari Deep Link] Found deep link in DOM:', href, link);
              }

              // Wrap the click handler
              link.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();

                if (process.env.NODE_ENV === 'development') {
                  console.log('[Safari Deep Link] Intercepted click on deep link:', href);
                }

                if (isSafariSimulator()) {
                  console.warn('[Safari Deep Link] Blocked deep link click in Safari simulator');
                  // Don't attempt to open, just prevent the error
                  return false;
                }

                const fixedUrl = fixDeepLinkForSafari(href);
                openDeepLinkSafari(fixedUrl);
              }, true);
            }
          });

          // Check if the element itself is a link with deep link
          if (element.tagName === 'A') {
            const href = element.getAttribute('href');
            if (
              href &&
              (href.startsWith('wc:') ||
                href.startsWith('rainbow:') ||
                href.startsWith('metamask:') ||
                href.startsWith('cbwallet:'))
            ) {
              if (process.env.NODE_ENV === 'development') {
                console.log('[Safari Deep Link] Found deep link element:', href, element);
              }
              element.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();

                if (process.env.NODE_ENV === 'development') {
                  console.log('[Safari Deep Link] Intercepted click on deep link element:', href);
                }

                if (isSafariSimulator()) {
                  console.warn('[Safari Deep Link] Blocked deep link click in Safari simulator');
                  // Don't attempt to open, just prevent the error
                  return false;
                }

                const fixedUrl = fixDeepLinkForSafari(href);
                openDeepLinkSafari(fixedUrl);
              }, true);
            }
          }
        }
      });
    });
  });

  // Start observing the document for changes
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // In Safari simulator, intercept wallet button clicks in WalletConnect modal
  if (isSafariSimulator()) {
    const interceptWalletButtons = () => {
      // Find all wallet buttons in the modal (RainbowKit uses specific classes/attributes)
      const walletButtons = document.querySelectorAll(
        'button[data-testid*="wallet"], ' +
        'button[aria-label*="Rainbow"], ' +
        'button[aria-label*="MetaMask"], ' +
        '[role="button"]:has-text("Rainbow"), ' +
        '[role="button"]:has-text("MetaMask")'
      );

      walletButtons.forEach((button) => {
        const buttonElement = button as HTMLElement;
        const buttonText = buttonElement.textContent?.toLowerCase() || '';

        // Check if this is a wallet button (not QR code button)
        if (
          (buttonText.includes('rainbow') ||
            buttonText.includes('metamask') ||
            buttonText.includes('coinbase')) &&
          !buttonText.includes('qr') &&
          !buttonText.includes('scan')
        ) {
          // Remove existing listeners and add our interceptor
          const newButton = buttonElement.cloneNode(true) as HTMLElement;
          buttonElement.parentNode?.replaceChild(newButton, buttonElement);

          newButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            console.warn(
              '[Safari Deep Link] Blocked wallet button click in Safari simulator. ' +
              'Please use QR code option instead.'
            );

            // Try to find and click QR code option
            setTimeout(() => {
              const qrOptions = [
                'button[data-testid*="qr"]',
                'button[aria-label*="QR"]',
                'button:has-text("QR")',
                'button:has-text("Scan")',
                '[role="tab"][aria-label*="QR"]',
                '[role="tab"]:has-text("QR")',
              ];

              for (const selector of qrOptions) {
                try {
                  const qrButton = document.querySelector(selector);
                  if (qrButton) {
                    if (process.env.NODE_ENV === 'development') {
                      console.log('[Safari Deep Link] Found QR code button, clicking:', selector);
                    }
                    (qrButton as HTMLElement).click();
                    return;
                  }
                } catch {
                  // Selector might not be supported
                }
              }

              // Fallback: look for any button with QR/Scan text
              const allButtons = Array.from(document.querySelectorAll('button'));
              const qrButton = allButtons.find(
                (btn) =>
                  btn.textContent?.toLowerCase().includes('qr') ||
                  btn.textContent?.toLowerCase().includes('scan') ||
                  btn.textContent?.toLowerCase().includes('code')
              );

              if (qrButton) {
                if (process.env.NODE_ENV === 'development') {
                  console.log('[Safari Deep Link] Found QR code button via text search');
                }
                qrButton.click();
              } else {
                console.warn(
                  '[Safari Deep Link] QR code button not found. ' +
                  'Please manually look for QR code option in the modal.'
                );
              }
            }, 100);
          }, true);
        }
      });
    };

    // Run immediately and also watch for new buttons
    setTimeout(interceptWalletButtons, 500);
    const walletButtonObserver = new MutationObserver(() => {
      interceptWalletButtons();
    });
    walletButtonObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Return cleanup function for Safari simulator
    return () => {
      observer.disconnect();
      walletButtonObserver.disconnect();
      window.open = originalWindowOpen;
      document.removeEventListener('click', handleLinkClick, true);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }

  // Return cleanup function for non-simulator Safari
  return () => {
    window.open = originalWindowOpen;
    document.removeEventListener('click', handleLinkClick, true);
    window.removeEventListener('beforeunload', handleBeforeUnload);
    observer.disconnect();
  };
}

/**
 * Try to open a deep link with Safari-specific handling
 */
export function tryOpenDeepLink(url: string): { success: boolean; error?: string } {
  if (typeof window === 'undefined') {
    return { success: false, error: 'Window not available' };
  }

  // For Safari (including macOS Safari simulating iOS), use the special handler
  if (isSafari() || isIOS()) {
    const fixedUrl = fixDeepLinkForSafari(url);
    const success = openDeepLinkSafari(fixedUrl);

    if (!success) {
      return {
        success: false,
        error: 'Failed to open deep link. Safari simulator may not support custom URL schemes. Try using QR code instead.',
      };
    }

    return { success: true };
  }

  // For non-Safari browsers, try direct navigation
  try {
    window.location.href = url;
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

