export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';
export type AccessoryType = 'head' | 'face' | 'torso' | 'back' | 'pet' | 'effect' | 'hand';
export type UnlockCondition = 'coins_earned' | 'level' | 'mission' | 'event' | 'none';

export interface Avatar {
    id: string;
    name: string;
    description: string;
    personality: string;
    colors: string[];
    style: string;
    baseImage: string;
}

export interface Accessory {
    id: string;
    name: string;
    type: AccessoryType;
    rarity: Rarity;
    cost: number;
    conditionType: UnlockCondition;
    conditionValue?: number | string;
    icon: string;
}

// 1st Grade Avatars (Fantasy Animals & Cute Heroes)
export const AVATARS_GRADE_1: Avatar[] = [
    {
        id: 'g1_bunny',
        name: 'Super Conejo',
        description: 'Salta muy alto y es muy rápido.',
        personality: 'Enérgico',
        colors: ['#FFC0CB', '#FFFFFF'],
        style: 'Cute Animal',
        baseImage: '/avatars/g1_bunny.png' // Generated
    },
    {
        id: 'g1_dino',
        name: 'Dino Rex',
        description: 'Un pequeño T-Rex con gran corazón.',
        personality: 'Valiente',
        colors: ['#32CD32', '#FFFF00'],
        style: 'Prehistoric',
        baseImage: '/avatars/g1_dino.png' // Generated
    },
    {
        id: 'g1_princess',
        name: 'Princesa Hada',
        description: 'Usa magia de estrellas para ayudar.',
        personality: 'Amable',
        colors: ['#FF69B4', '#DA70D6'],
        style: 'Magic Royal',
        baseImage: '/avatars/g1_princess.png'
    },
    {
        id: 'g1_knight',
        name: 'Caballero Mini',
        description: 'Defensor del castillo de juguetes.',
        personality: 'Noble',
        colors: ['#C0C0C0', '#4169E1'],
        style: 'Medieval',
        baseImage: '/avatars/g1_knight.png'
    },
    {
        id: 'g1_cat',
        name: 'Gato Mágico',
        description: 'Tiene siete vidas y muchos trucos.',
        personality: 'Astuto',
        colors: ['#FFA500', '#FFFFFF'],
        style: 'Cute Animal',
        baseImage: '/avatars/g1_cat.png'
    },
    {
        id: 'g1_robot',
        name: 'Robo-Amigo',
        description: 'Un robot que ayuda con las tareas.',
        personality: 'Inteligente',
        colors: ['#00BFFF', '#CCCCCC'],
        style: 'Sci-Fi',
        baseImage: '/avatars/g1_robot.png' // Generated
    },
    {
        id: 'g1_hero_girl',
        name: 'Chica Maravilla',
        description: 'Salva el día con su súper fuerza.',
        personality: 'Fuerte',
        colors: ['#FF4500', '#FFD700'],
        style: 'Superhero',
        baseImage: '/avatars/g1_hero_girl.png'
    },
    {
        id: 'g1_hero_boy',
        name: 'Chico Rayo',
        description: 'Corre más rápido que el viento.',
        personality: 'Veloz',
        colors: ['#FFFF00', '#FF0000'],
        style: 'Superhero',
        baseImage: '/avatars/g1_hero_boy.png'
    }
];

