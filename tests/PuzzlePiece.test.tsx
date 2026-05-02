import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { PuzzlePiece } from '../src/components/PuzzlePiece';
import { PuzzlePiece as PuzzlePieceType } from '../src/types';

const mockPiece: PuzzlePieceType = {
  id: 0, correctIndex: 0, currentIndex: 2, isPlaced: false,
  imageClip: { x: 0, y: 0, width: 200, height: 200 },
};

describe('PuzzlePiece', () => {
  it('should render with image clip background', () => {
    const { container } = render(
      <PuzzlePiece piece={mockPiece} image="test.png" gridSize={2} puzzleSize={400}
        onSwap={() => {}} selected={false} selectedIndex={-1} onSelect={() => {}} />
    );
    const el = container.firstChild as HTMLElement;
    expect(el.style.backgroundImage).toContain('test.png');
  });

  it('should show checkmark when piece is placed correctly', () => {
    const placedPiece = { ...mockPiece, isPlaced: true };
    render(
      <PuzzlePiece piece={placedPiece} image="test.png" gridSize={2} puzzleSize={400}
        onSwap={() => {}} selected={false} selectedIndex={-1} onSelect={() => {}} />
    );
    expect(document.querySelector('.puzzle-piece__check')).not.toBeNull();
  });

  it('should call onSwap when clicked with another piece selected', () => {
    let swapCalled = false;
    let swapArgs: [number, number] = [0, 0];
    const onSwap = (from: number, to: number) => { swapCalled = true; swapArgs = [from, to]; };
    render(
      <PuzzlePiece piece={mockPiece} image="test.png" gridSize={2} puzzleSize={400}
        onSwap={onSwap} selected={false} selectedIndex={1} onSelect={() => {}} />
    );
    fireEvent.click(document.querySelector('.puzzle-piece')!);
    expect(swapCalled).toBe(true);
    expect(swapArgs).toEqual([1, mockPiece.currentIndex]);
  });

  it('should not be interactive when piece is placed', () => {
    const placedPiece = { ...mockPiece, isPlaced: true };
    let swapCalled = false;
    render(
      <PuzzlePiece piece={placedPiece} image="test.png" gridSize={2} puzzleSize={400}
        onSwap={() => { swapCalled = true; }} selected={false} selectedIndex={-1} onSelect={() => {}} />
    );
    fireEvent.click(document.querySelector('.puzzle-piece')!);
    expect(swapCalled).toBe(false);
  });
});