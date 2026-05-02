import { useState, useCallback } from 'react';
import { GameState, PuzzlePiece, DifficultyLevel } from '../types';
import { shuffle } from '../utils/shuffle';
import { calculateClips } from '../utils/imageClip';

const PUZZLE_SIZE = 400;

const initialState: GameState = {
  image: '',
  difficulty: 2,
  pieces: [],
  startTime: 0,
  isComplete: false,
  phase: 'start',
};

export function useGameState() {
  const [state, setState] = useState<GameState>(initialState);

  const startGame = useCallback((image: string, difficulty: DifficultyLevel) => {
    const clips = calculateClips(difficulty, PUZZLE_SIZE, PUZZLE_SIZE);
    const totalPieces = difficulty * difficulty;
    const correctIndices = Array.from({ length: totalPieces }, (_, i) => i);
    const shuffledIndices = shuffle(correctIndices);

    const pieces: PuzzlePiece[] = correctIndices.map((correctIndex, id) => ({
      id,
      correctIndex,
      currentIndex: shuffledIndices[id],
      isPlaced: shuffledIndices[id] === correctIndex,
      imageClip: clips[correctIndex],
    }));

    setState({
      image,
      difficulty,
      pieces,
      startTime: Date.now(),
      isComplete: false,
      phase: 'playing',
    });
  }, []);

  const swapPieces = useCallback((indexA: number, indexB: number) => {
    setState(prev => {
      const pieceA = prev.pieces.find(p => p.currentIndex === indexA);
      const pieceB = prev.pieces.find(p => p.currentIndex === indexB);
      if (!pieceA || !pieceB) return prev;

      const newPieces = prev.pieces.map(p => {
        if (p.id === pieceA.id) {
          return { ...p, currentIndex: indexB, isPlaced: indexB === p.correctIndex };
        }
        if (p.id === pieceB.id) {
          return { ...p, currentIndex: indexA, isPlaced: indexA === p.correctIndex };
        }
        return p;
      });

      const isComplete = newPieces.every(p => p.isPlaced);
      return { ...prev, pieces: newPieces, isComplete, phase: isComplete ? 'complete' : prev.phase };
    });
  }, []);

  const resetGame = useCallback(() => {
    setState(initialState);
  }, []);

  return { ...state, startGame, swapPieces, resetGame };
}