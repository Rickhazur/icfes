import React, { useState, useRef } from 'react';
import { Palette, Music, Sparkles, Globe, Wand2, Sticker } from 'lucide-react';
import { ViewState } from '../../types';
import { useLearning } from '@/context/LearningContext';
import { Whiteboard, WhiteboardRef } from '../MathMaestro/tutor/Whiteboard';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { generateImage } from '@/services/openai';
import { toast } from 'sonner';

interface ArtsTutorProps {
    onNavigate?: (view: ViewState) => void;
    gradeLevel: number;
}

const ArtsTutor: React.FC<ArtsTutorProps> = ({ onNavigate, gradeLevel }) => {
    const { language, setLanguage } = useLearning();
    const [selectedMode, setSelectedMode] = useState<'visual' | 'music' | null>('visual'); // Default to visual for immediate wow
    const whiteboardRef = useRef<WhiteboardRef>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [stickerPrompt, setStickerPrompt] = useState('');
    const [isStickerOpen, setIsStickerOpen] = useState(false);

    const isEn = language === 'en';

    const handleMagicSticker = async () => {
        if (!stickerPrompt.trim()) return;
        setIsGenerating(true);
        toast.info(isEn ? "Summoning magic sticker..." : "Invocando sticker mágico...");

        try {
            // Add "cute sticker, white background" context to ensure usability
            const enhancedPrompt = `A cute, high quality sticker of ${stickerPrompt}, white background, disney style, isolated`;
            const url = await generateImage(enhancedPrompt, 'vivid');
            if (url && whiteboardRef.current) {
                whiteboardRef.current.drawImage(url);
                setIsStickerOpen(false);
                setStickerPrompt('');
                toast.success(isEn ? "Sticker appeared!" : "¡Apareció el sticker!");
            }
        } catch (e) {
            toast.error("Error mágico :(");
        } finally {
            setIsGenerating(false);
        }
    };

    // Scribble to Art Logic (Magic Interpretation)
    const [scribblePrompt, setScribblePrompt] = useState('');
    const [isScribbleOpen, setIsScribbleOpen] = useState(false);

    const handleScribbleToArt = async () => {
        if (!scribblePrompt.trim()) return;
        setIsGenerating(true);
        toast.info(isEn ? "Transforming your art..." : "Transformando tu arte...");

        try {
            // Prompt for a "Masterpiece" interpretation
            const enhancedPrompt = `A 3D render masterpiece of ${scribblePrompt}, pixar style, vibrant colors, soft lighting, 4k resolution, high quality`;
            const url = await generateImage(enhancedPrompt, 'vivid');
            if (url && whiteboardRef.current) {
                whiteboardRef.current.drawImage(url);
                setIsScribbleOpen(false);
                setScribblePrompt('');
                toast.success(isEn ? "Masterpiece created!" : "¡Obra maestra creada!");
            }
        } catch (e) {
            toast.error("Error al transformar :(");
        } finally {
            setIsGenerating(false);
        }
    };




    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-6 font-poppins animate-in fade-in">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex items-center justify-between bg-white/80 backdrop-blur p-6 rounded-3xl shadow-lg border-2 border-pink-100">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-gradient-to-br from-pink-400 to-purple-500 rounded-2xl shadow-md transform rotate-3">
                            <Palette className="w-10 h-10 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
                                {isEn ? 'Creative Studio' : 'Estudio Creativo'}
                            </h1>
                            <p className="text-slate-500 font-medium">
                                {isEn ? 'Explore your creativity • Grade ' : 'Explora tu creatividad • Grado '}{gradeLevel}°
                            </p>
                        </div>
                    </div>

                    {/* Language Toggle */}
                    <div className="flex bg-pink-100 p-1 rounded-full border border-pink-200">
                        <button
                            onClick={() => setLanguage('es')}
                            className={`px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${language === 'es' || language === 'bilingual' ? 'bg-white text-pink-600 shadow-sm' : 'text-pink-400 hover:text-pink-600'}`}
                        >
                            <span className="text-lg">🇪🇸</span>
                            ES
                        </button>
                        <button
                            onClick={() => setLanguage('en')}
                            className={`px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${language === 'en' ? 'bg-white text-purple-600 shadow-sm' : 'text-purple-400 hover:text-purple-600'}`}
                        >
                            <span className="text-lg">🇺🇸</span>
                            EN
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex gap-4 h-[700px]">

                    {/* Sidebar Tools */}
                    <div className="w-64 flex flex-col gap-4">
                        <button
                            onClick={() => setSelectedMode('visual')}
                            className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${selectedMode === 'visual' ? 'bg-pink-100 border-pink-400 text-pink-700 shadow-md' : 'bg-white border-transparent text-slate-500 hover:bg-white/80'}`}
                        >
                            <Palette className="w-6 h-6" />
                            <span className="font-bold">{isEn ? 'Canvas' : 'Lienzo'}</span>
                        </button>

                        <button
                            onClick={() => setSelectedMode('music')}
                            className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${selectedMode === 'music' ? 'bg-purple-100 border-purple-400 text-purple-700 shadow-md' : 'bg-white border-transparent text-slate-500 hover:bg-white/80'}`}
                        >
                            <Music className="w-6 h-6" />
                            <span className="font-bold">{isEn ? 'Music' : 'Música'}</span>
                        </button>

                        <div className="border-t border-black/10 my-2"></div>

                        {/* Magic Tools (Only active in Visual) */}
                        {selectedMode === 'visual' && (
                            <>
                                {/* Magic Sticker Dialog */}
                                <Dialog open={isStickerOpen} onOpenChange={setIsStickerOpen}>
                                    <DialogTrigger asChild>
                                        <button className="p-4 rounded-2xl border-2 border-dashed border-indigo-300 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-all flex items-center gap-3 group">
                                            <div className="p-2 bg-white rounded-lg group-hover:scale-110 transition-transform">
                                                <Sticker className="w-5 h-5" />
                                            </div>
                                            <span className="font-bold text-sm text-left leading-tight">
                                                {isEn ? 'Magic Sticker' : 'Sticker Mágico'}
                                            </span>
                                        </button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>
                                                {isEn ? 'Create a Magic Sticker' : 'Crear Sticker Mágico'} 🪄
                                            </DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4 pt-4">
                                            <p className="text-sm text-slate-500">
                                                {isEn ? 'Describe what you want (e.g., "a flying pizza")' : 'Describe qué quieres (ej. "una pizza voladora")'}
                                            </p>
                                            <Input
                                                value={stickerPrompt}
                                                onChange={(e) => setStickerPrompt(e.target.value)}
                                                placeholder={isEn ? "Type here..." : "Escribe aquí..."}
                                                onKeyDown={(e) => e.key === 'Enter' && handleMagicSticker()}
                                            />
                                            <Button
                                                onClick={handleMagicSticker}
                                                disabled={isGenerating}
                                                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 font-bold"
                                            >
                                                {isGenerating ? (
                                                    <span className="animate-pulse">{isEn ? 'Creating Magic...' : 'Creando Magia...'}</span>
                                                ) : (
                                                    <><Sparkles className="w-4 h-4 mr-2" /> {isEn ? 'Create!' : '¡Crear!'}</>
                                                )}
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>

                                {/* Scribble to Art Dialog */}
                                <Dialog open={isScribbleOpen} onOpenChange={setIsScribbleOpen}>
                                    <DialogTrigger asChild>
                                        <button className="p-4 rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 transition-all flex items-center gap-3 group">
                                            <div className="p-2 bg-white rounded-lg group-hover:scale-110 transition-transform">
                                                <Wand2 className="w-5 h-5" />
                                            </div>
                                            <span className="font-bold text-sm text-left leading-tight">
                                                {isEn ? 'Scribble to Art' : 'Garabato a Arte'}
                                            </span>
                                        </button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>
                                                {isEn ? 'Transform your Scribble' : 'Transforma tu Garabato'} 🎨
                                            </DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4 pt-4">
                                            <p className="text-sm text-slate-500">
                                                {isEn ? 'What did you draw? Ollie will turn it into a masterpiece!' : '¿Qué dibujaste? ¡Ollie lo convertirá en una obra maestra!'}
                                            </p>
                                            <Input
                                                value={scribblePrompt}
                                                onChange={(e) => setScribblePrompt(e.target.value)}
                                                placeholder={isEn ? "E.g., A giant robot in a city..." : "Ej., Un robot gigante en la ciudad..."}
                                                onKeyDown={(e) => e.key === 'Enter' && handleScribbleToArt()}
                                            />
                                            <Button
                                                onClick={handleScribbleToArt}
                                                disabled={isGenerating}
                                                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 font-bold"
                                            >
                                                {isGenerating ? (
                                                    <span className="animate-pulse">{isEn ? 'Painting...' : 'Pintando...'}</span>
                                                ) : (
                                                    <><Wand2 className="w-4 h-4 mr-2" /> {isEn ? 'Transform!' : '¡Transformar!'}</>
                                                )}
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </>
                        )}
                    </div>

                    {/* Canvas / Workspace */}
                    <div className="flex-1 bg-white rounded-3xl shadow-xl overflow-hidden border-4 border-slate-100 relative">
                        {selectedMode === 'visual' ? (
                            <Whiteboard ref={whiteboardRef} language={language === 'es' ? 'es' : 'en'} />
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                <Music className="w-20 h-20 mb-4 opacity-20" />
                                <p>Music Studio Opening Soon</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ArtsTutor;
