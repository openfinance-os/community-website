/** Read width and height from a PNG IHDR. Used so social meta matches the file. */
export function pngSize(bytes: Uint8Array): { width: number; height: number } {
  const signature = [137, 80, 78, 71, 13, 10, 26, 10];
  if (bytes.byteLength < 24) {
    throw new Error('PNG is too small to contain an IHDR');
  }
  for (let index = 0; index < signature.length; index += 1) {
    if (bytes[index] !== signature[index]) {
      throw new Error('Expected a PNG file');
    }
  }
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (view.getUint32(12) !== 0x49484452) {
    throw new Error('PNG is missing an IHDR chunk');
  }
  return {
    width: view.getUint32(16),
    height: view.getUint32(20),
  };
}
