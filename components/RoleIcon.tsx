import React from 'react';
import { 
  Eye, Shield, Wand2, Crosshair, Heart, Skull, Moon, 
  Sparkles, Crown, Search, FlaskConical, AlertTriangle, 
  Footprints, Ghost, User, Scale, Meh, HelpCircle
} from 'lucide-react';
import { RoleType } from '../types';

export const getRoleIcon = (roleId: RoleType | null, size = 18, className = "") => {
  const props = { size, className };
  switch (roleId) {
    // Village - Info
    case RoleType.SEER: return <Eye {...props} />;
    case RoleType.AURA_SEER: return <Sparkles {...props} />;
    case RoleType.APPRENTICE_SEER: return <Search {...props} />;
    
    // Village - Protection
    case RoleType.GUARD: return <Shield {...props} />;
    case RoleType.BODYGUARD: return <Shield {...props} />;
    
    // Village - Power
    case RoleType.WITCH: return <Wand2 {...props} />;
    case RoleType.HUNTER: return <Crosshair {...props} />;
    case RoleType.MAYOR: return <Scale {...props} />;
    case RoleType.PRINCE: return <Crown {...props} />;
    case RoleType.ELDER: return <Shield {...props} />; 
    
    // Wolf Faction
    case RoleType.WEREWOLF: return <Skull {...props} />;
    case RoleType.ALPHA_WOLF: return <Crown {...props} />;
    case RoleType.MYSTIC_WOLF: return <Eye {...props} />;
    case RoleType.EVIL_MAGE: return <FlaskConical {...props} />;
    case RoleType.DIRE_WOLF: return <AlertTriangle {...props} />;
    
    // Neutral
    case RoleType.CUPID: return <Heart {...props} />;
    case RoleType.THIEF: return <Footprints {...props} />;
    case RoleType.TANNER: return <Ghost {...props} />;
    case RoleType.FOOL: return <Meh {...props} />;
    case RoleType.SCAPEGOAT: return <HelpCircle {...props} />;
    
    case RoleType.VILLAGER: return <User {...props} />;
    default: return <Moon {...props} />;
  }
};