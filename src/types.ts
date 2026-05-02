export interface PuzzlePiece {
  id: number;
  correctIndex: number;
  currentIndex: number;
  isPlaced: boolean;
  imageClip: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface GameState {
  image: string;
  difficulty: 2 | 3 | 4;
  pieces: PuzzlePiece[];
  startTime: number;
  isComplete: boolean;
  phase: 'start' | 'playing' | 'complete';
}

export type DifficultyLevel = 2 | 3 | 4;