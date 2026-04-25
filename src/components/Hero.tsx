import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '../i18n/LanguageContext';
import { useContactModal } from './ContactModalProvider';
import { listActiveHeroImages, type HeroImageRow } from '../admin/heroQueries';
import { hasSupabase } from '../lib/supabase';

const FALLBACK_SLIDE: HeroImageRow = {
  id: 'fallback',
  image_url: '/hero-default.jpg',
  image_alt: null,
  display_order: 0,
  is_active: true,
  created_at: '',
  updated_at: '',
};

type Direction = 'right' | 'left';

const Hero = () => {
  const { t } = useLanguage();
  const { open: openContactModal } = useContactModal();

  const { data } = useQuery({
    queryKey: ['hero-images'],
    queryFn: listActiveHeroImages,
    enabled: hasSupabase,
    staleTime: 1000 * 60 * 5,
  });

  // Slides:
  //  - while query is in-flight, return [] → render gradient only (no default flash)
  //  - on success/error with empty data, or when supabase is disabled, fall back
  const slides = useMemo<HeroImageRow[]>(() => {
    if (data && data.length > 0) return data;
    if (!hasSupabase || data !== undefined) return [FALLBACK_SLIDE];
    return [];
  }, [data]);

  // Preload every image before enabling transitions. Without this, the first
  // navigation triggers a network fetch, the outgoing slide blurs out, and the
  // incoming slide pops in late — which is exactly the flicker the user saw
  // during the first cycle.
  const [imagesReady, setImagesReady] = useState(false);
  useEffect(() => {
    if (slides.length === 0) {
      setImagesReady(false);
      return;
    }
    let cancelled = false;
    const loaders = slides.map(
      (s) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => resolve();
          img.src = s.image_url;
        })
    );
    Promise.all(loaders).then(() => {
      if (!cancelled) setImagesReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [slides]);

  const [index, setIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [direction, setDirection] = useState<Direction>('right');
  // Se incrementa en cada navegación para forzar el reinicio de la animación
  // aunque el usuario repita dirección o vuelva al mismo índice.
  const [transitionKey, setTransitionKey] = useState(0);

  // clamp index si se reducen los slides desde el CMS
  useEffect(() => {
    if (index > slides.length - 1) {
      setIndex(0);
      setPrevIndex(null);
    }
  }, [slides.length, index]);

  const animatingRef = useRef(false);
  const userInteractedRef = useRef(false);

  const go = useCallback(
    (nextIndex: number, dir: Direction) => {
      if (animatingRef.current) return;
      if (nextIndex === index || slides.length < 2) return;
      if (!imagesReady) return;
      animatingRef.current = true;
      setDirection(dir);
      setPrevIndex(index);
      setIndex(nextIndex);
      setTransitionKey((k) => k + 1);
    },
    [index, slides.length, imagesReady]
  );

  const goPrev = useCallback(() => {
    userInteractedRef.current = true;
    const n = slides.length;
    go((index - 1 + n) % n, 'left');
  }, [go, index, slides.length]);

  const goNext = useCallback(() => {
    userInteractedRef.current = true;
    const n = slides.length;
    go((index + 1) % n, 'right');
  }, [go, index, slides.length]);

  const goTo = useCallback(
    (target: number) => {
      if (target === index) return;
      userInteractedRef.current = true;
      // Dirección: si el objetivo está delante, va a la derecha; si atrás, izquierda.
      go(target, target > index ? 'right' : 'left');
    },
    [go, index]
  );

  // One-shot auto-advance after first ready, to hint that the hero is a slider.
  // Bails out if the user already clicked an arrow/dot.
  const didAutoAdvanceRef = useRef(false);
  useEffect(() => {
    if (!imagesReady) return;
    if (slides.length < 2) return;
    if (didAutoAdvanceRef.current) return;
    const id = window.setTimeout(() => {
      if (userInteractedRef.current) return;
      didAutoAdvanceRef.current = true;
      const n = slides.length;
      go((index + 1) % n, 'right');
    }, 3500);
    return () => window.clearTimeout(id);
  }, [imagesReady, slides.length, go, index]);

  const onSlideAnimationEnd = () => {
    animatingRef.current = false;
    setPrevIndex(null);
  };

  const hasMultiple = imagesReady && slides.length > 1;
  const altFallback = t('hero.imageAlt');

  const incomingAnim =
    direction === 'right' ? 'animate-hero-slide-in-right' : 'animate-hero-slide-in-left';

  return (
    <section className="relative min-h-screen flex items-center py-24 bg-radial-gradient overflow-hidden">
      {/* Slides — only render once preloaded, so the first transition has the
          incoming image already in cache. Otherwise the radial gradient shows. */}
      <div className="absolute inset-0 z-0">
        {imagesReady && slides.length > 0 && (
          <>
            {prevIndex !== null && (
              <div
                key={`prev-${transitionKey}`}
                className="absolute inset-0 z-[1] overflow-hidden animate-hero-blur-out will-change-[filter,opacity]"
                aria-hidden
              >
                <img
                  src={slides[prevIndex].image_url}
                  alt=""
                  className="w-full h-full object-cover"
                  width={1920}
                  height={1280}
                  decoding="async"
                />
              </div>
            )}
            <div
              key={transitionKey}
              className={`absolute inset-0 z-[2] ${prevIndex !== null ? incomingAnim : ''}`}
              onAnimationEnd={onSlideAnimationEnd}
            >
              <img
                src={slides[index].image_url}
                alt={slides[index].image_alt ?? altFallback}
                className="w-full h-full object-cover"
                width={1920}
                height={1280}
                loading="eager"
                fetchPriority="high"
                decoding="async"
              />
            </div>
          </>
        )}
        {/* Overlay para legibilidad del texto */}
        <div className="absolute inset-0 z-[3] pointer-events-none bg-gradient-to-r from-dark-gray/70 via-dark-gray/45 to-dark-gray/30" />
      </div>

      {/* Key glow effect */}
      <div className="absolute right-1/3 top-1/2 w-[300px] h-[300px] bg-key-green rounded-full blur-[50px] opacity-25 pointer-events-none z-[5]" />

      {/* Arrows */}
      {hasMultiple && (
        <>
          <button
            type="button"
            onClick={goPrev}
            aria-label="Imagen anterior"
            className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 md:w-12 md:h-12 rounded-full bg-white/10 hover:bg-white/25 backdrop-blur-sm ring-1 ring-white/25 text-white grid place-items-center transition-all"
          >
            <ChevronLeft />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Imagen siguiente"
            className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 md:w-12 md:h-12 rounded-full bg-white/10 hover:bg-white/25 backdrop-blur-sm ring-1 ring-white/25 text-white grid place-items-center transition-all"
          >
            <ChevronRight />
          </button>
        </>
      )}

      <div className="container mx-auto px-4 z-10 relative">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.35] tracking-[-0.02em] mb-7">
            {t('hero.title')}
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-4">
            {t('hero.subtitle')}
          </p>
          <p className="text-lg md:text-xl text-white/80 mb-8">
            {t('hero.tagline')}
          </p>
          <button
            onClick={openContactModal}
            className="btn-primary text-lg"
          >
            {t('hero.cta')}
          </button>
        </div>
      </div>

      {/* Dots */}
      {hasMultiple && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {slides.map((s, i) => {
            const active = i === index;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Ir a la imagen ${i + 1}`}
                aria-current={active}
                className={`h-2 rounded-full transition-all duration-300 ${
                  active ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/80 w-2'
                }`}
              />
            );
          })}
        </div>
      )}
    </section>
  );
};

const ChevronLeft = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="m15 18-6-6 6-6" />
  </svg>
);

const ChevronRight = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="m9 6 6 6-6 6" />
  </svg>
);

export default Hero;
