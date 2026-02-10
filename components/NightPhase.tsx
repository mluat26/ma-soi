import React, { useState, useEffect, useMemo } from 'react';
import { 
  Moon, Shield, Skull, Heart, Wand2, Check, ArrowRight, Crosshair, Users, 
  FlaskConical, AlertTriangle, Info, CheckCircle2, Edit3, UserPlus, Settings, X, MicOff
} from 'lucide-react';
import { Player, RoleType, RoleCounts, GameLog, NightStepDef, GameRules, RoleDetail, ActionType } from '../types';
import { getNightSchedule, ROLE_LABELS, WOLF_FACTION, ROLE_DETAILS } from '../constants';
import { getRoleIcon } from './RoleIcon';

interface NightPhaseProps {
  players: Player[];
  activeRoles: RoleType[];
  roleCounts: RoleCounts;
  nightNumber: number;
  onUpdatePlayers: (players: Player[]) => void;
  onNightEnd: (logs: GameLog[]) => void;
}

const getGradient = (role: RoleType | 'DEFAULT') => {
  // Pastel/Light mode colors
  switch (role) {
    case RoleType.WEREWOLF:
    case RoleType.ALPHA_WOLF:
    case RoleType.MYSTIC_WOLF:
    case RoleType.DIRE_WOLF:
    case RoleType.EVIL_MAGE:
      return 'from-red-100 to-rose-200 border-red-300'; 
    case RoleType.SEER:
    case RoleType.AURA_SEER:
      return 'from-blue-100 to-indigo-200 border-blue-300'; 
    case RoleType.GUARD:
    case RoleType.BODYGUARD:
      return 'from-emerald-100 to-teal-200 border-emerald-300'; 
    case RoleType.WITCH:
      return 'from-fuchsia-100 to-purple-200 border-purple-300';
    case RoleType.CUPID:
      return 'from-pink-100 to-rose-200 border-pink-300';
    default:
      return 'from-slate-100 to-gray-200 border-slate-300';
  }
};

