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
    // Missing required field message
    [{ request_id: '123', title: 'test', error_code: 'test', doc_url: undefined }, undefined],
    // Required field message wrong type
    [{ request_id: '123', message: 123, title: 'test', error_code: 'test', doc_url: null }, undefined],
    // Optional field doc_url wrong type
    [
      { request_id: '123', message: 'test', title: 'test', error_code: 'quota_exceeded', doc_url: 123 },
      { request_id: '123', message: 'test', title: 'test', error_code: 'quota_exceeded', doc_url: undefined },
    ],
  ]) {
    it(`${JSON.stringify(input)} -> ${expected}`, () => {
      if (expected === undefined) {
        expect(safeAPIErrorPayload(input)).toEqual(undefined);
        return;
      }

      expect(safeAPIErrorPayload(input)).toEqual({
        ...expected,
        raw: input,
      });
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
