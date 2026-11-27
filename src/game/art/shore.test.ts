import { describe, expect, it } from "vitest";
import { buildShore, SHORE_FRAMES, shoreDistance, shoreline } from "./shore";

const COAST = ["......", ".....~", "...~~~", "~~~~~~"];

describe("shoreline", () => {
  it("runs through the bottom-left corner of each row's first water tile", () => {
    expect(shoreline(COAST)?.slice(1, -1)).toEqual([[80, 32], [48, 48], [0, 64]]);
  });

  it("only draws coasts whose water reaches the east edge in every row", () => {
    expect(shoreline(["..~~.", ".~~~~"])).toBeNull();
    expect(shoreline(["....", "...."])).toBeNull();
  });
});

describe("shoreDistance", () => {
  const points = shoreline(COAST)!;

  it("is negative on the beach and positive at sea", () => {
    expect(shoreDistance(points, 8, 24)).toBeLessThan(-10);
    expect(shoreDistance(points, 92, 60)).toBeGreaterThan(10);
  });

  it("measures across the slope, not along the row", () => {
    // Halfway along the 32 px run per 16 px row, the coast is 16 px west of x = 80 at y = 40.
    const d = shoreDistance(points, 80, 40);
    expect(d).toBeCloseTo(16 / Math.hypot(1, 2), 5);
  });
});

describe("buildShore", () => {
  it("leaves dry sand transparent and paints the sea in every frame", () => {
    const shore = buildShore(COAST)!;
    const alpha = (frame: number, x: number, y: number) =>
      shore.pixels[((frame * shore.height + y - shore.top) * shore.width + x) * 4 + 3];

    expect(shore.frames).toBe(SHORE_FRAMES);
    expect(shore.pixels.length).toBe(shore.width * shore.height * SHORE_FRAMES * 4);
    for (let frame = 0; frame < SHORE_FRAMES; frame++) {
      expect(alpha(frame, 2, 34)).toBe(0);
      expect(alpha(frame, 94, 62)).toBe(255);
    }
  });

  it("returns null for maps without a drawable coast", () => {
    expect(buildShore(["....", "...."])).toBeNull();
  });
});
