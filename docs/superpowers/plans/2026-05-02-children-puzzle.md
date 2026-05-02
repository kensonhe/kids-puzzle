# 儿童拼图游戏实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个面向 3-5 岁幼儿的经典拼图 Web 游戏，支持预设图片和用户上传，多难度等级，React 技术栈。

**Architecture:** 单页 React 应用，DOM 组件实现拼图块，CSS background-position 裁切图片，HTML5 Drag & Drop + touch 事件实现拖拽交互，Web Audio API 生成音效反馈。

**Tech Stack:** React 18, TypeScript, Vite, Vitest, CSS（无额外 CSS 框架，保持幼儿友好的自定义样式）

---

## 文件结构

```
glm-puzzle/
├── public/
│   └── images/
│       ├── cat.svg
│       ├── dog.svg
│       ├── butterfly.svg
│       └── sunflower.svg
├── src/
│   ├── types.ts              # TypeScript 类型定义
│   ├── constants.ts          # 预设图片配置、鼓励语列表
│   ├── utils/
│   │   ├── shuffle.ts        # Fisher-Yates 打乱算法
│   │   ├── imageClip.ts      # 拼图块裁切区域计算
│   │   ├── imageCompress.ts  # 上传图片压缩
│   │   ├── sounds.ts         # Web Audio API 音效生成
│   ├── hooks/
│   │   ├── useGameState.ts   # 游戏核心状态管理
│   ├── components/
│   │   ├── StartScreen.tsx   # 开始页
│   │   ├── StartScreen.css
│   │   ├── PuzzlePiece.tsx   # 单个拼图块
│   │   ├── PuzzlePiece.css
│   │   ├── GameScreen.tsx    # 游戏页
│   │   ├── GameScreen.css
│   │   ├── CompleteScreen.tsx # 完成页
│   │   ├── CompleteScreen.css
│   │   ├── App.tsx           # 主应用路由
│   │   ├── App.css
│   ├── main.tsx
│   ├── index.css             # 全局样式
├── tests/
│   ├── shuffle.test.ts
│   ├── imageClip.test.ts
│   ├── imageCompress.test.ts
│   ├── useGameState.test.ts
│   ├── PuzzlePiece.test.tsx
│   ├── StartScreen.test.tsx
│   ├── GameScreen.test.tsx
│   ├── CompleteScreen.test.tsx
├── package.json
├── vite.config.ts
├── vitest.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
```

---

### Task 1: 项目初始化

**Files:**
- Create: `package.json`, `vite.config.ts`, `vitest.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`
- Create: `src/main.tsx`, `src/index.css`

- [ ] **Step 1: 用 Vite 初始化 React + TypeScript 项目**

```bash
cd /Users/heshengqiang/claude_code/glm-puzzle
npm create vite@latest . -- --template react-ts
```

如果目录已有文件，Vite 可能提示冲突，选择覆盖。

- [ ] **Step 2: 安装测试依赖**

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

- [ ] **Step 3: 配置 Vitest**

修改 `vitest.config.ts`：

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
    css: true,
  },
})
```

创建 `tests/setup.ts`：

```typescript
import '@testing-library/jest-dom'
```

- [ ] **Step 4: 确认项目能运行**

```bash
npm run dev
```

打开 http://localhost:5173 确认看到 Vite + React 默认页面。

```bash
npx vitest run
```

确认 Vitest 能运行（即使没有测试也应正常启动）。

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: initialize React + Vite + Vitest project"
```

---

### Task 2: 类型定义和常量

**Files:**
- Create: `src/types.ts`
- Create: `src/constants.ts`

- [ ] **Step 1: 写类型定义**

创建 `src/types.ts`：

```typescript
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
```

- [ ] **Step 2: 写常量配置**

创建 `src/constants.ts`：

```typescript
import { DifficultyLevel } from './types';

export interface PresetImage {
  id: string;
  name: string;
  url: string;
}

export const PRESET_IMAGES: PresetImage[] = [
  { id: 'cat', name: '小猫', url: '/images/cat.svg' },
  { id: 'dog', name: '小狗', url: '/images/dog.svg' },
  { id: 'butterfly', name: '蝴蝶', url: '/images/butterfly.svg' },
  { id: 'sunflower', name: '向日葵', url: '/images/sunflower.svg' },
];

export const DIFFICULTY_OPTIONS: { level: DifficultyLevel; label: string; stars: number }[] = [
  { level: 2, label: '简单', stars: 1 },
  { level: 3, label: '中等', stars: 2 },
  { level: 4, label: '挑战', stars: 3 },
];

export const ENCOURAGEMENTS: string[] = [
  '太棒了！',
  '你真聪明！',
  '真厉害！',
  '拼图小达人！',
  '好厉害呀！',
];

export const MAX_IMAGE_SIZE = 800;
```

- [ ] **Step 3: Commit**

```bash
git add src/types.ts src/constants.ts
git commit -m "feat: add TypeScript types and constants"
```

---

### Task 3: Shuffle 打乱算法

**Files:**
- Create: `src/utils/shuffle.ts`
- Create: `tests/shuffle.test.ts`

- [ ] **Step 1: 写失败的测试**

创建 `tests/shuffle.test.ts`：

```typescript
import { describe, it, expect } from 'vitest';
import { shuffle } from '../src/utils/shuffle';

describe('shuffle', () => {
  it('should return an array of the same length', () => {
    const input = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    const result = shuffle(input);
    expect(result).toHaveLength(input.length);
  });

  it('should contain all original elements', () => {
    const input = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    const result = shuffle(input);
    expect(result.sort((a, b) => a - b)).toEqual(input);
  });

  it('should not return the same order as input', () => {
    const input = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    // Run shuffle multiple times, at least one should differ
    const results = Array.from({ length: 20 }, () => shuffle(input));
    const hasDifferent = results.some(r => r.some((v, i) => v !== input[i]));
    expect(hasDifferent).toBe(true);
  });

  it('should shuffle at least 60% of elements away from original position', () => {
    const input = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    const result = shuffle(input);
    const displaced = result.filter((v, i) => v !== input[i]).length;
    expect(displaced).toBeGreaterThanOrEqual(Math.ceil(input.length * 0.6));
  });

  it('should not modify the original array', () => {
    const input = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    const copy = [...input];
    shuffle(input);
    expect(input).toEqual(copy);
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

```bash
npx vitest run tests/shuffle.test.ts
```

预期：FAIL — `shuffle` 函数不存在。

- [ ] **Step 3: 实现 shuffle**

创建 `src/utils/shuffle.ts`：

```typescript
export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  let attempts = 0;
  const maxAttempts = 100;

  do {
    // Fisher-Yates shuffle
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    attempts++;
  } while (
    attempts < maxAttempts &&
    result.filter((v, i) => v !== array[i]).length < Math.ceil(array.length * 0.6)
  );

  return result;
}
```

- [ ] **Step 4: 运行测试确认通过**

```bash
npx vitest run tests/shuffle.test.ts
```

预期：全部 PASS。

- [ ] **Step 5: Commit**

```bash
git add src/utils/shuffle.ts tests/shuffle.test.ts
git commit -m "feat: add Fisher-Yates shuffle utility with 60% displacement guarantee"
```

---

### Task 4: 拼图块裁切区域计算

**Files:**
- Create: `src/utils/imageClip.ts`
- Create: `tests/imageClip.test.ts`

- [ ] **Step 1: 写失败的测试**

创建 `tests/imageClip.test.ts`：

```typescript
import { describe, it, expect } from 'vitest';
import { calculateClips } from '../src/utils/imageClip';

