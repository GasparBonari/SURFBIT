import type Phaser from "phaser";
import { DIRS, type Dir } from "../art/characters";

export class Character {
  readonly sprite: Phaser.GameObjects.Sprite;
  private readonly shadow: Phaser.GameObjects.Image;

  constructor(scene: Phaser.Scene, x: number, y: number, private readonly texture: string, private facing: Dir) {
    for (const [row, direction] of DIRS.entries()) {
      const key = `${texture}-walk-${direction}`;
      if (scene.anims.exists(key)) continue;
      const stand = row * 3;
      scene.anims.create({
        key,
        frames: [stand, stand + 1, stand, stand + 2].map((frame) => ({ key: texture, frame })),
        frameRate: 8,
        repeat: -1,
      });
    }

    this.shadow = scene.add.image(x, y, "shadow").setDepth(y);
    this.sprite = scene.add.sprite(x, y, texture, DIRS.indexOf(facing) * 3)
      .setOrigin(0.5, 1).setDepth(y);
  }

  get direction(): Dir {
    return this.facing;
  }

  protected face(dx: number, dy: number) {
    if (dx === 0 && dy === 0) return;
    this.facing = Math.abs(dx) > Math.abs(dy)
      ? (dx < 0 ? "left" : "right")
      : (dy < 0 ? "up" : "down");
  }

  protected walk(x: number, y: number, animationRate = 1) {
    this.shadow.setPosition(x, y).setDepth(y);
    this.sprite.setPosition(x, y).setDepth(y);
    this.sprite.play(`${this.texture}-walk-${this.facing}`, true);
    this.sprite.anims.timeScale = animationRate;
  }

  protected stand() {
    if (this.sprite.anims.isPlaying) this.sprite.stop();
    const frame = DIRS.indexOf(this.facing) * 3;
    if (Number(this.sprite.frame.name) !== frame) this.sprite.setFrame(frame);
  }
}
