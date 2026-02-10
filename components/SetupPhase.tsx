import React, { useState, useMemo, useEffect } from 'react';
import { Play, Plus, Minus, Users, Dices, ChevronDown, ChevronUp, X, Wand2, Heart, Edit2, Save } from 'lucide-react';
import { INITIAL_PLAYER_COUNT, ROLES_CONFIG, getSuggestedRoles, ROLE_DETAILS } from '../constants';
import { getRoleIcon } from './RoleIcon';
import { Player, RoleType, RoleCounts, RoleDetail, GameRules, ActionType } from '../types';

interface SetupPhaseProps {
  onStartGame: (players: Player[], activeRoles: RoleType[], roleCounts: RoleCounts, rules: GameRules) => void;
}

const CATEGORY_ORDER = ['WOLF FACTION', 'INFO', 'PROTECTION', 'KILLING', 'CONTROL', 'NEUTRAL'];

const getCategoryStyle = (category: string) => {
  switch (category) {
    case 'WOLF FACTION': return {
      bg: 'bg-red-50',
      border: 'border-red-200',
      titleColor: 'text-red-600',
      label: 'Phe Sói'
    };
    case 'INFO': return {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      titleColor: 'text-blue-600',
      label: 'Thông Tin'
    };
    case 'PROTECTION': return {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      titleColor: 'text-emerald-600',
      label: 'Bảo Vệ'
    };
    case 'KILLING': 
    case 'CONTROL': return {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      titleColor: 'text-purple-600',
      label: 'Chức Năng'
    };
    default: return {
      bg: 'bg-slate-100',
      border: 'border-slate-200',
      titleColor: 'text-slate-600',
      label: 'Phe Thứ 3 / Khác'
    };
  }
};

const ACTION_LABELS: Record<ActionType, string> = {
  [ActionType.NONE]: 'Không có (Thụ động)',
  [ActionType.KILL]: 'Giết / Cắn (Kill)',
  [ActionType.PROTECT]: 'Bảo vệ (Protect)',
  [ActionType.INSPECT]: 'Soi (Seer)',
  [ActionType.HEAL_KILL]: 'Phù Thuỷ (Cứu/Giết)',
  [ActionType.SILENCE]: 'Gây Câm Lặng',
  [ActionType.LINK]: 'Ghép Đôi',
};

