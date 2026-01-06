// data/adventureWorlds.ts
// Definition of Adventure Worlds for each grade level

export interface AdventureWorld {
    id: string;
    grade: number;
    title: { es: string; en: string };
    description: { es: string; en: string };
    themeColor: string;
    bgGradient: string;
    icon: string;
    mapImage: string; // Added mapImage field
    lore: { es: string; en: string };
    missions: AdventureMission[];
}

export interface AdventureMission {
    id: string;
    level: string; // e.g., "1-1"
    title: { es: string; en: string };
    problem: { es: string; en: string }; // The real-world problem
    dba: string; // Reference to Colombian DBA
    category: 'math' | 'science' | 'language' | 'social_studies';
    difficulty: 'easy' | 'medium' | 'hard';
    reward: { coins: number; xp: number };
    status: 'locked' | 'available' | 'completed';
    position: { x: number; y: number }; // For the map layout
    hints: { es: string[]; en: string[] }; // Mario-style hints
    trophyId: string; // ID of the trophy gained
}

export const adventureWorlds: AdventureWorld[] = [
    {
        id: 'world-g1',
        grade: 1,
        title: { es: 'Valle de los Guardianes', en: 'Guardians Valley' },
        description: { es: 'Restaura el orden en la naturaleza.', en: 'Restore order in nature.' },
        themeColor: 'emerald',
        bgGradient: 'from-emerald-400 to-green-600',
        icon: '🌳',
        mapImage: '/assets/arena/master_map.png',
        lore: {
            es: 'Los Guardianes del Bosque han perdido su equipo. ¡Ayúdalos a clasificar y contar para salvar el bosque!',
            en: 'The Forest Guardians have lost their gear. Help them classify and count to save the forest!'
        },
        missions: [
            {
                id: 'm-g1-1',
                level: '1-1',
                title: { es: 'Censo de Criaturas', en: 'Creature Census' },
                problem: { es: '¡Muchos animales se han mezclado! Ayúdalos a contarlos por especie hasta 20.', en: 'Many animals have mixed up! Help count them by species up to 20.' },
                dba: 'DBA 1: Cuenta, compara y ordena números del 0 al 20.',
                category: 'math',
                difficulty: 'easy',
                reward: { coins: 50, xp: 80 },
                status: 'available',
                position: { x: 150, y: 300 },
                hints: { es: ['Usa tus dedos para no perder la cuenta.', 'Agrupa de 5 en 5.'], en: ['Use your fingers to keep track.', 'Group by 5s.'] },
                trophyId: 'trophy-g1-1'
            },
            {
                id: 'm-g1-2',
                level: '1-2',
                title: { es: 'Suma de Cristales', en: 'Crystal Addition' },
                problem: { es: 'Junta los cristales de luz para encender las flores. Sumas simples.', en: 'Gather light crystals to light up the flowers. Simple additions.' },
                dba: 'DBA 2: Resuelve problemas de suma (agrupar, juntar) con material concreto.',
                category: 'math',
                difficulty: 'easy',
                reward: { coins: 60, xp: 90 },
                status: 'locked',
                position: { x: 300, y: 250 },
                hints: { es: ['1+1 es igual a...', 'Cuenta los cristales uno por uno.'], en: ['1+1 equals...', 'Count crystals one by one.'] },
                trophyId: 'trophy-g1-2'
            },
            {
                id: 'm-g1-3',
                level: '1-3',
                title: { es: 'Resta de Semillas', en: 'Seed Subtraction' },
                problem: { es: '¿Cuántas semillas quedan si los pájaros se llevan algunas?', en: 'How many seeds are left if the birds take some?' },
                dba: 'DBA 2: Resuelve problemas de resta (quitar, separar) en situaciones cotidianas.',
                category: 'math',
                difficulty: 'easy',
                reward: { coins: 65, xp: 100 },
                status: 'locked',
                position: { x: 450, y: 200 },
                hints: { es: ['Si quitas, el número se hace pequeño.'], en: ['If you take away, the number gets smaller.'] },
                trophyId: 'trophy-g1-3'
            },
            {
                id: 'm-g1-4',
                level: '1-4',
                title: { es: 'Formas del Bosque', en: 'Forest Shapes' },
                problem: { es: 'Identifica círculos, cuadrados, rectángulos y triángulos ocultos.', en: 'Identify hidden circles, squares, rectangles, and triangles.' },
                dba: 'DBA 6: Compara y clasifica objetos bidimensionales por sus atributos.',
                category: 'math',
                difficulty: 'medium',
                reward: { coins: 70, xp: 110 },
                status: 'locked',
                position: { x: 600, y: 280 },
                hints: { es: ['Mira los bordes de las piedras.', 'Cuenta las esquinas.'], en: ['Look at the edges of the stones.', 'Count the corners.'] },
                trophyId: 'trophy-g1-4'
            },
            {
                id: 'm-g1-5',
                level: '1-5',
                title: { es: 'Puente de Longitudes', en: 'Length Bridge' },
                problem: { es: 'Mide qué tronco es más largo usando tus propios pasos.', en: 'Measure which log is longer using your own steps.' },
                dba: 'DBA 4: Compara longitudes y alturas usando medidas no estandarizadas.',
                category: 'math',
                difficulty: 'medium',
                reward: { coins: 75, xp: 120 },
                status: 'locked',
                position: { x: 800, y: 220 },
                hints: { es: ['Ponlos uno al lado del otro.'], en: ['Put them side by side.'] },
                trophyId: 'trophy-g1-5'
            },
            {
                id: 'm-g1-6',
                level: '1-6',
                title: { es: 'Reloj de Sol', en: 'Sun Clock' },
                problem: { es: 'Ordena la rutina de los guardianes: Mañana, Tarde, Noche.', en: 'Order the guardians routine: Morning, Afternoon, Night.' },
                dba: 'DBA 4: Establece relaciones temporales y secuencias de eventos.',
                category: 'math',
                difficulty: 'medium',
                reward: { coins: 80, xp: 130 },
                status: 'locked',
                position: { x: 1000, y: 150 },
                hints: { es: ['¿Qué haces primero al despertar?', 'El sol sale en la mañana.'], en: ['What do you do first when you wake up?', 'The sun rises in the morning.'] },
                trophyId: 'trophy-g1-6'
            },
            {
                id: 'm-g1-7',
                level: '1-7',
                title: { es: 'Conteo de Tesoros', en: 'Treasure Counting' },
                problem: { es: 'Clasifica las hojas por color y cuéntalas en una tabla.', en: 'Sort leaves by color and count them in a table.' },
                dba: 'DBA 10: Clasifica y organiza datos en tablas (pictogramas simples).',
                category: 'math',
                difficulty: 'medium',
                reward: { coins: 85, xp: 140 },
                status: 'locked',
                position: { x: 1200, y: 300 },
                hints: { es: ['Haz una marca por cada hoja verde.'], en: ['Make a mark for each green leaf.'] },
                trophyId: 'trophy-g1-7'
            },
            {
                id: 'm-g1-8',
                level: '1-8',
                title: { es: 'El Gran 100', en: 'The Big 100' },
                problem: { es: 'Completa la serie numérica contando de 10 en 10 hasta 100.', en: 'Complete the number series counting by 10s up to 100.' },
                dba: 'DBA 1: Reconoce el sistema decimal y cuenta hasta 100 de diversas formas.',
                category: 'math',
                difficulty: 'hard',
                reward: { coins: 90, xp: 150 },
                status: 'locked',
                position: { x: 1400, y: 200 },
                hints: { es: ['10, 20, 30...', 'Son las decenas.'], en: ['10, 20, 30...', 'These are the tens.'] },
                trophyId: 'trophy-g1-8'
            },
            {
                id: 'm-g1-9',
                level: '1-9',
                title: { es: 'Carrera de Guardianes', en: 'Guardian Race' },
                problem: { es: 'Identifica quién llegó Primero, Segundo y Tercero.', en: 'Identify who arrived First, Second, and Third.' },
                dba: 'DBA 1: Usa números ordinales para identificar posiciones.',
                category: 'math',
                difficulty: 'hard',
                reward: { coins: 100, xp: 180 },
                status: 'locked',
                position: { x: 1250, y: 400 },
                hints: { es: ['El 1° es el ganador.', 'El 2° va después.'], en: ['1st is the winner.', '2nd comes after.'] },
                trophyId: 'trophy-g1-9'
            },
            {
                id: 'm-g1-10',
                level: '1-10',
                title: { es: 'Ritual del Bosque', en: 'Forest Ritual' },
                problem: { es: 'Resuelve un reto de patrones visuales para salvar el bosque.', en: 'Solve a visual pattern challenge to save the forest.' },
                dba: 'DBA 9 (Pensamiento Variacional): Identifica patrones y regularidades.',
                category: 'science',
                difficulty: 'hard',
                reward: { coins: 200, xp: 300 },
                status: 'locked',
                position: { x: 1000, y: 450 },
                hints: { es: ['Rojo, Azul, Rojo, Azul... ¿qué sigue?'], en: ['Red, Blue, Red, Blue... what next?'] },
                trophyId: 'trophy-g1-10'
            }
        ]
    },
    {
        id: 'world-g2',
        grade: 2,
        title: { es: 'Desierto de los Enigmas', en: 'Desert of Enigmas' },
        description: { es: 'Descifra los secretos de las arenas antiguas.', en: 'Decipher the secrets of the ancient sands.' },
        themeColor: 'amber',
        bgGradient: 'from-orange-300 to-amber-600',
        icon: '🦂',
        mapImage: '/assets/arena/master_map.png',
        lore: {
            es: 'Las pirámides guardan tesoros matemáticos. Resuelve los enigmas numéricos para encontrar el Oasis Sagrado.',
            en: 'The pyramids hold mathematical treasures. Solve the numeric riddles to find the Sacred Oasis.'
        },
        missions: [
            {
                id: 'm-g2-1',
                level: '2-1',
                title: { es: 'Conteo de Dunas', en: 'Dune Counting' },
                problem: { es: 'Cuenta de 2 en 2, 5 en 5 y 10 en 10 hasta 999.', en: 'Count by 2s, 5s, and 10s up to 999.' },
                dba: 'DBA 1: Utiliza el sistema de numeración decimal (unidades, decenas, centenas).',
                category: 'math',
                difficulty: 'easy',
                reward: { coins: 50, xp: 80 },
                status: 'available',
                position: { x: 150, y: 350 },
                hints: { es: ['Identifica las centenas.', '900 + 90 + 9'], en: ['Identify the hundreds.', '900 + 90 + 9'] },
                trophyId: 'trophy-g2-1'
            },
            {
                id: 'm-g2-2',
                level: '2-2',
                title: { es: 'Suma de Escarabajos', en: 'Beetle Sum' },
                problem: { es: 'Suma grupos de escarabajos dorados con reagrupación.', en: 'Sum groups of golden beetles with regrouping.' },
                dba: 'DBA 2: Resuelve problemas aditivos de composición (sumas llevando).',
                category: 'math',
                difficulty: 'easy',
                reward: { coins: 60, xp: 90 },
                status: 'locked',
                position: { x: 300, y: 400 },
                hints: { es: ['Si suma más de 9, lleva a la siguiente columna.'], en: ['If it sums more than 9, carry to the next column.'] },
                trophyId: 'trophy-g2-2'
            },
            {
                id: 'm-g2-3',
                level: '2-3',
                title: { es: 'Pirámide de Restas', en: 'Subtraction Pyramid' },
                problem: { es: 'Resta bloques para bajar de la pirámide (desagrupando).', en: 'Subtract blocks to climb down the pyramid (regrouping).' },
                dba: 'DBA 2: Realiza sustracciones desagrupando decenas (restas prestando).',
                category: 'math',
                difficulty: 'medium',
                reward: { coins: 70, xp: 100 },
                status: 'locked',
                position: { x: 450, y: 300 },
                hints: { es: ['Si no te alcanza, pide prestado al vecino.'], en: ['If not enough, borrow from the neighbor.'] },
                trophyId: 'trophy-g2-3'
            },
            {
                id: 'm-g2-4',
                level: '2-4',
                title: { es: 'Mapas Estelares', en: 'Star Maps' },
                problem: { es: 'Ubica objetos en una cuadrícula o laberinto.', en: 'Locate objects on a grid or maze.' },
                dba: 'DBA 7: Representa el espacio circundante y describe trayectorias.',
                category: 'math',
                difficulty: 'medium',
                reward: { coins: 75, xp: 110 },
                status: 'locked',
                position: { x: 600, y: 250 },
                hints: { es: ['Derecha, Izquierda, Arriba, Abajo.'], en: ['Right, Left, Up, Down.'] },
                trophyId: 'trophy-g2-4'
            },
            {
                id: 'm-g2-5',
                level: '2-5',
                title: { es: 'Reloj de Arena', en: 'Sand Clock' },
                problem: { es: 'Lee la hora en relojes y mide la duración de eventos.', en: 'Read time on clocks and measure event duration.' },
                dba: 'DBA 8: Reconoce unidades de tiempo (horas, minutos) y eventos.',
                category: 'math',
                difficulty: 'medium',
                reward: { coins: 80, xp: 120 },
                status: 'locked',
                position: { x: 750, y: 350 },
                hints: { es: ['1 hora tiene 60 minutos.'], en: ['1 hour has 60 minutes.'] },
                trophyId: 'trophy-g2-5'
            },
            {
                id: 'm-g2-6',
                level: '2-6',
                title: { es: 'Simetría de Oasis', en: 'Oasis Symmetry' },
                problem: { es: 'Reconoce figuras planas (Círculo, Triángulo) y Sólidos (Cubo, Esfera).', en: 'Recognize flat shapes (Circle, Triangle) and Solids (Cube, Sphere).' },
                dba: 'DBA 6: Clasifica figuras planas y sólidos por sus atributos.',
                category: 'math',
                difficulty: 'hard',
                reward: { coins: 90, xp: 130 },
                status: 'locked',
                position: { x: 900, y: 450 },
                hints: { es: ['El cubo parece una caja.', 'La esfera es como un balón.'], en: ['The cube looks like a box.', 'The sphere is like a ball.'] },
                trophyId: 'trophy-g2-6'
            },
            {
                id: 'm-g2-7',
                level: '2-7',
                title: { es: 'Mercado de Especias', en: 'Spice Market' },
                problem: { es: 'Usa monedas y billetes para comprar especias (Pesos Colombianos).', en: 'Use coins and bills to buy spices (Colombian Pesos).' },
                dba: 'DBA 1: Reconoce y opera con el valor de monedas y billetes.',
                category: 'math',
                difficulty: 'hard',
                reward: { coins: 100, xp: 140 },
                status: 'locked',
                position: { x: 1050, y: 300 },
                hints: { es: ['Suma los valores. 1000 + 2000 = 3000.'], en: ['Sum the values. 1000 + 2000 = 3000.'] },
                trophyId: 'trophy-g2-7'
            },
            {
                id: 'm-g2-8',
                level: '2-8',
                title: { es: 'Datos del Desierto', en: 'Desert Data' },
                problem: { es: 'Interpreta pictogramas de los animales observados.', en: 'Interpret pictograms of observed animals.' },
                dba: 'DBA 11: Clasifica y organiza datos en pictogramas y tablas.',
                category: 'math',
                difficulty: 'medium',
                reward: { coins: 110, xp: 150 },
                status: 'locked',
                position: { x: 1200, y: 200 },
                hints: { es: ['Cada dibujo representa una cantidad.'], en: ['Each drawing represents a quantity.'] },
                trophyId: 'trophy-g2-8'
            },
            {
                id: 'm-g2-9',
                level: '2-9',
                title: { es: 'Multiplicación de Cactus', en: 'Cactus Multiplication' },
                problem: { es: 'Usa la suma repetida para contar espinas.', en: 'Use repeated addition to count thorns.' },
                dba: 'DBA 3: Comprende la multiplicación como suma repetida.',
                category: 'math',
                difficulty: 'hard',
                reward: { coins: 120, xp: 180 },
                status: 'locked',
                position: { x: 1350, y: 350 },
                hints: { es: ['3 cactus con 5 espinas... 5+5+5 = 3x5'], en: ['3 cactus with 5 thorns... 5+5+5 = 3x5'] },
                trophyId: 'trophy-g2-9'
            },
            {
                id: 'm-g2-10',
                level: '2-10',
                title: { es: 'Patrones Ancestrales', en: 'Ancestral Patterns' },
                problem: { es: 'Descubre el patrón de crecimiento en los murales egipcios.', en: 'Discover the growth pattern in the Egyptian murals.' },
                dba: 'DBA 9: Identifica patrones numéricos y geométricos.',
                category: 'math',
                difficulty: 'hard',
                reward: { coins: 200, xp: 300 },
                status: 'locked',
                position: { x: 1500, y: 300 },
                hints: { es: ['Observa qué cambia en cada paso.'], en: ['Observe what changes in each step.'] },
                trophyId: 'trophy-g2-10'
            }
        ]
    },
    {
        id: 'world-g3',
        grade: 3,
        title: { es: 'Isla de las Operaciones', en: 'Operations Island' },
        description: { es: 'Ciencia y tecnología para la zona costera.', en: 'Science and tech for the coastal zone.' },
        themeColor: 'indigo',
        bgGradient: 'from-blue-600 to-indigo-900',
        icon: '⛰️',
        mapImage: '/assets/arena/master_map.png',
        lore: {
            es: 'El Dr. Nova necesita asistentes brillantes. La isla se está quedando sin energía y solo el conocimiento puede reactivar los generadores en los diferentes biomas.',
            en: 'Dr. Nova needs brilliant assistants. The island is running out of power and only knowledge can reactivate the generators in different biomes.'
        },
        missions: [
            {
                id: 'm-g3-1',
                level: '3-1',
                title: { es: 'Multiplicación de Corales', en: 'Coral Multiplication' },
                problem: { es: 'Calcula el total multiplicando filas por columnas.', en: 'Calculate the total by multiplying rows by columns.' },
                dba: 'DBA 1: Resuelve problemas multiplicativos (suma repetida, arreglos).',
                category: 'math',
                difficulty: 'easy',
                reward: { coins: 80, xp: 120 },
                status: 'available',
                position: { x: 150, y: 350 },
                hints: { es: ['Filas x Columnas = Total.'], en: ['Rows x Columns = Total.'] },
                trophyId: 'trophy-g3-1'
            },
            {
                id: 'm-g3-2',
                level: '3-2',
                title: { es: 'Fracciones del Manglar', en: 'Mangrove Fractions' },
                problem: { es: 'Identifica fracciones como parte de un conjunto.', en: 'Identify fractions as part of a set.' },
                dba: 'DBA 3: Interpreta fracciones en contextos de medida y reparto.',
                category: 'math',
                difficulty: 'easy',
                reward: { coins: 90, xp: 140 },
                status: 'locked',
                position: { x: 320, y: 300 },
                hints: { es: ['El denominador indica el total de partes.', '1 de 4 es 1/4.'], en: ['Denominator indicates total parts.', '1 of 4 is 1/4.'] },
                trophyId: 'trophy-g3-2'
            },
            {
                id: 'm-g3-3',
                level: '3-3',
                title: { es: 'División en la Selva', en: 'Rainforest Division' },
                problem: { es: 'Reparte los suministros equitativamente.', en: 'Share supplies equally.' },
                dba: 'DBA 2: Comprende la división como repartos y restas repetidas.',
                category: 'math',
                difficulty: 'medium',
                reward: { coins: 100, xp: 160 },
                status: 'locked',
                position: { x: 480, y: 220 },
                hints: { es: ['¿Cuántos le tocan a cada uno?'], en: ['How many does each one get?'] },
                trophyId: 'trophy-g3-3'
            },
            {
                id: 'm-g3-4',
                level: '3-4',
                title: { es: 'Geometría del Dosel', en: 'Canopy Geometry' },
                problem: { es: 'Identifica y describe figuras bidimensionales y tridimensionales.', en: 'Identify and describe 2D and 3D shapes.' },
                dba: 'DBA 5: Clasifica figuras y cuerpos geométricos por sus atributos.',
                category: 'math',
                difficulty: 'medium',
                reward: { coins: 110, xp: 180 },
                status: 'locked',
                position: { x: 650, y: 140 },
                hints: { es: ['¿Tiene lados rectos o curvos?', '¿Es plano o tiene volumen?'], en: ['Does it have straight or curved sides?', 'Is it flat or does it have volume?'] },
                trophyId: 'trophy-g3-4'
            },
            {
                id: 'm-g3-5',
                level: '3-5',
                title: { es: 'Estadística del Valle', en: 'Valley Statistics' },
                problem: { es: 'Lee diagramas de barras sobre la lluvia caída.', en: 'Read bar charts about rainfall.' },
                dba: 'DBA 10: Lee e interpreta información en diagramas de barras.',
                category: 'math',
                difficulty: 'medium',
                reward: { coins: 120, xp: 200 },
                status: 'locked',
                position: { x: 850, y: 200 },
                hints: { es: ['Compara la altura de las barras.'], en: ['Compare the height of the bars.'] },
                trophyId: 'trophy-g3-5'
            },
            {
                id: 'm-g3-6',
                level: '3-6',
                title: { es: 'Cálculo de Cumbres', en: 'Peak Calculation' },
                problem: { es: 'Realiza sumas y restas con números hasta 100.000.', en: 'Perform addition and subtraction with numbers up to 100,000.' },
                dba: 'DBA 1: Usa propiedades de las operaciones lógicas y aritméticas.',
                category: 'math',
                difficulty: 'medium',
                reward: { coins: 130, xp: 220 },
                status: 'locked',
                position: { x: 1050, y: 150 },
                hints: { es: ['Ordena por unidades, decenas, centenas...'], en: ['Order by units, tens, hundreds...'] },
                trophyId: 'trophy-g3-6'
            },
            {
                id: 'm-g3-7',
                level: '3-7',
                title: { es: 'Perímetro del Faro', en: 'Lighthouse Perimeter' },
                problem: { es: 'Mide el contorno del faro y calcula su perímetro.', en: 'Measure the lighthouse outline and calculate its perimeter.' },
                dba: 'DBA 6: Mide y estima longitud, área y perímetro.',
                category: 'math',
                difficulty: 'medium',
                reward: { coins: 140, xp: 240 },
                status: 'locked',
                position: { x: 1250, y: 100 },
                hints: { es: ['Suma la longitud de todos los lados.'], en: ['Sum the length of all sides.'] },
                trophyId: 'trophy-g3-7'
            },
            {
                id: 'm-g3-8',
                level: '3-8',
                title: { es: 'Patrones de Obsidiana', en: 'Obsidian Patterns' },
                problem: { es: 'Descubre la regla de formación en la secuencia numérica.', en: 'Discover the formation rule in the number sequence.' },
                dba: 'DBA 8: Identifica patrones numéricos y geométricos.',
                category: 'math',
                difficulty: 'hard',
                reward: { coins: 150, xp: 260 },
                status: 'locked',
                position: { x: 1450, y: 250 },
                hints: { es: ['¿Suma siempre la misma cantidad?'], en: ['Does it always add the same amount?'] },
                trophyId: 'trophy-g3-8'
            },
            {
                id: 'm-g3-9',
                level: '3-9',
                title: { es: 'Probabilidad Volcánica', en: 'Volcanic Probability' },
                problem: { es: '¿Es seguro o imposible que el volcán despierte hoy?', en: 'Is it certain or impossible for the volcano to wake up today?' },
                dba: 'DBA 11: Describe situaciones de azar (seguro, posible, imposible).',
                category: 'science',
                difficulty: 'hard',
                reward: { coins: 160, xp: 280 },
                status: 'locked',
                position: { x: 1300, y: 400 },
                hints: { es: ['Si nunca ha pasado, es poco probable.'], en: ['If it has never happened, it is unlikely.'] },
                trophyId: 'trophy-g3-9'
            },
            {
                id: 'm-g3-10',
                level: '3-10',
                title: { es: 'Sumo Sacerdote', en: 'High Priest' },
                problem: { es: 'Resuelve un problema mixto de operaciones y lógica.', en: 'Solve a mixed operations and logic problem.' },
                dba: 'DBA 2 (Integral): Resolución de problemas aditivos y multiplicativos.',
                category: 'math',
                difficulty: 'hard',
                reward: { coins: 300, xp: 500 },
                status: 'locked',
                position: { x: 1100, y: 480 },
                hints: { es: ['Divide el problema en pasos pequeños.'], en: ['Break the problem into small steps.'] },
                trophyId: 'trophy-g3-10'
            }
        ]
    },
    {
        id: 'world-g4',
        grade: 4,
        title: { es: 'Laboratorio del Cielo', en: 'Sky Laboratory' },
        description: { es: 'Investigación aérea en la ciudad flotante.', en: 'Aerial research in the floating city.' },
        themeColor: 'cyan',
        bgGradient: 'from-cyan-400 to-blue-600',
        icon: '🛸',
        mapImage: '/assets/arena/master_map.png',
        lore: {
            es: 'En las nubes se encuentra Sky-City, donde los científicos de Nova estudian el clima. ¡Ayúdales a calibrar sus máquinas!',
            en: 'In the clouds lies Sky-City, where Nova scientists study the weather. Help them calibrate their machines!'
        },
        missions: [
            {
                id: 'm-g4-1',
                level: '4-1',
                title: { es: 'Métrica de Nubes', en: 'Cloud Metrics' },
                problem: { es: 'Calcula el área y perímetro de las plataformas flotantes.', en: 'Calculate the area and perimeter of the floating platforms.' },
                dba: 'DBA 4: Calcula el área y perímetro de rectángulos y cuadrados.',
                category: 'math',
                difficulty: 'easy',
                reward: { coins: 100, xp: 150 },
                status: 'available',
                position: { x: 150, y: 250 },
                hints: { es: ['Área = Largo x Ancho. Perímetro = Suma de lados.'], en: ['Area = Length x Width. Perimeter = Sum of sides.'] },
                trophyId: 'trophy-g4-1'
            },
            {
                id: 'm-g4-2',
                level: '4-2',
                title: { es: 'Radar Decimal', en: 'Decimal Radar' },
                problem: { es: 'Identifica y ordena números decimales en los sensores.', en: 'Identify and order decimal numbers on the sensors.' },
                dba: 'DBA 1: Interpreta y usa números decimales hasta las milésimas.',
                category: 'math',
                difficulty: 'easy',
                reward: { coins: 110, xp: 170 },
                status: 'locked',
                position: { x: 300, y: 350 },
                hints: { es: ['Mira la posición después de la coma.'], en: ['Look at the position after the comma.'] },
                trophyId: 'trophy-g4-2'
            },
            {
                id: 'm-g4-3',
                level: '4-3',
                title: { es: 'Fracciones de Vuelo', en: 'Flight Fractions' },
                problem: { es: 'Suma y resta fracciones con el mismo denominador.', en: 'Add and subtract fractions with the same denominator.' },
                dba: 'DBA 1: Realiza operaciones con fracciones homogéneas.',
                category: 'math',
                difficulty: 'medium',
                reward: { coins: 120, xp: 190 },
                status: 'locked',
                position: { x: 450, y: 280 },
                hints: { es: ['Deja el denominador igual y opera los de arriba.'], en: ['Keep the denominator same and operate the top ones.'] },
                trophyId: 'trophy-g4-3'
            },
            {
                id: 'm-g4-4',
                level: '4-4',
                title: { es: 'Simetría Aérea', en: 'Aerial Symmetry' },
                problem: { es: 'Aplica traslaciones y giros a las naves en el plano.', en: 'Apply translations and turns to ships on the plane.' },
                dba: 'DBA 3: Reconoce reflexiones, traslaciones y rotaciones.',
                category: 'math',
                difficulty: 'medium',
                reward: { coins: 130, xp: 210 },
                status: 'locked',
                position: { x: 600, y: 200 },
                hints: { es: ['Mueve la figura sin cambiar su forma.'], en: ['Move the figure without changing its shape.'] },
                trophyId: 'trophy-g4-4'
            },
            {
                id: 'm-g4-5',
                level: '4-5',
                title: { es: 'Ángulos de Navegación', en: 'Navigation Angles' },
                problem: { es: 'Mide ángulos usando el transportador para el despegue.', en: 'Measure angles using the protractor for takeoff.' },
                dba: 'DBA 3: Mide y clasifica ángulos (agudo, recto, obtuso).',
                category: 'math',
                difficulty: 'medium',
                reward: { coins: 140, xp: 230 },
                status: 'locked',
                position: { x: 800, y: 320 },
                hints: { es: ['Menos de 90° es agudo.'], en: ['Less than 90° is acute.'] },
                trophyId: 'trophy-g4-5'
            },
            {
                id: 'm-g4-6',
                level: '4-6',
                title: { es: 'Promedio Atmosférico', en: 'Atmospheric Average' },
                problem: { es: 'Calcula el promedio de temperatura de la semana.', en: 'Calculate the average temperature of the week.' },
                dba: 'DBA 10: Interpreta la media (promedio) de un conjunto de datos.',
                category: 'math',
                difficulty: 'medium',
                reward: { coins: 150, xp: 250 },
                status: 'locked',
                position: { x: 1000, y: 380 },
                hints: { es: ['Suma todo y divide por la cantidad de datos.'], en: ['Sum everything and divide by the count of data.'] },
                trophyId: 'trophy-g4-6'
            },
            {
                id: 'm-g4-7',
                level: '4-7',
                title: { es: 'Detección de Datos', en: 'Data Detection' },
                problem: { es: 'Organiza datos de vientos en diagramas de líneas.', en: 'Organize wind data in line charts.' },
                dba: 'DBA 10: Representa datos en diagramas de barras y líneas.',
                category: 'math',
                difficulty: 'medium',
                reward: { coins: 160, xp: 270 },
                status: 'locked',
                position: { x: 1200, y: 300 },
                hints: { es: ['Une los puntos para ver la tendencia.'], en: ['Connect the dots to see the trend.'] },
                trophyId: 'trophy-g4-7'
            },
            {
                id: 'm-g4-8',
                level: '4-8',
                title: { es: 'Geometría Espacial', en: 'Space Geometry' },
                problem: { es: 'Diferencia prismas y pirámides por sus caras y bases.', en: 'Differentiate prisms and pyramids by their faces and bases.' },
                dba: 'DBA 3: Diferencia cuerpos geométricos (prismas, pirámides).',
                category: 'math',
                difficulty: 'hard',
                reward: { coins: 180, xp: 300 },
                status: 'locked',
                position: { x: 1400, y: 220 },
                hints: { es: ['La pirámide termina en punta.'], en: ['The pyramid ends in a point.'] },
                trophyId: 'trophy-g4-8'
            },
            {
                id: 'm-g4-9',
                level: '4-9',
                title: { es: 'Secuencia de Clima', en: 'Weather Sequence' },
                problem: { es: 'Predice el siguiente valor en una secuencia multiplicativa.', en: 'Predict the next value in a multiplicative sequence.' },
                dba: 'DBA 9: Identifica patrones en secuencias multiplicativas.',
                category: 'math',
                difficulty: 'hard',
                reward: { coins: 200, xp: 350 },
                status: 'locked',
                position: { x: 1300, y: 450 },
                hints: { es: ['¿Por cuánto se multiplica cada vez?'], en: ['By how much do you multiply each time?'] },
                trophyId: 'trophy-g4-9'
            },
            {
                id: 'm-g4-10',
                level: '4-10',
                title: { es: 'Ingeniero Jefe', en: 'Chief Engineer' },
                problem: { es: 'Resuelve un reto de operaciones combinadas para salvar la ciudad.', en: 'Solve a combined operations challenge to save the city.' },
                dba: 'DBA INTEGRAL: Resolución de problemas con números naturales y decimales.',
                category: 'math',
                difficulty: 'hard',
                reward: { coins: 400, xp: 800 },
                status: 'locked',
                position: { x: 1000, y: 550 },
                hints: { es: ['Sigue el orden de las operaciones.'], en: ['Follow the order of operations.'] },
                trophyId: 'trophy-g4-10'
            }
        ]
    },
    {
        id: 'world-g5',
        grade: 5,
        title: { es: 'Ciudadela del Tiempo', en: 'Citadel of Time' },
        description: { es: 'Domina las eras con matemáticas avanzadas.', en: 'Master the eras with advanced math.' },
        themeColor: 'violet',
        bgGradient: 'from-violet-500 to-purple-900',
        icon: '⏳',
        mapImage: '/assets/arena/master_map.png',
        lore: {
            es: 'El tiempo se ha roto. Usa fracciones, decimales y lógica para reparar el reloj universal.',
            en: 'Time is broken. Use fractions, decimals, and logic to repair the universal clock.'
        },
        missions: [
            {
                id: 'm-g5-1',
                level: '5-1',
                title: { es: 'Engranajes Decimales', en: 'Decimal Gears' },
                problem: { es: 'Suma, resta y multiplica decimales para ajustar engranajes.', en: 'Sum, subtract and multiply decimals to adjust gears.' },
                dba: 'DBA 1: Opera con números decimales (suma, resta, multiplicación).',
                category: 'math',
                difficulty: 'medium',
                reward: { coins: 100, xp: 150 },
                status: 'available',
                position: { x: 150, y: 300 },
                hints: { es: ['Alinea la coma decimal.'], en: ['Align the decimal point.'] },
                trophyId: 'trophy-g5-1'
            },
            {
                id: 'm-g5-2',
                level: '5-2',
                title: { es: 'Fracciones Temporales', en: 'Temporal Fractions' },
                problem: { es: 'Multiplica fracciones para calcular tiempos de viaje.', en: 'Multiply fractions to calculate travel times.' },
                dba: 'DBA 2: Interpreta y resuelve problemas con fracciones y sus operaciones.',
                category: 'math',
                difficulty: 'hard',
                reward: { coins: 110, xp: 160 },
                status: 'locked',
                position: { x: 300, y: 350 },
                hints: { es: ['Multiplica en línea recta: numerador con numerador.'], en: ['Multiply in straight line: numerator with numerator.'] },
                trophyId: 'trophy-g5-2'
            },
            {
                id: 'm-g5-3',
                level: '5-3',
                title: { es: 'Porcentajes de Energía', en: 'Energy Percentages' },
                problem: { es: 'Calcula el 10%, 25% y 50% de la carga de energía.', en: 'Calculate 10%, 25%, and 50% of the energy load.' },
                dba: 'DBA 3: Resuelve problemas que involucran porcentajes.',
                category: 'math',
                difficulty: 'medium',
                reward: { coins: 120, xp: 170 },
                status: 'locked',
                position: { x: 450, y: 250 },
                hints: { es: ['50% es la mitad.'], en: ['50% is half.'] },
                trophyId: 'trophy-g5-3'
            },
            {
                id: 'm-g5-4',
                level: '5-4',
                title: { es: 'Promedio Histórico', en: 'Historical Average' },
                problem: { es: 'Calcula la media, mediana y moda de las eras visitadas.', en: 'Calculate mean, median, and mode of visited eras.' },
                dba: 'DBA 11: Interpreta la media, mediana y moda en conjuntos de datos.',
                category: 'math',
                difficulty: 'medium',
                reward: { coins: 130, xp: 180 },
                status: 'locked',
                position: { x: 600, y: 400 },
                hints: { es: ['La moda es el que más se repite.'], en: ['Mode is the one that repeats most.'] },
                trophyId: 'trophy-g5-4'
            },
            {
                id: 'm-g5-5',
                level: '5-5',
                title: { es: 'Triángulos Solares', en: 'Solar Triangles' },
                problem: { es: 'Calcula el área de los paneles triangulares.', en: 'Calculate the area of triangular panels.' },
                dba: 'DBA 6: Calcula áreas de triángulos y cuadriláteros.',
                category: 'math',
                difficulty: 'hard',
                reward: { coins: 140, xp: 200 },
                status: 'locked',
                position: { x: 750, y: 300 },
                hints: { es: ['(Base x Altura) / 2'], en: ['(Base x Height) / 2'] },
                trophyId: 'trophy-g5-5'
            },
            {
                id: 'm-g5-6',
                level: '5-6',
                title: { es: 'Volumen Cúbico', en: 'Cubic Volume' },
                problem: { es: 'Calcula el volumen de cajas de almacenamiento.', en: 'Calculate calculation of storage boxes.' },
                dba: 'DBA 6: Diferencia y calcula el volumen de cuerpos geométricos.',
                category: 'math',
                difficulty: 'hard',
                reward: { coins: 150, xp: 210 },
                status: 'locked',
                position: { x: 900, y: 350 },
                hints: { es: ['Largo x Ancho x Alto.'], en: ['Length x Width x Height.'] },
                trophyId: 'trophy-g5-6'
            },
            {
                id: 'm-g5-7',
                level: '5-7',
                title: { es: 'Coordenadas del Caos', en: 'Chaos Coordinates' },
                problem: { es: 'Ubica puntos (x, y) en el plano cartesiano.', en: 'Locate points (x, y) on the Cartesian plane.' },
                dba: 'DBA 9: Ubica parejas ordenadas en el plano cartesiano.',
                category: 'math',
                difficulty: 'medium',
                reward: { coins: 160, xp: 220 },
                status: 'locked',
                position: { x: 1050, y: 250 },
                hints: { es: ['Primero avanza horizontal (x), luego sube (y).'], en: ['First move horizontal (x), then up (y).'] },
                trophyId: 'trophy-g5-7'
            },
            {
                id: 'm-g5-8',
                level: '5-8',
                title: { es: 'Probabilidad Cuántica', en: 'Quantum Probability' },
                problem: { es: 'Expresa la probabilidad como una fracción.', en: 'Express probability as a fraction.' },
                dba: 'DBA 10: Predice y calcula la probabilidad de ocurrencia.',
                category: 'math',
                difficulty: 'hard',
                reward: { coins: 170, xp: 230 },
                status: 'locked',
                position: { x: 1200, y: 400 },
                hints: { es: ['Casos favorables / Casos totales.'], en: ['Favorable cases / Total cases.'] },
                trophyId: 'trophy-g5-8'
            },
            {
                id: 'm-g5-9',
                level: '5-9',
                title: { es: 'Proporción Divina', en: 'Divine Proportion' },
                problem: { es: 'Resuelve problemas de proporcionalidad directa (Regla de tres).', en: 'Solve direct proportionality problems (Rule of three).' },
                dba: 'DBA 5: Resuelve problemas de proporcionalidad directa.',
                category: 'math',
                difficulty: 'hard',
                reward: { coins: 190, xp: 260 },
                status: 'locked',
                position: { x: 1350, y: 300 },
                hints: { es: ['Si 1 vale 10, 2 valen 20.'], en: ['If 1 equals 10, 2 equals 20.'] },
                trophyId: 'trophy-g5-9'
            },
            {
                id: 'm-g5-10',
                level: '5-10',
                title: { es: 'El Reloj Maestro', en: 'The Master Clock' },
                problem: { es: 'Desafío final con ecuaciones simples (x + 5 = 10).', en: 'Final challenge with simple equations (x + 5 = 10).' },
                dba: 'DBA 7 (Variacional): Encuentra el valor desconocido en igualdades.',
                category: 'math',
                difficulty: 'hard',
                reward: { coins: 300, xp: 600 },
                status: 'locked',
                position: { x: 1500, y: 300 },
                hints: { es: ['¿Qué número falta para que sea igual?'], en: ['What number is missing to make it equal?'] },
                trophyId: 'trophy-g5-10'
            }
        ]
    }
];
