/**
 * Decode a base64 string to bytes.
 *
 * In Node.js, this is just a wrapper for `Buffer.from(data, 'base64')`.
 */
export function decodeBase64String(data: string): Uint8Array {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(data, 'base64');
  }
  const binary = atob(data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
