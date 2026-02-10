import { NightStepDef, RoleType, RoleDetail, ActionType } from './types';

// --- Role Definitions & Labels ---
export const ROLE_LABELS: Record<RoleType, string> = {
  [RoleType.WEREWOLF]: 'Ma Sói',
  [RoleType.ALPHA_WOLF]: 'Sói Trùm (Alpha)',
  [RoleType.MYSTIC_WOLF]: 'Sói Tri (Mystic)',
  [RoleType.EVIL_MAGE]: 'Sói Phù Thủy (Mage)',
  [RoleType.DIRE_WOLF]: 'Sói Độc (Dire)',
  [RoleType.SEER]: 'Tiên Tri',
  [RoleType.AURA_SEER]: 'Tiên Tri Hào Quang',
  [RoleType.APPRENTICE_SEER]: 'Tiên Tri Tập Sự',
  [RoleType.GUARD]: 'Bảo Vệ',
  [RoleType.BODYGUARD]: 'Vệ Sĩ',
  [RoleType.WITCH]: 'Phù Thủy',
  [RoleType.CUPID]: 'Thần Tình Yêu',
  [RoleType.HUNTER]: 'Thợ Săn',
  [RoleType.MAYOR]: 'Thị Trưởng',
  [RoleType.PRINCE]: 'Hoàng Tử',
  [RoleType.ELDER]: 'Trưởng Làng',
  [RoleType.THIEF]: 'Trộm',
  [RoleType.SCAPEGOAT]: 'Già Làng / Vật Tế',
  [RoleType.TANNER]: 'Kẻ Chán Đời',
  [RoleType.FOOL]: 'Kẻ Ngốc',
  [RoleType.VILLAGER]: 'Dân Làng',
};

