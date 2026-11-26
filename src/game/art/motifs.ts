import { px, rect, shade, type Ctx } from "./canvas";

export function drawBoard(ctx: Ctx, x: number, y: number, w: number, h: number, color: string, accent: string) {
  // vertical surfboard: pointed nose top, rounded tail bottom
  for (let i = 0; i < h; i++) {
    const t = i / (h - 1);
    const width = t < 0.25 ? Math.max(1, Math.round(w * Math.sqrt(t / 0.25))) : t > 0.9 ? Math.round(w * (1 - (t - 0.9) * 3)) : w;
    const lx = x + Math.floor((w - width) / 2);
    rect(ctx, lx, y + i, width, 1, color);
    if (width > 2) px(ctx, lx, y + i, shade(color, 0.3));
  }
  rect(ctx, x + Math.floor(w / 2), y + 3, 1, h - 6, accent); // stringer
  rect(ctx, x + 1, y + Math.floor(h * 0.45), w - 2, 2, accent); // stripe
}

export function drawShirt(ctx: Ctx, x: number, y: number, color: string, accent: string, long = false) {
  rect(ctx, x + 2, y, 6, 1, color);
  rect(ctx, x, y + 1, 10, 3, color);
  rect(ctx, x + 2, y + 4, 6, 6, color);
  if (long) {
    rect(ctx, x, y + 4, 2, 5, color);
    rect(ctx, x + 8, y + 4, 2, 5, color);
  }
  rect(ctx, x + 4, y + 3, 2, 2, accent);
  px(ctx, x + 4, y, shade(color, -0.25));
  px(ctx, x + 5, y, shade(color, -0.25));
}

export function drawWaveMark(ctx: Ctx, x: number, y: number, color: string, scale = 1) {
  const rows = [
    [[8, 5]], [[6, 9]], [[5, 7], [13, 3]], [[4, 6]],
    [[3, 6], [11, 2]], [[2, 6], [10, 5]], [[0, 7], [9, 10]],
    [[0, 5], [10, 12]],
  ];
  rows.forEach((row, dy) => {
    for (const [left, width] of row) rect(ctx, x + left * scale, y + dy * scale, width * scale, scale, color);
  });
}
