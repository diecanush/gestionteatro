
import React from 'react';

interface CardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ title, children, className = '' }) => {
  return (
    <div className={`bg-white dark:bg-brand-navy rounded-xl shadow-lg p-6 ${className}`}>
      <h3 className="text-xl font-bold text-gray-800 dark:text-brand-light mb-4 border-b border-gray-200 dark:border-brand-blue pb-2">{title}</h3>
      <div>{children}</div>
    </div>
  );
};

export default Card;