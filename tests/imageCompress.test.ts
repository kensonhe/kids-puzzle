import { describe, it, expect, vi, beforeAll } from 'vitest';
import { compressImage } from '../src/utils/imageCompress';
import { MAX_IMAGE_SIZE } from '../src/constants';
import { Image as CanvasImage } from 'canvas';

// Patch Image with canvas package's Image so data URL loading works in jsdom
beforeAll(() => {
  vi.stubGlobal('Image', CanvasImage);
});

describe('compressImage', () => {
  it('should return original data URL if image is smaller than max size', async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(0, 0, 100, 100);
    const smallDataUrl = canvas.toDataURL('image/png');
    const result = await compressImage(smallDataUrl);
    expect(result).toMatch(/^data:image\/png;base64,/);
  });

  it('should resize image when dimensions exceed max size', async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 2000;
    canvas.height = 2000;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#00FF00';
    ctx.fillRect(0, 0, 2000, 2000);
    const largeDataUrl = canvas.toDataURL('image/png');
    const result = await compressImage(largeDataUrl);
    const img = new CanvasImage();
    img.src = result;
    expect(img.width).toBeLessThanOrEqual(MAX_IMAGE_SIZE);
    expect(img.height).toBeLessThanOrEqual(MAX_IMAGE_SIZE);
  });

  it('should preserve aspect ratio when resizing', async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1600;
    canvas.height = 800;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#0000FF';
    ctx.fillRect(0, 0, 1600, 800);
    const dataUrl = canvas.toDataURL('image/png');
    const result = await compressImage(dataUrl);
    const img = new CanvasImage();
    img.src = result;
    expect(img.width).toBe(MAX_IMAGE_SIZE);
    expect(img.height).toBe(MAX_IMAGE_SIZE / 2);
  });
});