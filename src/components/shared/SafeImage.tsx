import React, { useState } from 'react';
import { Utensils, Store } from 'lucide-react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt: string;
  fallbackType?: 'food' | 'canteen';
  aspectRatio?: string;
}

export function SafeImage({
  src,
  alt,
  fallbackType = 'food',
  aspectRatio,
  className,
  style,
  ...props
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // If no src or error loading, show semantic fallback card
  if (!src || hasError) {
    return (
      <div
        className={className}
        style={{
          width: '100%',
          height: '100%',
          aspectRatio,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #EFF6FF 0%, #E2EEFC 100%)',
          color: '#0265DC',
          padding: 12,
          textAlign: 'center',
          boxSizing: 'border-box',
          ...style,
        }}
        role="img"
        aria-label={alt}
      >
        {fallbackType === 'canteen' ? (
          <Store size={28} color="#0265DC" />
        ) : (
          <Utensils size={28} color="#0265DC" />
        )}
        <span
          style={{
            fontSize: 11,
            fontWeight: 800,
            marginTop: 6,
            color: '#1E3A8A',
            maxWidth: 120,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setHasError(true)}
      onLoad={() => setIsLoaded(true)}
      className={className}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        aspectRatio,
        opacity: isLoaded ? 1 : 0.7,
        transition: 'opacity 0.2s ease',
        ...style,
      }}
      {...props}
    />
  );
}
