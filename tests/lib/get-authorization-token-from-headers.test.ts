import { buildHeaders } from '@cartesia/cartesia-js/internal/headers';
import { getAuthorizationTokenFromHeaders } from '@cartesia/cartesia-js/internal/lib/utils/get-authorization-token-from-headers';

describe('getAuthorizationTokenFromHeaders', () => {
  test('returns the token from a Bearer authorization header', () => {
    const headers = new Headers({ authorization: 'Bearer my-token' });
    expect(getAuthorizationTokenFromHeaders(headers)).toBe('my-token');
  });

  test('trims surrounding whitespace before splitting', () => {
    const headers = new Headers({ authorization: '  Bearer my-token  ' });
    expect(getAuthorizationTokenFromHeaders(headers)).toBe('my-token');
  });

  test('returns undefined when the authorization header is missing', () => {
    const headers = new Headers();
    expect(getAuthorizationTokenFromHeaders(headers)).toBeUndefined();
  });

  test('returns undefined when the header value has no token', () => {
    const headers = new Headers({ authorization: 'Bearer' });
    expect(getAuthorizationTokenFromHeaders(headers)).toBeUndefined();
  });

  test('returns only the first whitespace-separated token after the scheme', () => {
    const headers = new Headers({ authorization: 'Bearer first second' });
    expect(getAuthorizationTokenFromHeaders(headers)).toBe('first');
  });

  describe('when paired with buildHeaders (as used in ExternalVADWS)', () => {
    test('extracts the token from headers built by buildHeaders', () => {
      const { values } = buildHeaders([{ Authorization: 'Bearer ws-options-token' }]);
      expect(getAuthorizationTokenFromHeaders(values)).toBe('ws-options-token');
    });

    test('returns undefined when no authorization header was supplied to buildHeaders', () => {
      const { values } = buildHeaders([{ 'Cartesia-Version': '2025-11-04' }]);
      expect(getAuthorizationTokenFromHeaders(values)).toBeUndefined();
    });
  });
});
