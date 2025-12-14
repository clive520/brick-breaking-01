import { LevelConfig } from './types';

// Canvas Dimensions (Internal resolution)
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;

// Game Settings
export const PADDLE_WIDTH = 120;
export const PADDLE_MAX_WIDTH = 200;
export const PADDLE_HEIGHT = 20;
export const PADDLE_Y = CANVAS_HEIGHT - 40;
export const BALL_RADIUS = 8;
export const BASE_SPEED = 6;
export const BRICK_ROW_COUNT = 6;
export const BRICK_COLUMN_COUNT = 10;
export const BRICK_PADDING = 10;
export const BRICK_OFFSET_TOP = 60;
export const BRICK_OFFSET_LEFT = 35;
export const BRICK_HEIGHT = 25;
// Calculated width based on padding and count
export const BRICK_WIDTH = (CANVAS_WIDTH - (BRICK_OFFSET_LEFT * 2) - (BRICK_PADDING * (BRICK_COLUMN_COUNT - 1))) / BRICK_COLUMN_COUNT;

export const POWERUP_SIZE = 20;
export const POWERUP_SPEED = 3;
export const POWERUP_CHANCE = 0.15; // 15% chance to drop

// Colors
export const COLORS = {
  paddle: '#38bdf8', // Sky 400
  ball: '#ffffff',
  text: '#f0f9ff',
  background: '#0f172a',
  bricks: [
    'transparent', // 0
    '#f43f5e', // 1: Rose 500
    '#f59e0b', // 2: Amber 500
    '#84cc16', // 3: Lime 500
    '#06b6d4', // 4: Cyan 500
    '#a855f7', // 5: Purple 500
    '#64748b', // 6: Slate 500 (Unused placeholder)
    '#64748b', // 7: Slate 500 (Unused placeholder)
    '#94a3b8', // 8: Hard Brick (Silver)
    '#ef4444', // 9: Explosive (Red Pulsing)
  ],
  powerUps: {
    EXTEND: '#3b82f6', // Blue
    MULTIBALL: '#eab308', // Yellow
    LIFE: '#ec4899' // Pink
  }
};

// Level Designs
// 0: Empty
// 1-5: Color tier (Normal)
// 8: Hard Brick (3 hits)
// 9: Explosive Brick
export const LEVELS: LevelConfig[] = [
  {
    id: 1,
    name: "Initiation",
    speedMultiplier: 1.0,
    layout: [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [1, 1, 1, 9, 1, 1, 9, 1, 1, 1], // Added bombs
      [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
      [3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
      [8, 4, 4, 4, 8, 8, 4, 4, 4, 8], // Added hard bricks
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ]
  },
  {
    id: 2,
    name: "The Pyramid",
    speedMultiplier: 1.2,
    layout: [
      [0, 0, 0, 0, 5, 5, 0, 0, 0, 0],
      [0, 0, 0, 4, 4, 4, 4, 0, 0, 0],
      [0, 0, 3, 3, 9, 9, 3, 3, 0, 0], // Bombs in center
      [0, 2, 2, 2, 2, 2, 2, 2, 2, 0],
      [8, 1, 1, 1, 1, 1, 1, 1, 1, 8], // Hard corners
      [1, 0, 1, 0, 1, 1, 0, 1, 0, 1],
    ]
  },
  {
    id: 3,
    name: "Chaos Fortress",
    speedMultiplier: 1.4,
    layout: [
      [9, 8, 8, 8, 9, 9, 8, 8, 8, 9], // Hard/Bomb top
      [5, 4, 5, 4, 5, 5, 4, 5, 4, 5],
      [3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
      [2, 2, 0, 0, 2, 2, 0, 0, 2, 2],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [9, 5, 0, 0, 5, 5, 0, 0, 5, 9],
    ]
  }
];