// src/utils/compatibilityScore.ts

export interface CompatibilityInput {
  mySex: "male" | "female";
  theirSex: "male" | "female";

  myPreference: "male" | "female" | "everyone";
  theirPreference: "male" | "female" | "everyone";

  distanceMiles: number;
  sharedInterests: string[];
}

export function computeCompatibilityScore(input: CompatibilityInput): number {
  let score = 0;

  const prefMatch =
    (input.myPreference === "everyone" ||
      input.myPreference === input.theirSex) &&
    (input.theirPreference === "everyone" ||
      input.theirPreference === input.mySex);

  if (prefMatch) {
    score += 40;
  }

  const distScore = Math.max(0, 30 - input.distanceMiles);
  score += distScore;

  const interestScore = Math.min(20, input.sharedInterests.length * 5);
  score += interestScore;

  return Math.min(100, score);
}
