import React, { useState } from 'react';
import { useGamification } from '@/context/GamificationContext';
import { Sparkles, ShoppingBag, Gift, Palette, Ticket, Trophy, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { HallOfFame } from './HallOfFame';
import { AvatarShop } from '@/components/Gamification/AvatarShop';

// ... imports

const STORE_ITEMS = [
    {
        id: 'sticker_pack_1',
        name: 'Pack de Stickers Espaciales',
        nameEn: 'Space Sticker Pack',
        description: '¡Decora tus reportes con planetas y cohetes!',
        price: 100,
        icon: '🚀',
        color: 'bg-indigo-100 border-indigo-300',
        type: 'sticker'
    },
    {
        id: 'avatar_superhero',
        name: 'Avatar Superhéroe',
        nameEn: 'Superhero Avatar',
        description: 'Convierte a tu tutor en un héroe.',
        price: 250,
        icon: '🦸‍♂️',
        color: 'bg-red-100 border-red-300',
        type: 'avatar'
    },
    {
        id: 'theme_dark',
        name: 'Modo Nocturno Mágico',
        nameEn: 'Magic Dark Mode',
        description: 'Un tema oscuro con estrellas brillantes.',
        price: 500,
        icon: '🌙',
        color: 'bg-slate-800 border-slate-600 text-white',
        type: 'theme'
    },
    {
        id: 'real_break',
        name: '10 Minutos Extra de Recreo',
        nameEn: '10 Mins Extra Break',
        description: 'Canjéalo con tu profesor.',
        price: 1000,
        icon: '🎟️',
        color: 'bg-kid-yellow border-yellow-400',
        type: 'coupon'
    }
];

// Mock Inventory (Ideally comes from Context/DB)
const MOCK_INVENTORY = [
    { id: 'sticker_pack_1', name: 'Pack de Stickers Espaciales', icon: '🚀' },
];

interface PrizeStoreProps {
    language: 'es' | 'en';
}

export function PrizeStore({ language = 'es' }: PrizeStoreProps) {
    const { coins, spendCoins, xp } = useGamification();
    const [activeTab, setActiveTab] = useState<'avatar_shop' | 'general_shop' | 'trophies' | 'inventory'>('avatar_shop');




    return (
        <div className="min-h-screen bg-slate-50 font-poppins p-8 space-y-8">
            {/* Header */}
            <header className="flex items-center justify-between bg-white p-6 rounded-3xl border-b-4 border-black/5 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-kid-pink rounded-2xl flex items-center justify-center border-2 border-black shadow-comic rotate-3">
                        <ShoppingBag className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="font-fredoka text-3xl font-black text-slate-800 tracking-tight">
                            {language === 'es' ? 'Zona de Premios' : 'Prize Zone'}
                        </h1>
                        <p className="text-slate-500 font-medium">
                            {language === 'es' ? '¡Gana, compra y colecciona!' : 'Earn, buy and collect!'}
                        </p>
                    </div>
                </div>

                <div className="flex gap-4">
                    {/* XP Display */}
                    <div className="flex items-center gap-3 bg-blue-50 px-5 py-3 rounded-2xl border-2 border-blue-200">
                        <div className="text-2xl">✨</div>
                        <div>
                            <div className="font-black text-xl text-slate-800">{xp} XP</div>
                        </div>
                    </div>

                    {/* Coins Display */}
                    <div className="flex items-center gap-3 bg-yellow-50 px-5 py-3 rounded-2xl border-2 border-yellow-200">
                        <div className="text-2xl">🪙</div>
                        <div>
                            <div className="font-black text-2xl text-slate-800">{coins}</div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Tabs Header */}
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                <button
                    onClick={() => setActiveTab('avatar_shop')}
                    className={cn(
                        "px-6 py-3 rounded-xl font-black transition-all flex items-center gap-2 min-w-max",
                        activeTab === 'avatar_shop'
                            ? "bg-indigo-600 text-white shadow-comic -translate-y-1"
                            : "bg-white text-slate-500 hover:bg-slate-100"
                    )}
                >
                    <User size={20} /> {language === 'es' ? 'Accesorios Avatar' : 'Avatar Shop'}
                </button>
                <button
                    onClick={() => setActiveTab('general_shop')}
                    className={cn(
                        "px-6 py-3 rounded-xl font-black transition-all flex items-center gap-2 min-w-max",
                        activeTab === 'general_shop'
                            ? "bg-kid-blue text-white shadow-comic -translate-y-1"
                            : "bg-white text-slate-500 hover:bg-slate-100"
                    )}
                >
                    <ShoppingBag size={20} /> {language === 'es' ? 'Otros Premios' : 'Other Prizes'}
                </button>
                <button
                    onClick={() => setActiveTab('trophies')}
                    className={cn(
                        "px-6 py-3 rounded-xl font-black transition-all flex items-center gap-2 min-w-max",
                        activeTab === 'trophies'
                            ? "bg-amber-400 text-white shadow-comic -translate-y-1"
                            : "bg-white text-slate-500 hover:bg-slate-100"
                    )}
                >
                    <Trophy size={20} /> {language === 'es' ? 'Salón de la Fama' : 'Hall of Fame'}
                </button>
                <button
                    onClick={() => setActiveTab('inventory')}
                    className={cn(
                        "px-6 py-3 rounded-xl font-black transition-all flex items-center gap-2 min-w-max",
                        activeTab === 'inventory'
                            ? "bg-purple-500 text-white shadow-comic -translate-y-1"
                            : "bg-white text-slate-500 hover:bg-slate-100"
                    )}
                >
                    <Gift size={20} /> {language === 'es' ? 'Mochila' : 'Backpack'}
                </button>
            </div>

            <AnimatePresence mode="wait">
                {/* AVATAR SHOP TAB */}
                {activeTab === 'avatar_shop' && (
                    <motion.div
                        key="avatar_shop"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="h-[600px] bg-white rounded-3xl overflow-hidden border-2 border-stone-200 shadow-sm"
                    >
                        <AvatarShop />
                    </motion.div>
                )}

                {/* GENERAL STORE TAB */}
                {activeTab === 'general_shop' && (
                    <motion.div
                        key="shop"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                    >
                        {STORE_ITEMS.map((item) => (
                            <motion.div
                                key={item.id}
                                whileHover={{ y: -5 }}
                                className={cn(
                                    "relative bg-white rounded-3xl border-2 border-stone-200 p-6 flex flex-col gap-4 shadow-sm hover:shadow-comic-lg transition-all",
                                    item.color.includes('bg-slate-800') ? 'dark-card' : ''
                                )}
                            >
                                <div className={cn(
                                    "w-full aspect-square rounded-2xl flex items-center justify-center text-6xl border-2 border-black/5 mb-2",
                                    item.color
                                )}>
                                    {item.icon}
                                </div>

                                <div className="flex-1">
                                    <h3 className={cn(
                                        "font-fredoka text-xl font-bold mb-1",
                                        item.color.includes('bg-slate-800') ? 'text-white' : 'text-slate-800'
                                    )}>
                                        {language === 'es' ? item.name : item.nameEn}
                                    </h3>
                                    <p className={cn(
                                        "text-sm",
                                        item.color.includes('bg-slate-800') ? 'text-slate-300' : 'text-slate-500'
                                    )}>
                                        {item.description}
                                    </p>
                                </div>

                                <Button
                                    onClick={() => spendCoins(item.price, item.name)}
                                    disabled={coins < item.price}
                                    className={cn(
                                        "w-full font-black border-2 border-black shadow-comic active:shadow-none active:translate-y-1 transition-all",
                                        coins >= item.price
                                            ? "bg-kid-green hover:bg-kid-green/90 text-white"
                                            : "bg-slate-200 text-slate-400 border-slate-300 shadow-none cursor-not-allowed"
                                    )}
                                >
                                    {coins >= item.price
                                        ? (language === 'es' ? `Comprar ${item.price} 🪙` : `Buy ${item.price} 🪙`)
                                        : (language === 'es' ? `Faltan ${item.price - coins} 🪙` : `Need ${item.price - coins} 🪙`)
                                    }
                                </Button>
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {activeTab === 'trophies' && (
                    <motion.div
                        key="trophies"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <HallOfFame language={language} />
                    </motion.div>
                )}

                {activeTab === 'inventory' && (
                    <motion.div
                        key="inventory"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-3xl p-8 border-2 border-stone-100 shadow-sm text-center"
                    >
                        <h2 className="font-fredoka text-2xl font-bold mb-6 text-slate-700">
                            {language === 'es' ? 'Tus Cosas' : 'Your Stuff'}
                        </h2>
                        {MOCK_INVENTORY.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {MOCK_INVENTORY.map(item => (
                                    <div key={item.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                                        <div className="text-4xl mb-2">{item.icon}</div>
                                        <div className="font-bold text-slate-600">{item.name}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-slate-400 py-12">
                                <Ticket className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                {language === 'es' ? 'Tu mochila está vacía. ¡Compra algo!' : 'Your backpack is empty. Buy something!'}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
