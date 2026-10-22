import React, { useState } from 'react';
import { FileText, Printer, Check, Sparkles, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';

/**
 * CreativeActionButton
 * 
 * High-performance interactive button with:
 * - Ambient luxury glow & modern dark/festive styling
 * - Click-state: Turns vibrant fiery orange with animated circulating border beam
 *   ("line suthi-tu vara maari" - glowing laser line racing around the perimeter)
 * - Dynamic feedback: "Generating PDF..." / "Preparing Print..." -> Checkmark "Saved!" / "Ready!"
 */
export const CreativeActionButton = ({
  variant = 'pdf', // 'pdf' | 'print'
  onClick,
  label,
  sublabel,
  size = 'md', // 'sm' | 'md' | 'lg'
  className = '',
  style = {},
  title
}) => {
  const [animState, setAnimState] = useState('idle'); // 'idle' | 'running' | 'success'

  const isPdf = variant === 'pdf';

  // Labels for various states
  const defaultLabel = isPdf ? 'Download PDF' : 'Print Receipt';
  const displayLabel = label || defaultLabel;

  const handleClick = async (e) => {
    if (animState !== 'idle') return;

    // Trigger active circulating line & orange morphing state
    setAnimState('running');

    // Trigger user action (PDF generation or print dialog)
    try {
      if (onClick) {
        await Promise.resolve(onClick(e));
      }
    } catch (err) {
      console.error(`Action error in CreativeActionButton (${variant}):`, err);
    }

    // After brief progress, show success state with confetti burst
    setTimeout(() => {
      setAnimState('success');

      // Subtle celebration sparkle burst
      try {
        confetti({
          particleCount: 28,
          spread: 55,
          origin: { y: 0.75 },
          colors: ['#ff6f00', '#ffb703', '#ffd166', '#ffffff']
        });
      } catch {
        // Fallback gracefully if canvas-confetti is not loaded
      }

      // Return to idle state after displaying success
      setTimeout(() => {
        setAnimState('idle');
      }, 1600);
    }, 900);
  };

  // Render Icon based on state
  const iconSize = size === 'sm' ? 14 : size === 'lg' ? 21 : 17;

  const renderIcon = () => {
    if (animState === 'running') {
      return <Loader2 className="creative-btn-spin-icon" size={iconSize} />;
    }
    if (animState === 'success') {
      return <Check className="creative-btn-check-icon" size={iconSize} />;
    }
    if (isPdf) {
      return <FileText className="creative-btn-main-icon" size={iconSize} />;
    }
    return <Printer className="creative-btn-main-icon" size={iconSize} />;
  };

  // Render dynamic text based on state
  const renderText = () => {
    if (animState === 'running') {
      return isPdf ? 'Generating PDF...' : 'Preparing Print...';
    }
    if (animState === 'success') {
      return isPdf ? 'PDF Ready!' : 'Print Sent!';
    }
    return displayLabel;
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`creative-action-btn size-${size} variant-${variant} state-${animState} ${className}`}
      style={style}
      title={title || displayLabel}
      disabled={animState === 'running'}
      aria-label={displayLabel}
    >
      {/* SVG Circulating Laser Line - strictly conforms to button border */}
      <svg className="creative-btn-laser-svg" aria-hidden="true">
        <defs>
          <linearGradient id={`laserGrad-${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="40%" stopColor="#ffb703" stopOpacity="1" />
            <stop offset="100%" stopColor="#ff6f00" stopOpacity="0.8" />
          </linearGradient>
        </defs>
        <rect
          x="1.5"
          y="1.5"
          width="calc(100% - 3px)"
          height="calc(100% - 3px)"
          rx={size === 'sm' ? 6 : size === 'lg' ? 10 : 8}
          pathLength="100"
          className="creative-btn-laser-rect"
        />
      </svg>

      {/* Ambient background glow & shimmer */}
      <span className="creative-btn-shimmer" />

      {/* Button Content */}
      <span className="creative-btn-inner">
        <span className="creative-btn-icon-wrapper">
          {renderIcon()}
        </span>
        <span className="creative-btn-label-wrap">
          <span className="creative-btn-label">{renderText()}</span>
          {sublabel && animState === 'idle' && (
            <span className="creative-btn-sublabel">{sublabel}</span>
          )}
        </span>
        {animState === 'running' && (
          <Sparkles className="creative-btn-sparkle-pill" size={13} />
        )}
      </span>
    </button>
  );
};

export default CreativeActionButton;
