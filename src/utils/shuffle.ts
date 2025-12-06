// src/utils/shuffle.ts
// ============================================================================
// shuffleArray.ts
// ============================================================================
//
// PURPOSE:
//   Implements a generic, immutable array shuffle using the
//   Fisher–Yates algorithm.
//
// WHY THIS MATTERS:
//   • Ensures a statistically-unbiased shuffle.
//   • Avoids mutating the original array (returns a new copy).
//   • Works with any array type via the generic <T>.
//
// HOW IT WORKS:
//   1. Copy the array so the original is untouched.
//   2. Walk backward from the last index.
//   3. Swap each element with a random earlier element (including itself).
//
// EXAMPLE:
//   const shuffled = shuffleArray([1,2,3,4]);
//   console.log(shuffled); // randomized order
//
// PERFORMANCE:
//   • O(n) time complexity
//   • O(n) space complexity (due to copying)
//
// ============================================================================

export default function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}
