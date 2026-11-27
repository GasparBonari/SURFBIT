import type Phaser from "phaser";
import { prefersReducedMotion, useSettings } from "@/state/settings";
import { buildShore } from "../art/shore";
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
const FOOTPRINT_LIFETIME = 2_500;
const FOOTPRINT_SPACING = 10;

export class Ambient {
  private readonly water: { tile: Phaser.Tilemaps.Tile; loop: number[]; phase: number }[] = [];
  private readonly props;
  private readonly gulls;
  private readonly shore?: Phaser.GameObjects.Image;
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

    this.shore = this.addShore();

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
      this.shore?.setFrame(waterFrame);
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
  }

  /** Smooth coastline drawn over the water tiles; its frames advance with the water. */
  private addShore() {
    const key = `shore:${this.map.key}`;
    const { textures } = this.scene;
    if (!textures.exists(key)) {
      const shore = buildShore(this.map.ground);
      if (!shore) return undefined;
      const canvas = textures.createCanvas(key, shore.width, shore.height * shore.frames);
      if (!canvas) throw new Error(`Could not create texture "${key}"`);
      canvas.context.putImageData(new ImageData(shore.pixels, shore.width, shore.height * shore.frames), 0, 0);
      canvas.refresh();
      for (let frame = 0; frame < shore.frames; frame++) {
        canvas.add(frame, 0, 0, frame * shore.height, shore.width, shore.height);
      }
      canvas.customData = { top: shore.top };
    }
    const { top } = textures.get(key).customData as { top: number };
    // Just above the ground, under flat props (1), footprints (3) and everything standing.
    return this.scene.add.image(0, top, key, 0).setOrigin(0, 0).setDepth(0.5);
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
