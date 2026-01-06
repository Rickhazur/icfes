
import React from 'react';

const staticMessages = [
    "Analizando los cuadernillos del ICFES...",
    "Construyendo preguntas desafiantes...",
    "Diseñando distractores inteligentes...",
    "Calibrando el nivel de dificultad...",
    "Compilando tu examen personalizado...",
    "Preparando tu camino al éxito...",
];

interface LoadingIndicatorProps {
    message: string;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ message }) => {
    const [subMessage, setSubMessage] = React.useState(staticMessages[0]);

    React.useEffect(() => {
        const intervalId = setInterval(() => {
            setSubMessage(prevMessage => {
                const currentIndex = staticMessages.indexOf(prevMessage);
                const nextIndex = (currentIndex + 1) % staticMessages.length;
                return staticMessages[nextIndex];
            });
        }, 2500);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="mt-8 flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-300">{message || 'Iniciando generación...'}</p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subMessage}</p>
        </div>
    );
};

export default LoadingIndicator;
