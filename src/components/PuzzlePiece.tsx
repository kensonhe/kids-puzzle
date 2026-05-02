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

// Detect touch device - HTML5 Drag & Drop doesn't work on touch
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
  // For gridSize=1, avoid division by zero (shouldn't happen in practice)
  const bgPositionX = gridSize > 1 ? (col / (gridSize - 1)) * 100 : 0;
  const bgPositionY = gridSize > 1 ? (row / (gridSize - 1)) * 100 : 0;
  const bgPositionPercent = `${bgPositionX}% ${bgPositionY}%`;

  // Touch-based drag state
  const [touchDragIndex, setTouchDragIndex] = useState<number>(-1);

  const handleClick = () => {
    if (piece.isPlaced) return;

    if (selectedIndex >= 0 && selectedIndex !== piece.currentIndex) {
      onSwap(selectedIndex, piece.currentIndex);
    } else {
      onSelect(piece.currentIndex);
    }
  };

  // Touch drag handlers for mobile
  const handleTouchStart = () => {
    if (piece.isPlaced) return;
    setTouchDragIndex(piece.currentIndex);
    setIsDragging(true);
  };

  const handleTouchMove = () => {
    if (touchDragIndex < 0) return;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchDragIndex < 0 || piece.isPlaced) {
      setIsDragging(false);
      setTouchDragIndex(-1);
      return;
    }

    // Find which cell the finger landed on
    const touch = e.changedTouches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    const cell = target?.closest('.puzzle-cell');
    if (cell) {
      // Determine the cell index by its position in the grid
      const grid = cell.parentElement;
      if (grid) {
        const cells = Array.from(grid.children);
        const cellIndex = cells.indexOf(cell);
        if (cellIndex >= 0 && cellIndex !== piece.currentIndex) {
          onSwap(piece.currentIndex, cellIndex);
        }
      }
    }

    setIsDragging(false);
    setTouchDragIndex(-1);
  };

  // Desktop drag handlers
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

  // On touch devices, don't use HTML5 drag (it blocks clicks)
  // On desktop, use both drag and click-to-swap
  const dragProps = isTouchDevice
    ? {
        onTouchStart: handleTouchStart,
        onTouchMove: handleTouchMove,
        onTouchEnd: handleTouchEnd,
      }
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