
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AVATARS, ACCESSORIES, AvatarId, Accessory } from '../data/avatarData';
import { useGamification } from './GamificationContext';
import { supabase } from '../services/supabase';

interface AvatarContextType {
    currentAvatar: AvatarId | null;
    isLoading: boolean;
    ownedAccessories: string[]; // IDs
    equippedAccessories: Record<string, string>; // type -> ID
    setAvatar: (id: AvatarId) => void;
    buyAccessory: (item: Accessory) => void;
    equipAccessory: (item: Accessory) => void;
    unequipAccessory: (type: string) => void;
    isOwned: (id: string) => boolean;
}

const AvatarContext = createContext<AvatarContextType | undefined>(undefined);

export const AvatarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { coins, spendCoins } = useGamification();
    const [isLoading, setIsLoading] = useState(true);

    // Persist in localStorage
    const [currentAvatar, setCurrentAvatarState] = useState<AvatarId | null>(() => {
        return (localStorage.getItem('nova_avatar_id') as AvatarId) || null;
    });

    const [ownedAccessories, setOwnedAccessories] = useState<string[]>(() => {
        const saved = localStorage.getItem('nova_avatar_inventory');
        return saved ? JSON.parse(saved) : [];
    });

    const [equippedAccessories, setEquippedAccessories] = useState<Record<string, string>>(() => {
        const saved = localStorage.getItem('nova_avatar_equipped');
        return saved ? JSON.parse(saved) : {};
    });

    // Sync with Supabase
    useEffect(() => {
        const fetchProfile = async () => {
            if (!supabase) {
                setIsLoading(false);
                return;
            }
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data } = await supabase
                        .from('profiles')
                        .select('avatar, owned_accessories, equipped_accessories')
                        .eq('id', user.id)
                        .single();

                    if (data) {
                        if (data.avatar) {
                            setCurrentAvatarState(data.avatar as AvatarId);
                            localStorage.setItem('nova_avatar_id', data.avatar);
                        }
                        if (data.owned_accessories) {
                            setOwnedAccessories(data.owned_accessories);
                            localStorage.setItem('nova_avatar_inventory', JSON.stringify(data.owned_accessories));
                        }
                        if (data.equipped_accessories) {
                            setEquippedAccessories(data.equipped_accessories);
                            localStorage.setItem('nova_avatar_equipped', JSON.stringify(data.equipped_accessories));
                        }
                    }
                }
            } catch (error) {
                console.error("Error fetching avatar:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, []);

    useEffect(() => {
        const saveToProfile = async () => {
            if (!supabase) return;
            if (currentAvatar) {
                localStorage.setItem('nova_avatar_id', currentAvatar);
                try {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (user) {
                        const { error } = await supabase.from('profiles').update({ avatar: currentAvatar }).eq('id', user.id);
                        if (error) {
                            console.error("Error saving avatar to Supabase:", error);
                            // toast.error("No se pudo guardar tu avatar en la nube."); // Optional: Don't spam user if it's auto-save
                        }
                    }
                } catch (err) {
                    console.error("Unexpected error saving avatar:", err);
                }
            }
        };
        saveToProfile();
    }, [currentAvatar]);

    // Sync Owned Accessories
    useEffect(() => {
        localStorage.setItem('nova_avatar_inventory', JSON.stringify(ownedAccessories));

        const saveOwned = async () => {
            if (!supabase) return;
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { error } = await supabase.from('profiles').update({ owned_accessories: ownedAccessories }).eq('id', user.id);
                    if (error) console.error("Error saving accessories:", error);
                }
            } catch (err) {
                console.error("Unexpected error saving accessories:", err);
            }
        };
        // Debounce slightly to avoid spamming if multiple buys happen fast
        const timeout = setTimeout(saveOwned, 1000);
        return () => clearTimeout(timeout);
    }, [ownedAccessories]);

    // Sync Equipped Accessories
    useEffect(() => {
        localStorage.setItem('nova_avatar_equipped', JSON.stringify(equippedAccessories));

        const saveEquipped = async () => {
            if (!supabase) return;
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await supabase.from('profiles').update({ equipped_accessories: equippedAccessories }).eq('id', user.id);
            }
        };
        saveEquipped(); // Immediate save for equipping is better for perceived responsiveness
    }, [equippedAccessories]);

    const setAvatar = (id: AvatarId) => {
        setCurrentAvatarState(id);
    };

    const buyAccessory = (item: Accessory) => {
        if (ownedAccessories.includes(item.id)) return;
        if (spendCoins(item.cost, item.name)) {
            setOwnedAccessories(prev => [...prev, item.id]);
        }
    };

    const equipAccessory = (item: Accessory) => {
        if (!ownedAccessories.includes(item.id)) return;
        setEquippedAccessories(prev => ({
            ...prev,
            [item.type]: item.id
        }));
    };

    const unequipAccessory = (type: string) => {
        setEquippedAccessories(prev => {
            const next = { ...prev };
            delete next[type];
            return next;
        });
    };

    const isOwned = (id: string) => ownedAccessories.includes(id);

    return (
        <AvatarContext.Provider value={{
            currentAvatar,
            isLoading,
            ownedAccessories,
            equippedAccessories,
            setAvatar,
            buyAccessory,
            equipAccessory,
            unequipAccessory,
            isOwned
        }}>
            {children}
        </AvatarContext.Provider>
    );
};

export const useAvatar = () => {
    const context = useContext(AvatarContext);
    if (context === undefined) {
        throw new Error('useAvatar must be used within an AvatarProvider');
    }
    return context;
};
