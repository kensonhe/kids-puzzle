import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { GameScreen } from '../src/components/GameScreen';
import { PuzzlePiece as PuzzlePieceType, DifficultyLevel } from '../src/types';

const mockPieces: PuzzlePieceType[] = [
  { id: 0, correctIndex: 0, currentIndex: 1, isPlaced: false, imageClip: { x: 0, y: 0, width: 200, height: 200 } },
  { id: 1, correctIndex: 1, currentIndex: 0, isPlaced: false, imageClip: { x: 200, y: 0, width: 200, height: 200 } },
  { id: 2, correctIndex: 2, currentIndex: 3, isPlaced: false, imageClip: { x: 0, y: 200, width: 200, height: 200 } },
  { id: 3, correctIndex: 3, currentIndex: 2, isPlaced: false, imageClip: { x: 200, y: 200, width: 200, height: 200 } },
];

describe('GameScreen', () => {
  it('should render reference image', () => {
    render(<GameScreen image="test.png" difficulty={2} pieces={mockPieces}
      startTime={Date.now()} isComplete={false} onSwap={() => {}} onReset={() => {}} />);
    expect((document.querySelector('.reference-image img') as HTMLImageElement).src).toContain('test.png');
  });

  it('should render puzzle grid with correct number of cells', () => {
    render(<GameScreen image="test.png" difficulty={2} pieces={mockPieces}
      startTime={Date.now()} isComplete={false} onSwap={() => {}} onReset={() => {}} />);
    expect(document.querySelectorAll('.puzzle-cell')).toHaveLength(4);
  });

  it('should render reset button', () => {
    render(<GameScreen image="test.png" difficulty={2} pieces={mockPieces}
      startTime={Date.now()} isComplete={false} onSwap={() => {}} onReset={() => {}} />);
    expect(document.querySelector('.game-reset-btn')).not.toBeNull();
  });
});