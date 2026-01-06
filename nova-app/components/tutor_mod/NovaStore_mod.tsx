import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Star, ShoppingBag, Check, Lock } from "lucide-react";
import { useRewards } from "@/hooks/useRewards_mod";
import { toast } from "sonner";

interface StoreItem {
  id: string;
  name: string;
  description: string;
  price: number;
  emoji: string;
  category: 'avatar' | 'theme' | 'powerup' | 'badge';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

const storeItems: StoreItem[] = [
  // Avatars
  { id: 'avatar_astronaut', name: 'Astronaut', description: 'A space explorer', price: 50, emoji: '👨‍🚀', category: 'avatar', rarity: 'common' },
  { id: 'avatar_wizard', name: 'Wizard', description: 'Master of magic', price: 100, emoji: '🧙', category: 'avatar', rarity: 'rare' },
  { id: 'avatar_dragon', name: 'Dragon', description: 'Super rare golden dragon!', price: 300, emoji: '🐉', category: 'avatar', rarity: 'legendary' },
  { id: 'avatar_unicorn', name: 'Unicorn', description: 'Magical and special', price: 200, emoji: '🦄', category: 'avatar', rarity: 'epic' },
  
  // Themes
  { id: 'theme_space', name: 'Space Theme', description: 'Space background', price: 80, emoji: '🌌', category: 'theme', rarity: 'common' },
  { id: 'theme_ocean', name: 'Ocean Theme', description: 'Underwater background', price: 80, emoji: '🌊', category: 'theme', rarity: 'common' },
  { id: 'theme_rainbow', name: 'Rainbow Theme', description: 'All the colors!', price: 150, emoji: '🌈', category: 'theme', rarity: 'rare' },
  
  // Power-ups
  { id: 'powerup_hint', name: 'Hints Pack', description: '5 free hints', price: 30, emoji: '💡', category: 'powerup', rarity: 'common' },
  { id: 'powerup_timer', name: '+30 Seconds', description: 'More time in games', price: 40, emoji: '⏱️', category: 'powerup', rarity: 'common' },
  { id: 'powerup_double', name: 'Coins x2', description: 'Double coins for 1 game', price: 100, emoji: '✨', category: 'powerup', rarity: 'rare' },
  
  // Badges
  { id: 'badge_star', name: 'Star Badge', description: 'Shine on your profile', price: 120, emoji: '⭐', category: 'badge', rarity: 'rare' },
  { id: 'badge_crown', name: 'Royal Crown', description: 'Only for champions', price: 500, emoji: '👑', category: 'badge', rarity: 'legendary' },
];

const rarityColors: Record<string, string> = {
  common: 'border-muted bg-muted/30',
  rare: 'border-primary/50 bg-primary/10',
  epic: 'border-accent/50 bg-accent/10',
  legendary: 'border-warning/50 bg-warning/10',
};

const rarityLabels: Record<string, string> = {
  common: 'Common',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
};

interface NovaStoreProps {
  onClose: () => void;
}

const NovaStore_mod = ({ onClose }: NovaStoreProps) => {
  const { balance, purchaseItem, refreshBalance, isLoading } = useRewards();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [purchasedItems, setPurchasedItems] = useState<string[]>([]);
  const [purchasingItem, setPurchasingItem] = useState<string | null>(null);

  // Load purchased items
  useEffect(() => {
    const saved = localStorage.getItem('nova_store_purchased_mod');
    if (saved) {
      setPurchasedItems(JSON.parse(saved));
    }
    refreshBalance();
  }, [refreshBalance]);

  const categories = [
    { id: 'all', name: 'All', emoji: '🎁' },
    { id: 'avatar', name: 'Avatars', emoji: '👤' },
    { id: 'theme', name: 'Themes', emoji: '🎨' },
    { id: 'powerup', name: 'Power-ups', emoji: '⚡' },
    { id: 'badge', name: 'Badges', emoji: '🏅' },
  ];

  const filteredItems = selectedCategory === 'all' 
    ? storeItems 
    : storeItems.filter(item => item.category === selectedCategory);

  const handlePurchase = async (item: StoreItem) => {
    if (purchasedItems.includes(item.id)) {
      toast.info('You already own this item!');
      return;
    }

    if (balance < item.price) {
      toast.error('Not enough coins!');
      return;
    }

    setPurchasingItem(item.id);
    const result = await purchaseItem(item.price, item.id);
    setPurchasingItem(null);

    if (result.success) {
      const newPurchased = [...purchasedItems, item.id];
      setPurchasedItems(newPurchased);
      localStorage.setItem('nova_store_purchased_mod', JSON.stringify(newPurchased));
      toast.success(`You bought ${item.name}! ${item.emoji}`);
    } else {
      toast.error(result.message || 'Purchase failed');
    }
  };

  return (
    <motion.div
      className="p-6 bg-card rounded-3xl shadow-medium max-h-[80vh] overflow-hidden flex flex-col"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="sm" onClick={onClose}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <motion.div 
          className="flex items-center gap-2 px-4 py-2 gradient-secondary rounded-xl"
          key={balance}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
        >
          <Star className="w-5 h-5 text-secondary-foreground fill-current" />
          <span className="font-bold text-secondary-foreground">{balance}</span>
        </motion.div>
      </div>

      {/* Title */}
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-foreground mb-1">
          🏪 Nova Store
        </h2>
        <p className="text-sm text-muted-foreground">
          Use your coins to get awesome items!
        </p>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'gradient-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <span>{cat.emoji}</span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Items grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item, index) => {
              const isPurchased = purchasedItems.includes(item.id);
              const canAfford = balance >= item.price;
              const isPurchasing = purchasingItem === item.id;

              return (
                <motion.div
                  key={item.id}
                  className={`p-4 rounded-xl border-2 ${rarityColors[item.rarity]} ${
                    isPurchased ? 'opacity-60' : ''
                  }`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  layout
                >
                  {/* Item content */}
                  <div className="text-center mb-3">
                    <motion.span 
                      className="text-4xl block mb-2"
                      whileHover={{ scale: 1.2, rotate: [0, 10, -10, 0] }}
                    >
                      {item.emoji}
                    </motion.span>
                    <h3 className="font-bold text-foreground text-sm">{item.name}</h3>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full mt-1 inline-block ${
                      item.rarity === 'legendary' ? 'bg-warning/20 text-warning' :
                      item.rarity === 'epic' ? 'bg-accent/20 text-accent' :
                      item.rarity === 'rare' ? 'bg-primary/20 text-primary' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {rarityLabels[item.rarity]}
                    </span>
                  </div>

                  {/* Purchase button */}
                  <Button
                    variant={isPurchased ? 'ghost' : canAfford ? 'default' : 'ghost'}
                    size="sm"
                    className="w-full"
                    onClick={() => handlePurchase(item)}
                    disabled={isPurchased || !canAfford || isPurchasing}
                  >
                    {isPurchasing ? (
                      <motion.div
                        className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      />
                    ) : isPurchased ? (
                      <>
                        <Check className="w-4 h-4 mr-1" />
                        Owned
                      </>
                    ) : !canAfford ? (
                      <>
                        <Lock className="w-4 h-4 mr-1" />
                        {item.price}
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4 mr-1" />
                        {item.price}
                      </>
                    )}
                  </Button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer tip */}
      <div className="mt-4 p-3 bg-muted/30 rounded-xl text-center">
        <p className="text-xs text-muted-foreground">
          💡 Earn more coins by playing in the Games Center
        </p>
      </div>
    </motion.div>
  );
};

export default NovaStore_mod;
