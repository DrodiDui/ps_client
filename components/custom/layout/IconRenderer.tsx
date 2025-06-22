// components/custom/IconRenderer.tsx
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
    if (!iconName) {
        return (
            <div
                className={`bg-gray-200 border-2 border-dashed rounded-xl ${className}`}
                style={{ width: size, height: size }}
            />
        );
    }

    const IconComponent = LucideIcons[iconName as keyof typeof LucideIcons];

    if (!IconComponent) {
        return (
            <div
                className={`bg-yellow-100 border border-yellow-300 rounded-xl ${className}`}
                style={{ width: size, height: size }}
            />
        );
    }

    return (
        <IconComponent
            className={`text-${color}-500 ${className}`}
            size={size}
            style={{ color: `var(--color-${color})` }}
        />
    );
};

export default IconRenderer;