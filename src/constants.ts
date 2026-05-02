import type { DifficultyLevel } from './types';

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
  { id: 'rabbit', name: '小兔', url: '/images/rabbit.svg' },
  { id: 'fish', name: '小鱼', url: '/images/fish.svg' },
  { id: 'penguin', name: '企鹅', url: '/images/penguin.svg' },
  { id: 'elephant', name: '大象', url: '/images/elephant.svg' },
  { id: 'lion', name: '狮子', url: '/images/lion.svg' },
  { id: 'bee', name: '蜜蜂', url: '/images/bee.svg' },
  { id: 'frog', name: '青蛙', url: '/images/frog.svg' },
  { id: 'turtle', name: '乌龟', url: '/images/turtle.svg' },
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