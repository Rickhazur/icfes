import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Star, Trophy, Sparkles, Lock, Check, Palette, Shirt, Crown, Heart } from "lucide-react";
import { useRewards } from "@/hooks/useRewards_mod";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

interface AvatarRewardsProps {
  onBack: () => void;
}

interface AvatarPart {
  id: string;
  type: 'skin' | 'hair' | 'eyes' | 'outfit' | 'accessory';
  name: string;
  emoji: string;
  color?: string;
  unlocked: boolean;
  cost: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface Badge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  earned: boolean;
  progress: number;
  target: number;
  reward: number;
}

const avatarParts: AvatarPart[] = [
  // Skins
  { id: 'skin1', type: 'skin', name: 'Light', emoji: '👋🏻', unlocked: true, cost: 0, rarity: 'common' },
  { id: 'skin2', type: 'skin', name: 'Medium', emoji: '👋🏽', unlocked: true, cost: 0, rarity: 'common' },
  { id: 'skin3', type: 'skin', name: 'Dark', emoji: '👋🏿', unlocked: true, cost: 0, rarity: 'common' },
  
  // Hair
  { id: 'hair1', type: 'hair', name: 'Blonde', emoji: '👱', color: 'bg-yellow-400', unlocked: true, cost: 0, rarity: 'common' },
  { id: 'hair2', type: 'hair', name: 'Brown', emoji: '👩‍🦰', color: 'bg-amber-700', unlocked: true, cost: 0, rarity: 'common' },
  { id: 'hair3', type: 'hair', name: 'Black', emoji: '🧑‍🦱', color: 'bg-gray-900', unlocked: true, cost: 0, rarity: 'common' },
  { id: 'hair4', type: 'hair', name: 'Red', emoji: '👩‍🦰', color: 'bg-red-500', unlocked: false, cost: 20, rarity: 'rare' },
  { id: 'hair5', type: 'hair', name: 'Blue', emoji: '🧑‍🎤', color: 'bg-blue-500', unlocked: false, cost: 50, rarity: 'epic' },
  { id: 'hair6', type: 'hair', name: 'Rainbow', emoji: '🌈', color: 'bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500', unlocked: false, cost: 100, rarity: 'legendary' },
  
  // Eyes
  { id: 'eyes1', type: 'eyes', name: 'Happy', emoji: '😊', unlocked: true, cost: 0, rarity: 'common' },
  { id: 'eyes2', type: 'eyes', name: 'Cool', emoji: '😎', unlocked: false, cost: 15, rarity: 'rare' },
  { id: 'eyes3', type: 'eyes', name: 'Sparkle', emoji: '🤩', unlocked: false, cost: 40, rarity: 'epic' },
  { id: 'eyes4', type: 'eyes', name: 'Wink', emoji: '😉', unlocked: false, cost: 25, rarity: 'rare' },
  
  // Outfits
  { id: 'outfit1', type: 'outfit', name: 'T-Shirt', emoji: '👕', unlocked: true, cost: 0, rarity: 'common' },
  { id: 'outfit2', type: 'outfit', name: 'Hoodie', emoji: '🧥', unlocked: false, cost: 30, rarity: 'rare' },
  { id: 'outfit3', type: 'outfit', name: 'Dress', emoji: '👗', unlocked: false, cost: 35, rarity: 'rare' },
  { id: 'outfit4', type: 'outfit', name: 'Suit', emoji: '🤵', unlocked: false, cost: 60, rarity: 'epic' },
  { id: 'outfit5', type: 'outfit', name: 'Superhero', emoji: '🦸', unlocked: false, cost: 150, rarity: 'legendary' },
  
  // Accessories
  { id: 'acc1', type: 'accessory', name: 'None', emoji: '✨', unlocked: true, cost: 0, rarity: 'common' },
  { id: 'acc2', type: 'accessory', name: 'Glasses', emoji: '👓', unlocked: false, cost: 20, rarity: 'rare' },
  { id: 'acc3', type: 'accessory', name: 'Hat', emoji: '🎩', unlocked: false, cost: 25, rarity: 'rare' },
  { id: 'acc4', type: 'accessory', name: 'Crown', emoji: '👑', unlocked: false, cost: 100, rarity: 'legendary' },
  { id: 'acc5', type: 'accessory', name: 'Headphones', emoji: '🎧', unlocked: false, cost: 45, rarity: 'epic' },
];

