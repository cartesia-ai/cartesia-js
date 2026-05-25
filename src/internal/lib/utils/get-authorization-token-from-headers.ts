/**
 * Returns `<token>` from `Authorization: Bearer <token>`.
 * @param headers Record of headers (single value only) that is used internally in this SDK. Header names should be lowercased.
 * @returns `<token>` or undefined if headers did not contain the expected header and value.
 */
export function getAuthorizationTokenFromHeaders(
  headers: Record<string, string> | undefined,
): string | undefined {
  const [, token] = headers?.['authorization']?.trim().split(' ', 2) ?? [];
  return token;
}
