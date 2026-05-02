import React from 'react';
import { useGameState } from './hooks/useGameState';
import { StartScreen } from './components/StartScreen';
import { GameScreen } from './components/GameScreen';
import { CompleteScreen } from './components/CompleteScreen';
import './App.css';

function App() {
  const { phase, image, difficulty, pieces, startTime, isComplete, startGame, swapPieces, resetGame } = useGameState();

  if (phase === 'start') {
    return <StartScreen onStartGame={startGame} />;
  }

  if (phase === 'playing') {
    return (
      <GameScreen
        image={image}
        difficulty={difficulty}
        pieces={pieces}
        startTime={startTime}
        isComplete={isComplete}
        onSwap={swapPieces}
        onReset={resetGame}
      />
    );
  }

  if (phase === 'complete') {
    return (
      <CompleteScreen
        image={image}
        startTime={startTime}
        onPlayAgain={() => startGame(image, difficulty)}
        onChooseImage={resetGame}
      />
    );
  }

  return null;
}

export default App;