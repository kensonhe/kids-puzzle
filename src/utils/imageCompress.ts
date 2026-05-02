import { MAX_IMAGE_SIZE } from '../constants';

export async function compressImage(dataUrl: string): Promise<string> {
  const img = new Image();

  await new Promise<void>((resolve) => {
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = dataUrl;
    // Some environments (e.g., Node.js canvas package) load data URLs
    // synchronously, making img.complete true immediately. Check this
    // as a fallback to avoid hanging if onload never fires.
    if (img.complete) {
      resolve();
    }
  });

  if (img.width <= MAX_IMAGE_SIZE && img.height <= MAX_IMAGE_SIZE) {
    return dataUrl;
  }

  const scale = Math.min(MAX_IMAGE_SIZE / img.width, MAX_IMAGE_SIZE / img.height);
  const targetWidth = Math.round(img.width * scale);
  const targetHeight = Math.round(img.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  return canvas.toDataURL('image/jpeg', 0.8);
}