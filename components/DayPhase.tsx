import React, { useState, useMemo, useEffect } from 'react';
import { 
  Sun, Moon, History, X, Users, Heart, Eye, Crosshair, Shield, Skull, MicOff, AlertOctagon, Trophy, Gavel, RefreshCw
} from 'lucide-react';
import { Player, RoleType, GameLog } from '../types';
import { ROLE_LABELS, WOLF_FACTION, NEUTRAL_FACTION } from '../constants';
import { getRoleIcon } from './RoleIcon';

interface DayPhaseProps {
  players: Player[];
  logs: GameLog[];
  onUpdatePlayers: (players: Player[]) => void;
  onStartNight: () => void;
}

export const DayPhase: React.FC<DayPhaseProps> = ({ players, logs, onUpdatePlayers, onStartNight }) => {
  const [showLog, setShowLog] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [winCondition, setWinCondition] = useState<{ title: string; description: string; type: 'VILLAGER' | 'WOLF' | 'NEUTRAL' } | null>(null);

  // Check Win Conditions whenever players change
  useEffect(() => {
    const alivePlayers = players.filter(p => p.isAlive);
    const wolves = alivePlayers.filter(p => p.role && WOLF_FACTION.includes(p.role));
    const villagers = alivePlayers.filter(p => !p.role || !WOLF_FACTION.includes(p.role));
    const lovers = alivePlayers.filter(p => p.isLinked);

    // 1. Lovers Win (Priority)
    if (alivePlayers.length === 2 && lovers.length === 2) {
       setWinCondition({ title: 'CẶP ĐÔI CHIẾN THẮNG', description: 'Tình yêu đã chiến thắng tất cả!', type: 'NEUTRAL' });
       return;
    }

    // 2. Tanner Win (Handled in Death Action)
    
    // 3. Wolf Win
    if (wolves.length >= villagers.length && wolves.length > 0) {
      setWinCondition({ title: 'PHE SÓI THẮNG', description: 'Số lượng Sói đã áp đảo Dân Làng.', type: 'WOLF' });
      return;
    }

    // 4. Villager Win
    if (wolves.length === 0 && alivePlayers.length > 0) {
      setWinCondition({ title: 'DÂN LÀNG THẮNG', description: 'Tất cả Sói đã bị tiêu diệt.', type: 'VILLAGER' });
      return;
    }
  }, [players]);

  const handlePlayerAction = (action: 'LYNCH' | 'KILL' | 'REVIVE') => {
    if (!selectedPlayerId) return;

    onUpdatePlayers(players.map(p => {
      if (p.id !== selectedPlayerId) return p;

      if (action === 'REVIVE') {
        return { ...p, isAlive: true, deathReason: undefined };
      }
      
      const deathReason = action === 'LYNCH' ? 'Bị treo cổ' : 'Chết bất đắc kỳ tử';
      
      // Check Special Win Conditions upon Death
      if (action === 'LYNCH' && p.role === RoleType.TANNER) {
         setWinCondition({ title: 'KẺ CHÁN ĐỜI THẮNG', description: 'Kẻ Chán Đời đã bị treo cổ thành công!', type: 'NEUTRAL' });
      }
      
      if (action === 'LYNCH' && p.role === RoleType.FOOL) {
          setWinCondition({ title: 'KẺ NGỐC THẮNG', description: 'Kẻ Ngốc đã bị treo cổ!', type: 'NEUTRAL' });
      }

      return { ...p, isAlive: false, deathReason };
    }));
    
    setSelectedPlayerId(null);
  };
  
  const aliveCount = players.filter(p => p.isAlive).length;

  const nightReport = useMemo(() => {
    if (logs.length === 0) return null;
    const currentNight = logs[0].night;
    const deaths = logs.filter(l => l.night === currentNight && l.type === 'DEATH');
    const damage = logs.filter(l => l.night === currentNight && l.type === 'DAMAGE');
    
    if (deaths.length === 0 && damage.length === 0) return { title: 'Đêm qua bình yên', details: 'Không ai chết.' };
    
    const details = [
        ...deaths.map(d => d.message),
        ...damage.map(d => d.message)
    ].join(' • ');

    return {
      title: `Tổng kết Đêm ${currentNight}`,
      details
    };
  }, [logs]);

  const getFactionStyle = (role: RoleType | null, isAlive: boolean) => {
    if (!isAlive) return 'bg-slate-100 border-slate-200 opacity-60 grayscale';
    if (role && WOLF_FACTION.includes(role)) return 'bg-gradient-to-br from-red-50 to-rose-100 border-red-200 shadow-sm'; 
    if (role && NEUTRAL_FACTION.includes(role)) return 'bg-gradient-to-br from-amber-50 to-orange-100 border-amber-200 shadow-sm'; 
    return 'bg-gradient-to-br from-indigo-50 to-blue-100 border-indigo-200 shadow-sm';
  };

  const getAvatarStyle = (role: RoleType | null, isAlive: boolean) => {
    if (!isAlive) return 'bg-slate-200 text-slate-400';
    if (role && WOLF_FACTION.includes(role)) return 'bg-red-500 text-white shadow-red-200 shadow-md';
    if (role && NEUTRAL_FACTION.includes(role)) return 'bg-amber-500 text-white shadow-amber-200 shadow-md';
    return 'bg-indigo-500 text-white shadow-indigo-200 shadow-md';
  };

  const getFactionLabel = (role: RoleType | null) => {
    if (role && WOLF_FACTION.includes(role)) return { text: 'PHE SÓI', color: 'text-red-500' };
    if (role && NEUTRAL_FACTION.includes(role)) return { text: 'PHE THỨ 3', color: 'text-amber-500' };
    return { text: 'DÂN LÀNG', color: 'text-indigo-500' };
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      {/* Header */}
      <div className="p-6 pb-2 border-b border-slate-200 bg-white/80 backdrop-blur-md z-10 flex flex-col sticky top-0">
        <div className="flex justify-between items-start w-full">
            <div>
               <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-500 flex items-center gap-2">
                 <Sun className="text-orange-400 fill-orange-400" size={32} />
                 Ban Ngày
               </h1>
               <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block mt-1">
                 {aliveCount} Sống / {players.length} Tổng
               </span>
            </div>
            <button onClick={() => setShowLog(true)} className="p-2 bg-white border border-slate-200 rounded-full text-slate-400 hover:text-slate-800 shadow-sm">
               <History size={20} />
            </button>
        </div>

        {nightReport && (
          <div className="mt-4 bg-white/50 rounded-xl p-3 border border-slate-200 animate-in slide-in-from-top-2 shadow-sm">
             <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{nightReport.title}</h3>
             <p className="text-sm font-medium text-slate-700">{nightReport.details}</p>
          </div>
        )}
      </div>

      {/* Grid Layout */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-28">
        <div className="grid grid-cols-2 gap-3">
          {players.map(player => {
            const isAlive = player.isAlive;
            const roleLabel = player.role ? ROLE_LABELS[player.role] : 'Dân Làng';
            const cardStyle = getFactionStyle(player.role, isAlive);
            const avatarStyle = getAvatarStyle(player.role, isAlive);
            const factionInfo = getFactionLabel(player.role);
            
            return (
              <div 
                key={player.id}
                onClick={() => setSelectedPlayerId(player.id)}
                className={`
                  relative flex flex-col p-3 rounded-2xl border transition-all cursor-pointer select-none overflow-hidden
                  ${cardStyle}
                `}
              >
                <div className={`absolute top-3 right-3 w-2.5 h-2.5 rounded-full shadow-sm z-10 ring-2 ring-white ${isAlive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                
                <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
                   {player.isLinked && (
                     <div className="bg-pink-100 p-1 rounded-full text-pink-500 border border-pink-200" title="Cặp đôi">
                        <Heart size={12} className="fill-pink-500" />
                     </div>
                   )}
                   {player.wasSeerChecked && (
                     <div className="bg-blue-100 p-1 rounded-full text-blue-500 border border-blue-200" title="Đã bị soi">
                        <Eye size={12} />
                     </div>
                   )}
                   {player.nightStatus.isSilenced && (
                     <div className="bg-slate-200 p-1 rounded-full text-slate-600 border border-slate-300" title="Bị câm">
                        <MicOff size={12} />
                     </div>
                   )}
                </div>

                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg mb-2 self-center mt-2 ring-2 ring-white
                  ${avatarStyle}
                `}>
                  {getRoleIcon(player.role, 20)}
                </div>
                
                <div className="text-center mb-1">
                  <h3 className={`font-bold text-sm truncate px-1 ${isAlive ? 'text-slate-900' : 'text-slate-500'}`}>{player.name}</h3>
                  <p className={`text-[10px] font-black uppercase tracking-wider ${isAlive ? factionInfo.color : 'text-slate-400'}`}>
                    {factionInfo.text}
                  </p>
                </div>

                {isAlive && player.lives > 0 && (
                  <div className="flex justify-center gap-0.5 mb-2">
                     {Array.from({length: player.lives}).map((_, i) => (
                        <Heart key={i} size={10} className="text-rose-500 fill-rose-500" />
                     ))}
                  </div>
                )}
                
                <div className="flex items-center justify-center gap-1 mt-auto bg-white/60 rounded-lg py-1 mx-2 backdrop-blur-sm">
                   <span className={`text-xs truncate font-medium ${isAlive ? 'text-slate-600' : 'text-slate-400'}`}>
                     {roleLabel}
                   </span>
                   {player.role === RoleType.HUNTER && !isAlive && (
                      <span className="ml-1 text-amber-500 animate-pulse"><Crosshair size={12}/></span>
                   )}
                </div>

                {!isAlive && player.deathReason && (
                   <span className="text-[10px] font-bold text-red-600 bg-red-100 border border-red-200 px-2 py-1 rounded mt-2 text-center w-full">
                     {player.deathReason}
                   </span>
                )}
                {isAlive && player.survivalReason && (
                   <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 border border-emerald-200 px-2 py-1 rounded mt-2 text-center w-full">
                     {player.survivalReason}
                   </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* WIN CONDITION MODAL */}
      {winCondition && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-6 animate-in zoom-in-95 duration-500">
           <div className={`
             relative w-full max-w-sm rounded-3xl p-8 shadow-2xl text-center border-4
             flex flex-col items-center justify-center gap-4 overflow-hidden
             ${winCondition.type === 'WOLF' ? 'bg-red-900 border-red-500 text-red-50' : 
               winCondition.type === 'VILLAGER' ? 'bg-indigo-900 border-indigo-400 text-indigo-50' : 
               'bg-amber-900 border-amber-400 text-amber-50'}
           `}>
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20" />
              
              <div className={`p-4 rounded-full mb-2 ${winCondition.type === 'WOLF' ? 'bg-red-500' : winCondition.type === 'VILLAGER' ? 'bg-indigo-500' : 'bg-amber-500'}`}>
                <Trophy size={48} className="text-white fill-white" />
              </div>

              <h2 className="text-3xl font-black uppercase tracking-tight relative z-10">{winCondition.title}</h2>
              <p className="text-lg font-medium opacity-90 relative z-10">{winCondition.description}</p>
              
              <div className="flex flex-col gap-3 w-full mt-4 relative z-10">
                 <button 
                   onClick={() => setWinCondition(null)} // Dismiss
                   className="w-full py-3 rounded-xl font-bold bg-white/10 hover:bg-white/20 border border-white/20 transition-all"
                 >
                   Tiếp tục chơi (Ignore)
                 </button>
                 <button 
                   onClick={() => window.location.reload()} 
                   className="w-full py-3 rounded-xl font-bold bg-white text-slate-900 hover:scale-105 transition-all shadow-lg"
                 >
                   Về màn hình chính
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* PLAYER ACTION MODAL */}
      {selectedPlayerId && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setSelectedPlayerId(null)}>
           <div className="bg-white border border-slate-200 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden mb-4 sm:mb-0" onClick={e => e.stopPropagation()}>
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                 <h3 className="font-bold text-lg text-slate-800">
                    {players.find(p => p.id === selectedPlayerId)?.name}
                 </h3>
                 <button onClick={() => setSelectedPlayerId(null)} className="p-1 rounded-full hover:bg-slate-200">
                   <X size={20} className="text-slate-500"/>
                 </button>
              </div>
              <div className="p-4 flex flex-col gap-2">
                 {players.find(p => p.id === selectedPlayerId)?.isAlive ? (
                   <>
                     <button 
                       onClick={() => handlePlayerAction('LYNCH')}
                       className="w-full py-3 rounded-xl bg-orange-100 text-orange-700 font-bold border border-orange-200 hover:bg-orange-200 flex items-center justify-center gap-2"
                     >
                       <Gavel size={18}/> Treo cổ (Lynch)
                     </button>
                     <button 
                       onClick={() => handlePlayerAction('KILL')}
                       className="w-full py-3 rounded-xl bg-red-100 text-red-700 font-bold border border-red-200 hover:bg-red-200 flex items-center justify-center gap-2"
                     >
                       <Skull size={18}/> Chết (Khác/Sói cắn)
                     </button>
                   </>
                 ) : (
                   <button 
                       onClick={() => handlePlayerAction('REVIVE')}
                       className="w-full py-3 rounded-xl bg-emerald-100 text-emerald-700 font-bold border border-emerald-200 hover:bg-emerald-200 flex items-center justify-center gap-2"
                     >
                       <RefreshCw size={18}/> Hồi sinh
                     </button>
                 )}
              </div>
           </div>
        </div>
      )}

      {/* History Log Modal */}
      {showLog && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowLog(false)}>
            <div className="bg-white border border-slate-200 w-full max-w-md h-[70vh] rounded-2xl flex flex-col shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
               <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-2xl">
                  <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                    <History size={20} className="text-indigo-500"/> Lịch sử Ván đấu
                  </h3>
                  <button onClick={() => setShowLog(false)} className="text-slate-400 hover:text-slate-800"><X size={24}/></button>
               </div>
               <div className="flex-1 overflow-y-auto p-4 space-y-6">
                  {logs.length === 0 && <p className="text-slate-400 text-center italic mt-10">Chưa có sự kiện nào.</p>}
                  {logs.map((log, i) => (
                     <div key={i} className="flex gap-4 group">
                        <div className="flex flex-col items-center">
                           <div className="w-8 h-8 rounded-full bg-indigo-500 text-white text-sm flex items-center justify-center font-bold shadow-md z-10">
                             {log.night}
                           </div>
                           {i < logs.length - 1 && <div className="w-0.5 h-full bg-slate-200 -my-2 group-last:hidden"></div>}
                        </div>
                        <div className="pb-2 flex-1">
                           <div className={`p-3 rounded-xl border ${
                               log.type === 'DEATH' ? 'bg-red-50 border-red-200' : 
                               log.type === 'DAMAGE' ? 'bg-orange-50 border-orange-200' :
                               'bg-slate-50 border-slate-200'
                            }`}>
                             <p className={`font-bold text-sm ${
                                 log.type === 'DEATH' ? 'text-red-600' : 
                                 log.type === 'DAMAGE' ? 'text-orange-600' :
                                 'text-slate-800'
                             }`}>{log.message}</p>
                             {log.subtext && <p className="text-xs text-slate-500 mt-1">{log.subtext}</p>}
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      )}

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur border-t border-slate-200 max-w-md mx-auto z-20">
        <button
          onClick={onStartNight}
          className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-black py-4 rounded-xl shadow-lg shadow-indigo-200 flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
        >
          <Moon size={22} className="fill-current" />
          Vào Màn Đêm
        </button>
      </div>
    </div>
  );
};