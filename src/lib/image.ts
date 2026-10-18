// Strip EXIF/metadata from JPEG/PNG photos by re-encoding the image through a
// canvas. This drops GPS coordinates, camera info, and thumbnails that EXIF
// would otherwise carry into public storage. No external dependencies.
//
// Returns a new Blob (PNG for transparency support, JPEG otherwise) with
// metadata removed. Falls back to the original File if decoding fails so a
// valid upload is never blocked by the stripping step.

export async function stripImageMetadata(
  file: File,
  maxDim = 1600,
): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close?.();
    const isJpeg = file.type === 'image/jpeg' || file.type === 'image/jpg';
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(
        resolve,
        isJpeg ? 'image/jpeg' : 'image/png',
        isJpeg ? 0.85 : undefined,
      ),
    );
    return blob ?? file;
  } catch {
    // Decoding failed (rare). Preserve the original so uploads still work.
    return file;
  }
}

export function blobToFile(blob: Blob, originalName: string): File {
  const ext = blob.type === 'image/png' ? '.png' : '.jpg';
  const base = originalName.replace(/\.(jpe?g|png)$/i, '');
  return new File([blob], `${base}${ext}`, { type: blob.type });
}
