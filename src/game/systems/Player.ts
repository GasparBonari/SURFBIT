import type Phaser from "phaser";
import { isOverlayOpen, useUI } from "@/state/ui";
import { DIRS, type Dir } from "../art/characters";
import { TILE } from "../art/tiles";
import { virtualStick } from "../bridge";
import type { Spawn } from "../maps/types";
import { moveWithCollision } from "./collision";

const WALK_SPEED = 80;
const RUN_MULTIPLIER = 1.6;
const RUN_ANIMATION_RATE = 1.5;
const PLAYER_TEXTURE = "player";

export class Player {
  readonly sprite: Phaser.GameObjects.Sprite;
  private readonly shadow: Phaser.GameObjects.Image;
  private readonly keyboard: Phaser.Input.Keyboard.KeyboardPlugin | null;
  private readonly keys;
  private facing: Dir;

  constructor(scene: Phaser.Scene, spawn: Spawn, private readonly blocked: readonly (readonly boolean[])[]) {
    this.keyboard = scene.input.keyboard;
    const addKey = (name: string) => this.keyboard?.addKey(name, false);
    this.keys = {
      w: addKey("W"), a: addKey("A"), s: addKey("S"), d: addKey("D"),
      up: addKey("UP"), left: addKey("LEFT"), down: addKey("DOWN"), right: addKey("RIGHT"),
      shift: addKey("SHIFT"),
    };

    for (const [row, direction] of DIRS.entries()) {
      const key = `player-walk-${direction}`;
      if (scene.anims.exists(key)) continue;
      const stand = row * 3;
      scene.anims.create({
        key,
        frames: [stand, stand + 1, stand, stand + 2].map((frame) => ({ key: PLAYER_TEXTURE, frame })),
        frameRate: 8,
        repeat: -1,
      });
    }

    this.facing = spawn.facing;
    const x = (spawn.x + 0.5) * TILE;
    const y = (spawn.y + 0.5) * TILE;
    this.shadow = scene.add.image(x, y, "shadow").setDepth(y);
    this.sprite = scene.add.sprite(x, y, PLAYER_TEXTURE, DIRS.indexOf(this.facing) * 3)
      .setOrigin(0.5, 1).setDepth(y);
  }

  update(delta: number) {
    if (isOverlayOpen(useUI.getState())) {
      this.keyboard?.resetKeys();
      this.stand();
      return;
    }

    const { w, a, s, d, up, left, down, right, shift } = this.keys;
    let x = Number(!!(d?.isDown || right?.isDown)) - Number(!!(a?.isDown || left?.isDown));
    let y = Number(!!(s?.isDown || down?.isDown)) - Number(!!(w?.isDown || up?.isDown));
    if (x === 0 && y === 0) ({ x, y } = virtualStick);
    if (x === 0 && y === 0) {
      this.stand();
      return;
    }

    if (Math.abs(x) > Math.abs(y)) {
      this.facing = x < 0 ? "left" : "right";
    } else {
      this.facing = y < 0 ? "up" : "down";
    }

    const running = shift?.isDown;
    const distance = WALK_SPEED * (running ? RUN_MULTIPLIER : 1) * delta / 1000;
    const scale = distance / Math.max(1, Math.hypot(x, y));
    const next = moveWithCollision(this.blocked, this.sprite, x * scale, y * scale);
    if (next.x === this.sprite.x && next.y === this.sprite.y) {
      this.stand();
      return;
    }

    this.shadow.setPosition(next.x, next.y).setDepth(next.y);
    this.sprite.setPosition(next.x, next.y).setDepth(next.y);
    this.sprite.play(`player-walk-${this.facing}`, true);
    this.sprite.anims.timeScale = running ? RUN_ANIMATION_RATE : 1;
  }

  private stand() {
    this.sprite.stop().setFrame(DIRS.indexOf(this.facing) * 3);
  }
}
