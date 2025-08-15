import React, { FC, useEffect } from 'react';
import { useFarkleStore } from '../store';
import { Button } from '@/components/ui/button';
import { useUser } from '@clerk/nextjs';

const numberToWord = (n: number) => {
  switch (n) {
    case 1:
      return 'one';
    case 2:
      return 'two';
    case 3:
      return 'three';
    case 4:
      return 'four';
    case 5:
      return 'five';
    case 6:
      return 'six';
    default:
      return '';
  }
};

const DiceFace: FC<{
  value: number;
  kept: boolean;
  onClick?: () => void;
  selectable?: boolean;
}> = ({ value, kept, onClick, selectable }) => {
  return (
    <div
      className={`relative flex h-12 w-12 cursor-pointer items-center justify-center rounded border bg-white transition-all duration-150 select-none ${kept ? 'border-green-400 bg-green-200 shadow-2xl ring-2 ring-green-500' : 'border-gray-300 bg-white shadow'} ${selectable ? 'hover:ring-2 hover:ring-blue-400' : 'cursor-default opacity-60'} `}
      onClick={selectable ? onClick : undefined}
      tabIndex={selectable ? 0 : -1}
      aria-pressed={kept}
      role='button'
    >
      <img
        src={`/assets/dice-six-faces-${numberToWord(value)}.svg`}
        alt={`Die showing ${value}`}
        width={40}
        height={40}
        className='h-10 w-10'
        draggable={false}
      />
    </div>
  );
};

const ScoreboardPanel: FC = () => {
  const { state } = useFarkleStore();
  const currentPlayer = state.players[state.currentPlayerIndex];
  return (
    <div className="relative mx-auto flex w-full max-w-md flex-col items-center rounded-xl border-4 border-gray-400 bg-[url('/assets/wood-texture.jpg')] bg-cover bg-center p-6 text-white shadow-2xl md:sticky md:top-4 md:w-1/3">
      <div
        className='absolute inset-0 rounded-xl opacity-70'
        style={{
          background: 'linear-gradient(180deg, #e0a96d 0%, #b97a3a 100%)'
        }}
      />
      <div className='relative z-10 flex w-full flex-col items-center'>
        {/* Scoreboard Title */}
        <div className='mb-4 flex w-full justify-center'>
          <Button
            variant='secondary'
            size='lg'
            className='bg-transparent text-2xl font-bold text-white'
          >
            FARKLE
          </Button>
        </div>
        {/* Current Player Nameplate */}
        <div className='mb-4 flex w-full justify-center'>
          <Button variant='outline' size='sm' className='text-black'>
            <span className='text-lg'>🎯</span>
            <span>Current: {currentPlayer?.name}</span>
          </Button>
        </div>
        {/* Player Scores */}
        <div className='mb-4 w-full rounded-lg border-2 border-gray-200 bg-white/70 p-2 shadow-inner'>
          <ul className='divide-y divide-gray-300'>
            {state.players.map((p) => (
              <li
                key={p.id}
                className={`flex items-center justify-between px-2 py-2 text-lg font-bold ${p.isCurrent ? 'rounded bg-blue-100 text-blue-700' : 'text-gray-800'}`}
              >
                <Button
                  variant={p.isCurrent ? 'secondary' : 'ghost'}
                  size='sm'
                  className={`flex w-28 items-center gap-2 font-bold ${p.isCurrent ? 'bg-blue-200 text-blue-900' : 'text-gray-800'}`}
                  disabled
                >
                  {p.isCurrent && <span className='animate-pulse'>▶</span>}
                  {p.name}
                </Button>
                <span className='text-xl font-extrabold'>{p.score}</span>
              </li>
            ))}
          </ul>
        </div>
        {/* Turn Score */}
        <div className='flex w-full justify-center'>
          <Button
            variant='default'
            size='lg'
            className='pointer-events-none cursor-default rounded-lg border-2 border-yellow-500 bg-yellow-300 px-4 py-2 font-bold text-yellow-900 shadow select-none'
          >
            Turn Score: <span className='ml-2 text-xl'>{state.turnScore}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

const GameBoard: FC = () => {
  const {
    state,
    rollDice,
    selectDice,
    bankScore,
    endTurn,
    startGame,
    joinGame,
    resetGame
  } = useFarkleStore();
  const { user, isSignedIn } = useUser();

  // Local state for which dice are selected (to be set aside)
  const [selected, setSelected] = React.useState<string[]>([]);

  // Add logged-in user to lobby if not present
  useEffect(() => {
    if (state.phase === 'lobby' && isSignedIn && user) {
      const alreadyJoined = state.players.some((p) => p.id === user.id);
      if (!alreadyJoined) {
        joinGame(user.fullName || user.username || user.id);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase, isSignedIn, user]);

  // Reset selection when phase or dice change
  React.useEffect(() => {
    setSelected([]);
  }, [state.phase, state.dice.map((d) => d.id).join('')]);

  // Handle die click (toggle selection)
  const handleDieClick = (id: string) => {
    if (state.phase !== 'selecting') return;
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  // Confirm selection (set aside selected dice)
  const handleConfirmSelection = () => {
    if (selected.length > 0) {
      selectDice(selected);
      setSelected([]);
    }
  };

  if (state.phase === 'lobby') {
    return (
      <div className='p-4'>
        <h2 className='mb-2 text-xl font-bold'>Farkle Lobby</h2>
        <Button
          variant='default'
          size='lg'
          onClick={() => startGame(['Alice', 'Bob'])}
        >
          Start Game (Demo: Alice & Bob)
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className='mt-10 flex w-full flex-col items-center gap-6 px-4'>
        <ScoreboardPanel />
        <div className='mx-auto max-w-3xl rounded border p-4 shadow'>
          {/* Dice Board */}
          <div className='flex-1'>
            <div className='mb-2'>
              <div className='mt-1 flex flex-wrap gap-2'>
                {state.dice.map((die) => (
                  <DiceFace
                    key={die.id}
                    value={die.value}
                    kept={die.kept || selected.includes(die.id)}
                    onClick={() => handleDieClick(die.id)}
                    selectable={state.phase === 'selecting' && !die.kept}
                  />
                ))}
              </div>
            </div>
            <div className='mt-4 flex flex-wrap gap-2'>
              {state.phase === 'rolling' && (
                <Button variant='default' size='lg' onClick={rollDice}>
                  Roll Dice
                </Button>
              )}
              {state.phase === 'selecting' && (
                <Button
                  variant='secondary'
                  size='lg'
                  onClick={handleConfirmSelection}
                  disabled={selected.length === 0}
                >
                  Set Aside Selected Dice
                </Button>
              )}
              {state.phase === 'banking' && (
                <>
                  <Button variant='default' size='lg' onClick={bankScore}>
                    Bank Score
                  </Button>
                  <Button variant='default' size='lg' onClick={rollDice}>
                    Reroll
                  </Button>
                </>
              )}
              {state.phase === 'farkle' && (
                <Button variant='destructive' size='lg' onClick={endTurn}>
                  Farkle! End Turn
                </Button>
              )}
              {state.phase === 'ended' && (
                <Button variant='outline' size='lg' onClick={endTurn}>
                  Next Player
                </Button>
              )}
              <Button
                variant='ghost'
                size='lg'
                className='ml-auto'
                onClick={resetGame}
              >
                Reset Game
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default GameBoard;
