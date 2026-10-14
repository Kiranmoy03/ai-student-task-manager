import React from 'react';

interface SparkleIconProps {
  className?: string;
  size?: number;
  glow?: boolean;
}

export const SparkleIcon: React.FC<SparkleIconProps> = ({
  className = 'text-white',
  size = 20,
  glow = false,
}) => {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {glow && (
        <div
          className="absolute inset-0 bg-violet-400/40 rounded-full blur-md"
          style={{ width: size * 1.6, height: size * 1.6, left: -size * 0.3, top: -size * 0.3 }}
        />
      )}
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        className="relative transform transition-transform hover:scale-110"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z" />
      </svg>
    </div>
  );
};
