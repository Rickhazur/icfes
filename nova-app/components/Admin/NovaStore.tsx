
import React, { useEffect, useState } from 'react';
import { ShoppingBag, Star, Gift, Search, Plus, Trash2, Edit } from 'lucide-react';
import { fetchStoreItems, saveStoreItemToDb, deleteStoreItemFromDb } from '../../services/supabase';
import { StoreItem } from '../../types';
import { useToast } from '@/components/ui/use-toast';

const NovaStore: React.FC = () => {
    const { toast } = useToast();
    const [items, setItems] = useState<StoreItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState<Partial<StoreItem>>({
        name: '',
        cost: 100,
        image: '🎁',
        category: 'theme',
        owned: false
    });
    const [editingId, setEditingId] = useState<string | null>(null);

    const loadItems = async () => {
        setLoading(true);
        const data = await fetchStoreItems();
        setItems(data);
        setLoading(false);
    };

    useEffect(() => {
        loadItems();
    }, []);

    const handleSaveItem = async (e: React.FormEvent) => {
        e.preventDefault();

        const newItem: StoreItem = {
            id: editingId || `item-${Date.now()}`,
            name: formData.name || 'Nuevo Item',
            cost: Number(formData.cost) || 0,
            image: formData.image || '🎁',
            category: (formData.category as any) || 'theme',
            owned: false,
            color: 'indigo'
        };

        try {
            const success = await saveStoreItemToDb(newItem);
            if (success) {
                toast({ title: editingId ? "Item actualizado" : "Item creado", description: "El producto ya está en la tienda." });
                setIsModalOpen(false);
                setEditingId(null);
                setFormData({ name: '', cost: 100, image: '🎁', category: 'theme' });
                loadItems();
            } else {
                toast({ title: "Error", description: "No se pudo guardar.", variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Error", description: "Error de conexión.", variant: "destructive" });
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("¿Eliminar este item de la tienda?")) {
            const success = await deleteStoreItemFromDb(id);
            if (success) {
                toast({ title: "Item eliminado", description: "Ya no aparecerá en la tienda." });
                loadItems();
            }
        }
    };

    const openEdit = (item: StoreItem) => {
        setEditingId(item.id);
        setFormData(item);
        setIsModalOpen(true);
    };

    const openCreate = () => {
        setEditingId(null);
        setFormData({ name: '', cost: 100, image: '🎁', category: 'theme' });
        setIsModalOpen(true);
    };

    return (
        <div className="p-8 max-w-7xl mx-auto font-sans animate-fade-in text-stone-800">

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl relative">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-stone-400 hover:text-stone-600">✕</button>
                        <h2 className="text-2xl font-bold text-stone-900 mb-6">{editingId ? 'Editar Premio' : 'Nuevo Premio'}</h2>
                        <form onSubmit={handleSaveItem} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Nombre del Item</label>
                                <input
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Costo (Coins)</label>
                                    <input
                                        type="number"
                                        value={formData.cost}
                                        onChange={e => setFormData({ ...formData, cost: Number(e.target.value) })}
                                        className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                                        required
                                    />
                                </div>
                                <div className="w-24">
                                    <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Emoji</label>
                                    <input
                                        value={formData.image}
                                        onChange={e => setFormData({ ...formData, image: e.target.value })}
                                        className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-center text-xl"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Categoría</label>
                                <select
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="avatar">Avatar</option>
                                    <option value="theme">Temas</option>
                                    <option value="coupon">Servicios/Cupón</option>
                                    <option value="real">Físico</option>
                                </select>
                            </div>
                            <button type="submit" className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 mt-4">
                                {editingId ? 'Guardar Cambios' : 'Crear Premio'}
                            </button>
                        </form>
                    </div>
                </div >
            )}

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-stone-900 mb-2">Tienda Nova & Premios</h1>
                <p className="text-stone-500">Gestiona los premios canjeables por Nova Coins</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                        <ShoppingBag className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-stone-400 uppercase">Items en Tienda</p>
                        <h3 className="text-2xl font-black text-stone-800">{items.length}</h3>
                    </div>
                </div>
                {/* Placeholder Stat */}
                <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                        <Gift className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-stone-400 uppercase">Premios Canjeados</p>
                        <h3 className="text-2xl font-black text-stone-800">--</h3>
                    </div>
                </div>
            </div>

            {/* Tools */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex gap-2">
                    <button onClick={openCreate} className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Agregar Premio
                    </button>
                </div>
                <div className="flex gap-2 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4" />
                    <input type="text" placeholder="Buscar premios..." className="pl-10 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100" />
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {loading ? <p className="text-stone-400 col-span-4 text-center">Cargando tienda...</p> : items.map(item => (
                    <div key={item.id} className="bg-white border border-stone-200 rounded-2xl p-4 hover:shadow-md transition-shadow group relative">
                        <div className="bg-stone-50 rounded-xl h-32 flex items-center justify-center text-4xl mb-4 group-hover:scale-105 transition-transform">
                            {item.image}
                        </div>
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="font-bold text-stone-800">{item.name}</h3>
                                <p className="text-xs text-stone-400">{item.category}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 font-black text-amber-500 mb-4">
                            <SmallCoin /> {item.cost}
                        </div>

                        <div className="flex gap-2">
                            <button onClick={() => openEdit(item)} className="flex-1 py-2 bg-stone-50 text-stone-600 font-bold text-xs rounded-lg hover:bg-stone-100 flex items-center justify-center gap-1">
                                <Edit className="w-3 h-3" /> Editar
                            </button>
                            <button onClick={() => handleDelete(item.id)} className="flex-1 py-2 bg-red-50 text-red-500 font-bold text-xs rounded-lg hover:bg-red-100 flex items-center justify-center gap-1">
                                <Trash2 className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            {
                items.length === 0 && !loading && (
                    <div className="p-12 text-center text-stone-400">La tienda está vacía. ¡Agrega el primer premio!</div>
                )
            }
        </div >
    );
};

const SmallCoin = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="6" /><path d="M18.09 10.37A6 6 0 1 1 10.34 18" /><path d="M7 6h1v4" /><path d="m16.71 13.88.7 .71-2.82 2.82" /></svg>
);

export default NovaStore;
