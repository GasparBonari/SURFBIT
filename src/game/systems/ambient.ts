import type Phaser from "phaser";
import { prefersReducedMotion, useSettings } from "@/state/settings";
import { FOAM_FRAMES, T, TILE, WATER_FRAMES } from "../art/tiles";
import type { MapDef } from "../maps/types";
import type { AnimatedProp } from "./objects";

const WATER_FRAME_MS = 300;
const WATER_LOOPS = [
  WATER_FRAMES,
  FOAM_FRAMES,
  [T.foamWest0, T.foamWest1, T.foamWest2, T.foamWest3],
  [T.foamCorner0, T.foamCorner1, T.foamCorner2, T.foamCorner3],
  [T.foamInner0, T.foamInner1, T.foamInner2, T.foamInner3],
];
const WAVE_PERIOD = 4_200;
const WAVE_TRAVEL = 2_800;
const FOOTPRINT_LIFETIME = 2_500;
const FOOTPRINT_SPACING = 10;

function findShore(ground: MapDef["ground"]) {
  const shore = [];
  for (let x = 2; x < ground[0].length - 2; x++) {
    const y = ground.findIndex((row, y) => row[x] === "~" && ground[y - 1]?.[x] === ".");
    if (y !== -1 && ground[y + 3]?.[x] === "~") shore.push({ x, y });
  }
  return shore;
}

