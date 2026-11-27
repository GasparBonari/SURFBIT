import { expect, it } from "vitest";
import { daylightAt } from "./daylight";

const atSecond = (seconds: number) => daylightAt(seconds * 1000, "cycle", false);

it("holds daylight and night, with warmer transitions between them", () => {
  const day = daylightAt(0, "day", false);
  const night = daylightAt(0, "night", false);

  expect(atSecond(120)).toEqual(day);
  expect(atSecond(205).warmth).toBeGreaterThan(day.warmth);
  expect(atSecond(225).shade).toBeGreaterThan(atSecond(205).shade);
  expect(atSecond(225).shade).toBeLessThan(night.shade);
  expect(atSecond(300)).toEqual(night);
  expect(atSecond(439).warmth).toBeGreaterThan(night.warmth);
  expect(atSecond(439).glow).toBeLessThan(night.glow);
  expect(atSecond(480)).toEqual(day);
  expect(atSecond(685)).toEqual(atSecond(205));
});

it("uses a steady look when selected or when reduced motion is on", () => {
  const day = atSecond(0);
  const night = atSecond(300);

  expect(daylightAt(300_000, "cycle", true)).toEqual(day);
  expect(daylightAt(300_000, "day", false)).toEqual(day);
  expect(daylightAt(0, "night", true)).toEqual(night);
});
