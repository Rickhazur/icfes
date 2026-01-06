

export type AvatarId = 'leon_primero' | 'delfin_segundo' | 'aguila_tercero' | 'tigre_cuarto' | 'dragon_quinto' | 'koala_exploradorx' | 'zorro_aventurero';

export interface AvatarBase {
    id: AvatarId;
    name: string;
    description: string;
    grade: number; // 1-5 for elementary, 0 for universal
    imageUrl: string;
    color: string;
    personality: string;
}

export interface Accessory {
    id: string;
    name: string;
    type: 'head' | 'eyes' | 'neck' | 'back' | 'hand' | 'body';
    description: string;
    cost: number;
    icon: string; // Emoji for now?
    minLevel?: number;
}

export const AVATARS: AvatarBase[] = [
    // PRIMERO (1st Grade) - León
    {
        id: 'leon_primero',
        name: 'Leo el León',
        description: 'El Valiente de Primero',
        grade: 1,
        imageUrl: '/avatars/leon.png',
        color: '#f59e0b', // Amber
        personality: '¡Rugido de aprendizaje! Leo te ayuda a descubrir las letras y números con valentía.'
    },
    // SEGUNDO (2nd Grade) - Delfín
    {
        id: 'delfin_segundo',
        name: 'Dina la Delfín',
        description: 'La Nadadora de Segundo',
        grade: 2,
        imageUrl: '/avatars/delfin.png',
        color: '#3b82f6', // Blue
        personality: '¡Salta entre las olas del conocimiento! Dina te guía en matemáticas y lectura.'
    },
    // TERCERO (3rd Grade) - Águila
    {
        id: 'aguila_tercero',
        name: 'Águila el Águila',
        description: 'El Volador de Tercero',
        grade: 3,
        imageUrl: '/avatars/aguila.png',
        color: '#8b5cf6', // Violet
        personality: '¡Vuela alto en ciencias! Águila te muestra el mundo desde arriba.'
    },
    // CUARTO (4th Grade) - Tigre
    {
        id: 'tigre_cuarto',
        name: 'Tina la Tigre',
        description: 'La Cazadora de Cuarto',
        grade: 4,
        imageUrl: '/avatars/tigre.png',
        color: '#f97316', // Orange
        personality: '¡Caza el conocimiento! Tina te ayuda a dominar fracciones y escritura.'
    },
    // QUINTO (5th Grade) - Dragón
    {
        id: 'dragon_quinto',
        name: 'Drake el Dragón',
        description: 'El Sabio de Quinto',
        grade: 5,
        imageUrl: '/avatars/dragon.png',
        color: '#dc2626', // Red
        personality: '¡Fuego de sabiduría! Drake te prepara para la secundaria con desafíos épicos.'
    },
    // UNIVERSAL - Koala (para cualquier grado)
    {
        id: 'koala_exploradorx',
        name: 'Kira la Koala',
        description: 'La Exploradora Universal',
        grade: 0,
        imageUrl: '/avatars/koala.png',
        color: '#14b8a6', // Teal
        personality: '¡Abraza el aprendizaje! Kira es amiga de todos los grados.'
    },
    // UNIVERSAL - Zorro (para cualquier grado)
    {
        id: 'zorro_aventurero',
        name: 'Foxy el Zorro',
        description: 'El Aventurero Astuto',
        grade: 0,
        imageUrl: '/avatars/fox.png',
        color: '#ea580c', // Red-Orange
        personality: '¡Astucia y diversión! Foxy te acompaña en cualquier aventura.'
    }
];

export const ACCESSORIES: Accessory[] = [
    // HEAD
    { id: 'h1', name: 'Gorra de Pensar', type: 'head', description: 'Ayuda a concentrarse', cost: 50, icon: '🧢' },
    { id: 'h2', name: 'Corona de Laurel', type: 'head', description: 'Para campeones', cost: 500, icon: '👑', minLevel: 10 },
    { id: 'h3', name: 'Casco Espacial', type: 'head', description: 'Listo para el despegue', cost: 200, icon: '👩‍🚀' },

    // EYES
    { id: 'e1', name: 'Gafas de Lectura', type: 'eyes', description: 'Visión +10', cost: 100, icon: '👓' },
    { id: 'e2', name: 'Monóculo', type: 'eyes', description: 'Muy elegante', cost: 150, icon: '🧐' },
    { id: 'e3', name: 'Gafas de Sol', type: 'eyes', description: 'Demasiado brillante', cost: 80, icon: '🕶️' },

    // BODY/NECK
    { id: 'n1', name: 'Bufanda Matemática', type: 'neck', description: 'Calentita y lógica', cost: 120, icon: '🧣' },
    { id: 'b1', name: 'Capa de Héroe', type: 'body', description: 'Vuela alto', cost: 300, icon: '🦸' },
    { id: 'b2', name: 'Bata de Laboratorio', type: 'body', description: 'Ciencia seria', cost: 250, icon: '🥼' },

    // HAND
    { id: 'ha1', name: 'Lápiz Gigante', type: 'hand', description: 'Para grandes ideas', cost: 150, icon: '✏️' },
    { id: 'ha2', name: 'Cetro de Graduación', type: 'hand', description: 'Poder académico', cost: 1000, icon: '🎓' },

    // BACK
    { id: 'bk1', name: 'Mochila Exploradora', type: 'back', description: 'Lleva todo', cost: 200, icon: '🎒' },
    { id: 'bk2', name: 'Jetpack', type: 'back', description: 'Impuso extra', cost: 800, icon: '🚀' }
];
