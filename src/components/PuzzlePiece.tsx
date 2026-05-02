import { useState } from 'react';
import type { PuzzlePiece as PuzzlePieceType } from '../types';
import './PuzzlePiece.css';

interface PuzzlePieceProps {
  piece: PuzzlePieceType;
  image: string;
  gridSize: number;
  onSwap: (fromIndex: number, toIndex: number) => void;
  selected: boolean;
  selectedIndex: number;
  onSelect: (index: number) => void;
}

// Detect touch device - only use click-to-swap on mobile
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

export function PuzzlePiece({
  piece,
  image,
  gridSize,
  onSwap,
  selected,
  selectedIndex,
  onSelect,
}: PuzzlePieceProps) {
  const [isDragging, setIsDragging] = useState(false);

  const bgSizePercent = `${gridSize * 100}% ${gridSize * 100}%`;
  const col = piece.correctIndex % gridSize;
  const row = Math.floor(piece.correctIndex / gridSize);
  const bgPositionX = gridSize > 1 ? (col / (gridSize - 1)) * 100 : 0;
  const bgPositionY = gridSize > 1 ? (row / (gridSize - 1)) * 100 : 0;
  const bgPositionPercent = `${bgPositionX}% ${bgPositionY}%`;

  const handleClick = () => {
    if (piece.isPlaced) return;

    if (selectedIndex >= 0 && selectedIndex !== piece.currentIndex) {
      onSwap(selectedIndex, piece.currentIndex);
    } else {
      onSelect(piece.currentIndex);
    }
  };

  // Desktop drag handlers only
  const handleDragStart = (e: React.DragEvent) => {
    if (piece.isPlaced) {
      e.preventDefault();
      return;
    }
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', String(piece.currentIndex));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setIsDragging(false);
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

  // On touch devices: click-to-swap only (no drag)
  // On desktop: drag + click-to-swap
  const dragProps = isTouchDevice
    ? {} // No drag props on touch devices
    : {
        draggable: !piece.isPlaced,
        onDragStart: handleDragStart,
        onDragEnd: handleDragEnd,
        onDragOver: handleDragOver,
        onDrop: handleDrop,
      };

  return (
    <div
      className={classNames}
      style={{
        backgroundImage: `url(${image})`,
        backgroundSize: bgSizePercent,
        backgroundPosition: bgPositionPercent,
      }}
      onClick={handleClick}
      {...dragProps}
    >
      {piece.isPlaced && <span className="puzzle-piece__check">&#10003;</span>}
    </div>
  );
}