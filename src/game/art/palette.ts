/**
 * The single SURFBIT palette. Every sprite pulls from here so terrain,
 * buildings and characters stay cohesive. Values are sampled from the visual
 * target in docs/art-references/ — see docs/ART_DIRECTION.md.
 * Shared colors must match the --sb-* tokens in src/app/globals.css.
 */
export const P = {
  outline: "#2b2433",
  ink: "#3d3346",
  shadow: "rgba(43,36,51,0.28)",

  // Terrain
  sand: "#fdda8a",
  sandLight: "#fee9b0",
  sandDark: "#e9bf6e",
  sandWet: "#d9b071",
  sandWetDark: "#a7906f",

  grass: "#6f9e3c",
  grassLight: "#a2a042",
  grassDark: "#3a6b36",
  grassDeep: "#143e34",

  water: "#0fb0bc",
  waterLight: "#37c0c6",
  waterDeep: "#02919f",
  waterDeeper: "#017a8a",
  foam: "#fcfbf0",
  foamShade: "#bfe6e0",

  // Cobblestone streets & plaza
  stone: "#ecbe78",
  stoneLight: "#fad5a0",
  stoneDark: "#cba260",
  grout: "#7a6a45",

  // Retaining walls, planters, stairs
  wallStone: "#ba9780",
  wallStoneLight: "#eec898",
  wallStoneDark: "#7c745f",

  rock: "#a58174",
  rockDark: "#6e5b5f",
  rockDeep: "#3f3948",

  // Warm orange-brown wood (floors, decks, furniture, walls)
  wood: "#c97a43",
  woodLight: "#e79b5b",
  woodDark: "#8a4a26",
  woodDeep: "#552f26",

  // Roofs (one material per shop)
  thatch: "#f0a14b",
  thatchLight: "#fcca6e",
  thatchDark: "#b97e51",
  thatchDeep: "#6c4738",
  terracotta: "#e45f2a",
  terracottaLight: "#f08a55",
  terracottaDark: "#b3461f",
  roofIndigo: "#6a6796",
  roofIndigoDark: "#524f8f",
  roofIndigoDeep: "#232f4c",
  roofSlate: "#8791ba",
  roofSlateDark: "#6c5a69",

  // Brand & signage
  navy: "#114f6d",
  navyDark: "#0c3b56",
  signTeal: "#3d7a74",
  signTealDark: "#194e56",
  wallSage: "#577559",
  wallSageDark: "#234144",

  coral: "#e8734a",
  coralDark: "#c4553a",
  teal: "#3c8c84",
  tealDark: "#2c6f6a",
  sun: "#f2b632",
  sunDark: "#d18f1d",
  sky: "#6fccd2",
  deepBlue: "#2f6f8f",
  flagBlue: "#1684c6",
  cream: "#fff3d6",
  white: "#ffffff",

  // Foliage
  leaf: "#4f8a3a",
  leafLight: "#a2a042",
  leafGlint: "#e0d13c",
  leafDark: "#2b5e36",
  leafDeep: "#143e34",
  trunk: "#a8754a",
  trunkDark: "#7c5132",
  hibiscus: "#e8505b",
  pink: "#f29bb0",
  lilac: "#a99be0",

  // Lights & metal
  iron: "#4f565c",
  ironDark: "#171e2a",
  glow: "#fdf2ad",
  glowWarm: "#e4ab3f",

  skin1: "#f5cfa6",
  skin2: "#d9a173",
  skin3: "#a86f48",
  skin4: "#6e4430",
} as const;
