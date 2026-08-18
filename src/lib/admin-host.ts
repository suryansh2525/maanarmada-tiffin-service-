export function getHostname(hostHeader: string): string {
  return hostHeader.split(":")[0].toLowerCase();
}

export function isLocalDevHost(hostHeader: string): boolean {
  const hostname = getHostname(hostHeader);
  return hostname === "localhost" || hostname === "127.0.0.1";
}

/** Set ADMIN_HOST=admin.yourdomain.com after you buy a domain. */
export function getConfiguredAdminHost(): string | null {
  const host = process.env.ADMIN_HOST?.trim().toLowerCase();
  return host || null;
}

export function isAdminHostname(hostHeader: string): boolean {
  const adminHost = getConfiguredAdminHost();
  if (!adminHost) return false;
  return getHostname(hostHeader) === adminHost;
}

/**
 * Admin is reachable on:
 * - localhost (while developing, before a domain exists)
 * - the configured admin subdomain, once ADMIN_HOST is set
 *
 * On the public customer host, /admin returns 404.
 */
export function canAccessAdmin(hostHeader: string): boolean {
  if (isLocalDevHost(hostHeader)) return true;
  const adminHost = getConfiguredAdminHost();
  if (!adminHost) return true;
  return isAdminHostname(hostHeader);
}
