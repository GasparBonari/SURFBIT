import { describe, expect, it } from "vitest";
import { moveWithCollision } from "./collision";

const grid = [
  [false, false, true, false],
  [false, false, true, false],
  [false, false, true, false],
];

describe("moveWithCollision", () => {
  it("keeps fractional movement on open ground", () => {
    expect(moveWithCollision(grid, { x: 8, y: 24 }, 2.5, -3.25)).toEqual({ x: 10.5, y: 20.75 });
  });

  it("slides along a wall when one axis is blocked", () => {
    expect(moveWithCollision(grid, { x: 26, y: 24 }, 2, 4)).toEqual({ x: 26, y: 28 });
  });

  it("allows the right edge of the hitbox to touch a wall", () => {
    expect(moveWithCollision(grid, { x: 26, y: 24 }, 1, 0)).toEqual({ x: 27, y: 24 });
  });

  it("checks above the feet when walking north into a solid tile", () => {
    const wall = [[true], [false]];
    expect(moveWithCollision(wall, { x: 8, y: 24 }, 0, -2)).toEqual({ x: 8, y: 22 });
    expect(moveWithCollision(wall, { x: 8, y: 22 }, 0, -1)).toEqual({ x: 8, y: 22 });
  });

  it("blocks a corner of the hitbox even when the feet's center stays clear", () => {
    const corner = [[false, true], [false, false]];
    expect(moveWithCollision(corner, { x: 10, y: 20 }, 2, 0)).toEqual({ x: 10, y: 20 });
  });

  it.each([
    { x: 8, y: 8, dx: -4, dy: 0 },
    { x: 8, y: 8, dx: 0, dy: -3 },
    { x: 56, y: 40, dx: 4, dy: 0 },
    { x: 56, y: 48, dx: 0, dy: 1 },
  ])("blocks movement beyond the map at ($x, $y)", ({ x, y, dx, dy }) => {
    expect(moveWithCollision(grid, { x, y }, dx, dy)).toEqual({ x, y });
  });

  it("cannot skip past a wall during a long frame", () => {
    expect(moveWithCollision(grid, { x: 24, y: 24 }, 32, 0)).toEqual({ x: 24, y: 24 });
  });
});
