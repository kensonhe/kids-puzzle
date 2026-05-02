import { describe, it, expect } from 'vitest';
import { calculateClips } from '../src/utils/imageClip';

describe('calculateClips', () => {
  it('should generate correct number of clips for 2x2 grid', () => {
    const clips = calculateClips(2, 400, 400);
    expect(clips).toHaveLength(4);
  });

  it('should generate correct number of clips for 3x3 grid', () => {
    const clips = calculateClips(3, 400, 400);
    expect(clips).toHaveLength(9);
  });

  it('should generate correct number of clips for 4x4 grid', () => {
    const clips = calculateClips(4, 400, 400);
    expect(clips).toHaveLength(16);
  });

  it('should calculate correct clip positions for 2x2', () => {
    const clips = calculateClips(2, 400, 400);
    expect(clips[0]).toEqual({ x: 0, y: 0, width: 200, height: 200 });
    expect(clips[3]).toEqual({ x: 200, y: 200, width: 200, height: 200 });
  });

  it('should calculate correct clip positions for 3x3', () => {
    const clips = calculateClips(3, 300, 300);
    expect(clips[4]).toEqual({ x: 100, y: 100, width: 100, height: 100 });
    expect(clips[8]).toEqual({ x: 200, y: 200, width: 100, height: 100 });
  });
});