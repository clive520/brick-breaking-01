export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  LEVEL_COMPLETE = 'LEVEL_COMPLETE',
  GAME_OVER = 'GAME_OVER',
  VICTORY = 'VICTORY'
}

export interface Vector {
  x: number;
  y: number;
}

export interface Ball {
  id: number;
  pos: Vector;
  vel: Vector;
  radius: number;
  speed: number;
  active: boolean;
}

export interface Paddle {
  x: number;
  width: number;
  height: number;
}

export enum BrickType {
  NORMAL = 'NORMAL',
  HARD = 'HARD', // Requires multiple hits
  EXPLOSIVE = 'EXPLOSIVE' // Destroys neighbors
}

export interface Brick {
  x: number;
  y: number;
  width: number;
  height: number;
  status: number; // 1 = active, 0 = broken
  health: number; // Current hits remaining
  maxHealth: number;
  type: BrickType;
  color: string;
  scoreValue: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

export enum PowerUpType {
  EXTEND = 'EXTEND',
  MULTIBALL = 'MULTIBALL',
  LIFE = 'LIFE'
}

export interface PowerUp {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  vy: number;
  type: PowerUpType;
  active: boolean;
}

export interface LevelConfig {
  id: number;
  name: string;
  layout: number[][]; // 0=empty, 1-5=normal colors, 8=Hard, 9=Explosive
  speedMultiplier: number;
}