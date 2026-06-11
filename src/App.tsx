import type { FC } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useTournamentStore } from './store/useTournamentStore';
import { Screen } from './types';
import { SplashScreen } from './components/SplashScreen';
import { ConfigScreen } from './components/ConfigScreen';
import { StageTransition } from './components/StageTransition';
import { DrawScreen } from './components/DrawScreen';
import { MatchReady } from './components/MatchReady';
import { PerformingScreen } from './components/PerformingScreen';
import { ResultEntry } from './components/ResultEntry';
import { ChampionScreen } from './components/ChampionScreen';

const App: FC = () => {
  const { screen } = useTournamentStore();

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <AnimatePresence mode="wait">
        {screen === Screen.SPLASH && <SplashScreen key="splash" />}
        {screen === Screen.CONFIG && <ConfigScreen key="config" />}
        {screen === Screen.STAGE_TRANSITION && <StageTransition key="transition" />}
        {screen === Screen.DRAW && <DrawScreen key="draw" />}
        {screen === Screen.MATCH_READY && <MatchReady key="matchReady" />}
        {screen === Screen.PERFORMING && <PerformingScreen key="performing" />}
        {screen === Screen.RESULT && <ResultEntry key="result" />}
        {screen === Screen.CHAMPION && <ChampionScreen key="champion" />}
      </AnimatePresence>
    </div>
  );
}

export default App;
