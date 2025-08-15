import { create } from 'zustand';
import { FarkleGameState, Player, Die } from '@/types/farkle';
import { rollDice, scoreRoll, advanceTurn } from '@/lib/farkle-logic';
import { v4 as uuid } from 'uuid';

interface FarkleStore {
  state: FarkleGameState;
  rollDice: () => void;
  selectDice: (dieIds: string[]) => void;
  bankScore: () => void;
  endTurn: () => void;
  startGame: (playerNames: string[]) => void;
  joinGame: (playerName: string) => void;
  resetGame: () => void;
}

const initialState: FarkleGameState = {
  id: uuid(),
  players: [],
  currentPlayerIndex: 0,
  dice: rollDice(6),
  turnScore: 0,
  bankedScore: 0,
  phase: 'lobby',
  rollCount: 0,
  lastRoll: [],
  hotDice: false
};

export const useFarkleStore = create<FarkleStore>((set, get) => ({
  state: initialState,

  startGame: (playerNames) => {
    const players: Player[] = playerNames.map((name, i) => ({
      id: uuid(),
      name,
      score: 0,
      isCurrent: i === 0,
      farkleCount: 0
    }));
    set({
      state: {
        ...initialState,
        id: uuid(),
        players,
        phase: 'rolling',
        dice: rollDice(6),
        currentPlayerIndex: 0
      }
    });
  },

  joinGame: (playerName) => {
    set((state) => ({
      state: {
        ...state.state,
        players: [
          ...state.state.players,
          {
            id: uuid(),
            name: playerName,
            score: 0,
            isCurrent: false,
            farkleCount: 0
          }
        ]
      }
    }));
  },

  rollDice: () => {
    set((state) => {
      const diceToRoll = state.state.dice.filter((d) => !d.kept).length || 6;
      const newDice = rollDice(diceToRoll);
      const scored = scoreRoll(newDice);
      return {
        state: {
          ...state.state,
          dice: newDice,
          lastRoll: newDice.map((d) => d.value),
          phase: scored.farkle ? 'farkle' : 'selecting',
          turnScore: scored.farkle ? 0 : state.state.turnScore,
          hotDice: scored.hotDice,
          rollCount: state.state.rollCount + 1
        }
      };
    });
  },

  selectDice: (dieIds) => {
    set((state) => {
      const updatedDice = state.state.dice.map((d) =>
        dieIds.includes(d.id) ? { ...d, kept: true } : d
      );
      const scored = scoreRoll(updatedDice.filter((d) => d.kept));
      return {
        state: {
          ...state.state,
          dice: updatedDice,
          turnScore: state.state.turnScore + scored.score,
          phase: 'banking'
        }
      };
    });
  },

  bankScore: () => {
    set((state) => {
      const { players, currentPlayerIndex, turnScore } = state.state;
      const updatedPlayers = players.map((p, i) =>
        i === currentPlayerIndex ? { ...p, score: p.score + turnScore } : p
      );
      return {
        state: {
          ...state.state,
          players: updatedPlayers,
          phase: 'ended'
        }
      };
    });
  },

  endTurn: () => {
    set((state) => ({
      state: advanceTurn(state.state)
    }));
  },

  resetGame: () => {
    set({ state: initialState });
  }
}));