// Configuration for Setup Screen with Detailed Info
export const ROLE_DETAILS: Record<RoleType, RoleDetail> = {
  // --- WOLF FACTION ---
  [RoleType.WEREWOLF]: {
    id: RoleType.WEREWOLF, label: 'Ma Sói', category: 'WOLF FACTION', default: 2,
    description: 'Thức dậy mỗi đêm để tìm và giết dân làng.',
    ability: 'Mỗi đêm, Ma Sói thức dậy cùng đồng loại và thống nhất chọn một nạn nhân để giết.',
    actionType: ActionType.KILL,
  },
  [RoleType.ALPHA_WOLF]: {
    id: RoleType.ALPHA_WOLF, label: 'Sói Trùm (Alpha)', category: 'WOLF FACTION', default: 0,
    description: 'Là thủ lĩnh bầy sói. Nếu chết, Sói mất lượt cắn đêm đó.',
    ability: 'Có tiếng nói quyết định trong bầy Sói.',
    actionType: ActionType.NONE, 
  },
  [RoleType.MYSTIC_WOLF]: {
    id: RoleType.MYSTIC_WOLF, label: 'Sói Tri (Mystic)', category: 'WOLF FACTION', default: 0,
    description: 'Có khả năng soi vai trò của người chơi khác.',
    ability: 'Mỗi đêm, Sói Tri có thể chọn một người để biết chính xác vai trò của họ.',
    actionType: ActionType.INSPECT,
  },
  [RoleType.EVIL_MAGE]: {
    id: RoleType.EVIL_MAGE, label: 'Sói Phù Thủy', category: 'WOLF FACTION', default: 0,
    description: 'Có thể đầu độc hoặc nguyền rủa nạn nhân.',
    ability: 'Sở hữu khả năng nguyền rủa khiến nạn nhân không thể nói.',
    actionType: ActionType.SILENCE,
  },
  [RoleType.DIRE_WOLF]: {
    id: RoleType.DIRE_WOLF, label: 'Sói Độc (Dire)', category: 'WOLF FACTION', default: 0,
    description: 'Nếu bị giết, kẻ giết nó cũng sẽ chết theo.',
    ability: 'Sói cực mạnh, có lớp da cứng hoặc máu độc.',
    actionType: ActionType.NONE,
  },

  // --- INFO ---
  [RoleType.SEER]: {
    id: RoleType.SEER, label: 'Tiên Tri', category: 'INFO', default: 1,
    description: 'Soi danh tính thực sự của một người mỗi đêm.',
    ability: 'Mỗi đêm, Tiên Tri thức dậy và chọn một người. Quản trò sẽ ra hiệu người đó là Sói hay Dân.',
    actionType: ActionType.INSPECT,
  },
  [RoleType.AURA_SEER]: {
    id: RoleType.AURA_SEER, label: 'Tiên Tri Hào Quang', category: 'INFO', default: 0,
    description: 'Biết được phe của người chơi (Thiện/Ác/Lạ).',
    ability: 'Mỗi đêm soi hào quang của một người để biết họ thuộc phe nào.',
    actionType: ActionType.INSPECT,
  },
  [RoleType.APPRENTICE_SEER]: {
    id: RoleType.APPRENTICE_SEER, label: 'Tiên Tri Tập Sự', category: 'INFO', default: 0,
    description: 'Trở thành Tiên Tri nếu Tiên Tri thật chết.',
    ability: 'Ban đầu chỉ là dân thường.',
    actionType: ActionType.NONE,
  },

  // --- PROTECTION ---
  [RoleType.GUARD]: {
    id: RoleType.GUARD, label: 'Bảo Vệ', category: 'PROTECTION', default: 1,
    description: 'Bảo vệ một người khỏi bị Sói cắn mỗi đêm.',
    ability: 'Mỗi đêm chọn một người để bảo vệ.',
    actionType: ActionType.PROTECT,
  },
  [RoleType.BODYGUARD]: {
    id: RoleType.BODYGUARD, label: 'Vệ Sĩ', category: 'PROTECTION', default: 0,
    description: 'Hy sinh thân mình để cứu người được bảo vệ.',
    ability: 'Chọn một người bảo vệ. Nếu người đó bị tấn công, Vệ Sĩ sẽ chết thay.',
    actionType: ActionType.PROTECT,
  },

  // --- KILLING / CONTROL ---
  [RoleType.WITCH]: {
    id: RoleType.WITCH, label: 'Phù Thủy', category: 'KILLING', default: 1,
    description: 'Có 2 bình thuốc: 1 Cứu và 1 Giết.',
    ability: 'Mỗi đêm được gọi dậy và biết ai bị Sói cắn. Dùng bình Cứu hoặc Độc.',
    actionType: ActionType.HEAL_KILL,
  },
  [RoleType.HUNTER]: {
    id: RoleType.HUNTER, label: 'Thợ Săn', category: 'CONTROL', default: 0,
    description: 'Khi chết, được kéo theo một người khác.',
    ability: 'Nếu Thợ Săn chết, có thể bắn súng và chọn một người chơi khác chết cùng.',
    actionType: ActionType.NONE,
  },
  [RoleType.MAYOR]: {
    id: RoleType.MAYOR, label: 'Thị Trưởng', category: 'CONTROL', default: 0,
    description: 'Phiếu bầu tính là 2 điểm.',
    ability: 'Khi biểu quyết treo cổ, phiếu có giá trị gấp đôi.',
    actionType: ActionType.NONE,
  },
  [RoleType.PRINCE]: {
    id: RoleType.PRINCE, label: 'Hoàng Tử', category: 'CONTROL', default: 0,
    description: 'Không thể bị treo cổ.',
    ability: 'Nếu bị treo cổ, Hoàng Tử sẽ lật bài và được tha chết.',
    actionType: ActionType.NONE,
  },
  [RoleType.ELDER]: {
    id: RoleType.ELDER, label: 'Trưởng Làng', category: 'CONTROL', default: 0,
    description: 'Có 2 mạng. Chịu được 1 vết cắn của Sói.',
    ability: 'Chịu được 1 vết cắn của Sói. Mất mạng nếu bị cắn lần 2 hoặc bị Phù Thủy đầu độc.',
    actionType: ActionType.NONE,
    initialLives: 2,
  },

  // --- NEUTRAL ---
  [RoleType.CUPID]: {
    id: RoleType.CUPID, label: 'Thần Tình Yêu', category: 'NEUTRAL', default: 0,
    description: 'Ghép đôi 2 người chơi yêu nhau.',
    ability: 'Đêm đầu tiên, chọn 2 người làm Cặp Đôi.',
    actionType: ActionType.LINK,
  },
  [RoleType.THIEF]: {
    id: RoleType.THIEF, label: 'Trộm', category: 'NEUTRAL', default: 0,
    description: 'Được chọn vai trò từ các lá bài thừa.',
    ability: 'Đêm đầu tiên được chọn bài.',
    actionType: ActionType.NONE,
  },
  [RoleType.TANNER]: {
    id: RoleType.TANNER, label: 'Kẻ Chán Đời', category: 'NEUTRAL', default: 0,
    description: 'Mục tiêu là BỊ TREO CỔ.',
    ability: 'Thắng nếu bị treo cổ.',
    actionType: ActionType.NONE,
  },
  [RoleType.FOOL]: {
    id: RoleType.FOOL, label: 'Kẻ Ngốc', category: 'NEUTRAL', default: 0,
    description: 'Dân thường nhưng ngây thơ.',
    ability: 'Không chết khi bị treo cổ nhưng mất quyền bầu.',
    actionType: ActionType.NONE,
  },
  [RoleType.SCAPEGOAT]: {
    id: RoleType.SCAPEGOAT, label: 'Vật Tế', category: 'NEUTRAL', default: 0,
    description: 'Chết thay nếu kết quả bỏ phiếu hòa.',
    ability: 'Chết thay khi hòa phiếu.',
    actionType: ActionType.NONE,
  },
  [RoleType.VILLAGER]: {
    id: RoleType.VILLAGER, label: 'Dân Làng', category: 'NEUTRAL', default: 0,
    description: 'Tìm ra Sói và treo cổ chúng.',
    ability: 'Không có chức năng đặc biệt.',
    actionType: ActionType.NONE,
  }
};