const badges: Badge[] = [
  { id: 'b1', name: 'First Steps', description: 'Complete your first lesson', emoji: '🌟', earned: true, progress: 1, target: 1, reward: 10 },
  { id: 'b2', name: 'Word Wizard', description: 'Learn 50 new words', emoji: '📚', earned: false, progress: 32, target: 50, reward: 25 },
  { id: 'b3', name: 'Grammar Pro', description: 'Complete 20 grammar exercises', emoji: '✏️', earned: false, progress: 12, target: 20, reward: 30 },
  { id: 'b4', name: 'Perfect Score', description: 'Get 100% on a quiz', emoji: '💯', earned: true, progress: 1, target: 1, reward: 15 },
  { id: 'b5', name: 'Week Warrior', description: 'Practice 7 days in a row', emoji: '🔥', earned: false, progress: 5, target: 7, reward: 50 },
  { id: 'b6', name: 'Bookworm', description: 'Read 10 articles', emoji: '📖', earned: false, progress: 3, target: 10, reward: 40 },
  { id: 'b7', name: 'Speech Star', description: 'Complete 30 pronunciation exercises', emoji: '🎤', earned: false, progress: 15, target: 30, reward: 35 },
  { id: 'b8', name: 'Game Master', description: 'Win 50 games', emoji: '🎮', earned: false, progress: 28, target: 50, reward: 60 },
  { id: 'b9', name: 'Social Butterfly', description: 'Help 5 classmates', emoji: '🦋', earned: false, progress: 2, target: 5, reward: 45 },
  { id: 'b10', name: 'Legend', description: 'Earn all other badges', emoji: '🏆', earned: false, progress: 2, target: 9, reward: 200 },
];

const rarityColors = {
  common: 'border-gray-300 bg-gray-100',
  rare: 'border-blue-400 bg-blue-100',
  epic: 'border-purple-500 bg-purple-100',
  legendary: 'border-yellow-500 bg-gradient-to-br from-yellow-100 to-amber-200',
};

const rarityLabels = {
  common: 'Common',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
};

