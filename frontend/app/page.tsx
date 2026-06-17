'use client';

import { useGameStore } from '@/store/gameStore';
import { WelcomeScreen } from '@/components/WelcomeScreen';
import { GameScreen } from '@/components/GameScreen';
import { RoundResultScreen } from '@/components/RoundResultScreen';
import { SummaryScreen } from '@/components/SummaryScreen';

export default function Home() {
  const { phase } = useGameStore();

  return (
    <main>
      {phase === 'idle' && <WelcomeScreen />}
      {phase === 'playing' && <GameScreen />}
      {phase === 'round-result' && <RoundResultScreen />}
      {phase === 'summary' && <SummaryScreen />}
    </main>
  );
}