export class Ambient {
  private readonly water: { tile: Phaser.Tilemaps.Tile; loop: number[]; phase: number }[] = [];
  private readonly props;
  private readonly gulls;
  private readonly waves;
  private readonly surfers;
  private readonly footprints: { image: Phaser.GameObjects.Image; born: number }[] = [];
  private readonly motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  private readonly unsubscribeSettings: () => void;
  private reduced = prefersReducedMotion();
  private elapsed = 0;
  private waterElapsed = 0;
  private waterFrame = 0;
  private lastX: number;
  private lastY: number;
  private stride = 0;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly map: MapDef,
    layer: Phaser.Tilemaps.TilemapLayer,
    props: AnimatedProp[],
    player: Phaser.GameObjects.Sprite,
  ) {
    this.lastX = player.x;
    this.lastY = player.y;
    layer.forEachTile((tile) => {
      const loop = WATER_LOOPS.find((frames) => frames.includes(tile.index));
      if (loop) this.water.push({ tile, loop, phase: loop.indexOf(tile.index) });
    });

    this.props = props.map((prop) => {
      const cycle = prop.pingPong ? 2 * prop.frames - 2 : prop.frames;
      return { ...prop, cycle, phase: prop.pingPong ? Math.random() * cycle * prop.frameMs : 0 };
    });

    const { width, height } = layer;
    const outdoor = map.kind === "outdoor";
    this.gulls = (outdoor ? [0.46, 0.69] : []).map((row, i) => {
      const image = scene.add.sprite(0, Math.round(height * row), "gull", 0)
        .setDepth(100000).setFlipX(i === 1).setVisible(false);
      return { image, speed: i === 0 ? 46 : -38, start: width * (i === 0 ? 0.28 : 0.84), span: width + 32 };
    });

    const shore = outdoor ? findShore(map.ground) : [];
    this.waves = shore.filter((_, i) => i % 5 === 2).map(({ x, y }, i) => {
      const endX = (x + 0.5) * TILE;
      const endY = (y + 1) * TILE;
      const image = scene.add.image(endX, endY, "wave").setDepth(4).setVisible(false);
      return { image, endX, endY, phase: (i % 3) * WAVE_PERIOD / 3 };
    });

    const offshore = shore.filter(({ x, y }) => map.ground[y + 5]?.[x] === "~");
    const surferCount = Math.min(offshore.length, 2);
    this.surfers = Array.from({ length: surferCount }, (_, i) => {
      const { x, y } = offshore[Math.floor((i + 0.5) * offshore.length / surferCount)];
      const feet = (y + 4.5) * TILE;
      return scene.add.sprite((x + 0.5) * TILE, feet, "surfer", 0)
        .setOrigin(0.5, 1).setDepth(feet).setVisible(false);
    });

    this.motionQuery.addEventListener("change", this.updateMotionPreference);
    this.unsubscribeSettings = useSettings.subscribe(this.updateMotionPreference);
  }

  update(delta: number, { x, y }: Phaser.GameObjects.Sprite) {
    this.waterElapsed = (this.waterElapsed + delta * (this.reduced ? 0.25 : 1))
      % (WATER_FRAME_MS * WATER_FRAMES.length);
    const waterFrame = Math.floor(this.waterElapsed / WATER_FRAME_MS);
    if (waterFrame !== this.waterFrame) {
      this.waterFrame = waterFrame;
      for (const { tile, loop, phase } of this.water) {
        // Every frame in a loop has the same collision properties.
        tile.index = loop[(phase + waterFrame) % loop.length];
      }
    }

    if (!this.reduced) {
      this.elapsed += delta;
      this.updateScenery();
      if (this.map.kind === "outdoor") this.updateFootprints(x, y);
    }
    this.lastX = x;
    this.lastY = y;
  }

  destroy() {
    this.motionQuery.removeEventListener("change", this.updateMotionPreference);
    this.unsubscribeSettings();
  }

  private readonly updateMotionPreference = () => {
    const reduced = prefersReducedMotion();
    if (this.reduced === reduced) return;
    this.reduced = reduced;
    if (!reduced) return;

    for (const { sprite } of this.props) sprite.setFrame(0);
    for (const { image } of this.gulls) image.setVisible(false);
    for (const { image } of this.waves) image.setVisible(false);
    for (const surfer of this.surfers) surfer.setVisible(false);
    for (const { image } of this.footprints) image.destroy();
    this.footprints.length = 0;
    this.stride = 0;
  };

  private updateScenery() {
    const time = this.elapsed;
    for (const { sprite, frameMs, phase, cycle, pingPong } of this.props) {
      const step = Math.floor((time + phase) / frameMs) % cycle;
      const frame = pingPong ? Math.min(step, cycle - step) : step;
      if (Number(sprite.frame.name) !== frame) sprite.setFrame(frame);
    }
    for (const { image, speed, start, span } of this.gulls) {
      const distance = start + time * speed / 1000;
      image.setX(Math.round(((distance % span) + span) % span) - 16)
        .setFrame(Math.floor(time / 200) % 2).setVisible(true);
    }
    for (const { image, endX, endY, phase } of this.waves) {
      const progress = (time + phase) % WAVE_PERIOD / WAVE_TRAVEL;
      image.setVisible(progress < 1);
      if (progress >= 1) continue;
      image.setPosition(endX + Math.round((1 - progress) * 24), endY + Math.round((1 - progress) * 20))
        .setAlpha(Math.min(progress * 4, 1 - progress) * 0.85);
    }
    this.surfers.forEach((sprite, i) => {
      sprite.setFrame(Math.floor((time + i * 450) / 900) % 2).setVisible(true);
    });
  }

  private updateFootprints(x: number, y: number) {
    while (this.footprints.length && this.elapsed - this.footprints[0].born >= FOOTPRINT_LIFETIME) {
      this.footprints.shift()?.image.destroy();
    }
    for (const { image, born } of this.footprints) {
      image.setAlpha(0.75 * (1 - (this.elapsed - born) / FOOTPRINT_LIFETIME));
    }

    const sand = this.map.ground[Math.ceil(y / TILE) - 1]?.[Math.floor(x / TILE)] === ".";
    if (!sand) {
      this.stride = 0;
      return;
    }
    this.stride += Math.hypot(x - this.lastX, y - this.lastY);
    if (this.stride < FOOTPRINT_SPACING) return;
    this.stride %= FOOTPRINT_SPACING;

    const image = this.scene.add.image(Math.round(x), Math.round(y) - 1, "footprint")
      .setDepth(3).setAlpha(0.75);
    this.footprints.push({ image, born: this.elapsed });
  }
}