// 2nd Grade Avatars (Adventure & Nature)
export const AVATARS_GRADE_2: Avatar[] = [
    {
        id: 'g2_explorer_g',
        name: 'Exploradora de la Selva',
        description: 'Descubre templos antiguos.',
        personality: 'Curiosa',
        colors: ['#228B22', '#F4A460'],
        style: 'Adventure',
        baseImage: '/avatars/g2_explorer_g.png'
    },
    {
        id: 'g2_explorer_b',
        name: 'Explorador del Desierto',
        description: 'Encuentra tesoros en la arena.',
        personality: 'Aventurero',
        colors: ['#DAA520', '#A52A2A'],
        style: 'Adventure',
        baseImage: '/avatars/g2_explorer_b.png'
    },
    {
        id: 'g2_mermaid',
        name: 'Sirena del Mar',
        description: 'Protege los océanos y corales.',
        personality: 'Protectora',
        colors: ['#00CED1', '#FF1493'],
        style: 'Fantasy',
        baseImage: '/avatars/g2_mermaid.png'
    },
    {
        id: 'g2_pirate',
        name: 'Pirata Valiente',
        description: 'Navega los siete mares.',
        personality: 'Temerario',
        colors: ['#000000', '#FF0000'],
        style: 'History',
        baseImage: '/avatars/g2_pirate.png'
    },
    {
        id: 'g2_fairy',
        name: 'Hada del Bosque',
        description: 'Cuida de las plantas y flores.',
        personality: 'Dulce',
        colors: ['#32CD32', '#FFC0CB'],
        style: 'Nature Magic',
        baseImage: '/avatars/g2_fairy.png'
    },
    {
        id: 'g2_elf',
        name: 'Elfo Arquero',
        description: 'Tiene una puntería perfecta.',
        personality: 'Certero',
        colors: ['#006400', '#8B4513'],
        style: 'Nature Warrior',
        baseImage: '/avatars/g2_elf.png'
    },
    {
        id: 'g2_doc',
        name: 'Doctora Juguetes',
        description: 'Cura a todos sus amigos peluches.',
        personality: 'Cuidadosa',
        colors: ['#FFFFFF', '#FF69B4'],
        style: 'Profession',
        baseImage: '/avatars/g2_doc.png'
    },
    {
        id: 'g2_builder',
        name: 'Constructor Maestro',
        description: 'Puede construir cualquier cosa.',
        personality: 'Creativo',
        colors: ['#FFA500', '#0000FF'],
        style: 'Profession',
        baseImage: '/avatars/g2_builder.png'
    }
];

// 3rd Grade Avatars (Fantasy Classes & Cool Kids)
export const AVATARS_GRADE_3: Avatar[] = [
    {
        id: 'g3_wizard',
        name: 'Aprendiz de Mago',
        description: 'Estudia hechizos antiguos.',
        personality: 'Sabio',
        colors: ['#4B0082', '#DAA520'],
        style: 'Fantasy Mage',
        baseImage: '/avatars/g3_wizard.png'
    },
    {
        id: 'g3_witch',
        name: 'Brujita Estelar',
        description: 'Vuela en escoba por la galaxia.',
        personality: 'Misteriosa',
        colors: ['#9932CC', '#000000'],
        style: 'Fantasy Mage',
        baseImage: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Witch&backgroundColor=b6e3f4'
    },
    {
        id: 'g3_skater_g',
        name: 'Skater Pro',
        description: 'Domina las rampas y trucos.',
        personality: 'Radical',
        colors: ['#FF00FF', '#00FFFF'],
        style: 'Urban Sport',
        baseImage: '/avatars/g3_skater_g.png'
    },
    {
        id: 'g3_skater_b',
        name: 'Roller King',
        description: 'El más rápido sobre ruedas.',
        personality: 'Veloz',
        colors: ['#0000FF', '#FFFF00'],
        style: 'Urban Sport',
        baseImage: 'https://api.dicebear.com/9.x/adventurer/svg?seed=SkaterBoy&backgroundColor=d1d4f9'
    },
    {
        id: 'g3_detective',
        name: 'Detective Joven',
        description: 'Resuelve misterios difíciles.',
        personality: 'Analítico',
        colors: ['#8B4513', '#F5DEB3'],
        style: 'Mystery',
        baseImage: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Detective&backgroundColor=c0c0c0'
    },
    {
        id: 'g3_ninja',
        name: 'Mini Ninja',
        description: 'Silencioso como una sombra.',
        personality: 'Sigiloso',
        colors: ['#000000', '#FF0000'],
        style: 'Martial Arts',
        baseImage: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Ninja&backgroundColor=b6e3f4'
    },
    {
        id: 'g3_artist',
        name: 'Artista Colorida',
        description: 'Pinta el mundo de colores.',
        personality: 'Expresiva',
        colors: ['#FF1493', '#00CED1'],
        style: 'Creative',
        baseImage: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Artist&backgroundColor=ffdfbf'
    },
    {
        id: 'g3_rock',
        name: 'Estrella de Rock',
        description: 'Toca la guitarra eléctrica.',
        personality: 'Ruidoso',
        colors: ['#000000', '#FFD700'],
        style: 'Music',
        baseImage: 'https://api.dicebear.com/9.x/adventurer/svg?seed=RockStar&backgroundColor=ffd5dc'
    }
];