export const NightPhase: React.FC<NightPhaseProps> = ({ 
  players, activeRoles, roleCounts, nightNumber, onUpdatePlayers, onNightEnd 
}) => {
  const [tempPlayers, setTempPlayers] = useState<Player[]>(players);
  
  const [completedStepIndices, setCompletedStepIndices] = useState<Set<number>>(new Set());
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [gameRules, setGameRules] = useState<GameRules>({
    witchCanSelfSave: true,
    wolvesCanKillWolves: false,
    guardCanProtectSelf: true,
  });
  
  const [targets, setTargets] = useState<string[]>([]);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showDeckInfo, setShowDeckInfo] = useState(false);

  const nightSchedule = useMemo(() => getNightSchedule(nightNumber, activeRoles), [nightNumber, activeRoles]);
  const currentStep = activeStepIndex !== null ? nightSchedule[activeStepIndex] : null;

  // Cleanup Night Status on New Night
  useEffect(() => {
     if (completedStepIndices.size === 0 && activeStepIndex === null) {
       setTempPlayers(prev => prev.map(p => ({ ...p, nightStatus: {} })));
     }
  }, [nightNumber]);

  const handleOpenStep = (index: number) => {
    const step = nightSchedule[index];
    const roleConfig = ROLE_DETAILS[step.role];

    // Check Cooldown Logic
    const holders = tempPlayers.filter(p => {
      if (p.role === null) return false;
      if (step.includedRoles) return step.includedRoles.includes(p.role);
      return p.role === step.role;
    });

    const cooldown = roleConfig.cooldown || 0;
    // ... cooldown logic (optional to block UI) ...

    setActiveStepIndex(index);
    setTargets([]);

    // Auto-assign logic
    if (holders.length === 0 && !step.includedRoles) {
      setShowAssignmentModal(true);
    } else if (holders.length === 0 && step.includedRoles) {
      setShowAssignmentModal(true); 
    } else {
      setShowAssignmentModal(false);
    }
  };

  const currentRoleHolders = useMemo(() => {
    if (!currentStep) return [];
    return tempPlayers.filter(p => {
      if (p.role === null) return false;
      if (currentStep.includedRoles) return currentStep.includedRoles.includes(p.role);
      return p.role === currentStep.role;
    });
  }, [currentStep, tempPlayers]);

  const isOnCooldown = useMemo(() => {
    if (!currentStep || currentRoleHolders.length === 0) return false;
    const config = ROLE_DETAILS[currentStep.role];
    const cooldown = config.cooldown || 0;
    if (cooldown === 0) return false;
    
    const lastActed = currentRoleHolders[0].roleData.lastActionNight || 0;
    if (lastActed === 0) return false;
    return (nightNumber - lastActed) <= cooldown;
  }, [currentRoleHolders, currentStep, nightNumber]);
  
  const toggleRoleAssignment = (playerId: string) => {
    if (!currentStep) return;
    const requiredCount = currentStep.includedRoles ? 0 : (roleCounts[currentStep.role] || 0);
    const currentCount = tempPlayers.filter(p => {
        if (currentStep.includedRoles) return currentStep.includedRoles.includes(p.role!);
        return p.role === currentStep.role;
    }).length;

    const player = tempPlayers.find(p => p.id === playerId);
    const targetRole = currentStep.role; 
    const isAlreadyAssigned = player?.role === targetRole;

    // Helper: Update lives when role assigned
    const updateRoleAndLives = (p: Player, newRole: RoleType | null) => {
        let lives = p.lives;
        if (newRole) {
            const config = ROLE_DETAILS[newRole];
            if (config.initialLives && config.initialLives > 1) {
                lives = config.initialLives; // Reset lives to role's default if assigning
            }
        }
        return { ...p, role: newRole, lives };
    };

    if (!isAlreadyAssigned && !currentStep.includedRoles && requiredCount > 0) {
      if (currentCount >= requiredCount) {
        if (requiredCount === 1) {
           setTempPlayers(prev => prev.map(p => {
              if (p.role === targetRole) return { ...p, role: null };
              if (p.id === playerId) return updateRoleAndLives(p, targetRole);
              return p;
           }));
           return;
        }
        return; 
      }
    }

    setTempPlayers(prev => prev.map(p => {
      if (p.id !== playerId) return p;
      if (p.role === targetRole) return { ...p, role: null };
      return updateRoleAndLives(p, targetRole);
    }));
  };

  const toggleTarget = (playerId: string) => {
    if (!currentStep || isOnCooldown) return;
    const config = ROLE_DETAILS[currentStep.role];
    const actionType = config.actionType;

    // Rule: Wolves Killing Wolves
    if (actionType === ActionType.KILL && !gameRules.wolvesCanKillWolves && currentStep?.includedRoles?.includes(RoleType.WEREWOLF)) {
       const targetPlayer = tempPlayers.find(p => p.id === playerId);
       if (targetPlayer?.role && WOLF_FACTION.includes(targetPlayer.role)) return;
    }

    setTargets(prev => 
      prev.includes(playerId) ? prev.filter(id => id !== playerId) : [...prev, playerId]
    );
  };

  const applyWitchHeal = (victimId: string, witchId: string) => {
    if (isOnCooldown) return;
    setTempPlayers(prev => prev.map(p => {
      if (p.id === victimId) {
        if (!gameRules.witchCanSelfSave && victimId === witchId) return p;
        return { ...p, nightStatus: { ...p.nightStatus, healedByWitch: !p.nightStatus.healedByWitch } };
      }
      if (p.id === witchId) {
        if (!gameRules.witchCanSelfSave && victimId === witchId) return p;
        // Mark usage (toggle)
        const used = !p.roleData.witchHealUsed;
        return { ...p, roleData: { ...p.roleData, witchHealUsed: used, lastActionNight: used ? nightNumber : 0 } };
      }
      return p;
    }));
  };

  const saveStepAndClose = () => {
    if (!currentStep) return;
    const config = ROLE_DETAILS[currentStep.role];
    const actionType = config.actionType;

    setTempPlayers(prev => prev.map(p => {
      const isHolder = p.role === currentStep.role || (currentStep.includedRoles && currentStep.includedRoles.includes(p.role!));
      if (isHolder && targets.length > 0 && !isOnCooldown) {
          p = { ...p, roleData: { ...p.roleData, lastActionNight: nightNumber } };
      }

      const isTarget = targets.includes(p.id);
      
      let persistentUpdates = {};
      if (isTarget) {
         if (actionType === ActionType.LINK) persistentUpdates = { isLinked: true };
         if (actionType === ActionType.INSPECT) persistentUpdates = { wasSeerChecked: true };
      }

      if (!isTarget) return { ...p, ...persistentUpdates };

      const newStatus = { ...p.nightStatus };
      
      switch (actionType) {
        case ActionType.PROTECT:
          newStatus.protectedByGuard = true;
          break;
        case ActionType.KILL:
          newStatus.targetedByWolves = true; 
          break;
        case ActionType.HEAL_KILL:
          newStatus.poisonedByWitch = true;
          break;
        case ActionType.SILENCE:
          newStatus.isSilenced = true;
          break;
        default:
          break;
      }
      
      return { ...p, nightStatus: newStatus, ...persistentUpdates };
    }));

    if (activeStepIndex !== null) {
      setCompletedStepIndices(prev => new Set(prev).add(activeStepIndex));
    }
    
    setTargets([]);
    setActiveStepIndex(null);
  };

  const finalizeNight = () => {
    const logs: GameLog[] = [];
    const finalPlayers = tempPlayers.map(p => {
      let isDead = false;
      let reason = '';
      let surviveReason = '';
      let remainingLives = p.lives;

      // Death Logic
      // 1. Wolves Attack
      if (p.nightStatus.targetedByWolves) {
        if (p.nightStatus.protectedByGuard) surviveReason = 'Được Bảo Vệ cứu';
        else if (p.nightStatus.healedByWitch) surviveReason = 'Được Phù Thủy cứu';
        else {
          // Check Lives (Elder logic)
          if (remainingLives > 1) {
             remainingLives -= 1;
             surviveReason = 'Bị cắn nhưng còn mạng';
             logs.push({ night: nightNumber, type: 'DAMAGE', message: `${p.name} bị tấn công nhưng còn ${remainingLives} mạng.` });
          } else {
             isDead = true;
             reason = 'Bị Sói cắn';
             logs.push({ night: nightNumber, type: 'DEATH', message: `${p.name} chết do Sói cắn.` });
          }
        }
      }

      // 2. Witch Poison (Usually kills instantly, ignoring armor/lives)
      if (p.nightStatus.poisonedByWitch) {
        isDead = true;
        reason = reason ? `${reason} & Trúng độc` : 'Bị Phù Thủy đầu độc';
        logs.push({ night: nightNumber, type: 'WITCH', message: `${p.name} chết do độc Phù Thủy.` });
      }

      if (p.nightStatus.healedByWitch && !p.nightStatus.targetedByWolves) {
         logs.push({ night: nightNumber, type: 'WITCH', message: `Phù thủy cứu nhầm ${p.name}.` });
      }

      if (p.nightStatus.isSilenced) {
         logs.push({ night: nightNumber, type: 'SILENCE', message: `${p.name} bị câm lặng.` });
      }

      if (isDead) return { ...p, isAlive: false, lives: 0, deathReason: reason };
      else if (surviveReason) return { ...p, lives: remainingLives, survivalReason: surviveReason };
      
      // If nothing happened, return player as is
      return { ...p, lives: remainingLives, survivalReason: undefined };
    });

    if (logs.length === 0) logs.push({ night: nightNumber, type: 'INFO', message: 'Đêm nay bình yên.' });
    
    onUpdatePlayers(finalPlayers);
    onNightEnd(logs);
  };

  const getStepSummary = (step: NightStepDef): string | null => {
    // Simplified summary
    const config = ROLE_DETAILS[step.role];
    if (config.actionType === ActionType.KILL) {
       const hasTarget = tempPlayers.some(p => p.nightStatus.targetedByWolves);
       return hasTarget ? `Đã chọn` : null;
    }
    if (config.actionType === ActionType.HEAL_KILL) {
       const hasAction = tempPlayers.some(p => p.nightStatus.healedByWitch || p.nightStatus.poisonedByWitch);
       return hasAction ? 'Đã dùng' : 'Bỏ qua';
    }
    if (config.actionType === ActionType.PROTECT) {
       return tempPlayers.some(p => p.nightStatus.protectedByGuard) ? 'Đã bảo vệ' : null;
    }
    if (config.actionType === ActionType.SILENCE) {
       return tempPlayers.some(p => p.nightStatus.isSilenced) ? 'Đã câm' : null;
    }
    return null;
  };

  const wolfVictims = tempPlayers.filter(p => p.nightStatus.targetedByWolves);

  // --- RENDER ---

  if (activeStepIndex === null) {
    return (
      <div className="flex flex-col h-full bg-slate-50">
        <div className="p-4 bg-white/80 backdrop-blur-md border-b border-slate-200 flex justify-between items-center sticky top-0 z-10">
          <div className="flex flex-col">
             <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center gap-2">
               <Moon size={18} className="text-purple-600 fill-purple-600" /> Đêm thứ {nightNumber}
             </h1>
          </div>
          <div className="flex gap-2">
             <button onClick={() => setShowSettings(true)} className="p-2 bg-white rounded-lg text-slate-500 hover:text-slate-900 border border-slate-200 shadow-sm">
               <Settings size={18} />
             </button>
             <button onClick={() => setShowDeckInfo(true)} className="p-2 bg-white rounded-lg text-slate-500 hover:text-slate-900 border border-slate-200 shadow-sm">
               <Info size={18} />
             </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 pb-32">
          <div className="grid grid-cols-2 gap-3">
            {nightSchedule.map((step, index) => {
              const isCompleted = completedStepIndices.has(index);
              const summary = isCompleted ? getStepSummary(step) : null;
              const gradientClass = getGradient(step.role);
              const roleDetail = ROLE_DETAILS[step.role];
              const displayLabel = roleDetail?.customLabel || step.label;

              return (
                <button
                  key={index}
                  onClick={() => handleOpenStep(index)}
                  className={`
                    relative group overflow-hidden rounded-xl border transition-all duration-200 text-left
                    flex flex-col h-24 shadow-sm
                    ${isCompleted 
                      ? 'border-green-200 bg-green-50/50' 
                      : 'border-slate-200 bg-white hover:bg-slate-50'}
                  `}
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${gradientClass}`} />
                  
                  <div className="p-3 flex flex-col justify-between h-full w-full">
                    <div className="flex justify-between items-start">
                       <div className={`
                        w-8 h-8 rounded-lg flex items-center justify-center shadow-sm
                        bg-gradient-to-br ${gradientClass}
                      `}>
                        {getRoleIcon(step.role, 16, "text-slate-700")}
                      </div>
                      {isCompleted && <CheckCircle2 size={16} className="text-green-500" />}
                    </div>
                    
                    <div>
                      <span className={`font-bold text-sm block truncate leading-tight ${isCompleted ? 'text-slate-400' : 'text-slate-800'}`}>
                        {displayLabel}
                      </span>
                      {summary && (
                        <span className="text-[10px] font-bold text-green-600 flex items-center gap-1 mt-0.5">
                          <Check size={10} /> {summary}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white/90 backdrop-blur border-t border-slate-200 sticky bottom-0 z-20">
          <button
            onClick={finalizeNight}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-purple-200 flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all"
          >
            <Moon size={20} className="fill-current" /> 
            KẾT THÚC ĐÊM
          </button>
        </div>

        {/* Deck Info & Settings Modals remain roughly same structure but light themed */}
        {showDeckInfo && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-6" onClick={() => setShowDeckInfo(false)}>
              <div className="bg-white border border-slate-200 p-6 rounded-2xl max-w-sm w-full shadow-2xl">
                 <h3 className="font-bold mb-4 text-slate-800 text-lg">Vai trò trong game</h3>
                 <div className="flex flex-wrap gap-2">
                   {activeRoles.map(r => (
                     <span key={r} className="px-3 py-1 bg-slate-100 rounded-full text-xs text-slate-600 border border-slate-200">
                       {ROLE_DETAILS[r]?.customLabel || ROLE_LABELS[r]} ({roleCounts[r]})
                     </span>
                   ))}
                 </div>
              </div>
           </div>
        )}

        {showSettings && (
           <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowSettings(false)}>
              <div className="bg-white border border-slate-200 p-5 rounded-2xl max-w-sm w-full shadow-2xl space-y-4" onClick={e => e.stopPropagation()}>
                 <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2"><Settings size={18}/> Luật chơi</h3>
                    <button onClick={() => setShowSettings(false)}><X size={20} className="text-slate-400"/></button>
                 </div>
                 
                 <div className="space-y-3">
                    <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                       <span className="text-sm font-medium text-slate-700">Phù thủy tự cứu</span>
                       <input 
                          type="checkbox" 
                          checked={gameRules.witchCanSelfSave}
                          onChange={(e) => setGameRules(prev => ({...prev, witchCanSelfSave: e.target.checked}))}
                          className="w-5 h-5 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                       />
                    </label>
                    <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                       <span className="text-sm font-medium text-slate-700">Sói cắn Sói</span>
                       <input 
                          type="checkbox" 
                          checked={gameRules.wolvesCanKillWolves}
                          onChange={(e) => setGameRules(prev => ({...prev, wolvesCanKillWolves: e.target.checked}))}
                          className="w-5 h-5 rounded border-slate-300 text-red-600 focus:ring-red-500"
                       />
                    </label>
                 </div>
              </div>
           </div>
        )}
      </div>
    );
  }

  // 3. ACTION VIEW (TARGETING)
  if (!currentStep) return null;

  const roleDetail = ROLE_DETAILS[currentStep.role];
  const displayLabel = roleDetail?.customLabel || currentStep.label;
  const displayAbility = roleDetail?.customAbility || currentStep.description;
  const actionType = roleDetail.actionType;
  const stepGradient = getGradient(currentStep.role);
  const holderNames = currentRoleHolders.map(p => p.name).join(', ');
  const isWolfAction = actionType === ActionType.KILL; 

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col animate-in slide-in-from-right duration-300">
      
      {/* Header */}
      <div className={`p-4 bg-gradient-to-r ${stepGradient} flex items-center justify-between shadow-sm sticky top-0 z-20`}>
        <div className="flex items-center gap-3">
           <button onClick={() => setActiveStepIndex(null)} className="p-2 -ml-2 text-slate-600 hover:text-slate-900 rounded-full hover:bg-white/50">
             <ArrowRight size={24} className="rotate-180" />
           </button>
           <div className="text-slate-800">
             <h2 className="text-xl font-black flex items-center gap-2">
               {getRoleIcon(currentStep.role, 24)} {displayLabel}
             </h2>
           </div>
        </div>
        <div className="text-xs font-bold text-slate-600 bg-white/50 px-3 py-1 rounded-full backdrop-blur-sm">
          {activeStepIndex + 1}/{nightSchedule.length}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-32 bg-slate-50">
        <div className="bg-white p-4 rounded-xl border border-slate-200 mb-4 shadow-sm">
           <p className="text-sm text-slate-600 italic">"{displayAbility}"</p>
           {isOnCooldown && (
             <div className="mt-2 text-xs font-bold text-red-500 bg-red-50 p-2 rounded flex items-center gap-2">
                <AlertTriangle size={14} /> Kỹ năng đang hồi (Cooldown). Không thể dùng đêm nay.
             </div>
           )}
        </div>

        {/* --- ROLE HOLDER INFO --- */}
        <div className="flex items-center justify-between mb-6 px-1">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Users size={16} />
            <span>Người thực hiện: <strong className="text-slate-900">{holderNames || "Chưa có"}</strong></span>
          </div>
          <button 
            onClick={() => setShowAssignmentModal(true)}
            className="p-2 bg-white rounded-lg text-slate-500 hover:text-slate-900 border border-slate-200 shadow-sm"
          >
            <Edit3 size={16} />
          </button>
        </div>

        {/* --- WITCH DISPLAY --- */}
        {actionType === ActionType.HEAL_KILL && (
           <div className="mb-8">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Skull size={16} className="text-red-500" /> Nạn nhân Sói
              </h3>
              {wolfVictims.length === 0 ? (
                <div className="p-4 bg-white border border-slate-200 rounded-xl text-center text-slate-400 italic">
                  Không ai bị cắn.
                </div>
              ) : (
                wolfVictims.map(v => (
                  <div key={v.id} className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between mb-2">
                     <div>
                       <div className="font-bold text-red-600 text-lg">{v.name}</div>
                       <div className="flex gap-1 mt-1">
                          {v.nightStatus.protectedByGuard && <span className="text-[10px] bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded border border-emerald-200 font-bold">Bảo Vệ Đỡ</span>}
                       </div>
                     </div>
                     {currentRoleHolders.map(w => {
                       const canSave = !w.roleData.witchHealUsed && !v.nightStatus.healedByWitch && (gameRules.witchCanSelfSave || w.id !== v.id);
                       return (
                         <button 
                           key={w.id}
                           onClick={() => applyWitchHeal(v.id, w.id)}
                           disabled={isOnCooldown || (!canSave && !v.nightStatus.healedByWitch)}
                           className={`px-4 py-2 rounded-lg font-bold text-xs shadow-sm transition-all active:scale-95 ${
                             v.nightStatus.healedByWitch 
                               ? 'bg-slate-200 text-slate-500 line-through cursor-not-allowed' 
                               : (canSave && !isOnCooldown ? 'bg-green-600 hover:bg-green-500 text-white shadow-green-200' : 'bg-slate-200 text-slate-400')
                           }`}
                         >
                           {v.nightStatus.healedByWitch ? 'Đã Cứu' : 'Dùng Bình Cứu'}
                         </button>
                       )
                     })}
                  </div>
                ))
              )}
           </div>
        )}

        {/* --- TARGET SELECTION --- */}
        <div>
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Crosshair size={16} /> 
              {isWolfAction ? "Sói thống nhất giết:" : "Chọn Mục Tiêu"}
          </h3>
          <div className="grid grid-cols-2 gap-3">
              {tempPlayers.map(p => {
                const isTarget = targets.includes(p.id);
                const roleLabel = ROLE_DETAILS[p.role!]?.customLabel || (p.role ? ROLE_LABELS[p.role] : '');
                
                const isWolfTarget = p.nightStatus.targetedByWolves;
                const isProtected = p.nightStatus.protectedByGuard;
                const isPoisoned = p.nightStatus.poisonedByWitch;
                const isHealed = p.nightStatus.healedByWitch;
                const isSilenced = p.nightStatus.isSilenced;

                const isTeammateWolf = isWolfAction && p.role && WOLF_FACTION.includes(p.role);
                const canTargetTeammate = gameRules.wolvesCanKillWolves;
                
                const isDisabled = !p.isAlive || isOnCooldown || (isWolfAction && isTeammateWolf && !canTargetTeammate);

                return (
                  <button
                    key={p.id}
                    onClick={() => !isDisabled && toggleTarget(p.id)}
                    disabled={isDisabled as boolean}
                    className={`
                      relative flex flex-col p-3 rounded-xl border-2 transition-all duration-200 overflow-hidden
                      ${isTarget
                        ? `bg-gradient-to-br ${stepGradient} border-white shadow-lg z-10 scale-[1.02]`
                        : 'bg-white border-slate-200 hover:bg-slate-50'}
                      ${isDisabled ? 'opacity-40 grayscale bg-slate-100 cursor-not-allowed' : ''}
                    `}
                  >
                    <div className="flex justify-between items-start w-full mb-1">
                      <span className={`text-sm font-bold truncate w-[85%] ${isTarget ? 'text-slate-900' : 'text-slate-700'}`}>
                        {p.name}
                      </span>
                      {isTarget && <CheckCircle2 size={16} className="text-green-500 drop-shadow-sm" />}
                    </div>

                    <span className={`text-[10px] truncate mb-2 ${isTarget ? 'text-slate-600' : 'text-slate-400'}`}>
                      {roleLabel || '---'}
                    </span>
                    
                    <div className="flex items-center gap-1 mt-auto">
                      {isWolfTarget && <Skull size={14} className="text-red-500 fill-red-500/20" />}
                      {isProtected && <Shield size={14} className="text-emerald-500 fill-emerald-500/20" />}
                      {isPoisoned && <FlaskConical size={14} className="text-purple-500 fill-purple-500/20" />}
                      {isHealed && <Heart size={14} className="text-pink-500 fill-pink-500/20" />}
                      {isSilenced && <MicOff size={14} className="text-slate-500" />}
                    </div>
                  </button>
                );
              })}
          </div>
        </div>
      </div>

      <div className="p-4 bg-white/95 border-t border-slate-200 sticky bottom-0 z-50">
        <button
          onClick={saveStepAndClose}
          disabled={isOnCooldown && targets.length === 0 && actionType !== ActionType.HEAL_KILL}
          className={`w-full bg-gradient-to-r ${stepGradient} text-slate-800 font-black py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-all hover:brightness-105 disabled:opacity-50`}
        >
          {isOnCooldown ? (
             <>
               <ArrowRight size={24} /> BỎ QUA (COOLDOWN)
             </>
          ) : (
             <>
               <CheckCircle2 size={24} /> XÁC NHẬN
             </>
          )}
        </button>
      </div>

      {/* Assignment Modal (Light Mode) */}
      {showAssignmentModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 w-full max-w-sm rounded-2xl shadow-2xl flex flex-col max-h-[85vh]">
            <div className={`p-4 rounded-t-2xl bg-gradient-to-r ${stepGradient}`}>
              <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <UserPlus size={24} />
                Ai là {displayLabel}?
              </h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
               {/* List logic same as before, just styling updates */}
               <div className="grid grid-cols-1 gap-2">
                 {tempPlayers.map(p => {
                   const isAssigned = p.role === currentStep.role;
                   const canAssign = p.role === null || p.role === currentStep.role;
                   const isDisabled = !isAssigned && !canAssign;

                   return (
                     <button
                       key={p.id}
                       onClick={() => canAssign && toggleRoleAssignment(p.id)}
                       disabled={isDisabled}
                       className={`
                         flex items-center justify-between p-3 rounded-xl border transition-all
                         ${isAssigned 
                           ? `bg-slate-100 border-indigo-500 text-indigo-700 shadow-sm ring-1 ring-indigo-500` 
                           : 'bg-white border-slate-200 text-slate-600'}
                         ${isDisabled ? 'opacity-30' : ''}
                       `}
                     >
                        <span className="font-bold text-sm">{p.name}</span>
                        {isAssigned && <CheckCircle2 size={20} className="text-indigo-600" />}
                     </button>
                   )
                 })}
               </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl">
              <button 
                onClick={() => setShowAssignmentModal(false)}
                className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors"
              >
                Xác nhận & Tiếp tục
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};