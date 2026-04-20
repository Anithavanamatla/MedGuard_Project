import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'glass' | 'neo';
    hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
    className,
    variant = 'default',
    hover = false,
    children,
    ...props
}) => {
    return (
        <div
            className={cn(
                variant === 'glass' ? 'glass-card' : 'bg-surface border border-white/5 rounded-2xl shadow-lg',
                hover && 'hover:border-white/10 hover:shadow-xl transition-all duration-300',
                'p-6',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};
