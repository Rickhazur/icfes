
import React from 'react';
import { useAvatar } from '../../context/AvatarContext';
import { useGamification } from '../../context/GamificationContext';
import { AVATARS, ACCESSORIES } from '../../data/avatarData';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingBag, Star, Coins, UserCircle2, Sparkles, Check } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { AvatarDisplay } from './AvatarDisplay';

export const AvatarShop = () => {
    const { buyAccessory, equipAccessory, isOwned, unequipAccessory, ownedAccessories, equippedAccessories, setAvatar, currentAvatar } = useAvatar();
    const { coins } = useGamification();

    const [mainTab, setMainTab] = React.useState<'characters' | 'accessories'>('accessories');
    const categories = ['head', 'eyes', 'neck', 'body', 'back', 'hand'];

    const handleBuy = (item: any) => {
        if (coins >= item.cost) {
            buyAccessory(item);
            toast.success(`¡Compraste ${item.name}!`);
        } else {
            toast.error("No tienes suficientes monedas todavía. ¡Sigue aprendiendo!");
        }
    };

    const handleSelectAvatar = (avatarId: string) => {
        setAvatar(avatarId as any);
        toast.success("¡Nuevo look activado!");
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-100">
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white flex justify-between items-center shrink-0">
                <div>
                    <h2 className="text-2xl font-bold font-fredoka flex items-center gap-2">
                        <ShoppingBag className="w-6 h-6" /> Tienda de Estilo
                    </h2>
                    <p className="text-indigo-100 opacity-80 text-sm">¡Personaliza tu personaje!</p>
                </div>
                <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 border border-white/30">
                    <Coins className="w-5 h-5 text-yellow-300" />
                    <span className="font-bold text-lg">{coins}</span>
                </div>
            </div>

            {/* Main Tabs (Personajes vs Accesorios) */}
            <div className="bg-indigo-50 p-2 flex gap-2 shrink-0">
                <button
                    onClick={() => setMainTab('characters')}
                    className={cn(
                        "flex-1 py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all",
                        mainTab === 'characters'
                            ? "bg-white text-indigo-600 shadow-sm"
                            : "text-indigo-400 hover:bg-indigo-100"
                    )}
                >
                    <UserCircle2 className="w-4 h-4" /> Personajes
                </button>
                <button
                    onClick={() => setMainTab('accessories')}
                    className={cn(
                        "flex-1 py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all",
                        mainTab === 'accessories'
                            ? "bg-white text-purple-600 shadow-sm"
                            : "text-purple-400 hover:bg-purple-100"
                    )}
                >
                    <Sparkles className="w-4 h-4" /> Accesorios
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden relative">

                {/* --- CHARACTERS TAB --- */}
                {mainTab === 'characters' && (
                    <ScrollArea className="h-full">
                        <div className="p-6 grid grid-cols-2 lg:grid-cols-3 gap-6">
                            {AVATARS.map(avatar => {
                                const isSelected = currentAvatar === avatar.id;
                                return (
                                    <div
                                        key={avatar.id}
                                        onClick={() => handleSelectAvatar(avatar.id)}
                                        className={cn(
                                            "relative border-4 rounded-3xl p-4 flex flex-col items-center gap-3 cursor-pointer transition-all hover:scale-105 active:scale-95 group",
                                            isSelected
                                                ? "border-green-500 bg-green-50 shadow-lg"
                                                : "border-slate-100 bg-white hover:border-indigo-200"
                                        )}
                                    >
                                        {isSelected && (
                                            <div className="absolute top-3 right-3 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white shadow-md z-10">
                                                <Check className="w-5 h-5" />
                                            </div>
                                        )}

                                        <div className="relative">
                                            <AvatarDisplay
                                                avatarId={avatar.id}
                                                size="md"
                                                showBackground={false}
                                                className="drop-shadow-lg"
                                            />
                                        </div>

                                        <div className="text-center">
                                            <h4 className="font-black text-slate-700 text-lg">{avatar.name}</h4>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{avatar.style}</p>
                                        </div>

                                        <div className="w-full mt-2">
                                            <span
                                                className={cn(
                                                    "block w-full text-center text-xs font-bold py-1.5 rounded-lg uppercase tracking-wide",
                                                    isSelected ? "text-green-600 bg-green-200" : "text-indigo-400 bg-slate-100 group-hover:bg-indigo-100 group-hover:text-indigo-600"
                                                )}
                                            >
                                                {isSelected ? 'Seleccionado' : 'Elegir'}
                                            </span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </ScrollArea>
                )}

                {/* --- ACCESSORIES TAB --- */}
                {mainTab === 'accessories' && (
                    <Tabs defaultValue="head" className="h-full flex flex-col">
                        <div className="p-4 shrink-0">
                            <TabsList className="grid grid-cols-6 rounded-xl bg-slate-100 p-1 w-full">
                                {categories.map(cat => (
                                    <TabsTrigger
                                        key={cat}
                                        value={cat}
                                        className="capitalize data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg text-xs md:text-sm"
                                    >
                                        {cat}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </div>

                        <div className="flex-1 overflow-hidden">
                            {categories.map(cat => (
                                <TabsContent key={cat} value={cat} className="h-full m-0">
                                    <ScrollArea className="h-full">
                                        <div className="p-6 grid grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
                                            {ACCESSORIES.filter(i => i.type === cat).map(item => {
                                                const owned = isOwned(item.id);
                                                const equipped = equippedAccessories[item.type] === item.id;

                                                return (
                                                    <div key={item.id} className="border border-slate-200 rounded-2xl p-4 flex flex-col items-center gap-3 hover:border-indigo-200 hover:shadow-lg transition-all bg-white">
                                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-4xl shadow-inner relative group/icon">
                                                            <div className="group-hover/icon:scale-125 transition-transform duration-300">
                                                                {item.icon}
                                                            </div>
                                                        </div>
                                                        <div className="text-center flex-1">
                                                            <h4 className="font-bold text-slate-800 text-sm">{item.name}</h4>
                                                            <p className="text-xs text-slate-400 leading-tight mt-1">{item.description}</p>
                                                        </div>

                                                        <div className="w-full mt-2">
                                                            {owned ? (
                                                                <Button
                                                                    variant={equipped ? "outline" : "default"}
                                                                    size="sm"
                                                                    className={`w-full rounded-xl font-bold shadow-sm ${equipped ? 'border-green-500 text-green-600 bg-green-50 hover:bg-green-100' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
                                                                    onClick={() => equipped ? unequipAccessory(cat) : equipAccessory(item)}
                                                                >
                                                                    {equipped ? <Check className="w-4 h-4 mr-1" /> : null}
                                                                    {equipped ? 'Listo' : 'Usar'}
                                                                </Button>
                                                            ) : (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold"
                                                                    onClick={() => handleBuy(item)}
                                                                    disabled={coins < item.cost}
                                                                >
                                                                    <Coins className="w-3 h-3 mr-1 text-yellow-500" /> {item.cost}
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </ScrollArea>
                                </TabsContent>
                            ))}
                        </div>
                    </Tabs>
                )}
            </div>
        </div>
    );
};
