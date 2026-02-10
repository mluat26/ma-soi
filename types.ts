export enum Phase {
  SETUP = 'SETUP',
  NIGHT = 'NIGHT',
  DAY = 'DAY',
}

export enum RoleType {
  // Werewolf Faction
  WEREWOLF = 'WEREWOLF',
  ALPHA_WOLF = 'ALPHA_WOLF',       // Sói Trùm
  MYSTIC_WOLF = 'MYSTIC_WOLF',     // Sói Tri
  EVIL_MAGE = 'EVIL_MAGE',         // Ma Sói Phù Thủy
  DIRE_WOLF = 'DIRE_WOLF',         // Sói Độc / Sói Giết Mạnh

  // Village Faction - Info
  SEER = 'SEER',
  AURA_SEER = 'AURA_SEER',
  APPRENTICE_SEER = 'APPRENTICE_SEER', // Tiên Tri Tập Sự

  // Village Faction - Protection
  GUARD = 'GUARD',
  BODYGUARD = 'BODYGUARD',         // Vệ Sĩ

  // Village Faction - Killing/Control
  WITCH = 'WITCH',
  HUNTER = 'HUNTER',
  MAYOR = 'MAYOR',                 // Thị Trưởng
  PRINCE = 'PRINCE',               // Hoàng Tử
  ELDER = 'ELDER',                 // Trưởng Làng

  // Neutral / Special
  CUPID = 'CUPID',
  THIEF = 'THIEF',
  SCAPEGOAT = 'SCAPEGOAT',
  TANNER = 'TANNER',               // Kẻ Chán Đời
  FOOL = 'FOOL',                   // Kẻ Ngốc
  VILLAGER = 'VILLAGER',
}

export enum ActionType {
  NONE = 'NONE',
  KILL = 'KILL',           // Mark for death (Wolf style)
  PROTECT = 'PROTECT',     // Protect from death
  INSPECT = 'INSPECT',     // Seer check
  HEAL_KILL = 'HEAL_KILL', // Witch interface
  SILENCE = 'SILENCE',     // Prevent speaking next day
  LINK = 'LINK',           // Cupid link
}

export interface PlayerRoleData {
  witchHealUsed?: boolean;
  witchPoisonUsed?: boolean;
  hunterRevengeTargetId?: string; 
  lastActionNight?: number; // Track for cooldowns
  [key: string]: any;
}

export interface NightStatus {
  protectedByGuard?: boolean;
  targetedByWolves?: boolean; // Or Generic Kill
  poisonedByWitch?: boolean;
  healedByWitch?: boolean;
  isSilenced?: boolean; // New status
}

export interface Player {
  id: string;
  name: string;
  role: RoleType | null; 
  isAlive: boolean;
  lives: number; // Current lives
  notes: string;
  roleData: PlayerRoleData;
  // Transient state for the current night
  nightStatus: NightStatus;
  // Persistent attributes
  isLinked?: boolean;      // For Cupid's couple
  wasSeerChecked?: boolean; // For Seer tracking
  // If dead
  deathReason?: string;
  // If alive but targeted
  survivalReason?: string;
}

export interface NightStepDef {
  role: RoleType; 
  label: string;
  description: string;
  firstNightOnly?: boolean;
  includedRoles?: RoleType[]; 
}

export interface GameLog {
  night: number;
  message: string;
  subtext?: string;
  type: 'DEATH' | 'INFO' | 'PROTECT' | 'WITCH' | 'SILENCE' | 'DAMAGE';
}

export interface RoleDetail {
  id: RoleType;
  label: string;
  category: string;
  description: string; 
  ability: string;     
  special?: string;    
  default: number;
  // Personalization
  customLabel?: string;
  customAbility?: string;
  // Functional Customization
  actionType: ActionType; 
  cooldown?: number; // Nights to skip between uses
  initialLives?: number; // Default lives (e.g. Elder = 2)
}

export type RoleCounts = Record<string, number>;

export interface GameRules {
  witchCanSelfSave: boolean;
  wolvesCanKillWolves: boolean;
  guardCanProtectSelf: boolean;
}