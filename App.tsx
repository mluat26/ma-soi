import React, { useState } from 'react';
import { Player, Phase, RoleType, RoleCounts, GameLog, GameRules } from './types';
import { SetupPhase } from './components/SetupPhase';
import { NightPhase } from './components/NightPhase';
import { DayPhase } from './components/DayPhase';

const App: React.FC = () => {
  const [phase, setPhase] = useState<Phase>(Phase.SETUP);
  const [players, setPlayers] = useState<Player[]>([]);
  // Track active roles present in game
  const [activeRoles, setActiveRoles] = useState<RoleType[]>([]);
  // Track initial configuration counts
  const [roleCounts, setRoleCounts] = useState<RoleCounts>({});
  
  const [nightCount, setNightCount] = useState(1);
  const [logs, setLogs] = useState<GameLog[]>([]);

  // Not used in this version but ready for expansion
  const [rules, setRules] = useState<GameRules | null>(null);

  const handleStartGame = (initialPlayers: Player[], roles: RoleType[], counts: RoleCounts, gameRules: GameRules) => {
    setPlayers(initialPlayers);
    setActiveRoles(roles);
    setRoleCounts(counts);
    setRules(gameRules); // Store rules
    setPhase(Phase.NIGHT);
  };

  const handleUpdatePlayers = (updatedPlayers: Player[]) => {
    setPlayers(updatedPlayers);
  };

  const handleNightEnd = (newLogs: GameLog[]) => {
    setLogs(prev => [...newLogs, ...prev]); // Prepend new logs
    setPhase(Phase.DAY);
  };

  const handleStartNight = () => {
    setNightCount(prev => prev + 1);
    setPhase(Phase.NIGHT);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Main Content Area */}
      <main className="h-screen w-full flex flex-col max-w-md mx-auto relative overflow-hidden shadow-2xl bg-white">
        {phase === Phase.SETUP && (
          <SetupPhase onStartGame={handleStartGame} />
        )}
        
        {phase === Phase.NIGHT && (
          <NightPhase 
            players={players} 
            activeRoles={activeRoles}
            roleCounts={roleCounts}
            nightNumber={nightCount} 
            onUpdatePlayers={handleUpdatePlayers}
            onNightEnd={handleNightEnd}
          />
        )}

        {phase === Phase.DAY && (
          <DayPhase 
            players={players} 
            logs={logs}
            onUpdatePlayers={handleUpdatePlayers}
            onStartNight={handleStartNight}
          />
        )}
      </main>
    </div>
  );
};

export default App;