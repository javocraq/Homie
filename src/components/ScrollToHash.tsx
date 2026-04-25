import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const FALLBACK_OFFSET = 80;
const EXTRA_PADDING = 16;

function getNavbarOffset(): number {
  if (typeof window === 'undefined') return FALLBACK_OFFSET;
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue('--navbar-height')
    .trim();
  const parsed = parseFloat(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : FALLBACK_OFFSET;
}

const ScrollToHash = () => {
  const { pathname, hash, key } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      return;
    }

    const id = decodeURIComponent(hash.slice(1));
    let cancelled = false;

    const scrollToTarget = () => {
      const el = document.getElementById(id);
      if (!el) return false;
      const offset = getNavbarOffset();
      const y = el.getBoundingClientRect().top + window.scrollY - offset - EXTRA_PADDING;
      window.scrollTo({ top: y, behavior: 'smooth' });
      return true;
    };

    const firstRaf = window.requestAnimationFrame(() => {
      if (cancelled) return;
      const ok = scrollToTarget();
      if (!ok) {
        let attempts = 0;
        const retry = () => {
          if (cancelled) return;
          attempts += 1;
          if (scrollToTarget()) return;
          if (attempts < 10) window.setTimeout(retry, 60);
        };
        window.setTimeout(retry, 60);
      } else {
        window.setTimeout(() => {
          if (!cancelled) scrollToTarget();
        }, 400);
      }
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(firstRaf);
    };
  }, [pathname, hash, key]);

  return null;
};

export default ScrollToHash;
