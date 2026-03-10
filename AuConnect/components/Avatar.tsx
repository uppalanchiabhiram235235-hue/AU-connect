
import React from 'react';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ name, size = 'md', className = '' }) => {
  const getInitials = (fullName: string) => {
    // Remove Mr., Mrs., Ms., Dr. prefixes (case insensitive)
    let cleanName = fullName.replace(/^(Mr\.|Mrs\.|Ms\.|Dr\.)\s+/i, '').trim();
    
    // Take first two characters of the remaining name and uppercase
    const initials = cleanName.substring(0, 2).toUpperCase();
    return initials || '??';
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-[10px]',
    md: 'w-10 h-10 text-xs',
    lg: 'w-12 h-12 text-sm',
    xl: 'w-16 h-16 text-xl',
  };

  const bgColors = [
    'bg-indigo-100 text-indigo-700',
    'bg-blue-100 text-blue-700',
    'bg-emerald-100 text-emerald-700',
    'bg-orange-100 text-orange-700',
    'bg-rose-100 text-rose-700',
    'bg-amber-100 text-amber-700',
  ];

  // Consistent color based on name
  const colorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % bgColors.length;

  return (
    <div className={`shrink-0 rounded-full flex items-center justify-center font-black tracking-tight border-2 border-white shadow-sm ${sizeClasses[size]} ${bgColors[colorIndex]} ${className}`}>
      {getInitials(name)}
    </div>
  );
};
