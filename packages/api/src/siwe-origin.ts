import { AUTH_CONFIG } from '@payments-view/constants';

const HTTPS_PROTOCOL = 'https://';

const ensureUriProtocol = (value: string): string =>
  /^https?:\/\//i.test(value) ? value : `${HTTPS_PROTOCOL}${value}`;

const resolveConfiguredSiweDomain = (): string =>
  process.env['SIWE_DOMAIN']?.trim() ?? AUTH_CONFIG.SIWE_DOMAIN;

const resolveConfiguredSiweUri = (): string =>
  ensureUriProtocol(process.env['SIWE_URI']?.trim() ?? AUTH_CONFIG.SIWE_URI);

const resolveRequestOrigin = (headers?: Headers, requestUrl?: string): string | undefined => {
  const origin = headers?.get('origin')?.trim();
  if (origin) {
    return origin;
  }

  return requestUrl ? new URL(requestUrl).origin : undefined;
};

const resolveRequestReferer = (headers?: Headers, requestUrl?: string): string | undefined => {
  return headers?.get('referer')?.trim() ?? requestUrl;
};

const resolveRequestHost = (headers?: Headers, requestUrl?: string): string => {
  const forwardedHost = headers?.get('x-forwarded-host')?.trim();
  if (forwardedHost) {
    return forwardedHost;
  }

  const host = headers?.get('host')?.trim();
  if (host) {
    return host;
  }

  if (requestUrl) {
    return new URL(requestUrl).host;
  }

  return resolveConfiguredSiweDomain();
};

export const isLocalSiweHost = (host: string): boolean => {
  return /^(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/i.test(host);
};

export const resolveSiweMessageConfig = (
  headers?: Headers,
  requestUrl?: string
): { domain: string; uri: string } => {
  const configuredDomain = resolveConfiguredSiweDomain();
  const configuredUri = resolveConfiguredSiweUri();
  const requestHost = resolveRequestHost(headers, requestUrl);

  if (isLocalSiweHost(requestHost)) {
    return {
      domain: requestHost,
      uri: configuredUri,
    };
  }

  return {
    domain: configuredDomain,
    uri: configuredUri,
  };
};

export const resolveSiweChallengeRequestContext = (
  headers?: Headers,
  requestUrl?: string
): { origin?: string; referer?: string } => {
  const requestHost = resolveRequestHost(headers, requestUrl);

  if (isLocalSiweHost(requestHost)) {
    const origin = resolveRequestOrigin(headers, requestUrl);
    const referer = resolveRequestReferer(headers, requestUrl);

    return {
      ...(origin ? { origin } : {}),
      ...(referer ? { referer } : {}),
    };
  }

  const canonicalOrigin = ensureUriProtocol(resolveConfiguredSiweDomain()).replace(/\/$/, '');

  return {
    origin: canonicalOrigin,
    referer: `${canonicalOrigin}/`,
  };
};
