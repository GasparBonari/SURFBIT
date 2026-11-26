import { px, rect, shade, type Ctx } from "./canvas";
import { P } from "./palette";

const SMALL_WAVE = [
  "........",
  "...###..",
  "..##.#..",
  "..##....",
  ".##.#...",
  ".#...##.",
  "........",
  "........",
];

const WAVE = [
  "................",
  "................",
  "................",
  "................",
  ".......#####....",
  ".....########...",
  "....####...###..",
  "...####..##..#..",
  "..####..##......",
  ".####...###...#.",
  ".###.....######.",
  "..........####..",
  "................",
  "................",
  "................",
  "................",
];

const PLAZA_WAVE = [
  "....................#######..............",
  "..................##++++++ff##...........",
  ".................##+++++++ffff##.........",
  "................##+++++++fffffff#........",
  "................#+++++++fff##ffff#.......",
  "...............#++++++tt##..#ffff#.......",
  "...............#+++++tt##....##ff#.......",
  "..............#++++ttt##....+..###.......",
  "..............#+++ttt++#.................",
  ".............#+++tttt+++#................",
  "............#++tttttt++++#...............",
  "..........#+++ttttttttt++++#.............",
  "........#++++ttttttttttt++++tt#..........",
  ".....#ttt+++++ttttttttttt++++++tttt#.....",
];

const PLAZA_WORDMARK = [
  ".######..###..###..#######...#######..#######...#####..#######",
  "#######..###..###..########..#######..########..#####..#######",
  "###......###..###..###..###..#######..###..###...###...#######",
  "###......###..###..###..###..###......###..###...###.....###..",
  "######...###..###..###..###..###......###..###...###.....###..",
  ".######..###..###..#######...######...#######....###.....###..",
  "....###..###..###..######....######...#######....###.....###..",
  "....###..###..###..###.###...###......###..###...###.....###..",
  "....###..###..###..###.###...###......###..###...###.....###..",
  "....###..###..###..###..###..###......###..###...###.....###..",
  "#######..########..###..###..###......########..#####....###..",
  "######....######...###..###..###......#######...#####....###..",
];

const INLAY_COLORS = {
  "#": P.navy,
  "+": P.productTeal,
  t: P.signTeal,
  f: P.parchment,
};

function drawPixelPattern(
  ctx: Ctx,
  rows: string[],
  x: number,
  y: number,
  scale: number,
  colors: Partial<Record<string, string>>,
) {
  for (const [dy, row] of rows.entries()) {
    for (let dx = 0; dx < row.length; dx++) {
      const color = colors[row[dx]];
      if (color) rect(ctx, x + dx * scale, y + dy * scale, scale, scale, color);
    }
  }
}

export function drawSmallWaveMark(ctx: Ctx, x: number, y: number, color: string) {
  drawPixelPattern(ctx, SMALL_WAVE, x, y, 1, { "#": color });
}

export function drawWaveMark(ctx: Ctx, x: number, y: number, color: string, scale = 1) {
  drawPixelPattern(ctx, WAVE, x, y, scale, { "#": color });
}

export function drawPlazaInlay(ctx: Ctx, x: number) {
  ctx.save();
  // Let the plaza's mortar lines show through the colored stones.
  ctx.globalAlpha = 0.88;
  drawPixelPattern(ctx, PLAZA_WAVE, x, 0, 2, INLAY_COLORS);
  drawPixelPattern(ctx, PLAZA_WORDMARK, x + 10, 30, 1, INLAY_COLORS);
  ctx.restore();
}

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
  drawSmallWaveMark(ctx, x + 1, y + 2, accent);
  px(ctx, x + 4, y, shade(color, -0.25));
  px(ctx, x + 5, y, shade(color, -0.25));
}
