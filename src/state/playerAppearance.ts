export const appearanceOptions = {
  skin: { light: "Light", tan: "Tan", brown: "Brown", deep: "Deep brown" },
  shirt: { white: "White", coral: "Coral", teal: "Teal", navy: "Navy" },
  headwear: { trucker: "Trucker cap", bucket: "Bucket hat", none: "No hat" },
} as const;

export type PlayerAppearance = {
  [Field in keyof typeof appearanceOptions]: keyof (typeof appearanceOptions)[Field];
};

export const defaultPlayerAppearance: PlayerAppearance = {
  skin: "tan",
  shirt: "white",
  headwear: "trucker",
};

function readChoice<Choice extends string>(options: Record<Choice, string>, value: unknown, fallback: Choice): Choice {
  return typeof value === "string" && Object.hasOwn(options, value) ? value as Choice : fallback;
}

export function readPlayerAppearance(value: unknown): PlayerAppearance {
  if (typeof value !== "object" || value === null) return defaultPlayerAppearance;
  const appearance = value as Record<string, unknown>;
  return {
    skin: readChoice(appearanceOptions.skin, appearance.skin, defaultPlayerAppearance.skin),
    shirt: readChoice(appearanceOptions.shirt, appearance.shirt, defaultPlayerAppearance.shirt),
    headwear: readChoice(appearanceOptions.headwear, appearance.headwear, defaultPlayerAppearance.headwear),
  };
}
