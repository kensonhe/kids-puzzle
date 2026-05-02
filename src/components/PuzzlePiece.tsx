import { useState, useRef } from 'react';
import type { PuzzlePiece as PuzzlePieceType } from '../types';
import './PuzzlePiece.css';

interface PuzzlePieceProps {
  piece: PuzzlePieceType;
  image: string;
  gridSize: number;
  puzzleSize: number;
  onSwap: (fromIndex: number, toIndex: number) => void;
  selected: boolean;
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export function PuzzlePiece({
  piece,
  image,
  gridSize,
  puzzleSize,
  onSwap,
  selected,
  selectedIndex,
  onSelect,
}: PuzzlePieceProps) {
  const [isDragging, setIsDragging] = useState(false);
  const dragStartIndex = useRef<number>(-1);

  const pieceSize = puzzleSize / gridSize;
  const bgSize = `${puzzleSize}px ${puzzleSize}px`;
  const bgPosition = `-${piece.imageClip.x}px -${piece.imageClip.y}px`;

  const handleClick = () => {
    if (piece.isPlaced) return;

    if (selectedIndex >= 0 && selectedIndex !== piece.currentIndex) {
      onSwap(selectedIndex, piece.currentIndex);
    } else {
      onSelect(piece.currentIndex);
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (piece.isPlaced) {
      e.preventDefault();
      return;
    }
    setIsDragging(true);
    dragStartIndex.current = piece.currentIndex;
    e.dataTransfer.setData('text/plain', String(piece.currentIndex));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    dragStartIndex.current = -1;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (fromIndex >= 0 && fromIndex !== piece.currentIndex) {
      onSwap(fromIndex, piece.currentIndex);
    }
  };

  const classNames = [
    'puzzle-piece',
    piece.isPlaced ? 'puzzle-piece--placed' : '',
    isDragging ? 'puzzle-piece--dragging' : '',
    selected ? 'puzzle-piece--selected' : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      className={classNames}
      style={{
        width: pieceSize,
        height: pieceSize,
        backgroundImage: `url(${image})`,
        backgroundSize: bgSize,
        backgroundPosition: bgPosition,
      }}
      onClick={handleClick}
      draggable={!piece.isPlaced}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {piece.isPlaced && <span className="puzzle-piece__check">&#10003;</span>}
    </div>
  );
}