export const SetupPhase: React.FC<SetupPhaseProps> = ({ onStartGame }) => {
  const [totalPlayers, setTotalPlayers] = useState(INITIAL_PLAYER_COUNT);
  const [playerNames, setPlayerNames] = useState<string[]>([]);
  const [roleCounts, setRoleCounts] = useState<RoleCounts>(() => getSuggestedRoles(INITIAL_PLAYER_COUNT));
  const [showNames, setShowNames] = useState(false);
  const [selectedRoleDetail, setSelectedRoleDetail] = useState<RoleDetail | null>(null);
  
  // Customization State
  const [customRoles, setCustomRoles] = useState<Record<string, { label: string, ability: string, action: ActionType, cooldown: number, initialLives: number }>>({});
  const [isEditingRole, setIsEditingRole] = useState(false);
  const [editForm, setEditForm] = useState({ label: '', ability: '', action: ActionType.NONE, cooldown: 0, initialLives: 1 });

  // Default Rules
  const [rules, setRules] = useState<GameRules>({
    witchCanSelfSave: true,
    wolvesCanKillWolves: false,
    guardCanProtectSelf: true,
  });

  useEffect(() => {
    setPlayerNames(prev => {
      const newNames = [...prev];
      if (totalPlayers > prev.length) {
        for (let i = prev.length; i < totalPlayers; i++) newNames.push(`Người chơi ${i + 1}`);
      } else {
        newNames.splice(totalPlayers);
      }
      return newNames;
    });
  }, [totalPlayers]);

  const handleTotalChange = (delta: number) => {
    const newTotal = Math.max(5, Math.min(50, totalPlayers + delta));
    setTotalPlayers(newTotal);
  };

  const handleNameChange = (index: number, val: string) => {
    const newNames = [...playerNames];
    newNames[index] = val;
    setPlayerNames(newNames);
  };

  const handleRoleCountChange = (roleId: string, delta: number) => {
    setRoleCounts(prev => {
      const current = prev[roleId] || 0;
      return { ...prev, [roleId]: Math.max(0, current + delta) };
    });
  };

  const applyAutoSuggest = () => {
    setRoleCounts(getSuggestedRoles(totalPlayers));
  };

  const saveCustomRole = () => {
    if (selectedRoleDetail) {
      setCustomRoles(prev => ({
        ...prev,
        [selectedRoleDetail.id]: { 
          label: editForm.label, 
          ability: editForm.ability,
          action: editForm.action,
          cooldown: editForm.cooldown,
          initialLives: editForm.initialLives
        }
      }));
      // Update global config reference
      ROLE_DETAILS[selectedRoleDetail.id].customLabel = editForm.label;
      ROLE_DETAILS[selectedRoleDetail.id].customAbility = editForm.ability;
      ROLE_DETAILS[selectedRoleDetail.id].actionType = editForm.action;
      ROLE_DETAILS[selectedRoleDetail.id].cooldown = editForm.cooldown;
      ROLE_DETAILS[selectedRoleDetail.id].initialLives = editForm.initialLives;

      setIsEditingRole(false);
      setSelectedRoleDetail(null);
    }
  };

  const openRoleDetail = (role: RoleDetail) => {
    const custom = customRoles[role.id];
    setEditForm({
      label: custom?.label || role.label,
      ability: custom?.ability || role.ability,
      action: custom?.action ?? role.actionType,
      cooldown: custom?.cooldown ?? (role.cooldown || 0),
      initialLives: custom?.initialLives ?? (role.initialLives || 1)
    });
    setSelectedRoleDetail(role);
    setIsEditingRole(false);
  };

  const specialRoleCount = useMemo(() => Object.values(roleCounts).reduce((a: number, b: number) => a + b, 0), [roleCounts]);
  const villagerCount = totalPlayers - specialRoleCount;
  const isValid = villagerCount >= 0;

  const handleStart = () => {
    if (!isValid) return;
    const activeRoles: RoleType[] = Object.entries(roleCounts).filter(([_, count]) => (count as number) > 0).map(([id]) => id as RoleType);
    
    const players: Player[] = playerNames.map((name, i) => ({
      id: `p-${Date.now()}-${i}`,
      name: name.trim() || `Người chơi ${i + 1}`,
      role: null, 
      isAlive: true, 
      lives: 1, // Default, will be updated when Role is assigned in NightPhase
      notes: '', 
      roleData: {}, 
      nightStatus: {}
    }));
    onStartGame(players, activeRoles, roleCounts, rules);
  };

  const groupedRoles = useMemo(() => {
    const groups: Record<string, RoleDetail[]> = {};
    ROLES_CONFIG.forEach(role => {
      let cat = role.category;
      if (cat === 'KILLING') cat = 'CONTROL'; 
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(role);
    });
    return groups;
  }, []);

  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-900 relative">
      {/* Header */}
      <div className="p-6 pb-4 bg-white/80 backdrop-blur-sm sticky top-0 z-20 border-b border-slate-200">
        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
          Thiết Lập
        </h1>
        <div className="flex justify-between items-end mt-2">
          <p className="text-slate-500 text-xs max-w-[60%]">
            Chọn số lượng người chơi và phân bổ các vai trò.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-32 space-y-6 pt-4 no-scrollbar">
        
        {/* 1. Player Count Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <label className="text-xs font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-2">
              <Users size={14} /> Số lượng người chơi
            </label>
            <button 
              onClick={applyAutoSuggest}
              className="text-xs bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 font-bold"
            >
              <Dices size={14} /> Gợi ý
            </button>
          </div>
          
          <div className="flex items-center justify-between bg-slate-100 rounded-xl p-2 mb-4">
            <button 
              onClick={() => handleTotalChange(-1)} 
              className="w-12 h-12 flex items-center justify-center bg-white hover:bg-slate-200 rounded-lg text-slate-700 shadow-sm transition-colors"
            >
              <Minus size={20} />
            </button>
            <span className="text-5xl font-thin text-slate-800 font-mono tabular-nums">{totalPlayers}</span>
            <button 
              onClick={() => handleTotalChange(1)} 
              className="w-12 h-12 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-lg shadow-indigo-200 transition-colors"
            >
              <Plus size={20} />
            </button>
          </div>

          <button 
            onClick={() => setShowNames(!showNames)}
            className="w-full text-xs text-slate-500 hover:text-indigo-600 flex items-center justify-center gap-1 py-2 border-t border-slate-100 transition-colors"
          >
            {showNames ? 'Ẩn tên người chơi' : 'Nhập tên người chơi'} 
            {showNames ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>

          {showNames && (
             <div className="grid grid-cols-2 gap-2 mt-3 animate-in fade-in slide-in-from-top-2 duration-200">
               {playerNames.map((name, i) => (
                 <div key={i} className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
                    <span className="text-[10px] text-slate-400 w-5 font-mono">{i+1}.</span>
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => handleNameChange(i, e.target.value)}
                      className="flex-1 bg-transparent border-none text-xs text-slate-800 focus:outline-none placeholder:text-slate-400"
                      placeholder={`Player ${i+1}`}
                    />
                 </div>
               ))}
             </div>
          )}
        </div>

        {/* 2. Roles Configuration */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-1">
             <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Phân bổ vai trò</h2>
             <span className="text-xs font-mono bg-slate-200 px-2 py-1 rounded text-slate-600">
               {specialRoleCount} / {totalPlayers}
             </span>
          </div>

          {CATEGORY_ORDER.map(catKey => {
            let lookupKey = catKey;
            if (catKey === 'KILLING') return null; 
            if (catKey === 'CONTROL') lookupKey = 'CONTROL'; 

            const roles = groupedRoles[lookupKey];
            if (!roles || roles.length === 0) return null;

            const style = getCategoryStyle(catKey);

            return (
              <div key={catKey} className={`rounded-2xl border overflow-hidden ${style.border} ${style.bg}`}>
                <div className="px-4 py-2 flex items-center justify-between border-b border-black/5">
                  <span className={`text-xs font-black uppercase tracking-widest ${style.titleColor}`}>
                    {style.label}
                  </span>
                </div>
                <div className="divide-y divide-slate-200/50">
                  {roles.map(config => {
                    const count = roleCounts[config.id] || 0;
                    const custom = customRoles[config.id];
                    const label = custom ? custom.label : config.label;

                    return (
                      <div key={config.id} className="flex items-center justify-between p-3 hover:bg-white/50 transition-colors group">
                        <div 
                           className="flex flex-col flex-1 cursor-pointer mr-2"
                           onClick={() => openRoleDetail(config)}
                        >
                          <div className="flex items-center gap-2 mb-1">
                             <span className={`${count > 0 ? 'text-indigo-600' : 'text-slate-400'}`}>
                               {getRoleIcon(config.id, 16)}
                             </span>
                             <span className={`font-bold text-sm ${count > 0 ? 'text-slate-900' : 'text-slate-500'}`}>
                               {label}
                             </span>
                             {custom && <span className="text-[10px] text-amber-600 bg-amber-100 px-1 rounded">Sửa</span>}
                             <Edit2 size={12} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <p className="text-[10px] text-slate-500 line-clamp-1 pr-2">{config.description}</p>
                        </div>
                        
                        <div className="flex items-center gap-3 bg-white rounded-lg p-1 border border-slate-200 shadow-sm">
                          <button
                            onClick={() => handleRoleCountChange(config.id, -1)}
                            className={`w-7 h-7 rounded flex items-center justify-center transition-colors ${count === 0 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-500 hover:bg-slate-100'}`}
                            disabled={count === 0}
                          >
                            <Minus size={14} />
                          </button>
                          <span className={`w-4 text-center font-bold text-sm ${count > 0 ? 'text-indigo-600' : 'text-slate-400'}`}>
                            {count}
                          </span>
                          <button
                            onClick={() => handleRoleCountChange(config.id, 1)}
                            className={`w-7 h-7 rounded flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors`}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* 3. Validation Summary */}
        <div className={`
          p-5 rounded-2xl border shadow-sm transition-all duration-300
          ${isValid 
            ? 'bg-emerald-50 border-emerald-200' 
            : 'bg-red-50 border-red-200'}
        `}>
          <div className="flex justify-between items-end">
            <div>
               <p className="text-xs uppercase tracking-widest font-bold opacity-70 mb-1 text-slate-600">
                 Còn lại (Dân làng)
               </p>
               <span className={`text-4xl font-black ${isValid ? 'text-emerald-600' : 'text-red-500'}`}>
                 {villagerCount}
               </span>
            </div>
            <div className="text-right">
               <p className="text-xs text-slate-500">Tổng người chơi: <b className="text-slate-900">{totalPlayers}</b></p>
               <p className="text-xs text-slate-500">Vai trò đặc biệt: <b className="text-slate-900">{specialRoleCount}</b></p>
            </div>
          </div>
          
          {!isValid && (
            <div className="mt-3 pt-3 border-t border-red-200 text-xs text-red-600 font-bold flex items-center gap-2">
               Cần giảm {Math.abs(villagerCount)} vai trò đặc biệt hoặc tăng người chơi.
            </div>
          )}
        </div>
      </div>

      {/* Role Detail Modal (Editing Enabled) */}
      {selectedRoleDetail && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setSelectedRoleDetail(null)}>
           <div className="bg-white border border-slate-200 w-full max-w-sm rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]" onClick={e => e.stopPropagation()}>
             <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-indigo-600 shadow-sm">
                      {getRoleIcon(selectedRoleDetail.id, 24)}
                   </div>
                   <div>
                     <h3 className="font-bold text-lg text-slate-900 leading-none">
                       {isEditingRole ? 'Chỉnh sửa vai trò' : (customRoles[selectedRoleDetail.id]?.label || selectedRoleDetail.label)}
                     </h3>
                     <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">{selectedRoleDetail.category}</span>
                   </div>
                </div>
                <button onClick={() => setSelectedRoleDetail(null)} className="p-2 text-slate-400 hover:text-slate-900 bg-white rounded-full hover:bg-slate-100">
                  <X size={20} />
                </button>
             </div>
             
             <div className="p-6 space-y-4 overflow-y-auto">
                {isEditingRole ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 mb-1 block">Tên hiển thị</label>
                      <input 
                        className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        value={editForm.label}
                        onChange={(e) => setEditForm(prev => ({...prev, label: e.target.value}))}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 mb-1 block">Loại kỹ năng (Action Type)</label>
                      <select 
                        className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        value={editForm.action}
                        onChange={(e) => setEditForm(prev => ({...prev, action: e.target.value as ActionType}))}
                      >
                         {Object.entries(ACTION_LABELS).map(([key, label]) => (
                           <option key={key} value={key}>{label}</option>
                         ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-500 mb-1 block">Cooldown</label>
                        <input 
                          type="number"
                          min="0"
                          className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                          value={editForm.cooldown}
                          onChange={(e) => setEditForm(prev => ({...prev, cooldown: parseInt(e.target.value) || 0}))}
                          placeholder="Số đêm nghỉ"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 mb-1 block">Số mạng (Lives)</label>
                        <input 
                          type="number"
                          min="1"
                          className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                          value={editForm.initialLives}
                          onChange={(e) => setEditForm(prev => ({...prev, initialLives: parseInt(e.target.value) || 1}))}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 mb-1 block">Mô tả kỹ năng</label>
                      <textarea 
                        className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-900 h-24 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        value={editForm.ability}
                        onChange={(e) => setEditForm(prev => ({...prev, ability: e.target.value}))}
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1 block">Nhiệm vụ / Mô tả</label>
                      <p className="text-sm text-slate-700">{selectedRoleDetail.description}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <label className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1 block flex items-center gap-1"><Wand2 size={12}/> Khả năng</label>
                      <p className="text-sm text-slate-700 leading-relaxed">
                        {customRoles[selectedRoleDetail.id]?.ability || selectedRoleDetail.ability}
                      </p>
                      <div className="mt-2 flex gap-2 flex-wrap">
                        <span className="text-[10px] px-2 py-0.5 bg-slate-200 text-slate-600 rounded-full font-bold">
                           {ACTION_LABELS[customRoles[selectedRoleDetail.id]?.action ?? selectedRoleDetail.actionType]}
                        </span>
                        {(customRoles[selectedRoleDetail.id]?.cooldown || selectedRoleDetail.cooldown) ? (
                          <span className="text-[10px] px-2 py-0.5 bg-red-100 text-red-600 rounded-full font-bold">
                             Cooldown: {customRoles[selectedRoleDetail.id]?.cooldown || selectedRoleDetail.cooldown} đêm
                          </span>
                        ) : null}
                         <span className="text-[10px] px-2 py-0.5 bg-rose-100 text-rose-600 rounded-full font-bold flex items-center gap-1">
                             <Heart size={8} fill="currentColor"/> Lives: {customRoles[selectedRoleDetail.id]?.initialLives || selectedRoleDetail.initialLives || 1}
                          </span>
                      </div>
                    </div>
                  </>
                )}
             </div>

             <div className="p-4 border-t border-slate-200 bg-slate-50 flex gap-2">
                {isEditingRole ? (
                   <button onClick={saveCustomRole} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-500 flex items-center justify-center gap-2">
                     <Save size={16}/> Lưu thay đổi
                   </button>
                ) : (
                   <button onClick={() => setIsEditingRole(true)} className="flex-1 py-3 bg-white text-slate-900 border border-slate-300 rounded-xl font-bold hover:bg-slate-100 flex items-center justify-center gap-2">
                     <Edit2 size={16}/> Tùy chỉnh (Personalize)
                   </button>
                )}
             </div>
           </div>
        </div>
      )}

      {/* Footer Action */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-lg border-t border-slate-200 max-w-md mx-auto z-50">
        <button
          onClick={handleStart}
          disabled={!isValid}
          className={`
            w-full font-black py-4 rounded-xl shadow-lg flex items-center justify-center gap-3 text-lg transition-all active:scale-[0.98]
            ${isValid 
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-200' 
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'}
          `}
        >
          <Play size={24} fill="currentColor" />
          BẮT ĐẦU GAME
        </button>
      </div>
    </div>
  );
};