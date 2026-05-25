/**
 * Returns `<token>` from `authorization: Bearer <token>`.
 * @param headers Header names should be lowercased.
 * @returns `<token>` or undefined if headers did not contain the expected header and value.
 */
export function getAuthorizationTokenFromHeaders(headers: Headers): string | undefined {
  const [, token] = headers.get('authorization')?.trim().split(' ', 2) ?? [];
  return token;
}
