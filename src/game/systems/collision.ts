import { TILE } from "../art/tiles";

export type BlockedGrid = readonly (readonly boolean[])[];

export interface Point {
  x: number;
  y: number;
}

const HITBOX_HALF_WIDTH = 5;
const HITBOX_HEIGHT = 6;

function canStandAt(blocked: BlockedGrid, obstacles: readonly Point[], x: number, y: number): boolean {
  // The 10 × 6 box ends at the feet. Touching a tile edge is allowed.
  const left = Math.floor((x - HITBOX_HALF_WIDTH) / TILE);
  const right = Math.ceil((x + HITBOX_HALF_WIDTH) / TILE) - 1;
  const top = Math.floor((y - HITBOX_HEIGHT) / TILE);
  const bottom = Math.ceil(y / TILE) - 1;

  return blocked[top]?.[left] === false && blocked[top]?.[right] === false
    && blocked[bottom]?.[left] === false && blocked[bottom]?.[right] === false
    && !obstacles.some((point) => Math.abs(point.x - x) < HITBOX_HALF_WIDTH * 2
      && Math.abs(point.y - y) < HITBOX_HEIGHT);
}

export function moveWithCollision(
  blocked: BlockedGrid, { x, y }: Point, dx: number, dy: number, obstacles: readonly Point[] = [],
): Point {
  // Keep long frames from skipping over tiles or the narrower character hitboxes.
  const maxStep = obstacles.length ? HITBOX_HEIGHT : TILE / 2;
  const steps = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) / maxStep));
  const stepX = dx / steps;
  const stepY = dy / steps;

  for (let step = 0; step < steps; step++) {
    if (stepX && canStandAt(blocked, obstacles, x + stepX, y)) x += stepX;
    if (stepY && canStandAt(blocked, obstacles, x, y + stepY)) y += stepY;
  }

  return { x, y };
}
