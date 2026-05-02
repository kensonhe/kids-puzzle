import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameState } from '../src/hooks/useGameState';

describe('useGameState', () => {
  it('should initialize with start phase', () => {
    const { result } = renderHook(() => useGameState());
    expect(result.current.phase).toBe('start');
  });

  it('should transition to playing phase when starting game', () => {
    const { result } = renderHook(() => useGameState());
    act(() => {
      result.current.startGame('/images/cat.svg', 3);
    });
    expect(result.current.phase).toBe('playing');
    expect(result.current.difficulty).toBe(3);
    expect(result.current.pieces).toHaveLength(9);
  });

  it('should generate pieces with correct clip regions for 2x2', () => {
    const { result } = renderHook(() => useGameState());
    act(() => {
      result.current.startGame('/images/cat.svg', 2);
    });
    expect(result.current.pieces).toHaveLength(4);
    expect(result.current.pieces[0].imageClip).toEqual({
      x: 0, y: 0, width: 200, height: 200,
    });
  });

  it('should swap pieces when swapPieces is called', () => {
    const { result } = renderHook(() => useGameState());
    act(() => {
      result.current.startGame('/images/cat.svg', 2);
    });
    const piecesBefore = result.current.pieces.map(p => p.currentIndex);
    act(() => {
      result.current.swapPieces(0, 1);
    });
    const piecesAfter = result.current.pieces.map(p => p.currentIndex);
    expect(piecesBefore).not.toEqual(piecesAfter);
  });

  it('should mark piece as placed when it lands on correct position', () => {
    const { result } = renderHook(() => useGameState());
    act(() => {
      result.current.startGame('/images/cat.svg', 2);
    });
    const unplacedPiece = result.current.pieces.find(p => !p.isPlaced);
    if (unplacedPiece) {
      act(() => {
        result.current.swapPieces(unplacedPiece.currentIndex, unplacedPiece.correctIndex);
      });
      const nowPlaced = result.current.pieces.find(p => p.id === unplacedPiece.id);
      expect(nowPlaced!.isPlaced).toBe(true);
    }
  });

  it('should detect game completion when all pieces are placed', () => {
    const { result } = renderHook(() => useGameState());
    act(() => {
      result.current.startGame('/images/cat.svg', 2);
    });
    // Re-read state each iteration to avoid stale data
    for (let i = 0; i < 10; i++) {
      const unplaced = result.current.pieces.find(p => !p.isPlaced);
      if (!unplaced) break;
      act(() => {
        result.current.swapPieces(unplaced.currentIndex, unplaced.correctIndex);
      });
    }
    expect(result.current.isComplete).toBe(true);
    expect(result.current.phase).toBe('complete');
  });

  it('should reset to start phase when resetGame is called', () => {
    const { result } = renderHook(() => useGameState());
    act(() => {
      result.current.startGame('/images/cat.svg', 2);
    });
    act(() => {
      result.current.resetGame();
    });
    expect(result.current.phase).toBe('start');
  });
});