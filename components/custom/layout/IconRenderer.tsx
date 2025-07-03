import * as LucideIcons from 'lucide-react';
import React from 'react';

interface IconRendererProps {
    iconName?: string;
    color?: string;
    size?: number;
    className?: string;
}

const IconRenderer = ({
                          iconName,
                          color = 'gray',
                          size = 16,
                          className = ''
                      }: IconRendererProps) => {
    // Проверка на отсутствие имени иконки
    if (!iconName) {
        return (
            <div
                className={`bg-gray-200 border-2 border-dashed rounded-xl ${className}`}
                style={{ width: size, height: size }}
            />
        );
    }

    // Типизированное получение компонента иконки
    const IconComponent = LucideIcons[iconName as keyof typeof LucideIcons] as
        React.FC<React.SVGProps<SVGSVGElement> & { size?: number }>;

    // Проверка на существование компонента
    if (!IconComponent) {
        return (
            <div
                className={`bg-yellow-100 border border-yellow-300 rounded-xl ${className}`}
                style={{ width: size, height: size }}
            />
        );
    }

    // Рендер иконки с правильными пропсами
    return (
        <IconComponent
            className={`${className}`}
            size={size}
            color={color}
            style={{ color: `var(--color-${color})` }}
        />
    );
};

export default IconRenderer;