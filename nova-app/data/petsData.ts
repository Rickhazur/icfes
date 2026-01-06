export interface PetStage {
    level: number;
    title: { es: string; en: string };
    image: string;
    description: { es: string; en: string };
}

export interface PetSpecies {
    id: string;
    type: 'dragon' | 'robot';
    baseName: { es: string; en: string };
    stages: PetStage[];
}

export const PET_SPECIES: PetSpecies[] = [
    {
        id: 'mystic-dragon',
        type: 'dragon',
        baseName: { es: 'Dragón Místico', en: 'Mystic Dragon' },
        stages: [
            {
                level: 0,
                title: { es: 'Huevo Ancestral', en: 'Ancient Egg' },
                image: '/pets/dragon_egg.png',
                description: { es: 'Un huevo misterioso con grietas de energía.', en: 'A mysterious egg with energy cracks.' }
            },
            {
                level: 5,
                title: { es: 'Cría de Dragón', en: 'Dragon Hatchling' },
                image: '/pets/dragon_baby.png',
                description: { es: 'Un pequeño compañero lleno de curiosidad.', en: 'A small companion full of curiosity.' }
            },
            {
                level: 10,
                title: { es: 'Dragón de Leyenda', en: 'Legendary Dragon' },
                image: '/pets/dragon_adult.png',
                description: { es: 'Un guardián majestuoso de sabiduría infinita.', en: 'A majestic guardian of infinite wisdom.' }
            }
        ]
    },
    {
        id: 'cyber-robot',
        type: 'robot',
        baseName: { es: 'Guardián Tech', en: 'Tech Guardian' },
        stages: [
            {
                level: 0,
                title: { es: 'Núcleo Esfero', en: 'Sphere Core' },
                image: '/pets/robot_egg.png',
                description: { es: 'Un núcleo de datos flotante en espera.', en: 'A floating data core on standby.' }
            },
            {
                level: 5,
                title: { es: 'Bot Compañero', en: 'Buddy Bot' },
                image: '/pets/robot_baby.png',
                description: { es: 'Un robot amigable que ayuda en los cálculos.', en: 'A friendly robot that helps with calculations.' }
            },
            {
                level: 10,
                title: { es: 'Centinela Supremo', en: 'Supreme Sentinel' },
                image: '/pets/robot_adult.png',
                description: { es: 'La forma final de la inteligencia protectora.', en: 'The final form of protective intelligence.' }
            }
        ]
    }
];
