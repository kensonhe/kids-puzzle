import { SpeedInsights } from '@vercel/speed-insights/react';
import { useGameState } from './hooks/useGameState';
import { StartScreen } from './components/StartScreen';
import { GameScreen } from './components/GameScreen';
import { CompleteScreen } from './components/CompleteScreen';
import './App.css';

function App() {
  const { phase, image, difficulty, pieces, startTime, startGame, swapPieces, resetGame } = useGameState();

  return (
    <>
      {phase === 'start' && <StartScreen onStartGame={startGame} />}
      
      {phase === 'playing' && (
        <GameScreen
          image={image}
          difficulty={difficulty}
          pieces={pieces}
          onSwap={swapPieces}
          onReset={resetGame}
        />
      )}
      
      {phase === 'complete' && (
        <CompleteScreen
          image={image}
          startTime={startTime}
          onPlayAgain={() => startGame(image, difficulty)}
          onChooseImage={resetGame}
        />
      )}
      
      <SpeedInsights />
    </>
  );
}

export default App;
