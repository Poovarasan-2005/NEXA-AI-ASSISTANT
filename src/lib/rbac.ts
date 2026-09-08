export interface UserAuthContext {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
}

/**
 * Checks if a user has a specific permission (e.g. "memory:write", "user:suspend").
 * ADMIN role inherently satisfies all permissions.
 */
export function hasPermission(user: UserAuthContext | null | undefined, permission: string): boolean {
  if (!user) return false;
  if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") return true;
  return user.permissions.includes(permission);
}

/**
 * Checks if a user has any of the specified roles.
 */
export function hasRole(user: UserAuthContext | null | undefined, roles: string[]): boolean {
  if (!user) return false;
  return roles.includes(user.role);
}

export function isAdmin(user: UserAuthContext | null | undefined): boolean {
  return hasRole(user, ["ADMIN", "SUPER_ADMIN"]);
}

/**
 * Validates that the active user owns the targeted resource to prevent Insecure Direct Object References (IDOR).
 * Returns true if the user is the resource owner or has an administrative bypass role.
 */
export function verifyOwnership(user: UserAuthContext, resourceOwnerId: string): boolean {
  if (!user) return false;
  if (isAdmin(user)) return true;
  return user.id === resourceOwnerId;
}

/**
 * Throws an error or returns a standard 403 Response if authorization check fails.
 */
export function assertAuthorized(
  user: UserAuthContext | null | undefined,
  permissionOrCheck: string | ((u: UserAuthContext) => boolean)
): void {
  if (!user) {
    throw new Error("UNAUTHORIZED: Authentication required");
  }

  const isAllowed =
    typeof permissionOrCheck === "string"
      ? hasPermission(user, permissionOrCheck)
      : permissionOrCheck(user);

  if (!isAllowed) {
    throw new Error("FORBIDDEN: Insufficient privileges for this resource or operation");
  }
}
