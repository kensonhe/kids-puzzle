export interface ClipRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function calculateClips(
  gridSize: number,
  imageWidth: number,
  imageHeight: number
): ClipRegion[] {
  const pieceWidth = imageWidth / gridSize;
  const pieceHeight = imageHeight / gridSize;
  const clips: ClipRegion[] = [];

  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      clips.push({
        x: col * pieceWidth,
        y: row * pieceHeight,
        width: pieceWidth,
        height: pieceHeight,
      });
    }
  }

  return clips;
}