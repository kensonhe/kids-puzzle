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