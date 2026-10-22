// ==========================================================================
// ScrollFloat — GSAP ScrollTrigger text animation component
// Splits text by chars/words/lines and animates them on scroll
// ==========================================================================

import { useEffect, useRef, useMemo } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function splitText(text, splitBy) {
  const raw = typeof text === 'string' ? text : String(text);
  if (splitBy === 'lines') {
    return raw.split('\n').map((line, i) => ({ key: i, content: line || '\u00A0', isSpace: false }));
  }
  if (splitBy === 'words') {
    return raw.split(/(\s+)/).map((w, i) => ({ key: i, content: w, isSpace: /^\s+$/.test(w) }));
  }
  return raw.split('').map((ch, i) => ({ key: i, content: ch, isSpace: ch === ' ' }));
}

function buildFromVars(effect, direction, distance, stretch, smoothing) {
  switch (effect) {
    case 'float': {
      const dy = direction === 'down' ? -distance : distance;
      return { opacity: 0, y: dy, scaleY: 1 + smoothing * 0.1, scaleX: 1 - stretch * 0.04 };
    }
    case 'fade': return { opacity: 0 };
    case 'slide': {
      const dx = direction === 'right' ? -distance : distance;
      return { opacity: 0, x: dx };
    }
    case 'zoom': return { opacity: 0, scale: 0.4 };
    default: return { opacity: 0, y: distance };
  }
}

export default function ScrollFloat({
  children,
  effect = 'float',
  splitBy = 'chars',
  direction = 'up',
  order = 'start',
  fromColor = 'currentColor',
  animationDuration = 1,
  ease = 'back.inOut(2)',
  scrollStart = 'center bottom+=50%',
  scrollEnd = 'bottom bottom-=40%',
  stagger = 0.03,
  distance = 120,
  stretch = 2.3,
  smoothing = 0,
  className = '',
  containerTag: Tag = 'span',
}) {
  const containerRef = useRef(null);

  const text = useMemo(() => {
    if (typeof children === 'string') return children;
    if (typeof children === 'number') return String(children);
    return '';
  }, [children]);

  const tokens = useMemo(() => splitText(text, splitBy), [text, splitBy]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const spans = Array.from(container.querySelectorAll('[data-sf-token]'));
    if (!spans.length) return;
    const ordered = order === 'end' ? [...spans].reverse() : spans;
    const fromVars = buildFromVars(effect, direction, distance, stretch, smoothing);
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ordered,
        { ...fromVars, ...(fromColor !== 'currentColor' ? { color: fromColor } : {}) },
        {
          opacity: 1, y: 0, x: 0, scale: 1, scaleY: 1, scaleX: 1,
          color: 'currentColor',
          duration: animationDuration,
          ease,
          stagger,
          scrollTrigger: {
            trigger: container,
            start: scrollStart,
            end: scrollEnd,
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, container);
    return () => ctx.revert();
  }, [effect, direction, order, fromColor, animationDuration, ease, scrollStart, scrollEnd, stagger, distance, stretch, smoothing]);

  return (
    <Tag
      ref={containerRef}
      className={`sf-container ${className}`}
      style={{ display: 'inline', lineHeight: 'inherit' }}
      aria-label={text}
    >
      {tokens.map((tok) =>
        tok.isSpace ? (
          <span key={tok.key} data-sf-token="space" style={{ display: 'inline-block', whiteSpace: 'pre' }}>
            {tok.content}
          </span>
        ) : (
          <span key={tok.key} data-sf-token="char" style={{ display: 'inline-block', willChange: 'transform, opacity' }}>
            {tok.content}
          </span>
        )
      )}
    </Tag>
  );
}
