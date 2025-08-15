import {
  Die,
  DieValue,
  ScoringResult,
  Player,
  FarkleGameState
} from '../types/farkle';

// Utility to generate a random die value
export function getRandomDieValue(): DieValue {
  return (Math.floor(Math.random() * 6) + 1) as DieValue;
}

// Roll n dice, return array of Die objects
export function rollDice(count: number): Die[] {
  return Array.from({ length: count }, (_, i) => ({
    value: getRandomDieValue(),
    kept: false,
    id: `${Date.now()}-${i}-${Math.random().toString(36).slice(2, 8)}`
  }));
}

// Scoring logic for a roll (single roll, not accumulated turn)
export function scoreRoll(dice: Die[]): ScoringResult {
  const values = dice.map((d) => d.value);
  const counts = [0, 0, 0, 0, 0, 0, 0]; // 0-index unused
  values.forEach((v) => counts[v]++);
  let score = 0;
  let scoringDiceIds: string[] = [];
  let description = '';
  let hotDice = false;

  // Check for straight (1-2-3-4-5-6)
  if (counts.slice(1).every((c) => c === 1)) {
    score += 3000;
    scoringDiceIds = dice.map((d) => d.id);
    description = 'Straight (1-6)';
    hotDice = true;
    return { score, scoringDiceIds, farkle: false, hotDice, description };
  }

  // Check for three pairs
  if (counts.filter((c) => c === 2).length === 3) {
    score += 1500;
    scoringDiceIds = dice.map((d) => d.id);
    description = 'Three pairs';
    hotDice = true;
    return { score, scoringDiceIds, farkle: false, hotDice, description };
  }

  // Check for triplets, quads, etc.
  for (let v = 1; v <= 6; v++) {
    if (counts[v] >= 3) {
      let base = v === 1 ? 1000 : v * 100;
      score += base * Math.pow(2, counts[v] - 3); // 3-of-a-kind, 4x for 4, 8x for 5, etc.
      scoringDiceIds.push(
        ...dice.filter((d) => d.value === v).map((d) => d.id)
      );
      counts[v] -= 3;
      description += `${counts[v] + 3}x${v} `;
    }
  }

  // Single 1s and 5s
  for (let i = 0; i < counts[1]; i++) {
    score += 100;
    const die = dice.find(
      (d) => d.value === 1 && !scoringDiceIds.includes(d.id)
    );
    if (die) scoringDiceIds.push(die.id);
  }
  for (let i = 0; i < counts[5]; i++) {
    score += 50;
    const die = dice.find(
      (d) => d.value === 5 && !scoringDiceIds.includes(d.id)
    );
    if (die) scoringDiceIds.push(die.id);
  }

  // Hot dice: all dice scored
  hotDice = scoringDiceIds.length === dice.length;

  // Farkle: no scoring dice
  const farkle = score === 0;
  if (farkle) description = 'Farkle!';

  return {
    score,
    scoringDiceIds,
    farkle,
    hotDice,
    description: description.trim()
  };
}

// Check if a roll is a Farkle (no scoring dice)
export function isFarkle(dice: Die[]): boolean {
  return scoreRoll(dice).farkle;
}

// Get next player index (wraps around)
export function getNextPlayerIndex(players: Player[], current: number): number {
  return (current + 1) % players.length;
}

// Example: advance turn (pure, does not mutate state)
export function advanceTurn(state: FarkleGameState): FarkleGameState {
  const nextIndex = getNextPlayerIndex(state.players, state.currentPlayerIndex);
  return {
    ...state,
    currentPlayerIndex: nextIndex,
    turnScore: 0,
    bankedScore: state.players[nextIndex].score,
    phase: 'rolling',
    rollCount: 0,
    dice: rollDice(6),
    lastRoll: [],
    hotDice: false
  };
}