// 4th Grade Avatars (Based on Screenshot 1)
export const AVATARS_GRADE_4: Avatar[] = [
    {
        id: 'g4_astro',
        name: 'Astro-Explorer',
        description: 'Explora el cosmos digital con su traje de última generación.',
        personality: 'Curioso y Valiente',
        colors: ['#00BFFF', '#CCCCCC'],
        style: 'Sci-Fi Explorer',
        baseImage: '/avatars/g4_astro.png'
    },
    {
        id: 'g4_pixel',
        name: 'Pixel Paladin',
        description: 'Defensor del reino con armadura de vóxels.',
        personality: 'Leal y Fuerte',
        colors: ['#A9A9A9', '#00FF7F'],
        style: 'Voxel Knight',
        baseImage: '/avatars/g4_pixel.png'
    },
    {
        id: 'g4_street',
        name: 'Street Stylist',
        description: 'Marca tendencia con su estilo urbano único.',
        personality: 'Creativa y Audaz',
        colors: ['#FF69B4', '#00CED1'],
        style: 'Urban Fashion',
        baseImage: '/avatars/g4_street.png'
    },
    {
        id: 'g4_tech',
        name: 'Tech Savvy',
        description: 'Experto en gadgets y soluciones inteligentes.',
        personality: 'Inteligente y Práctico',
        colors: ['#FFA500', '#2F4F4F'],
        style: 'Modern Geek',
        baseImage: '/avatars/g4_tech.png'
    },
    {
        id: 'g4_anime',
        name: 'Anime Ace',
        description: 'Espadachina tradicional con un toque moderno.',
        personality: 'Disciplinada y Veloz',
        colors: ['#FFC0CB', '#800080'],
        style: 'Anime Samurai',
        baseImage: '/avatars/g4_anime.png'
    },
    {
        id: 'g4_gamer',
        name: 'Gamer Guru',
        description: 'Capitán del equipo de e-sports.',
        personality: 'Competitivo y Estratega',
        colors: ['#FF4500', '#111111'],
        style: 'Pro Gamer',
        baseImage: '/avatars/g4_gamer.png'
    }
];

// 5th Grade Avatars (Based on Screenshot 2)
export const AVATARS_GRADE_5: Avatar[] = [
    {
        id: 'g5_imaginaut',
        name: 'Explorador Astral',
        description: 'Viajero interdimensional con tecnología cuántica.',
        personality: 'Visionario',
        colors: ['#F0F8FF', '#FF8C00'],
        style: 'Quantum Tech',
        baseImage: '/avatars/g5_imaginaut.png'
    },
    {
        id: 'g5_maga',
        name: 'Maga Digital',
        description: 'Hechicera que programa la realidad.',
        personality: 'Mística y Lógica',
        colors: ['#9370DB', '#E6E6FA'],
        style: 'Cyber Magic',
        baseImage: '/avatars/g5_maga.png'
    },
    {
        id: 'g5_synth',
        name: 'Guerrero Sintético',
        description: 'Fusión perfecta de hombre y máquina.',
        personality: 'Imparable',
        colors: ['#2E8B57', '#000000'],
        style: 'Cyberpunk Warrior',
        baseImage: '/avatars/g5_synth.png'
    },
    {
        id: 'g5_ninja',
        name: 'Shadow Ninja',
        description: 'Operativo sigiloso de élite.',
        personality: 'Invisible',
        colors: ['#000000', '#4B0082'],
        style: 'Stealth Ops',
        baseImage: '/avatars/g5_ninja.png'
    },
    {
        id: 'g5_vis',
        name: 'Tech Visionary',
        description: 'Inventor de soluciones holográficas.',
        personality: 'Genio',
        colors: ['#00CED1', '#4169E1'],
        style: 'Futurist Creator',
        baseImage: '/avatars/g5_vis.png'
    },
    {
        id: 'g5_cyber',
        name: 'Cyber Mage',
        description: 'Manipula la energía pura del sistema.',
        personality: 'Poderoso',
        colors: ['#FF00FF', '#191970'],
        style: 'Energy Master',
        baseImage: '/avatars/g5_cyber.png'
    }
];

// Combine all avatars for the main export
export const AVATARS: Avatar[] = [
    ...AVATARS_GRADE_1,
    ...AVATARS_GRADE_2,
    ...AVATARS_GRADE_3,
    ...AVATARS_GRADE_4,
    ...AVATARS_GRADE_5
];

