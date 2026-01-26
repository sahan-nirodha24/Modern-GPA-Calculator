import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    title?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title, ...props }) => {
    return (
        <div className={`card ${className}`} {...props}>
            {title && <h3 className="text-lg font-bold mb-4">{title}</h3>}
            {children}
        </div>
    );
};
