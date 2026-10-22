// ==========================================================================
// ScrollReveal — GSAP ScrollTrigger card/section reveal component
// Wraps any element and animates it in as the user scrolls past it.
// Supports: fade-up, fade-down, fade-left, fade-right, zoom, flip
// ==========================================================================

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function buildFrom(variant, distance) {
  switch (variant) {
    case 'fade-up':    return { opacity: 0, y: distance };
    case 'fade-down':  return { opacity: 0, y: -distance };
    case 'fade-left':  return { opacity: 0, x: distance };
    case 'fade-right': return { opacity: 0, x: -distance };
    case 'zoom':       return { opacity: 0, scale: 0.75 };
    case 'zoom-in':    return { opacity: 0, scale: 1.15 };
    case 'flip-x':    return { opacity: 0, rotateX: 60, transformOrigin: 'top center' };
    case 'flip-y':    return { opacity: 0, rotateY: 60, transformOrigin: 'left center' };
    default:           return { opacity: 0, y: distance };
  }
}

export default function ScrollReveal({
  children,
  variant = 'fade-up',
  distance = 48,
  duration = 0.7,
  ease = 'power3.out',
  delay = 0,
  scrollStart = 'top 88%',
  once = true,
  className = '',
  style = {},
  as: Tag = 'div',
}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const fromVars = buildFrom(variant, distance);

    const ctx = gsap.context(() => {
      gsap.fromTo(el, fromVars, {
        opacity: 1,
        y: 0,
        x: 0,
        scale: 1,
        rotateX: 0,
        rotateY: 0,
        duration,
        ease,
        delay,
        scrollTrigger: {
          trigger: el,
          start: scrollStart,
          toggleActions: once ? 'play none none none' : 'play none none reverse',
        },
      });
    });

    return () => ctx.revert();
  }, [variant, distance, duration, ease, delay, scrollStart, once]);

  return (
    <Tag ref={ref} className={className} style={{ willChange: 'transform, opacity', ...style }}>
      {children}
    </Tag>
  );
}