describe('calculateClips', () => {
  it('should generate correct number of clips for 2x2 grid', () => {
    const clips = calculateClips(2, 400, 400);
    expect(clips).toHaveLength(4);
  });

  it('should generate correct number of clips for 3x3 grid', () => {
    const clips = calculateClips(3, 400, 400);
    expect(clips).toHaveLength(9);
  });

  it('should generate correct number of clips for 4x4 grid', () => {
    const clips = calculateClips(4, 400, 400);
    expect(clips).toHaveLength(16);
  });

  it('should calculate correct clip positions for 2x2', () => {
    const clips = calculateClips(2, 400, 400);
    // Top-left piece
    expect(clips[0]).toEqual({ x: 0, y: 0, width: 200, height: 200 });
    // Bottom-right piece
    expect(clips[3]).toEqual({ x: 200, y: 200, width: 200, height: 200 });
  });

  it('should calculate correct clip positions for 3x3', () => {
    const clips = calculateClips(3, 300, 300);
    // Center piece
    expect(clips[4]).toEqual({ x: 100, y: 100, width: 100, height: 100 });
    // Bottom-right piece
    expect(clips[8]).toEqual({ x: 200, y: 200, width: 100, height: 100 });
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

```bash
npx vitest run tests/imageClip.test.ts
```

预期：FAIL — `calculateClips` 函数不存在。

- [ ] **Step 3: 实现 calculateClips**

创建 `src/utils/imageClip.ts`：

```typescript
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
```

- [ ] **Step 4: 运行测试确认通过**

```bash
npx vitest run tests/imageClip.test.ts
```

预期：全部 PASS。

- [ ] **Step 5: Commit**

```bash
git add src/utils/imageClip.ts tests/imageClip.test.ts
git commit -m "feat: add image clip region calculation utility"
```

---

### Task 5: 上传图片压缩

**Files:**
- Create: `src/utils/imageCompress.ts`
- Create: `tests/imageCompress.test.ts`

- [ ] **Step 1: 写失败的测试**

创建 `tests/imageCompress.test.ts`：

```typescript
import { describe, it, expect } from 'vitest';
import { compressImage } from '../src/utils/imageCompress';
import { MAX_IMAGE_SIZE } from '../src/constants';

describe('compressImage', () => {
  it('should return original data URL if image is smaller than max size', async () => {
    // Create a small 100x100 canvas image
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(0, 0, 100, 100);
    const smallDataUrl = canvas.toDataURL('image/png');

    const result = await compressImage(smallDataUrl);
    // Should be a valid data URL
    expect(result).toMatch(/^data:image\/png;base64,/);
  });

  it('should resize image when dimensions exceed max size', async () => {
    // Create a large 2000x2000 canvas image
    const canvas = document.createElement('canvas');
    canvas.width = 2000;
    canvas.height = 2000;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#00FF00';
    ctx.fillRect(0, 0, 2000, 2000);
    const largeDataUrl = canvas.toDataURL('image/png');

    const result = await compressImage(largeDataUrl);
    // Load the result image to check its dimensions
    const img = new Image();
    img.src = result;
    await new Promise<void>(resolve => {
      img.onload = () => resolve();
    });
    expect(img.width).toBeLessThanOrEqual(MAX_IMAGE_SIZE);
    expect(img.height).toBeLessThanOrEqual(MAX_IMAGE_SIZE);
  });

  it('should preserve aspect ratio when resizing', async () => {
    // Create a 1600x800 image (2:1 aspect ratio)
    const canvas = document.createElement('canvas');
    canvas.width = 1600;
    canvas.height = 800;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#0000FF';
    ctx.fillRect(0, 0, 1600, 800);
    const dataUrl = canvas.toDataURL('image/png');

    const result = await compressImage(dataUrl);
    const img = new Image();
    img.src = result;
    await new Promise<void>(resolve => {
      img.onload = () => resolve();
    });
    // After compression: max dimension is 800, so 1600→800, 800→400
    expect(img.width).toBe(MAX_IMAGE_SIZE);
    expect(img.height).toBe(MAX_IMAGE_SIZE / 2);
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

```bash
npx vitest run tests/imageCompress.test.ts
```

预期：FAIL — `compressImage` 函数不存在。

- [ ] **Step 3: 实现 compressImage**

创建 `src/utils/imageCompress.ts`：

```typescript
import { MAX_IMAGE_SIZE } from '../constants';

export async function compressImage(dataUrl: string): Promise<string> {
  const img = new Image();
  img.src = dataUrl;

  await new Promise<void>((resolve) => {
    img.onload = () => resolve();
    img.onerror = () => resolve();
  });

  if (img.width <= MAX_IMAGE_SIZE && img.height <= MAX_IMAGE_SIZE) {
    return dataUrl;
  }

  const scale = Math.min(MAX_IMAGE_SIZE / img.width, MAX_IMAGE_SIZE / img.height);
  const targetWidth = Math.round(img.width * scale);
  const targetHeight = Math.round(img.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  return canvas.toDataURL('image/jpeg', 0.8);
}
```

- [ ] **Step 4: 运行测试确认通过**

```bash
npx vitest run tests/imageCompress.test.ts
```

预期：全部 PASS。

- [ ] **Step 5: Commit**

```bash
git add src/utils/imageCompress.ts tests/imageCompress.test.ts
git commit -m "feat: add image compression utility with aspect ratio preservation"
```

---

### Task 6: 音效生成

**Files:**
- Create: `src/utils/sounds.ts`

- [ ] **Step 1: 实现音效工具**

创建 `src/utils/sounds.ts`：

```typescript
let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

export function playDing() {
  const ctx = getAudioContext();
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.connect(gain);
  gain.connect(ctx.destination);

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(880, ctx.currentTime);
  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.3);
}

export function playBoop() {
  const ctx = getAudioContext();
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.connect(gain);
  gain.connect(ctx.destination);

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(220, ctx.currentTime);
  gain.gain.setValueAtTime(0.2, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.5);
}

export function playCelebration() {
  const ctx = getAudioContext();
  const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6

  notes.forEach((freq, i) => {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.15);
    gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.15);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.15 + 0.4);

    oscillator.start(ctx.currentTime + i * 0.15);
    oscillator.stop(ctx.currentTime + i * 0.15 + 0.4);
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/utils/sounds.ts
git commit -m "feat: add Web Audio API sound effects (ding, boop, celebration)"
```

---

### Task 7: 游戏状态管理 Hook

**Files:**
- Create: `src/hooks/useGameState.ts`
- Create: `tests/useGameState.test.ts`

- [ ] **Step 1: 写失败的测试**

创建 `tests/useGameState.test.ts`：

```typescript
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
      x: 0, y: 0, width: 400, height: 400,
    });
  });

  it('should swap pieces when onSwap is called', () => {
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
    // Find a piece that's not in its correct position and swap it there
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
    // Place all pieces by swapping each to its correct position
    act(() => {
      result.current.pieces.forEach(piece => {
        if (!piece.isPlaced) {
          result.current.swapPieces(piece.currentIndex, piece.correctIndex);
        }
      });
    });
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
```

- [ ] **Step 2: 运行测试确认失败**

```bash
npx vitest run tests/useGameState.test.ts
```

预期：FAIL — `useGameState` hook 不存在。

- [ ] **Step 3: 实现 useGameState**

创建 `src/hooks/useGameState.ts`：

```typescript
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
      // Find pieces at these current positions
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

      return {
        ...prev,
        pieces: newPieces,
        isComplete,
        phase: isComplete ? 'complete' : prev.phase,
      };
    });
  }, []);

  const resetGame = useCallback(() => {
    setState(initialState);
  }, []);

  return {
    ...state,
    startGame,
    swapPieces,
    resetGame,
  };
}
```

- [ ] **Step 4: 运行测试确认通过**

```bash
npx vitest run tests/useGameState.test.ts
```

预期：全部 PASS。

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useGameState.ts tests/useGameState.test.ts
git commit -m "feat: add game state management hook with piece generation, swap, and completion detection"
```

