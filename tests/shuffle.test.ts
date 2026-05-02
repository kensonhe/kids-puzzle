import { describe, it, expect } from 'vitest';
import { shuffle } from '../src/utils/shuffle';

describe('shuffle', () => {
  it('should return an array of the same length', () => {
    const input = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    const result = shuffle(input);
    expect(result).toHaveLength(input.length);
  });

  it('should contain all original elements', () => {
    const input = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    const result = shuffle(input);
    expect(result.sort((a, b) => a - b)).toEqual(input);
  });

  it('should not return the same order as input', () => {
    const input = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    const results = Array.from({ length: 20 }, () => shuffle(input));
    const hasDifferent = results.some(r => r.some((v, i) => v !== input[i]));
    expect(hasDifferent).toBe(true);
  });

  it('should shuffle at least 60% of elements away from original position', () => {
    const input = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    const result = shuffle(input);
    const displaced = result.filter((v, i) => v !== input[i]).length;
    expect(displaced).toBeGreaterThanOrEqual(Math.ceil(input.length * 0.6));
  });

  it('should not modify the original array', () => {
    const input = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    const copy = [...input];
    shuffle(input);
    expect(input).toEqual(copy);
  });
});