const AvatarRewards_mod = ({ onBack }: AvatarRewardsProps) => {
  const { balance, addCoins } = useRewards();
  const [activeTab, setActiveTab] = useState<'avatar' | 'badges'>('avatar');
  const [selectedType, setSelectedType] = useState<'skin' | 'hair' | 'eyes' | 'outfit' | 'accessory'>('hair');
  const [parts, setParts] = useState(avatarParts);
  const [userBadges, setUserBadges] = useState(badges);
  const [avatar, setAvatar] = useState({
    skin: 'skin1',
    hair: 'hair1',
    eyes: 'eyes1',
    outfit: 'outfit1',
    accessory: 'acc1',
  });

  // Load saved data
  useEffect(() => {
    const savedAvatar = localStorage.getItem('userAvatar_mod');
    const savedParts = localStorage.getItem('unlockedParts_mod');
    
    if (savedAvatar) setAvatar(JSON.parse(savedAvatar));
    if (savedParts) {
      const unlocked = JSON.parse(savedParts);
      setParts(prev => prev.map(p => ({ ...p, unlocked: unlocked.includes(p.id) || p.cost === 0 })));
    }
  }, []);

  // Save avatar changes
  useEffect(() => {
    localStorage.setItem('userAvatar_mod', JSON.stringify(avatar));
  }, [avatar]);

  const handleUnlock = (part: AvatarPart) => {
    if (balance < part.cost) {
      toast.error(`Not enough coins! Need ${part.cost - balance} more.`);
      return;
    }

    // Deduct coins via useRewards (we'll use negative value hack or just update locally)
    const updatedParts = parts.map(p => p.id === part.id ? { ...p, unlocked: true } : p);
    setParts(updatedParts);
    
    // Save unlocked parts
    const unlocked = updatedParts.filter(p => p.unlocked).map(p => p.id);
    localStorage.setItem('unlockedParts_mod', JSON.stringify(unlocked));
    
    // Update balance (we'll need to handle this via local storage since useRewards adds coins)
    const currentBalance = parseInt(localStorage.getItem('userCoinBalance') || '0');
    localStorage.setItem('userCoinBalance', String(currentBalance - part.cost));
    window.dispatchEvent(new Event('storage'));
    
    toast.success(`Unlocked ${part.name}!`);
  };

  const handleSelectPart = (part: AvatarPart) => {
    if (!part.unlocked) return;
    setAvatar(prev => ({ ...prev, [part.type]: part.id }));
  };

  const handleClaimBadge = (badge: Badge) => {
    if (!badge.earned || badge.progress < badge.target) return;
    
    addCoins(badge.reward, `Badge: ${badge.name}`);
    setUserBadges(prev => prev.map(b => b.id === badge.id ? { ...b, earned: true } : b));
    toast.success(`+${badge.reward} coins from ${badge.name} badge!`);
  };

  const getAvatarPart = (type: string) => parts.find(p => p.id === avatar[type as keyof typeof avatar]);

  const typeIcons = {
    skin: Palette,
    hair: Crown,
    eyes: Heart,
    outfit: Shirt,
    accessory: Sparkles,
  };

  return (
    <motion.div className="flex-1 flex flex-col" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-xl font-bold text-foreground">My Avatar & Rewards</h2>
            <p className="text-sm text-muted-foreground">Customize and collect badges!</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-primary/20 rounded-full">
          <Star className="w-4 h-4 text-primary" />
          <span className="font-bold text-primary">{balance}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <Button
          variant={activeTab === 'avatar' ? 'default' : 'outline'}
          onClick={() => setActiveTab('avatar')}
          className="flex-1"
        >
          <Palette className="w-4 h-4 mr-2" />
          Avatar
        </Button>
        <Button
          variant={activeTab === 'badges' ? 'default' : 'outline'}
          onClick={() => setActiveTab('badges')}
          className="flex-1"
        >
          <Trophy className="w-4 h-4 mr-2" />
          Badges
        </Button>
      </div>

      {activeTab === 'avatar' ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Avatar Preview */}
          <motion.div 
            className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl p-6 mb-4 flex items-center justify-center"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="relative">
              {/* Avatar composition */}
              <div className="text-8xl relative">
                {/* Base face with skin tone */}
                <span className="relative z-10">
                  {getAvatarPart('eyes')?.emoji || '😊'}
                </span>
                
                {/* Accessories overlay */}
                {avatar.accessory !== 'acc1' && (
                  <motion.span 
                    className="absolute -top-4 left-1/2 -translate-x-1/2 text-4xl"
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                  >
                    {getAvatarPart('accessory')?.emoji}
                  </motion.span>
                )}
              </div>
              
              {/* Outfit below */}
              <motion.div 
                className="text-6xl text-center -mt-2"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
              >
                {getAvatarPart('outfit')?.emoji || '👕'}
              </motion.div>
              
              {/* Hair color indicator */}
              <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full ${getAvatarPart('hair')?.color || 'bg-gray-400'} border-2 border-white`} />
            </div>
          </motion.div>

          {/* Part Type Selector */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {(['skin', 'hair', 'eyes', 'outfit', 'accessory'] as const).map((type) => {
              const Icon = typeIcons[type];
              return (
                <Button
                  key={type}
                  variant={selectedType === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedType(type)}
                  className="whitespace-nowrap"
                >
                  <Icon className="w-4 h-4 mr-1" />
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Button>
              );
            })}
          </div>

          {/* Parts Grid */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-3 gap-3">
              {parts.filter(p => p.type === selectedType).map((part) => {
                const isSelected = avatar[selectedType] === part.id;
                
                return (
                  <motion.button
                    key={part.id}
                    onClick={() => part.unlocked ? handleSelectPart(part) : handleUnlock(part)}
                    className={`relative p-4 rounded-2xl border-2 transition-all ${
                      rarityColors[part.rarity]
                    } ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="text-3xl mb-2">{part.emoji}</div>
                    <div className="text-xs font-medium text-foreground">{part.name}</div>
                    
                    {part.color && part.type === 'hair' && (
                      <div className={`w-4 h-4 rounded-full ${part.color} mx-auto mt-1`} />
                    )}
                    
                    {!part.unlocked && (
                      <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center">
                        <div className="text-center">
                          <Lock className="w-5 h-5 text-white mx-auto mb-1" />
                          <span className="text-xs text-white font-bold">{part.cost} 🪙</span>
                        </div>
                      </div>
                    )}
                    
                    {isSelected && part.unlocked && (
                      <div className="absolute top-1 right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                    
                    <div className={`absolute bottom-1 left-1 px-1 py-0.5 rounded text-[10px] font-bold ${
                      part.rarity === 'legendary' ? 'bg-yellow-500 text-white' :
                      part.rarity === 'epic' ? 'bg-purple-500 text-white' :
                      part.rarity === 'rare' ? 'bg-blue-500 text-white' :
                      'bg-gray-400 text-white'
                    }`}>
                      {rarityLabels[part.rarity]}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-3">
          {userBadges.map((badge, index) => {
            const isComplete = badge.progress >= badge.target;
            
            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-4 rounded-2xl border-2 ${
                  badge.earned && isComplete ? 'bg-green-50 border-green-300' :
                  isComplete ? 'bg-amber-50 border-amber-300' :
                  'bg-card border-border'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`text-4xl ${!isComplete ? 'grayscale opacity-50' : ''}`}>
                    {badge.emoji}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-foreground">{badge.name}</h3>
                      {badge.earned && isComplete && (
                        <span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">Claimed!</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{badge.description}</p>
                    
                    <div className="flex items-center gap-2">
                      <Progress value={(badge.progress / badge.target) * 100} className="flex-1 h-2" />
                      <span className="text-xs text-muted-foreground">
                        {badge.progress}/{badge.target}
                      </span>
                    </div>
                  </div>
                  
                  {isComplete && !badge.earned ? (
                    <Button
                      size="sm"
                      onClick={() => handleClaimBadge(badge)}
                      className="bg-gradient-to-r from-amber-400 to-orange-500"
                    >
                      <Star className="w-4 h-4 mr-1" />
                      +{badge.reward}
                    </Button>
                  ) : (
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-primary">
                        <Star className="w-4 h-4" />
                        <span className="font-bold">{badge.reward}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">reward</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default AvatarRewards_mod;
