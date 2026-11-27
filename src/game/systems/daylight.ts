import type Phaser from "phaser";
import type { TownLighting } from "@/state/settings";
import { ellipse, makeCanvas } from "../art/canvas";
import { P } from "../art/palette";

const DAY = { warmth: 0, shade: 0, glow: 0 };
const NIGHT = { warmth: 0, shade: 0.64, glow: 1 };
const CYCLE_SECONDS = 480;
const PHASES = [
  [0, DAY],
  [165, DAY],
  [205, { warmth: 0.29, shade: 0.17, glow: 0.25 }],
  [245, NIGHT],
  [385, NIGHT],
  [439, { warmth: 0.16, shade: 0.14, glow: 0.12 }],
  [CYCLE_SECONDS, DAY],
] as const;

export function daylightAt(elapsedMs: number, mode: TownLighting, reducedMotion: boolean) {
  if (mode === "night") return NIGHT;
  if (mode === "day" || reducedMotion) return DAY;

  const second = (elapsedMs / 1000) % CYCLE_SECONDS;
  for (let index = 1; index < PHASES.length; index++) {
    const [end, to] = PHASES[index];
    if (second >= end) continue;
    const [start, from] = PHASES[index - 1];
    if (from === to) return from;
    const fraction = (second - start) / (end - start);
    const blend = fraction * fraction * (3 - 2 * fraction);
    return {
      warmth: from.warmth + (to.warmth - from.warmth) * blend,
      shade: from.shade + (to.shade - from.shade) * blend,
      glow: from.glow + (to.glow - from.glow) * blend,
    };
  }
  return DAY;
}

const LIGHTING_DEPTH = 100_001;
const LAMP_GLOW = "town-lamp-glow";

function addLampGlowTexture(textures: Phaser.Textures.TextureManager) {
  if (textures.exists(LAMP_GLOW)) return;
  const [canvas, ctx] = makeCanvas(53, 39);
  for (const [rx, ry, alpha] of [[26, 19, 0.06], [20, 15, 0.08], [13, 10, 0.13], [7, 5, 0.22]]) {
    ctx.globalAlpha = alpha;
    ellipse(ctx, 26, 19, rx, ry, P.glowWarm);
  }
  ctx.globalAlpha = 0.85;
  ellipse(ctx, 26, 19, 2, 1, P.glow);
  textures.addCanvas(LAMP_GLOW, canvas);
}

export class Daylight {
  private readonly sunset;
  private readonly night;
  private readonly lamps;
  private last?: ReturnType<typeof daylightAt>;

  constructor(scene: Phaser.Scene, lights: readonly { x: number; y: number }[]) {
    this.sunset = scene.add.rectangle(0, 0, 1, 1, parseInt(P.terracottaDark.slice(1), 16))
      .setScrollFactor(0).setDepth(LIGHTING_DEPTH);
    this.night = scene.add.rectangle(0, 0, 1, 1, parseInt(P.roofIndigoDeep.slice(1), 16))
      .setScrollFactor(0).setDepth(LIGHTING_DEPTH + 1);
    addLampGlowTexture(scene.textures);
    this.lamps = lights.map(({ x, y }) => scene.add.image(x, y, LAMP_GLOW).setDepth(LIGHTING_DEPTH + 2));
  }

  resize(width: number, height: number) {
    // Cover the camera background at the map edges as well as the scrolling world.
    this.sunset.setPosition(width / 2, height / 2).setSize(width, height);
    this.night.setPosition(width / 2, height / 2).setSize(width, height);
  }

  update(elapsedMs: number, mode: TownLighting, reducedMotion: boolean) {
    const light = daylightAt(elapsedMs, mode, reducedMotion);
    if (this.last === light) return;
    this.last = light;
    this.sunset.setAlpha(light.warmth).setVisible(light.warmth > 0);
    this.night.setAlpha(light.shade).setVisible(light.shade > 0);
    for (const lamp of this.lamps) lamp.setAlpha(light.glow).setVisible(light.glow > 0);
  }
}
