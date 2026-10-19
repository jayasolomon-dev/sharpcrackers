// ============================================================================
// SHARP CRACKERS - FAST IMAGE COMPONENT (ZERO-JANK & INSTANT RENDERING)
// High-performance image loader with async decoding, CSS shimmer placeholder,
// and automatic error fallback for seamless cross-device visual performance
// ============================================================================

import React, { useState } from 'react';

const FALLBACK_IMAGE = '/images/product_sparkler_1791567639029.jpg';

export const FastImage = ({
  src,
  alt = 'Sharp Crackers',
  className = '',
  style = {},
  priority = false,
  onClick,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [imgSrc, setImgSrc] = useState(src || FALLBACK_IMAGE);

  // Sync if src prop changes
  React.useEffect(() => {
    if (src) setImgSrc(src);
  }, [src]);

  return (
    <div 
      className={`fast-img-wrapper ${className}`}
      style={{
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#1c2541',
        display: 'inline-block',
        ...style
      }}
      onClick={onClick}
    >
      {/* Background Instant Festive Shimmer Skeleton */}
      {!isLoaded && (
        <div 
          className="fast-img-shimmer"
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 0%, rgba(255,183,3,0.08) 50%, rgba(255,255,255,0.03) 100%)',
            backgroundSize: '200% 100%',
            animation: 'fastShimmer 1.5s infinite linear',
            zIndex: 1
          }}
        />
      )}

      {/* Main Image with Async Decoding */}
      <img
        src={imgSrc}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchpriority={priority ? 'high' : 'auto'}
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          if (imgSrc !== FALLBACK_IMAGE) {
            setImgSrc(FALLBACK_IMAGE);
          }
          setIsLoaded(true);
        }}
        style={{
          width: '100%',
          height: '100%',
          objectFit: style.objectFit || 'cover',
          opacity: isLoaded ? 1 : 0.85,
          transition: 'opacity 0.2s ease-in, transform 0.25s ease',
          display: 'block',
          ...props.imgStyle
        }}
        {...props}
      />
    </div>
  );
};

export default FastImage;
