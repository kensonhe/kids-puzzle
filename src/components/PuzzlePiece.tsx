import { useState, useRef, useEffect, useCallback } from 'react';
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

// Detect touch device
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

const DRAG_THRESHOLD = 10; // pixels of movement to distinguish drag from tap

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
  const pieceRef = useRef<HTMLDivElement>(null);

  // Touch drag tracking (non-react state to avoid stale closures)
  const touchState = useRef<{
    startX: number;
    startY: number;
    currentIndex: number;
    isDragging: boolean;
    moved: boolean;
  }>({ startX: 0, startY: 0, currentIndex: -1, isDragging: false, moved: false });

  const bgSizePercent = `${gridSize * 100}% ${gridSize * 100}%`;
  const col = piece.correctIndex % gridSize;
  const row = Math.floor(piece.correctIndex / gridSize);
  const bgPositionX = gridSize > 1 ? (col / (gridSize - 1)) * 100 : 0;
  const bgPositionY = gridSize > 1 ? (row / (gridSize - 1)) * 100 : 0;
  const bgPositionPercent = `${bgPositionX}% ${bgPositionY}%`;

  // Click-to-swap handler
  const handleClick = useCallback(() => {
    if (piece.isPlaced) return;
    // Only handle click if no drag happened (tap = click)
    if (touchState.current.moved) return;

    if (selectedIndex >= 0 && selectedIndex !== piece.currentIndex) {
      onSwap(selectedIndex, piece.currentIndex);
    } else {
      onSelect(piece.currentIndex);
    }
  }, [piece, selectedIndex, onSwap, onSelect]);

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

  // Manually attach non-passive touch listeners on mobile
  useEffect(() => {
    if (!isTouchDevice || !pieceRef.current || piece.isPlaced) return;

    const el = pieceRef.current;

    const onTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchState.current = {
        startX: touch.clientX,
        startY: touch.clientY,
        currentIndex: piece.currentIndex,
        isDragging: true,
        moved: false,
      };
      setIsDragging(true);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!touchState.current.isDragging) return;
      e.preventDefault(); // Now allowed since listener is non-passive

      const touch = e.touches[0];
      const dx = touch.clientX - touchState.current.startX;
      const dy = touch.clientY - touchState.current.startY;

      if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
        touchState.current.moved = true;
      }

      // Visually move the piece with the finger
      if (el) {
        el.style.transform = `translate(${dx}px, ${dy}px) scale(1.1)`;
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!touchState.current.isDragging) return;

      // Reset visual position
      if (el) {
        el.style.transform = '';
      }
      setIsDragging(false);

      // If it was a drag (moved enough), find drop target
      if (touchState.current.moved) {
        const touch = e.changedTouches[0];
        // Temporarily hide the dragged element so elementFromPoint finds the cell underneath
        el.style.opacity = '0';
        const target = document.elementFromPoint(touch.clientX, touch.clientY);
        el.style.opacity = '';

        const cell = target?.closest('.puzzle-cell');
        if (cell) {
          const grid = cell.parentElement;
          if (grid) {
            const cells = Array.from(grid.children);
            const cellIndex = cells.indexOf(cell);
            if (cellIndex >= 0 && cellIndex !== piece.currentIndex) {
              onSwap(piece.currentIndex, cellIndex);
            }
          }
        }
      }
      // If it was a tap (no movement), handleClick will fire naturally

      touchState.current.isDragging = false;
    };

    el.addEventListener('touchstart', onTouchStart, { passive: false });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: false });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [piece.isPlaced, piece.currentIndex, onSwap]);

  const classNames = [
    'puzzle-piece',
    piece.isPlaced ? 'puzzle-piece--placed' : '',
    isDragging ? 'puzzle-piece--dragging' : '',
    selected ? 'puzzle-piece--selected' : '',
  ].filter(Boolean).join(' ');

  const dragProps = isTouchDevice
    ? {} // Touch handled via ref listeners
    : {
        draggable: !piece.isPlaced,
        onDragStart: handleDragStart,
        onDragEnd: handleDragEnd,
        onDragOver: handleDragOver,
        onDrop: handleDrop,
      };

  return (
    <div
      ref={pieceRef}
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