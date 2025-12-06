// src/utils/compatibilityScore.ts
// ============================================================================
// compatibilityScore.ts
// ============================================================================
//
// PURPOSE:
//   Produces a *0–100 compatibility score* between two users, used for:
//
//     • Sorting swipe queue results
//     • Ranking search results
//     • Powering future premium features (Smart Picks, Top Matches)
//
// FACTORS USED:
//   1. Preference Match (40 pts)
//      - Whether both users’ sex preferences mutually align.
//
//   2. Distance (max 30 pts)
//      - Full score at 0 miles.
//      - Loses 1 point per mile up to 30 miles.
//      - Never goes negative.
//
//   3. Shared Interests (max 20 pts)
//      - 5 pts per shared interest, capped at 20.
//
// FINAL SCORE:
//   sum(pref + distance + interests), capped at 100.
//
// INPUT SHAPE:
//   {
//     mySex: "male" | "female";
//     theirSex: "male" | "female";
//     myPreference: "male" | "female" | "everyone";
//     theirPreference: "male" | "female" | "everyone";
//     distanceMiles: number;
//     sharedInterests: string[];
//   }
//
// ============================================================================

export interface CompatibilityInput {
  mySex: "male" | "female";
  theirSex: "male" | "female";

  myPreference: "male" | "female" | "everyone";
  theirPreference: "male" | "female" | "everyone";

  distanceMiles: number;
  sharedInterests: string[];
}

// ============================================================================
// computeCompatibilityScore()
// ----------------------------------------------------------------------------
// Calculates compatibility between two users based on sexual preference
// alignment, physical distance, and shared interests.
//
// Returns a number from 0 to 100.
//
// Example:
//   computeCompatibilityScore({
//     mySex: "male",
//     theirSex: "female",
//     myPreference: "female",
//     theirPreference: "male",
//     distanceMiles: 12,
//     sharedInterests: ["Hiking", "Movies"]
//   });
//
// ============================================================================
export function computeCompatibilityScore(input: CompatibilityInput): number {
  let score = 0;

  // --------------------------------------------------------------------------
  // 1. Sexual Preference Match (40 pts)
  // --------------------------------------------------------------------------
  // TRUE when:
  //   - I am into their sex (or "everyone")
  //   - They are into my sex (or "everyone")
  //
  const prefMatch =
    (input.myPreference === "everyone" ||
      input.myPreference === input.theirSex) &&
    (input.theirPreference === "everyone" ||
      input.theirPreference === input.mySex);

  if (prefMatch) {
    score += 40;
  }

  // --------------------------------------------------------------------------
  // 2. Distance Score (0–30 pts)
  // --------------------------------------------------------------------------
  //   distance = 0 miles → +30 pts
  //   distance = 10 miles → +20 pts
  //   distance = 40 miles → +0 pts
  //
  const distScore = Math.max(0, 30 - input.distanceMiles);
  score += distScore;

  // --------------------------------------------------------------------------
  // 3. Shared Interests Score (0–20 pts)
  // --------------------------------------------------------------------------
  //   1 shared interest → 5 pts
  //   4+ shared interests → 20 pts (max)
  //
  const interestScore = Math.min(20, input.sharedInterests.length * 5);
  score += interestScore;

  // --------------------------------------------------------------------------
  // FINAL SAFETY CAP
  // --------------------------------------------------------------------------
  return Math.min(100, score);
}
