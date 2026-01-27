
import React from 'react';
import clsx from 'clsx';
import styles from './Badge.module.css';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: 'brand' | 'success' | 'danger' | 'warning' | 'neutral' | 'outline';
    size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
    className,
    variant = 'neutral',
    size = 'md',
    children,
    ...props
}) => {
    return (
        <span
            className={clsx(
                styles.badge,
                styles[variant],
                styles[size],
                className
            )}
            {...props}
        >
            {children}
        </span>
    );
};
