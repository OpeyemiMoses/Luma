import React from 'react';

interface XLayerIconProps {
  size?: number;
  className?: string;
  variant?: 'dark' | 'white' | 'auto';
  style?: React.CSSProperties;
}

export const XLayerIcon: React.FC<XLayerIconProps> = ({
  size = 20,
  className = '',
  variant = 'dark',
  style = {}
}) => {
  const src = variant === 'white' ? '/xlayer-logo-white.png' : '/xlayer-logo.png';

  return (
    <img
      src={src}
      alt="OKX X Layer"
      width={size}
      height={size}
      className={className}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        objectFit: 'contain',
        display: 'inline-block',
        verticalAlign: 'middle',
        flexShrink: 0,
        ...style
      }}
    />
  );
};