---

### Task 8: PuzzlePiece 组件

**Files:**
- Create: `src/components/PuzzlePiece.tsx`
- Create: `src/components/PuzzlePiece.css`
- Create: `tests/PuzzlePiece.test.tsx`

- [ ] **Step 1: 写失败的测试**

创建 `tests/PuzzlePiece.test.tsx`：

```typescript
import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { PuzzlePiece } from '../src/components/PuzzlePiece';
import { PuzzlePiece as PuzzlePieceType } from '../src/types';

const mockPiece: PuzzlePieceType = {
  id: 0,
  correctIndex: 0,
  currentIndex: 2,
  isPlaced: false,
  imageClip: { x: 0, y: 0, width: 200, height: 200 },
};

describe('PuzzlePiece', () => {
  it('should render with image clip background', () => {
    const { container } = render(
      <PuzzlePiece piece={mockPiece} image="test.png" onSwap={() => {}} />
    );
    const el = container.firstChild as HTMLElement;
    expect(el.style.backgroundImage).toContain('test.png');
  });

  it('should show checkmark when piece is placed correctly', () => {
    const placedPiece = { ...mockPiece, isPlaced: true };
    render(
      <PuzzlePiece piece={placedPiece} image="test.png" onSwap={() => {}} />
    );
    // Placed pieces should have the placed class
    const pieceEl = document.querySelector('.puzzle-piece--placed');
    expect(pieceEl).not.toBeNull();
  });

  it('should call onSwap when piece is clicked (fallback interaction)', () => {
    let swapCalled = false;
    let swapArgs: [number, number] = [0, 0];
    const onSwap = (from: number, to: number) => {
      swapCalled = true;
      swapArgs = [from, to];
    };
    render(
      <PuzzlePiece piece={mockPiece} image="test.png" onSwap={onSwap} selected={true} selectedIndex={1} />
    );
    const pieceEl = document.querySelector('.puzzle-piece') as HTMLElement;
    fireEvent.click(pieceEl);
    expect(swapCalled).toBe(true);
    expect(swapArgs).toEqual([mockPiece.currentIndex, 1]);
  });

  it('should not be interactive when piece is placed', () => {
    const placedPiece = { ...mockPiece, isPlaced: true };
    let swapCalled = false;
    const onSwap = () => { swapCalled = true; };
    render(
      <PuzzlePiece piece={placedPiece} image="test.png" onSwap={onSwap} selected={false} selectedIndex={-1} />
    );
    const pieceEl = document.querySelector('.puzzle-piece') as HTMLElement;
    fireEvent.click(pieceEl);
    expect(swapCalled).toBe(false);
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

```bash
npx vitest run tests/PuzzlePiece.test.tsx
```

预期：FAIL — `PuzzlePiece` 组件不存在。

- [ ] **Step 3: 实现 PuzzlePiece CSS**

创建 `src/components/PuzzlePiece.css`：

```css
.puzzle-piece {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  border: 3px solid #ddd;
  cursor: grab;
  transition: transform 0.15s, border-color 0.3s, box-shadow 0.15s;
  user-select: none;
  touch-action: none;
  position: relative;
}

