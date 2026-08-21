import React from 'react';

interface LumaLogoProps {
  size?: number;
  variant?: 'dark' | 'light' | 'auto';
  className?: string;
  style?: React.CSSProperties;
  showText?: boolean;
  textSize?: string;
  textColor?: string;
}

export const LumaLogo: React.FC<LumaLogoProps> = ({
  size = 30,
  variant = 'light',
  className = '',
  style = {},
  showText = false,
  textSize = '1.1rem',
  textColor
}) => {
  // Pure white/silver logo on 100% transparent background
  const logoSrc = '/luma-logo-white.png';
  const defaultTextColor = variant === 'light' ? '#0f172a' : '#ffffff';

  return (
    <div
      className={`inline-flex items-center gap-2.5 ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.65rem',
        ...style
      }}
    >
      <img
        src={logoSrc}
        alt="Luma"
        width={size}
        height={size}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          objectFit: 'contain',
          display: 'block',
          flexShrink: 0
        }}
      />
      {showText && (
        <span
          style={{
            fontSize: textSize,
            fontWeight: 900,
            color: textColor || defaultTextColor,
            letterSpacing: '-0.025em',
            fontFamily: 'inherit'
          }}
        >
          Luma
        </span>
      )}
    </div>
  );
};
