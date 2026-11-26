import { TILE } from "../art/tiles";

type BlockedGrid = readonly (readonly boolean[])[];

interface Point {
  x: number;
  y: number;
}

function canStandAt(blocked: BlockedGrid, x: number, y: number): boolean {
  // The 10 × 6 box ends at the feet. Touching a tile edge is allowed.
  const left = Math.floor((x - 5) / TILE);
  const right = Math.ceil((x + 5) / TILE) - 1;
  const top = Math.floor((y - 6) / TILE);
  const bottom = Math.ceil(y / TILE) - 1;

  return blocked[top]?.[left] === false && blocked[top]?.[right] === false
    && blocked[bottom]?.[left] === false && blocked[bottom]?.[right] === false;
}

export function moveWithCollision(blocked: BlockedGrid, { x, y }: Point, dx: number, dy: number): Point {
  // Keep long frames from skipping over a solid tile.
  const steps = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) / (TILE / 2)));
  const stepX = dx / steps;
  const stepY = dy / steps;

  for (let step = 0; step < steps; step++) {
    if (stepX && canStandAt(blocked, x + stepX, y)) x += stepX;
    if (stepY && canStandAt(blocked, x, y + stepY)) y += stepY;
  }

  return { x, y };
}
