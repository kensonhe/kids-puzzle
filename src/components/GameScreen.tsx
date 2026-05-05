import { useState } from 'react';
import type { PuzzlePiece as PuzzlePieceType, DifficultyLevel } from '../types';
import { PuzzlePiece as PuzzlePieceComponent } from './PuzzlePiece';
import './GameScreen.css';

interface GameScreenProps {
  image: string;
  difficulty: DifficultyLevel;
  pieces: PuzzlePieceType[];
  onSwap: (fromIndex: number, toIndex: number) => void;
  onReset: () => void;
}

const PUZZLE_SIZE = 400;

export function GameScreen({
  image,
  difficulty,
  pieces,
  onSwap,
  onReset,
}: GameScreenProps) {
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const totalCells = difficulty * difficulty;

  const handleSelect = (index: number) => {
    if (selectedIndex === index) {
      setSelectedIndex(-1);
    } else if (selectedIndex >= 0) {
      onSwap(selectedIndex, index);
      setSelectedIndex(-1);
    } else {
      setSelectedIndex(index);
    }
  };

  const handleSwap = (fromIndex: number, toIndex: number) => {
    onSwap(fromIndex, toIndex);
    setSelectedIndex(-1);
  };

  // Build a map from currentIndex to piece for quick lookup
  const pieceAtPosition = new Map<number, PuzzlePieceType>();
  pieces.forEach(p => pieceAtPosition.set(p.currentIndex, p));

  return (
    <div className="game-screen">
      <div className="game-header">
        <h1 className="game-header__title">拼图进行中</h1>
        <p className="game-header__desc">当前难度：{difficulty} × {difficulty}</p>
      </div>
      <div className="game-sidebar">
        <div className="reference-image">
          <img src={image} alt="参考图" />
        </div>
        <div className="game-help">提示：先点一块再点另一块，可快速交换位置</div>
        <button className="game-reset-btn" onClick={onReset}>
          ↻ 重新开始
        </button>
      </div>

      <div className="game-main">
        <div
          className="puzzle-grid"
          style={{
            gridTemplateColumns: `repeat(${difficulty}, 1fr)`,
            width: `min(${PUZZLE_SIZE}px, calc(100vw - 32px))`,
          }}
        >
          {Array.from({ length: totalCells }, (_, position) => {
            const piece = pieceAtPosition.get(position);
            return (
              <div key={position} className="puzzle-cell">
                {piece && (
                  <PuzzlePieceComponent
                    piece={piece}
                    image={image}
                    gridSize={difficulty}
                    onSwap={handleSwap}
                    selected={selectedIndex === piece.currentIndex}
                    selectedIndex={selectedIndex}
                    onSelect={handleSelect}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}