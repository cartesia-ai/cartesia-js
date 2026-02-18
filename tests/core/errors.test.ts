import { APIError, BadRequestError, safeAPIErrorPayload } from '../../src/core/error';

describe('safeAPIErrorPayload', () => {
  for (const [input, expected] of [
    // Happy path
    [
      { request_id: '123', message: 'test', title: 'test', error_code: 'quota_exceeded', doc_url: 'test' },
      { request_id: '123', message: 'test', title: 'test', error_code: 'quota_exceeded', doc_url: 'test' },
    ],
    // Only required fields
    [
      { request_id: '123', message: 'test', title: 'test' },
      { request_id: '123', message: 'test', title: 'test', error_code: undefined, doc_url: undefined },
    ],
    // Unknown error code is dropped
    [
      { request_id: '123', message: 'test', title: 'test', error_code: 'test', doc_url: undefined },
      { request_id: '123', message: 'test', title: 'test', error_code: undefined, doc_url: undefined },
    ],
    // Missing required field message falls back to default payload and stringifies message
    [
      { request_id: '123', title: 'test', error_code: 'test', doc_url: undefined },
      {
        request_id: 'unknown',
        message: 'undefined',
        title: 'Unknown error',
        error_code: undefined,
        doc_url: undefined,
      },
    ],
    // Required field message wrong type falls back to default payload and stringifies message
    [
      { request_id: '123', message: 123, title: 'test', error_code: 'test', doc_url: null },
      {
        request_id: 'unknown',
        message: '123',
        title: 'Unknown error',
        error_code: undefined,
        doc_url: undefined,
      },
    ],
    // Optional field doc_url wrong type
    [
      { request_id: '123', message: 'test', title: 'test', error_code: 'quota_exceeded', doc_url: 123 },
      { request_id: '123', message: 'test', title: 'test', error_code: 'quota_exceeded', doc_url: undefined },
    ],
    // Non-object payload falls back to default payload and stringifies response
    [
      'Unexpected string response',
      {
        request_id: 'unknown',
        message: 'Unexpected string response',
        title: 'Unknown error',
        error_code: undefined,
        doc_url: undefined,
      },
    ],
  ] as const) {
    it(`${JSON.stringify(input)}`, () => {
      const payload = safeAPIErrorPayload(input);
      expect(payload).toEqual({
        ...expected,
        raw: input,
      });
      expect(payload.raw).toBeTruthy();
    });
  }

  it('keeps raw as an object reference (not a deep copy)', () => {
    const input = {
      request_id: '123',
      message: 'test',
      title: 'test',
      error_code: 'quota_exceeded',
      doc_url: 'x',
    };
    const payload = safeAPIErrorPayload(input);

    expect(payload?.raw).toBe(input);
  });
});

describe('APIError.generate', () => {
  it('preserves matching status-specific error_code', () => {
    const payload = safeAPIErrorPayload({
      request_id: '123',
      message: 'test',
      title: 'test',
      error_code: 'voice_model_mismatch',
      doc_url: 'test',
    })!;

    const error = APIError.generate(400, payload, undefined, new Headers());

    expect(error).toBeInstanceOf(BadRequestError);
    expect(error.error?.error_code).toBe('voice_model_mismatch');
  });

  it('drops mismatched status-specific error_code but keeps payload content', () => {
    const payload = safeAPIErrorPayload({
      request_id: '123',
      message: 'test',
      title: 'test',
      error_code: 'quota_exceeded',
      doc_url: 'test',
    })!;

    const error = APIError.generate(400, payload, undefined, new Headers());

    expect(error).toBeInstanceOf(BadRequestError);
    expect(error.error).toEqual({
      request_id: '123',
      message: 'test',
      title: 'test',
      error_code: undefined,
      doc_url: 'test',
      raw: payload.raw,
    });
  });
});
