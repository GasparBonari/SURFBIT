/**
 * The single SURFBIT palette. Every procedurally drawn sprite pulls from here
 * so terrain, buildings and characters stay cohesive.
 */
export const P = {
  outline: "#2b2433",
  ink: "#3d3346",
  shadow: "rgba(43,36,51,0.28)",

  sand: "#f3d9a4",
  sandLight: "#fbe9c3",
  sandDark: "#e2bf7f",
  sandWet: "#d8b57a",
  sandWetDark: "#c7a066",

  grass: "#7cc46a",
  grassLight: "#a4dc7c",
  grassDark: "#549a4f",
  grassDeep: "#3d7a45",

  water: "#2fb3c6",
  waterLight: "#5fd3dc",
  waterDeep: "#1e8ea8",
  waterDeeper: "#18738f",
  foam: "#f4fbff",
  foamShade: "#bfe9f0",

  wood: "#b97a4b",
  woodLight: "#d49a62",
  woodDark: "#8a5534",
  woodDeep: "#663c25",

  stone: "#d9c9ad",
  stoneLight: "#ebdfc8",
  stoneDark: "#b6a385",

  coral: "#e8734a",
  coralDark: "#c4553a",
  teal: "#3fa7a0",
  tealDark: "#2c7f7c",
  sun: "#f2b632",
  sunDark: "#d18f1d",
  sky: "#7bc6e8",
  deepBlue: "#2f6f8f",
  cream: "#fff3d6",
  white: "#ffffff",
  leaf: "#4fae5b",
  leafLight: "#7fd36b",
  leafDark: "#2f7f48",
  trunk: "#a8754a",
  trunkDark: "#7c5132",
  pink: "#f29bb0",
  lilac: "#a99be0",

  skin1: "#f5cfa6",
  skin2: "#d9a173",
  skin3: "#a86f48",
  skin4: "#6e4430",
} as const;
