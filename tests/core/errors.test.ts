import { safeAPIErrorPayload } from "../../src/core/error";

describe('safeAPIErrorPayload', () => {
    for (const [input, expected] of [
        // Happy path
        [
            { request_id: '123', message: 'test', title: 'test', error_code: 'quota_exceeded', doc_url: 'test' },
            { request_id: '123', message: 'test', title: 'test', error_code: 'quota_exceeded', doc_url: 'test' }
        ],
        // Only required fields
        [
            { request_id: '123', message: 'test', title: 'test' },
            { request_id: '123', message: 'test', title: 'test', error_code: undefined, doc_url: undefined }
        ],
        // Missing required field message
        [
            { request_id: '123', title: 'test', error_code: 'test', doc_url: undefined },
            undefined
        ],
        // Required field message wrong type
        [
            { request_id: '123', message: 123, title: 'test', error_code: 'test', doc_url: null },
            undefined
        ],
        // Optional field doc_url wrong type
        [
            { request_id: '123', message: 'test', title: 'test', error_code: 'test', doc_url: 123 },
            { request_id: '123', message: 'test', title: 'test', error_code: 'test', doc_url: undefined },
        ],
    ]) {
        it(`${JSON.stringify(input)} -> ${expected}`, () => {
            expect(safeAPIErrorPayload(input)).toEqual(expected);
        });
    }
})