export const ACCESSORIES: Accessory[] = [
    // GENERIC ACCESSORIES POOL (Applicable to all for now)
    { id: 'acc_visor', name: 'Visor Tech', type: 'face', rarity: 'common', cost: 100, conditionType: 'none', icon: '🥽' },
    { id: 'acc_cape', name: 'Capa Holo', type: 'back', rarity: 'rare', cost: 500, conditionType: 'level', conditionValue: 5, icon: '🦸' },
    { id: 'acc_drone', name: 'Dron Mascota', type: 'pet', rarity: 'epic', cost: 1000, conditionType: 'coins_earned', conditionValue: 2000, icon: '🛸' },
    { id: 'acc_sword', name: 'Espada Energía', type: 'back', rarity: 'legendary', cost: 2000, conditionType: 'event', conditionValue: 'top_student', icon: '⚔️' },
    { id: 'acc_aura', name: 'Aura Digital', type: 'effect', rarity: 'epic', cost: 1500, conditionType: 'mission', conditionValue: 'm_all_done', icon: '✨' },

    // G1 Accessories
    { id: 'acc_balloon', name: 'Globo Rojo', type: 'hand', rarity: 'common', cost: 50, conditionType: 'none', icon: '🎈' },
    { id: 'acc_lollipop', name: 'Paleta Gigante', type: 'hand', rarity: 'common', cost: 50, conditionType: 'none', icon: '🍭' },
    { id: 'acc_crown_paper', name: 'Corona de Papel', type: 'head', rarity: 'common', cost: 75, conditionType: 'none', icon: '👑' },

    // G2 Accessories
    { id: 'acc_map', name: 'Mapa del Tesoro', type: 'hand', rarity: 'rare', cost: 200, conditionType: 'level', conditionValue: 2, icon: '🗺️' },
    { id: 'acc_hat_safari', name: 'Sombrero Safari', type: 'head', rarity: 'rare', cost: 200, conditionType: 'level', conditionValue: 2, icon: '👒' },
    { id: 'acc_parrot', name: 'Loro Pirata', type: 'pet', rarity: 'epic', cost: 800, conditionType: 'coins_earned', conditionValue: 1000, icon: '🦜' },

    // G3 Accessories
    { id: 'acc_wand', name: 'Varita Mágica', type: 'hand', rarity: 'rare', cost: 300, conditionType: 'level', conditionValue: 3, icon: '🪄' },
    { id: 'acc_glasses_cool', name: 'Gafas Cool', type: 'face', rarity: 'common', cost: 120, conditionType: 'none', icon: '😎' },
    { id: 'acc_skate', name: 'Skate', type: 'back', rarity: 'epic', cost: 900, conditionType: 'coins_earned', conditionValue: 1500, icon: '🛹' },

    // Universal Fun
    { id: 'acc_headphones', name: 'Auriculares', type: 'head', rarity: 'rare', cost: 250, conditionType: 'none', icon: '🎧' },
    { id: 'acc_book_spell', name: 'Libro de Hechizos', type: 'hand', rarity: 'rare', cost: 350, conditionType: 'level', conditionValue: 4, icon: '📖' },
    { id: 'acc_cat_ears', name: 'Orejas de Gato', type: 'head', rarity: 'common', cost: 150, conditionType: 'none', icon: '😺' },

    // G4 Accessories
    { id: 'acc_helmet_space', name: 'Casco Espacial', type: 'head', rarity: 'epic', cost: 600, conditionType: 'level', conditionValue: 4, icon: '👩‍🚀' },
    { id: 'acc_controller', name: 'Control Gamer', type: 'hand', rarity: 'rare', cost: 400, conditionType: 'none', icon: '🎮' },
    { id: 'acc_jetpack', name: 'Jetpack', type: 'back', rarity: 'legendary', cost: 1200, conditionType: 'coins_earned', conditionValue: 2000, icon: '🚀' },

    // G5 Accessories
    { id: 'acc_vr', name: 'Gafas VR', type: 'face', rarity: 'epic', cost: 700, conditionType: 'level', conditionValue: 5, icon: '🕶️' },
    { id: 'acc_laptop', name: 'Holo-Laptop', type: 'hand', rarity: 'rare', cost: 500, conditionType: 'none', icon: '💻' },
    { id: 'acc_robot_arm', name: 'Brazo Robótico', type: 'back', rarity: 'legendary', cost: 1500, conditionType: 'mission', conditionValue: 'm_g5_all', icon: '🦾' },

    // NEW REAL PETS
    { id: 'acc_pet_dragon', name: 'Bebé Dragón', type: 'pet', rarity: 'legendary', cost: 2000, conditionType: 'level', conditionValue: 5, icon: '/pets/dragon_baby.png' },
    { id: 'acc_pet_robot', name: 'Bebé Bot', type: 'pet', rarity: 'legendary', cost: 2000, conditionType: 'level', conditionValue: 5, icon: '/pets/robot_baby.png' }
];