// Flatten to Array for Setup Phase Logic
export const ROLES_CONFIG = Object.values(ROLE_DETAILS);

export const INITIAL_PLAYER_COUNT = 10;

export const WOLF_FACTION = [RoleType.WEREWOLF, RoleType.ALPHA_WOLF, RoleType.MYSTIC_WOLF, RoleType.EVIL_MAGE, RoleType.DIRE_WOLF];
export const NEUTRAL_FACTION = [RoleType.CUPID, RoleType.THIEF, RoleType.SCAPEGOAT, RoleType.TANNER, RoleType.FOOL];

// --- Night Steps Definitions ---

const STEPS: Record<string, NightStepDef> = {
  THIEF: {
    role: RoleType.THIEF, label: 'Trộm (Thief)', description: 'Gọi Trộm dậy. Trộm chọn đổi bài hoặc giữ nguyên.',
  },
  CUPID: {
    role: RoleType.CUPID, label: 'Thần Tình Yêu', description: 'Gọi Cupid dậy. Chọn hai người để ghép đôi.',
  },
  WEREWOLF_ACTION: {
    role: RoleType.WEREWOLF, includedRoles: WOLF_FACTION, label: 'Hội Ma Sói', description: 'Tất cả Sói dậy thống nhất giết một người.',
  },
  WITCH: {
    role: RoleType.WITCH, label: 'Phù Thủy', description: 'Gọi Phù Thủy dậy. Dùng thuốc Cứu/Giết?',
  },
  GUARD: {
    role: RoleType.GUARD, label: 'Bảo Vệ', description: 'Gọi Bảo Vệ dậy. Chọn một người để bảo vệ.',
  },
  BODYGUARD: {
    role: RoleType.BODYGUARD, label: 'Vệ Sĩ', description: 'Gọi Vệ Sĩ dậy. Chọn người bảo vệ.',
  },
  SEER: {
    role: RoleType.SEER, label: 'Tiên Tri', description: 'Gọi Tiên Tri dậy. Soi một người.',
  },
  AURA_SEER: {
    role: RoleType.AURA_SEER, label: 'Tiên Tri Hào Quang', description: 'Gọi Aura Seer dậy. Soi phe của một người.',
  },
  
  // Discovery Steps
  HUNTER_DISCOVERY: { role: RoleType.HUNTER, label: 'Thợ Săn (Nhận diện)', description: 'Gọi Thợ Săn dậy.' },
  MAYOR_DISCOVERY: { role: RoleType.MAYOR, label: 'Thị Trưởng (Nhận diện)', description: 'Gọi Thị Trưởng dậy.' },
  PRINCE_DISCOVERY: { role: RoleType.PRINCE, label: 'Hoàng Tử (Nhận diện)', description: 'Gọi Hoàng Tử dậy.' },
  ELDER_DISCOVERY: { role: RoleType.ELDER, label: 'Trưởng Làng (Nhận diện)', description: 'Gọi Trưởng Làng dậy.' },
  TANNER_DISCOVERY: { role: RoleType.TANNER, label: 'Kẻ Chán Đời (Nhận diện)', description: 'Gọi Kẻ Chán Đời dậy.' },
  FOOL_DISCOVERY: { role: RoleType.FOOL, label: 'Kẻ Ngốc (Nhận diện)', description: 'Gọi Kẻ Ngốc dậy.' },
  ALPHA_DISCOVERY: { role: RoleType.ALPHA_WOLF, label: 'Sói Trùm (Alpha)', description: 'Sói Trùm giơ tay.' },
  MYSTIC_WOLF_ACTION: { role: RoleType.MYSTIC_WOLF, label: 'Sói Tri (Mystic)', description: 'Sói Tri dậy soi/nhận diện.' },
  EVIL_MAGE_ACTION: { role: RoleType.EVIL_MAGE, label: 'Sói Phù Thủy', description: 'Sói Phù Thủy dậy dùng phép.' },
};