.puzzle-piece:hover:not(.puzzle-piece--placed) {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.puzzle-piece--dragging {
  transform: scale(1.1);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  opacity: 0.9;
  z-index: 10;
}

.puzzle-piece--placed {
  border-color: #4CAF50;
  cursor: default;
}

.puzzle-piece--selected {
  border-color: #FF9800;
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(255, 152, 0, 0.4);
}

.puzzle-piece__check {
  position: absolute;
  top: 4px;
  right: 4px;
  background: #4CAF50;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
}
```

- [ ] **Step 4: 实现 PuzzlePiece 组件**

创建 `src/components/PuzzlePiece.tsx`：

```typescript
import React, { useRef, useState } from 'react';
import { PuzzlePiece as PuzzlePieceType } from '../types';
import { playDing, playBoop } from '../utils/sounds';
import './PuzzlePiece.css';

interface PuzzlePieceProps {
  piece: PuzzlePieceType;
  image: string;
  onSwap: (fromIndex: number, toIndex: number) => void;
  selected: boolean;
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export function PuzzlePiece({
  piece,
  image,
  onSwap,
  selected,
  selectedIndex,
  onSelect,
}: PuzzlePieceProps) {
  const [isDragging, setIsDragging] = useState(false);
  const pieceRef = useRef<HTMLDivElement>(null);

  const clipStyle = {
    backgroundImage: `url(${image})`,
    backgroundPosition: `-${piece.imageClip.x}px -${piece.imageClip.y}px`,
    backgroundSize: `${piece.imageClip.width * (piece.correctIndex >= 0 ? 1 : 1) * (image.includes('svg') ? 1 : 1)}px`,
  };

  // Simplified: for a gridSize N, backgroundSize should be gridSize * pieceWidth
  // This will be computed properly in GameScreen and passed down

  const handleClick = () => {
    if (piece.isPlaced) return;
    if (selected) {
      // This piece is already selected, deselect
      onSelect(-1);
    } else if (selectedIndex >= 0) {
      // Another piece is selected, swap them
      onSwap(selectedIndex, piece.currentIndex);
      onSelect(-1);
    } else {
      // Select this piece
      onSelect(piece.currentIndex);
    }
  };

  // Touch/Mouse drag handlers
  const handleDragStart = (e: React.DragEvent) => {
    if (piece.isPlaced) {
      e.preventDefault();
      return;
    }
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', String(piece.currentIndex));
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const fromIndex = Number(e.dataTransfer.getData('text/plain'));
    if (fromIndex !== piece.currentIndex && !piece.isPlaced) {
      onSwap(fromIndex, piece.currentIndex);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const classNames = [
    'puzzle-piece',
    piece.isPlaced ? 'puzzle-piece--placed' : '',
    isDragging ? 'puzzle-piece--dragging' : '',
    selected ? 'puzzle-piece--selected' : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      ref={pieceRef}
      className={classNames}
      style={clipStyle}
      draggable={!piece.isPlaced}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={handleClick}
    >
      {piece.isPlaced && <span className="puzzle-piece__check">✓</span>}
    </div>
  );
}
```

- [ ] **Step 5: 更新测试以匹配组件接口**

更新 `tests/PuzzlePiece.test.tsx` 以匹配实际的 `onSelect` prop：

```typescript
import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { PuzzlePiece } from '../src/components/PuzzlePiece';
import { PuzzlePiece as PuzzlePieceType } from '../src/types';

const mockPiece: PuzzlePieceType = {
  id: 0,
  correctIndex: 0,
  currentIndex: 2,
  isPlaced: false,
  imageClip: { x: 0, y: 0, width: 200, height: 200 },
};

describe('PuzzlePiece', () => {
  it('should render with image clip background', () => {
    const { container } = render(
      <PuzzlePiece
        piece={mockPiece}
        image="test.png"
        onSwap={() => {}}
        selected={false}
        selectedIndex={-1}
        onSelect={() => {}}
      />
    );
    const el = container.firstChild as HTMLElement;
    expect(el.style.backgroundImage).toContain('test.png');
  });

  it('should show checkmark when piece is placed correctly', () => {
    const placedPiece = { ...mockPiece, isPlaced: true };
    render(
      <PuzzlePiece
        piece={placedPiece}
        image="test.png"
        onSwap={() => {}}
        selected={false}
        selectedIndex={-1}
        onSelect={() => {}}
      />
    );
    const checkEl = document.querySelector('.puzzle-piece__check');
    expect(checkEl).not.toBeNull();
  });

  it('should call onSwap when clicked with another piece selected (click-to-swap fallback)', () => {
    let swapCalled = false;
    let swapArgs: [number, number] = [0, 0];
    const onSwap = (from: number, to: number) => {
      swapCalled = true;
      swapArgs = [from, to];
    };
    render(
      <PuzzlePiece
        piece={mockPiece}
        image="test.png"
        onSwap={onSwap}
        selected={false}
        selectedIndex={1}
        onSelect={() => {}}
      />
    );
    const pieceEl = document.querySelector('.puzzle-piece') as HTMLElement;
    fireEvent.click(pieceEl);
    expect(swapCalled).toBe(true);
    expect(swapArgs).toEqual([1, mockPiece.currentIndex]);
  });

  it('should not be interactive when piece is placed', () => {
    const placedPiece = { ...mockPiece, isPlaced: true };
    let swapCalled = false;
    const onSwap = () => { swapCalled = true; };
    render(
      <PuzzlePiece
        piece={placedPiece}
        image="test.png"
        onSwap={onSwap}
        selected={false}
        selectedIndex={-1}
        onSelect={() => {}}
      />
    );
    const pieceEl = document.querySelector('.puzzle-piece') as HTMLElement;
    fireEvent.click(pieceEl);
    expect(swapCalled).toBe(false);
  });
});
```

- [ ] **Step 6: 运行测试确认通过**

```bash
npx vitest run tests/PuzzlePiece.test.tsx
```

预期：全部 PASS。

- [ ] **Step 7: Commit**

```bash
git add src/components/PuzzlePiece.tsx src/components/PuzzlePiece.css tests/PuzzlePiece.test.tsx
git commit -m "feat: add PuzzlePiece component with drag-and-drop and click-to-swap interaction"
```

---

### Task 9: StartScreen 组件

**Files:**
- Create: `src/components/StartScreen.tsx`
- Create: `src/components/StartScreen.css`
- Create: `tests/StartScreen.test.tsx`

- [ ] **Step 1: 写失败的测试**

创建 `tests/StartScreen.test.tsx`：

```typescript
import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { StartScreen } from '../src/components/StartScreen';

describe('StartScreen', () => {
  it('should render preset image options', () => {
    render(<StartScreen onStartGame={() => {}} />);
    // Should show 4 preset images
    const imageCards = document.querySelectorAll('.image-card');
    expect(imageCards).toHaveLength(4);
  });

  it('should render difficulty options', () => {
    render(<StartScreen onStartGame={() => {}} />);
    const difficultyButtons = document.querySelectorAll('.difficulty-btn');
    expect(difficultyButtons).toHaveLength(3);
  });

  it('should call onStartGame with selected image and difficulty', () => {
    let gameArgs: [string, number] = ['', 0];
    const onStartGame = (image: string, difficulty: number) => {
      gameArgs = [image, difficulty];
    };
    render(<StartScreen onStartGame={onStartGame} />);

    // Select first preset image
    const firstImageCard = document.querySelector('.image-card') as HTMLElement;
    fireEvent.click(firstImageCard);

    // Select first difficulty (2x2)
    const firstDifficulty = document.querySelector('.difficulty-btn') as HTMLElement;
    fireEvent.click(firstDifficulty);

    // Click start button
    const startButton = document.querySelector('.start-btn') as HTMLElement;
    fireEvent.click(startButton);

    expect(gameArgs[0]).toBeTruthy();
    expect(gameArgs[1]).toBe(2);
  });

  it('should show upload button', () => {
    render(<StartScreen onStartGame={() => {}} />);
    const uploadBtn = document.querySelector('.upload-btn');
    expect(uploadBtn).not.toBeNull();
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

```bash
npx vitest run tests/StartScreen.test.tsx
```

预期：FAIL — `StartScreen` 组件不存在。

- [ ] **Step 3: 实现 StartScreen CSS**

创建 `src/components/StartScreen.css`：

```css
.start-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.start-screen__title {
  font-size: 36px;
  margin-bottom: 24px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.start-screen__section {
  margin-bottom: 24px;
  width: 100%;
  max-width: 500px;
}

.start-screen__label {
  font-size: 20px;
  margin-bottom: 12px;
  text-align: center;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  justify-items: center;
}

.image-card {
  width: 120px;
  height: 120px;
  border-radius: 16px;
  border: 4px solid transparent;
  cursor: pointer;
  transition: transform 0.2s, border-color 0.2s;
  overflow: hidden;
}

.image-card:hover {
  transform: scale(1.05);
}

.image-card--selected {
  border-color: #FFD700;
  transform: scale(1.08);
}

.image-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-btn {
  display: block;
  margin: 12px auto;
  padding: 12px 24px;
  font-size: 18px;
  background: #FF9800;
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
}

.upload-btn:hover {
  background: #F57C00;
}

.difficulty-grid {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.difficulty-btn {
  padding: 12px 20px;
  font-size: 18px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 3px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}

.difficulty-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.difficulty-btn--selected {
  background: rgba(255, 255, 255, 0.4);
  border-color: #FFD700;
}

.start-btn {
  padding: 16px 48px;
  font-size: 28px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  margin-top: 24px;
  transition: background 0.2s, transform 0.2s;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.start-btn:hover {
  background: #45a049;
  transform: scale(1.05);
}

.start-btn:disabled {
  background: #999;
  cursor: not-allowed;
  transform: none;
}
```

- [ ] **Step 4: 实现 StartScreen 组件**

创建 `src/components/StartScreen.tsx`：

```typescript
import React, { useState, useRef } from 'react';
import { PRESET_IMAGES, DIFFICULTY_OPTIONS, MAX_IMAGE_SIZE } from '../constants';
import { DifficultyLevel } from '../types';
import { compressImage } from '../utils/imageCompress';
import './StartScreen.css';

interface StartScreenProps {
  onStartGame: (image: string, difficulty: DifficultyLevel) => void;
}

export function StartScreen({ onStartGame }: StartScreenProps) {
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>(2);
  const [uploadError, setUploadError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (url: string) => {
    setSelectedImage(url);
    setUploadError('');
  };

  const handleDifficultySelect = (level: DifficultyLevel) => {
    setSelectedDifficulty(level);
  };

  const handleStart = () => {
    if (selectedImage) {
      onStartGame(selectedImage, selectedDifficulty);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('请选择图片文件');
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUrl = event.target?.result as string;
        try {
          const compressed = await compressImage(dataUrl);
          setSelectedImage(compressed);
          setUploadError('');
        } catch {
          setUploadError('图片处理失败，请换一张试试');
        }
      };
      reader.onerror = () => {
        setUploadError('图片读取失败');
      };
      reader.readAsDataURL(file);
    } catch {
      setUploadError('图片加载失败，请换一张试试');
    }
  };

  const canStart = selectedImage !== '';

  return (
    <div className="start-screen">
      <div className="start-screen__title">🧩 小小拼图</div>

      <div className="start-screen__section">
        <div className="start-screen__label">选择一张图片</div>
        <div className="image-grid">
          {PRESET_IMAGES.map((img) => (
            <div
              key={img.id}
              className={`image-card ${selectedImage === img.url ? 'image-card--selected' : ''}`}
              onClick={() => handleImageSelect(img.url)}
            >
              <img src={img.url} alt={img.name} />
            </div>
          ))}
        </div>
        <button className="upload-btn" onClick={() => fileInputRef.current?.click()}>
          📷 从相册选一张
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleUpload}
        />
        {uploadError && <p style={{ color: '#FF6B6B', textAlign: 'center' }}>{uploadError}</p>}
      </div>

      <div className="start-screen__section">
        <div className="start-screen__label">选择难度</div>
        <div className="difficulty-grid">
          {DIFFICULTY_OPTIONS.map((opt) => (
            <button
              key={opt.level}
              className={`difficulty-btn ${selectedDifficulty === opt.level ? 'difficulty-btn--selected' : ''}`}
              onClick={() => handleDifficultySelect(opt.level)}
            >
              {'⭐'.repeat(opt.stars)} {opt.label} ({opt.level}×{opt.level})
            </button>
          ))}
        </div>
      </div>

      <button className="start-btn" disabled={!canStart} onClick={handleStart}>
        开始拼图!
      </button>
    </div>
  );
}
```

- [ ] **Step 5: 运行测试确认通过**

```bash
npx vitest run tests/StartScreen.test.tsx
```

预期：全部 PASS。

- [ ] **Step 6: Commit**

```bash
git add src/components/StartScreen.tsx src/components/StartScreen.css tests/StartScreen.test.tsx
git commit -m "feat: add StartScreen with image selection, difficulty selection, and upload support"
```

---

### Task 10: GameScreen 组件

**Files:**
- Create: `src/components/GameScreen.tsx`
- Create: `src/components/GameScreen.css`
- Create: `tests/GameScreen.test.tsx`

- [ ] **Step 1: 写失败的测试**

创建 `tests/GameScreen.test.tsx`：

```typescript
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
    render(
      <GameScreen
        image="test.png"
        difficulty={2}
        pieces={mockPieces}
        startTime={Date.now()}
        isComplete={false}
        onSwap={() => {}}
        onReset={() => {}}
      />
    );
    const refImg = document.querySelector('.reference-image img') as HTMLImageElement;
    expect(refImg.src).toContain('test.png');
  });

  it('should render puzzle grid with correct number of cells', () => {
    render(
      <GameScreen
        image="test.png"
        difficulty={2}
        pieces={mockPieces}
        startTime={Date.now()}
        isComplete={false}
        onSwap={() => {}}
        onReset={() => {}}
      />
    );
    const cells = document.querySelectorAll('.puzzle-cell');
    expect(cells).toHaveLength(4);
  });

  it('should render reset button', () => {
    render(
      <GameScreen
        image="test.png"
        difficulty={2}
        pieces={mockPieces}
        startTime={Date.now()}
        isComplete={false}
        onSwap={() => {}}
        onReset={() => {}}
      />
    );
    const resetBtn = document.querySelector('.game-reset-btn');
    expect(resetBtn).not.toBeNull();
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

```bash
npx vitest run tests/GameScreen.test.tsx
```

预期：FAIL — `GameScreen` 组件不存在。

- [ ] **Step 3: 实现 GameScreen CSS**

创建 `src/components/GameScreen.css`：

```css
.game-screen {
  display: flex;
  gap: 24px;
  padding: 24px;
  min-height: 100vh;
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
  align-items: center;
  justify-content: center;
}

.game-screen__sidebar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.reference-image {
  border-radius: 12px;
  border: 3px solid #ddd;
  overflow: hidden;
}

.reference-image img {
  width: 150px;
  height: 150px;
  object-fit: cover;
}

.reference-image__label {
  font-size: 14px;
  color: #666;
  text-align: center;
  margin-bottom: 8px;
}

.game-reset-btn {
  padding: 8px 20px;
  font-size: 16px;
  background: #FF9800;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
}

.game-reset-btn:hover {
  background: #F57C00;
}

.puzzle-grid {
  display: grid;
  gap: 6px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  padding: 8px;
}

.puzzle-cell {
  aspect-ratio: 1;
  border-radius: 8px;
  border: 2px dashed #ccc;
  background: rgba(255, 255, 255, 0.1);
}
```

- [ ] **Step 4: 实现 GameScreen 组件**

创建 `src/components/GameScreen.tsx`：

```typescript
import React, { useState } from 'react';
import { PuzzlePiece as PuzzlePieceType, DifficultyLevel } from '../types';
import { PuzzlePiece } from './PuzzlePiece';
import './GameScreen.css';

interface GameScreenProps {
  image: string;
  difficulty: DifficultyLevel;
  pieces: PuzzlePieceType[];
  startTime: number;
  isComplete: boolean;
  onSwap: (fromIndex: number, toIndex: number) => void;
  onReset: () => void;
}

export function GameScreen({
  image,
  difficulty,
  pieces,
  startTime,
  isComplete,
  onSwap,
  onReset,
}: GameScreenProps) {
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const totalPieces = difficulty * difficulty;

  return (
    <div className="game-screen">
      <div className="game-screen__sidebar">
        <div className="reference-image__label">原图参考</div>
        <div className="reference-image">
          <img src={image} alt="参考图" />
        </div>
        <button className="game-reset-btn" onClick={onReset}>
          ↻ 重新开始
        </button>
      </div>

      <div
        className="puzzle-grid"
        style={{ gridTemplateColumns: `repeat(${difficulty}, 1fr)` }}
      >
        {Array.from({ length: totalPieces }, (_, cellIndex) => {
          const pieceInCell = pieces.find(p => p.currentIndex === cellIndex);
          return (
            <div key={cellIndex} className="puzzle-cell">
              {pieceInCell && (
                <PuzzlePiece
                  piece={pieceInCell}
                  image={image}
                  onSwap={onSwap}
                  selected={selectedIndex === pieceInCell.currentIndex}
                  selectedIndex={selectedIndex}
                  onSelect={setSelectedIndex}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: 运行测试确认通过**

```bash
npx vitest run tests/GameScreen.test.tsx
```

预期：全部 PASS。

- [ ] **Step 6: Commit**

```bash
git add src/components/GameScreen.tsx src/components/GameScreen.css tests/GameScreen.test.tsx
git commit -m "feat: add GameScreen with puzzle grid, reference image, and reset button"
```

---

### Task 11: CompleteScreen 组件

**Files:**
- Create: `src/components/CompleteScreen.tsx`
- Create: `src/components/CompleteScreen.css`
- Create: `tests/CompleteScreen.test.tsx`

- [ ] **Step 1: 写失败的测试**

创建 `tests/CompleteScreen.test.tsx`：

```typescript
import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { CompleteScreen } from '../src/components/CompleteScreen';

describe('CompleteScreen', () => {
  it('should show encouragement text', () => {
    render(
      <CompleteScreen
        image="test.png"
        startTime={Date.now() - 45000}
        onPlayAgain={() => {}}
        onChooseImage={() => {}}
      />
    );
    const celebration = document.querySelector('.complete-screen__encouragement');
    expect(celebration).not.toBeNull();
    expect(celebration!.textContent).toBeTruthy();
  });

  it('should show complete image', () => {
    render(
      <CompleteScreen
        image="test.png"
        startTime={Date.now() - 45000}
        onPlayAgain={() => {}}
        onChooseImage={() => {}}
      />
    );
    const img = document.querySelector('.complete-screen__image img') as HTMLImageElement;
    expect(img.src).toContain('test.png');
  });

  it('should show play again button', () => {
    let playAgainCalled = false;
    render(
      <CompleteScreen
        image="test.png"
        startTime={Date.now() - 45000}
        onPlayAgain={() => { playAgainCalled = true; }}
        onChooseImage={() => {}}
      />
    );
    const btn = document.querySelector('.play-again-btn') as HTMLElement;
    fireEvent.click(btn);
    expect(playAgainCalled).toBe(true);
  });

  it('should show choose image button', () => {
    let chooseCalled = false;
    render(
      <CompleteScreen
        image="test.png"
        startTime={Date.now() - 45000}
        onPlayAgain={() => {}}
        onChooseImage={() => { chooseCalled = true; }}
      />
    );
    const btn = document.querySelector('.choose-image-btn') as HTMLElement;
    fireEvent.click(btn);
    expect(chooseCalled).toBe(true);
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

```bash
npx vitest run tests/CompleteScreen.test.tsx
```

预期：FAIL — `CompleteScreen` 组件不存在。

- [ ] **Step 3: 实现 CompleteScreen CSS**

创建 `src/components/CompleteScreen.css`：

```css
.complete-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  min-height: 100vh;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.complete-screen__celebration {
  font-size: 48px;
  margin-bottom: 12px;
}

.complete-screen__encouragement {
  font-size: 28px;
  margin-bottom: 16px;
  color: #FFD700;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.complete-screen__image {
  border-radius: 16px;
  border: 4px solid #FFD700;
  overflow: hidden;
  margin-bottom: 16px;
}

.complete-screen__image img {
  width: 300px;
  height: 300px;
  object-fit: cover;
}

.complete-screen__time {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 24px;
}

.complete-screen__buttons {
  display: flex;
  gap: 16px;
}

.play-again-btn {
  padding: 12px 32px;
  font-size: 20px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 14px;
  cursor: pointer;
}

.play-again-btn:hover {
  background: #45a049;
}

.choose-image-btn {
  padding: 12px 32px;
  font-size: 20px;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 14px;
  cursor: pointer;
}

.choose-image-btn:hover {
  background: #1976D2;
}
```

- [ ] **Step 4: 实现 CompleteScreen 组件**

创建 `src/components/CompleteScreen.tsx`：

```typescript
import React, { useState, useEffect } from 'react';
import { ENCOURAGEMENTS } from '../constants';
import { playCelebration } from '../utils/sounds';
import './CompleteScreen.css';

interface CompleteScreenProps {
  image: string;
  startTime: number;
  onPlayAgain: () => void;
  onChooseImage: () => void;
}

export function CompleteScreen({
  image,
  startTime,
  onPlayAgain,
  onChooseImage,
}: CompleteScreenProps) {
  const [encouragement] = useState(
    () => ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)]
  );

  useEffect(() => {
    playCelebration();
  }, []);

  const elapsedSeconds = Math.round((Date.now() - startTime) / 1000);

  return (
    <div className="complete-screen">
      <div className="complete-screen__celebration">🎉🎉🎉</div>
      <div className="complete-screen__encouragement">{encouragement}</div>
      <div className="complete-screen__image">
        <img src={image} alt="完成的拼图" />
      </div>
      <div className="complete-screen__time">
        用时 {elapsedSeconds} 秒
      </div>
      <div className="complete-screen__buttons">
        <button className="play-again-btn" onClick={onPlayAgain}>
          再来一次
        </button>
        <button className="choose-image-btn" onClick={onChooseImage}>
          换个图片
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: 运行测试确认通过**

```bash
npx vitest run tests/CompleteScreen.test.tsx
```

预期：全部 PASS。

- [ ] **Step 6: Commit**

```bash
git add src/components/CompleteScreen.tsx src/components/CompleteScreen.css tests/CompleteScreen.test.tsx
git commit -m "feat: add CompleteScreen with celebration animation, encouragement, and result info"
```

---

### Task 12: App 组件整合

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/App.css`

- [ ] **Step 1: 实现 App 组件**

替换 `src/App.tsx`：

```typescript
import React from 'react';
import { useGameState } from './hooks/useGameState';
import { StartScreen } from './components/StartScreen';
import { GameScreen } from './components/GameScreen';
import { CompleteScreen } from './components/CompleteScreen';
import './App.css';

function App() {
  const { phase, image, difficulty, pieces, startTime, isComplete, startGame, swapPieces, resetGame } = useGameState();

  if (phase === 'start') {
    return <StartScreen onStartGame={startGame} />;
  }

  if (phase === 'playing') {
    return (
      <GameScreen
        image={image}
        difficulty={difficulty}
        pieces={pieces}
        startTime={startTime}
        isComplete={isComplete}
        onSwap={swapPieces}
        onReset={resetGame}
      />
    );
  }

  if (phase === 'complete') {
    return (
      <CompleteScreen
        image={image}
        startTime={startTime}
        onPlayAgain={() => startGame(image, difficulty)}
        onChooseImage={resetGame}
      />
    );
  }

  return null;
}

export default App;
```

- [ ] **Step 2: 更新 App.css**

替换 `src/App.css`：

```css
#root {
  width: 100%;
  margin: 0;
  padding: 0;
}
```

- [ ] **Step 3: 清理 main.tsx 和 index.css**

确保 `src/main.tsx` 是标准 React 入口：

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

确保 `src/index.css` 包含全局基础样式：

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', 'Arial Rounded MT Bold', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow: hidden;
}

#root {
  width: 100vw;
  height: 100vh;
}
```

- [ ] **Step 4: 运行全部测试**

```bash
npx vitest run
```

预期：全部 PASS。

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/App.css src/main.tsx src/index.css
git commit -m "feat: integrate all screens into App component with phase routing"
```

---

### Task 13: 预设图片素材

**Files:**
- Create: `public/images/cat.svg`
- Create: `public/images/dog.svg`
- Create: `public/images/butterfly.svg`
- Create: `public/images/sunflower.svg`

- [ ] **Step 1: 创建可爱猫咪 SVG**

创建 `public/images/cat.svg`：

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
  <rect width="400" height="400" fill="#FFE4B5"/>
  <circle cx="200" cy="220" r="100" fill="#FFB6C1"/>
  <circle cx="200" cy="180" r="80" fill="#FFB6C1"/>
  <!-- 耳朵 -->
  <polygon points="130,120 150,180 110,180" fill="#FFB6C1"/>
  <polygon points="270,120 250,180 290,180" fill="#FFB6C1"/>
  <polygon points="130,120 150,180 110,180" fill="#FF9090" transform="translate(10,10) scale(0.8)"/>
  <polygon points="270,120 250,180 290,180" fill="#FF9090" transform="translate(-10,10) scale(0.8)"/>
  <!-- 眼睛 -->
  <ellipse cx="170" cy="170" rx="20" ry="25" fill="#333"/>
  <ellipse cx="230" cy="170" rx="20" ry="25" fill="#333"/>
  <ellipse cx="170" cy="165" rx="8" ry="10" fill="white"/>
  <ellipse cx="230" cy="165" rx="8" ry="10" fill="white"/>
  <!-- 鼻子 -->
  <ellipse cx="200" cy="195" rx="10" ry="8" fill="#FF6B6B"/>
  <!-- 嘴巴 -->
  <path d="M190,205 Q200,220 210,205" stroke="#FF6B6B" fill="none" stroke-width="3"/>
  <!-- 花纹 -->
  <path d="M160,130 Q170,140 160,150" stroke="#FF9090" fill="none" stroke-width="4"/>
  <path d="M240,130 Q230,140 240,150" stroke="#FF9090" fill="none" stroke-width="4"/>
</svg>
```

- [ ] **Step 2: 创建可爱小狗 SVG**

创建 `public/images/dog.svg`：

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
  <rect width="400" height="400" fill="#87CEEB"/>
  <circle cx="200" cy="220" r="100" fill="#DEB887"/>
  <circle cx="200" cy="180" r="80" fill="#DEB887"/>
  <!-- 大耳朵 -->
  <ellipse cx="130" cy="170" rx="35" ry="60" fill="#C19A6B"/>
  <ellipse cx="270" cy="170" rx="35" ry="60" fill="#C19A6B"/>
  <!-- 眼睛 -->
  <ellipse cx="170" cy="170" rx="18" ry="22" fill="#333"/>
  <ellipse cx="230" cy="170" rx="18" ry="22" fill="#333"/>
  <ellipse cx="170" cy="165" rx="7" ry="9" fill="white"/>
  <ellipse cx="230" cy="165" rx="7" ry="9" fill="white"/>
  <!-- 鼻子 -->
  <ellipse cx="200" cy="195" rx="12" ry="10" fill="#333"/>
  <!-- 嘴巴 -->
  <path d="M185,205 Q200,225 215,205" stroke="#333" fill="none" stroke-width="3"/>
  <!-- 脖子铃铛 -->
  <circle cx="200" cy="290" r="15" fill="#FFD700"/>
  <line x1="140" y1="280" x2="260" y2="280" stroke="#FF4444" stroke-width="6"/>
</svg>
```

- [ ] **Step 3: 创建蝴蝶 SVG**

创建 `public/images/butterfly.svg`：

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
  <rect width="400" height="400" fill="#DDA0DD"/>
  <!-- 左翅膀 -->
  <ellipse cx="140" cy="180" rx="90" ry="70" fill="#FF69B4" opacity="0.8"/>
  <ellipse cx="140" cy="180" rx="60" ry="45" fill="#FF1493" opacity="0.6"/>
  <circle cx="130" cy="170" r="15" fill="#FFF"/>
  <circle cx="150" cy="190" r="10" fill="#FFF"/>
  <!-- 右翅膀 -->
  <ellipse cx="260" cy="180" rx="90" ry="70" fill="#FF69B4" opacity="0.8"/>
  <ellipse cx="260" cy="180" rx="60" ry="45" fill="#FF1493" opacity="0.6"/>
  <circle cx="270" cy="170" r="15" fill="#FFF"/>
  <circle cx="250" cy="190" r="10" fill="#FFF"/>
  <!-- 下翅膀 -->
  <ellipse cx="150" cy="260" rx="50" ry="40" fill="#DA70D6" opacity="0.8"/>
  <ellipse cx="250" cy="260" rx="50" ry="40" fill="#DA70D6" opacity="0.8"/>
  <!-- 身体 -->
  <ellipse cx="200" cy="200" rx="8" ry="80" fill="#333"/>
  <!-- 头 -->
  <circle cx="200" cy="130" r="12" fill="#333"/>
  <!-- 眼睛 -->
  <circle cx="195" cy="127" r="4" fill="#FFF"/>
  <circle cx="205" cy="127" r="4" fill="#FFF"/>
</svg>
```

- [ ] **Step 4: 创建向日葵 SVG**

创建 `public/images/sunflower.svg`：

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
  <rect width="400" height="400" fill="#F0E68C"/>
  <!-- 花瓣 -->
  <g transform="translate(200,180)">
    <ellipse rx="15" ry="50" fill="#FFD700" transform="rotate(0) translate(0,-55)"/>
    <ellipse rx="15" ry="50" fill="#FFD700" transform="rotate(30) translate(0,-55)"/>
    <ellipse rx="15" ry="50" fill="#FFD700" transform="rotate(60) translate(0,-55)"/>
    <ellipse rx="15" ry="50" fill="#FFD700" transform="rotate(90) translate(0,-55)"/>
    <ellipse rx="15" ry="50" fill="#FFD700" transform="rotate(120) translate(0,-55)"/>
    <ellipse rx="15" ry="50" fill="#FFD700" transform="rotate(150) translate(0,-55)"/>
    <ellipse rx="15" ry="50" fill="#FFD700" transform="rotate(180) translate(0,-55)"/>
    <ellipse rx="15" ry="50" fill="#FFD700" transform="rotate(210) translate(0,-55)"/>
    <ellipse rx="15" ry="50" fill="#FFD700" transform="rotate(240) translate(0,-55)"/>
    <ellipse rx="15" ry="50" fill="#FFD700" transform="rotate(270) translate(0,-55)"/>
    <ellipse rx="15" ry="50" fill="#FFD700" transform="rotate(300) translate(0,-55)"/>
    <ellipse rx="15" ry="50" fill="#FFD700" transform="rotate(330) translate(0,-55)"/>
  </g>
  <!-- 花心 -->
  <circle cx="200" cy="180" r="40" fill="#8B4513"/>
  <!-- 花心纹理 -->
  <circle cx="190" cy="170" r="3" fill="#654321"/>
  <circle cx="210" cy="170" r="3" fill="#654321"/>
  <circle cx="200" cy="180" r="3" fill="#654321"/>
  <circle cx="185" cy="185" r="3" fill="#654321"/>
  <circle cx="215" cy="185" r="3" fill="#654321"/>
  <circle cx="195" cy="195" r="3" fill="#654321"/>
  <circle cx="205" cy="195" r="3" fill="#654321"/>
  <!-- 茎 -->
  <rect x="196" y="220" width="8" height="120" fill="#228B22" rx="4"/>
  <!-- 叶子 -->
  <ellipse cx="170" cy="280" rx="30" ry="15" fill="#228B22" transform="rotate(-30)"/>
  <ellipse cx="230" cy="310" rx="30" ry="15" fill="#228B22" transform="rotate(30)"/>
</svg>
```

- [ ] **Step 5: Commit**

```bash
git add public/images/
git commit -m "feat: add preset SVG images (cat, dog, butterfly, sunflower)"
```

---

### Task 14: PuzzlePiece 背景尺寸修正

**Files:**
- Modify: `src/components/PuzzlePiece.tsx`
- Modify: `src/components/GameScreen.tsx`

当前 PuzzlePiece 的 `clipStyle` 需要根据 `difficulty` 计算正确的 `backgroundSize`。每个拼图块的 `backgroundSize` 应该是 `图片总尺寸 / 单块尺寸 × 网格尺寸`。对于 SVG 图片，需要确保尺寸正确。

- [ ] **Step 1: 修正 PuzzlePiece 的背景样式计算**

更新 `src/components/PuzzlePiece.tsx` 中的 `clipStyle`：

```typescript
// PuzzlePiece.tsx - 修改 clipStyle 计算
interface PuzzlePieceProps {
  piece: PuzzlePieceType;
  image: string;
  gridSize: number;        // 新增：网格尺寸
  puzzleSize: number;      // 新增：拼图总尺寸
  onSwap: (fromIndex: number, toIndex: number) => void;
  selected: boolean;
  selectedIndex: number;
  onSelect: (index: number) => void;
}

// 在组件内部：
const pieceSize = puzzleSize / gridSize;
const clipStyle = {
  backgroundImage: `url(${image})`,
  backgroundPosition: `-${piece.imageClip.x}px -${piece.imageClip.y}px`,
  backgroundSize: `${puzzleSize}px ${puzzleSize}px`,
};
```

- [ ] **Step 2: 更新 GameScreen 传递新 props**

更新 `src/components/GameScreen.tsx` 中 PuzzlePiece 的调用：

```typescript
<PuzzlePiece
  piece={pieceInCell}
  image={image}
  gridSize={difficulty}
  puzzleSize={400}
  onSwap={onSwap}
  selected={selectedIndex === pieceInCell.currentIndex}
  selectedIndex={selectedIndex}
  onSelect={setSelectedIndex}
/>
```

- [ ] **Step 3: 更新 PuzzlePiece 测试**

更新 `tests/PuzzlePiece.test.tsx`，为每个 PuzzlePiece 添加 `gridSize` 和 `puzzleSize` props。

- [ ] **Step 4: 运行全部测试确认通过**

```bash
npx vitest run
```

预期：全部 PASS。

- [ ] **Step 5: Commit**

```bash
git add src/components/PuzzlePiece.tsx src/components/GameScreen.tsx tests/PuzzlePiece.test.tsx
git commit -m "fix: correct PuzzlePiece background-size calculation based on grid size"
```

---

### Task 15: 运行和手动验证

- [ ] **Step 1: 启动开发服务器**

```bash
npm run dev
```

打开 http://localhost:5173

- [ ] **Step 2: 手动验证完整游戏流程**

1. 开始页：点击预设图片（猫），选择难度（2x2），点击"开始拼图"
2. 游戏页：确认参考图显示正确，拼图块显示正确裁切区域
3. 拖拽/点击：拖动拼图块到正确位置，确认放对了有绿色边框和 ✓ 标记
4. 完成页：确认庆祝动画显示，鼓励文字出现，按钮可点击

- [ ] **Step 3: 测试上传图片**

点击"从相册选一张"，选择一张手机照片，确认能正常加载和拼图

- [ ] **Step 4: 测试响应式布局**

在不同屏幕宽度下查看界面是否合理（手机竖屏、平板横屏）

- [ ] **Step 5: 运行全部单元测试**

```bash
npx vitest run
```

确认全部 PASS。