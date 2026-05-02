# 儿童拼图游戏设计文档

## 项目概述

面向 3-5 岁幼儿的经典拼图游戏，Web 平台运行，React 技术栈，支持预设图片和用户上传图片，提供多难度等级（2x2 / 3x3 / 4x4）。

## 技术方案

**方案 B: DOM 组件 + CSS clip-path**

- 纯 React 组件开发，每个拼图块是一个 React 组件
- CSS `background-position` + `background-size` 实现图片裁切
- DOM 拖拽（HTML5 Drag & Drop + touch 事件）实现交互
- 最适合幼儿触屏操作，开发效率高，3-5 岁拼图块数有限（最多 16 块），DOM 性能足够

选择理由：幼儿主要用手指操作， DOM 元素天然支持触屏拖拽；纯 React 开发状态管理自然；幼儿拼图块数不多，无需 Canvas 或游戏引擎。

## 整体架构

游戏采用单页 React 应用，核心分为三个层：

1. **配置层** — 图片选择、难度选择
2. **游戏层** — 拼图块组件、拖拽交互、拼合检测
3. **反馈层** — 完成动画、音效提示、鼓励语

数据流：用户选择图片和难度 → 生成拼图块数组（含位置、图片裁切区域） → 拖拽交换位置 → 检测是否全部归位 → 触发完成动画

## 核心组件结构

```
App
 ├── StartScreen          // 开始页：图片选择 + 难度选择
 │    ├── ImageSelector    // 预设图片卡片 + 上传按钮
 │    └── DifficultySelector // 2x2 / 3x3 / 4x4 星标按钮
 ├── GameScreen           // 游戏页：拼图核心
 │    ├── ReferenceImage   // 左侧缩小原图
 │    ├── PuzzleGrid       // 拼图网格容器
 │    │    └── PuzzlePiece // 单个拼图块组件（可拖拽）
 │    └── GameControls     // 重新开始按钮
 └── CompleteScreen       // 完成页：庆祝
      ├── CelebrationAnimation // 动画
      └── ResultInfo        // 用时统计
```

## 数据模型

```typescript
interface PuzzlePiece {
  id: number;           // 唯一标识
  correctIndex: number; // 正确位置索引
  currentIndex: number; // 当前位置索引
  isPlaced: boolean;    // 是否已归位
  imageClip: {          // 图片裁切区域
    x: number; y: number;
    width: number; height: number;
  };
}

interface GameState {
  image: string;        // 图片URL或base64
  difficulty: 2 | 3 | 4; // 网格尺寸
  pieces: PuzzlePiece[];
  startTime: number;
  isComplete: boolean;
  phase: 'start' | 'playing' | 'complete';
}
```

## 界面设计

### 开始页

- 大大的可爱图标（动物、花朵等）选择预设图片
- 星标表示难度等级：⭐ 简单(2×2) / ⭐⭐ 中等(3×3) / ⭐⭐⭐ 挑战(4×4)
- "从相册选一张"按钮支持用户上传
- "开始拼图!"大按钮启动游戏

### 游戏页

- 左侧缩小原图作参考（始终可见）
- 右侧拼图网格，块大间距宽，方便小手操作
- 拖拽块到正确位置会固定 + 绿色边框 + ✓ 标记
- "重新开始"按钮

### 完成页

- 🎉🎉🎉 庆祝动画 + 星星飘落
- 鼓励文字（随机："太棒了！"/"你真聪明！"/"真厉害！"）
- 原图完整展示
- 用时统计
- "再来一次"和"换个图片"按钮

## 反馈机制

- **放对了**：块锁定 + 绿色边框闪亮 + 短促"叮"音效 + ✓ 标记
- **放错了**：块弹回原位 + 轻柔"嘟"音效（不惩罚性，不刺耳）
- **拼图完成**：全屏庆祝动画（星星飘落）+ 欢快音乐 + 鼓励文字
- **拖拽中**：块放大 10% + 微微阴影，让幼儿知道"我正在拿着这块"

## 交互逻辑

- 拖拽：HTML5 Drag & Drop API + touch 事件模拟，幼儿主要用触屏
- 拼合检测：每次交换位置后检查 `currentIndex === correctIndex`，归位则锁定
- 打乱算法：Fisher-Yates 随机打乱，确保不是原始顺序且至少打乱 60% 的块
- 图片裁切：CSS `background-position` + `background-size` 实现每块显示对应区域

## 错误处理

- 图片加载失败：显示"图片加载失败，请换一张试试"，不崩溃
- 上传图片过大：自动压缩到合理尺寸（最大 800x800），避免内存问题
- 浏览器不支持拖拽：降级为点击交换模式（点一块再点另一块交换位置）
- 误操作退出：游戏页只有"重新开始"，不设危险操作按钮

## 测试策略

- **单元测试**：打乱算法正确性、拼合检测逻辑、图片裁切计算
- **交互测试**：拖拽放置是否正确交换、归位锁定是否生效
- **集成测试**：完整游戏流程（选图 → 选难度 → 拼完 → 庆祝）
- **手动测试重点**：触屏设备上的拖拽体验、幼儿操作的直观性