// Farkle Game Types

export type DieValue = 1 | 2 | 3 | 4 | 5 | 6;

export interface Die {
  value: DieValue;
  kept: boolean; // true if set aside for scoring
  id: string; // unique per die for React rendering
}

export interface Player {
  id: string;
  name: string;
  score: number;
  isCurrent: boolean;
  farkleCount: number; // for 3-Farkle rule
}

export type GamePhase =
  | 'lobby'
  | 'rolling'
  | 'selecting'
  | 'banking'
  | 'farkle'
  | 'ended';

export interface FarkleGameState {
  id: string;
  players: Player[];
  currentPlayerIndex: number;
  dice: Die[];
  turnScore: number;
  bankedScore: number;
  phase: GamePhase;
  rollCount: number;
  lastRoll: DieValue[];
  winnerId?: string;
  hotDice: boolean;
}

export type FarkleAction =
  | { type: 'ROLL_DICE' }
  | { type: 'SELECT_DICE'; dieIds: string[] }
  | { type: 'BANK_SCORE' }
  | { type: 'END_TURN' }
  | { type: 'START_GAME'; playerNames: string[] }
  | { type: 'JOIN_GAME'; playerName: string }
  | { type: 'RESET_GAME' };

// Utility types for scoring
export interface ScoringResult {
  score: number;
  scoringDiceIds: string[];
  farkle: boolean;
  hotDice: boolean;
  description: string;
}