export const getNightSchedule = (night: number, activeRoles: RoleType[] = []): NightStepDef[] => {
  const schedule: NightStepDef[] = [];
  const has = (role: RoleType) => activeRoles.includes(role);

  if (night === 1) {
    if (has(RoleType.THIEF)) schedule.push(STEPS.THIEF);
    if (has(RoleType.CUPID)) schedule.push(STEPS.CUPID);
    if (activeRoles.some(r => WOLF_FACTION.includes(r))) {
      schedule.push(STEPS.WEREWOLF_ACTION);
      if (has(RoleType.ALPHA_WOLF)) schedule.push(STEPS.ALPHA_DISCOVERY);
      if (has(RoleType.MYSTIC_WOLF)) schedule.push(STEPS.MYSTIC_WOLF_ACTION);
      if (has(RoleType.EVIL_MAGE)) schedule.push(STEPS.EVIL_MAGE_ACTION);
    }
    if (has(RoleType.WITCH)) schedule.push(STEPS.WITCH);
    if (has(RoleType.GUARD)) schedule.push(STEPS.GUARD);
    if (has(RoleType.BODYGUARD)) schedule.push(STEPS.BODYGUARD);
    if (has(RoleType.SEER)) schedule.push(STEPS.SEER);
    if (has(RoleType.AURA_SEER)) schedule.push(STEPS.AURA_SEER);

    // Others
    [RoleType.HUNTER, RoleType.MAYOR, RoleType.PRINCE, RoleType.ELDER, RoleType.TANNER, RoleType.FOOL].forEach(r => {
      if (has(r)) schedule.push({ ...STEPS[`${r}_DISCOVERY`], role: r });
    });

  } else {
    // NIGHT 2+
    if (activeRoles.some(r => WOLF_FACTION.includes(r))) {
      schedule.push(STEPS.WEREWOLF_ACTION);
      if (has(RoleType.MYSTIC_WOLF)) schedule.push(STEPS.MYSTIC_WOLF_ACTION);
      if (has(RoleType.EVIL_MAGE)) schedule.push(STEPS.EVIL_MAGE_ACTION);
    }
    if (has(RoleType.WITCH)) schedule.push(STEPS.WITCH);
    if (has(RoleType.GUARD)) schedule.push(STEPS.GUARD);
    if (has(RoleType.BODYGUARD)) schedule.push(STEPS.BODYGUARD);
    if (has(RoleType.SEER)) schedule.push(STEPS.SEER);
    if (has(RoleType.AURA_SEER)) schedule.push(STEPS.AURA_SEER);
  }

  return schedule;
};

export const getSuggestedRoles = (count: number): Record<string, number> => {
  const defaults: Record<string, number> = {};
  defaults[RoleType.SEER] = 1;
  defaults[RoleType.WEREWOLF] = Math.max(1, Math.floor(count / 4));
  if (count >= 7) defaults[RoleType.GUARD] = 1;
  if (count >= 8) defaults[RoleType.HUNTER] = 1;
  if (count >= 9) defaults[RoleType.WITCH] = 1;
  if (count >= 12) {
    defaults[RoleType.WEREWOLF] += 1; 
    defaults[RoleType.CUPID] = 1;
  }
  return defaults;
};