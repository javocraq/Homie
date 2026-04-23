import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Phone, Mail, ArrowRight } from 'lucide-react';
import { useLanguage, type Language } from '../i18n/LanguageContext';
import { useScrolled } from '../hooks/useScrolled';
import { useContactModal } from './ContactModalProvider';

// ─────────────────────────────────────────────────────────────────────────
//  Navbar — editorial minimal
//
//  Design direction lifted from meetradial.com (hairline precision, inline
//  typography, zero chrome) and mistral.ai (restrained spacing, single
//  accented CTA, scroll-triggered blur). No floating capsule around the nav
//  — we trust the typography and use a 1px key-green underline as the one
//  signature indicator for hover + active states. A tiny pulsing "live" dot
//  next to the phone number gives the header a heartbeat without shouting.
// ─────────────────────────────────────────────────────────────────────────

type NavItem =
  | { key: string; labelKey: 'nav.ventajas' | 'nav.proceso' | 'nav.testimonios' | 'nav.faq'; anchor: string }
  | { key: string; labelKey: 'nav.blog'; to: string };

const navItems: NavItem[] = [
  { key: 'ventajas', labelKey: 'nav.ventajas', anchor: 'ventajas' },
  { key: 'proceso', labelKey: 'nav.proceso', anchor: 'proceso' },
  { key: 'blog', labelKey: 'nav.blog', to: '/blog' },
  { key: 'testimonios', labelKey: 'nav.testimonios', anchor: 'testimonios' },
  { key: 'faq', labelKey: 'nav.faq', anchor: 'faq' },
];

/**
 * Segmented language toggle with a sliding green indicator.
 * Minimal capsule, two labels, one glide — the one piece of "chrome" we keep,
 * because a bare text pair reads as a bug, not a control.
 */
const LangSwitch: React.FC<{
  lang: Language;
  setLang: (l: Language) => void;
  t: (k: any) => string;
  variant?: 'header' | 'mobile';
}> = ({ lang, setLang, t, variant = 'header' }) => {
  const isMobile = variant === 'mobile';
  return (
    <div
      role="group"
      aria-label={t('nav.lang.toggle')}
      className={[
        'relative inline-flex items-center p-0.5 rounded-full ring-1 transition-colors',
        isMobile
          ? 'h-7 bg-white/[0.04] ring-white/[0.08]'
          : 'h-7 bg-white/[0.03] ring-white/[0.06]',
      ].join(' ')}
    >
      <span
        aria-hidden="true"
        className={[
          'absolute top-0.5 bottom-0.5 left-0.5 w-[30px] rounded-full bg-key-green/[0.14] ring-1 ring-key-green/25',
          'transition-transform duration-[450ms] ease-[cubic-bezier(0.2,0.8,0.2,1)]',
          lang === 'es' ? 'translate-x-0' : 'translate-x-[30px]',
        ].join(' ')}
      />
      <button
        type="button"
        onClick={() => setLang('es')}
        aria-pressed={lang === 'es'}
        className={[
          'relative z-10 w-[30px] h-6 text-[10px] font-semibold tracking-[0.16em] uppercase transition-colors duration-200',
          lang === 'es' ? 'text-key-green' : 'text-white/45 hover:text-white/75',
        ].join(' ')}
      >
        {t('nav.lang.es')}
      </button>
      <button
        type="button"
        onClick={() => setLang('en')}
        aria-pressed={lang === 'en'}
        className={[
          'relative z-10 w-[30px] h-6 text-[10px] font-semibold tracking-[0.16em] uppercase transition-colors duration-200',
          lang === 'en' ? 'text-key-green' : 'text-white/45 hover:text-white/75',
        ].join(' ')}
      >
        {t('nav.lang.en')}
      </button>
    </div>
  );
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const scrolled = useScrolled(8);
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';
  const { lang, setLang, t } = useLanguage();
  const { open: openContactModal } = useContactModal();

  // Opens the projection modal from any route without navigating. Also
  // closes the mobile drawer if it happens to be open (so the modal takes
  // over cleanly on small screens).
  const openProjection = () => {
    setIsOpen(false);
    openContactModal();
  };
  const isBlogRoute = location.pathname.startsWith('/blog');
  // Show the dark glass backdrop on every non-home route so the white-on-dark
  // navbar stays legible over light PageShell pages (Distritos, Privacidad,
  // Términos, Blog, Gracias, etc.). Home keeps the transparent-on-Hero look
  // until the user scrolls.
  const showBackdrop = scrolled || isOpen || isBlogRoute || !isHome;

  // Hide the navbar CTA only when the Hero CTA is the primary call to action
  // on screen (home route AND not yet scrolled). Two green pills shouting the
  // same thing 40px apart is redundant; once the user scrolls past the hero
  // the navbar CTA fades back in so there's always one persistent conversion
  // entry point. On non-home routes the navbar CTA stays visible because
  // those pages have no hero CTA of their own.
  const heroCtaRedundant = isHome && !scrolled;

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const goToAnchor = (e: React.MouseEvent<HTMLAnchorElement>, anchor: string) => {
    e.preventDefault();
    setIsOpen(false);
    if (isHome) {
      const scrollOnce = () => {
        const el = document.getElementById(anchor);
        if (!el) return false;
        const raw = getComputedStyle(document.documentElement)
          .getPropertyValue('--navbar-height')
          .trim();
        const parsed = parseFloat(raw);
        const offset = Number.isFinite(parsed) && parsed > 0 ? parsed : 80;
        const y = el.getBoundingClientRect().top + window.scrollY - offset - 16;
        window.scrollTo({ top: y, behavior: 'smooth' });
        return true;
      };
      if (scrollOnce()) {
        window.setTimeout(scrollOnce, 400);
      }
      history.replaceState(null, '', `#${anchor}`);
    } else {
      navigate(`/#${anchor}`);
    }
  };

  const goHome = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setIsOpen(false);
    if (isHome) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      history.replaceState(null, '', '/');
    } else {
      navigate('/');
    }
  };

  // Inline nav link — no pill, no chrome. A 1px key-green underline
  // slides left→right on hover; the same underline persists when active.
  // Radial-editorial, Mistral-restrained. The `group` enables the `after`
  // bar to respond to hover without a nested element.
  const navLink =
    [
      'group relative inline-flex items-center h-9 px-3',
      'text-[13px] font-medium text-white/65 hover:text-white',
      'transition-colors duration-200',
      // hairline underline indicator
      "after:content-[''] after:pointer-events-none",
      'after:absolute after:left-3 after:right-3 after:bottom-[10px]',
      'after:h-px after:bg-key-green',
      'after:origin-left after:scale-x-0',
      'after:transition-transform after:duration-[450ms] after:ease-[cubic-bezier(0.2,0.8,0.2,1)]',
      'hover:after:scale-x-100',
    ].join(' ');
  const navLinkActive =
    'text-white after:scale-x-100';

  return (
    <>
      <nav
        aria-label="Navegación principal"
        className={[
          'fixed top-0 inset-x-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500 ease-out',
          showBackdrop
            ? 'bg-dark-gray/72 supports-[backdrop-filter]:bg-dark-gray/55 backdrop-blur-xl backdrop-saturate-150 border-b border-white/[0.06]'
            : 'bg-transparent border-b border-transparent',
        ].join(' ')}
      >
        {/* Signature: a barely-there key-green hairline at the very top —
            the "live system" pulse, only visible once the nav is anchored. */}
        <div
          aria-hidden="true"
          className={[
            'pointer-events-none absolute inset-x-0 top-0 h-px',
            'bg-gradient-to-r from-transparent via-key-green/40 to-transparent',
            'transition-opacity duration-700 ease-out',
            showBackdrop ? 'opacity-60' : 'opacity-0',
          ].join(' ')}
        />

        <div className="container mx-auto px-4 lg:px-8 flex items-center justify-between h-[72px]">
          {/* ── Left: wordmark (stable height — no scroll shrink) ── */}
          <a
            href="/"
            onClick={goHome}
            className="group flex items-center shrink-0"
            aria-label="Homie — ir al inicio"
          >
            <img
              src="/images/brand/homie-logo.png"
              alt="Homie"
              loading="eager"
              className="h-11 md:h-12 object-contain opacity-95 group-hover:opacity-100 transition-opacity duration-300"
            />
          </a>

          {/* ── Center-left: inline nav, no container ── */}
          <ul className="hidden lg:flex items-center gap-0.5">
            {navItems.map((item) => {
              if ('to' in item) {
                const active = isBlogRoute;
                return (
                  <li key={item.key}>
                    <Link
                      to={item.to}
                      onClick={() => setIsOpen(false)}
                      className={[navLink, active ? navLinkActive : ''].join(' ')}
                      aria-current={active ? 'page' : undefined}
                    >
                      {t(item.labelKey)}
                    </Link>
                  </li>
                );
              }
              return (
                <li key={item.key}>
                  <a
                    href={`/#${item.anchor}`}
                    onClick={(e) => goToAnchor(e, item.anchor)}
                    className={navLink}
                  >
                    {t(item.labelKey)}
                  </a>
                </li>
              );
            })}
          </ul>

          {/* ── Right: live contact · lang · CTA ── */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            {/* Live-status phone chip: pulsing dot + number. Single click
                target. No icon — the dot IS the icon. */}
            <a
              href="tel:+51912407529"
              aria-label="Llamar al +51 912 407 529"
              className="group hidden xl:inline-flex items-center gap-2 h-8 px-2.5 rounded-full text-[12px] font-medium text-white/55 hover:text-white transition-colors duration-200"
            >
              <span className="relative inline-flex w-1.5 h-1.5">
                <span
                  aria-hidden="true"
                  className="absolute inset-0 rounded-full bg-key-green/60 animate-ping"
                />
                <span
                  aria-hidden="true"
                  className="relative inline-block w-1.5 h-1.5 rounded-full bg-key-green shadow-[0_0_0_3px_rgba(104,180,131,0.08)]"
                />
              </span>
              <span className="tabular-nums tracking-[0.01em]">+51 912 407 529</span>
            </a>

            {/* Mail as icon-only, ultra-subtle */}
            <a
              href="mailto:contacto@homiebnb.com"
              aria-label="Enviar correo a contacto@homiebnb.com"
              title="contacto@homiebnb.com"
              className="inline-flex items-center justify-center w-8 h-8 rounded-full text-white/40 hover:text-key-green transition-colors duration-200"
            >
              <Mail size={13} strokeWidth={1.5} aria-hidden="true" />
            </a>

            {/* Hairline divider */}
            <span aria-hidden="true" className="w-px h-4 bg-white/[0.08]" />

            <LangSwitch lang={lang} setLang={setLang} t={t} />

            {/* CTA cluster (divider + button) — fades out when the Hero CTA
                owns conversion (home route at scroll top). Kept in the DOM
                and wrapped together so the fade is a single coordinated
                motion and the right-edge layout stays anchored (no reflow
                on scroll). `aria-hidden` + `tabIndex={-1}` when hidden
                remove the element from the accessibility tree and keyboard
                tab order, so screen readers and Tab navigation don't trip
                over an invisible button. */}
            <div
              aria-hidden={heroCtaRedundant}
              className={[
                'flex items-center gap-3',
                'transition-[opacity,transform] duration-500 ease-out',
                heroCtaRedundant
                  ? 'opacity-0 -translate-y-1 pointer-events-none'
                  : 'opacity-100 translate-y-0',
              ].join(' ')}
            >
              {/* Hairline divider */}
              <span aria-hidden="true" className="w-px h-4 bg-white/[0.08]" />

              {/* CTA — single filled pill, one accent, no bounce. The ring
                  grows slightly on hover; no y-translate (that's 2019). */}
              <button
                type="button"
                onClick={openProjection}
                tabIndex={heroCtaRedundant ? -1 : 0}
                className={[
                  'group inline-flex items-center gap-1.5 pl-4 pr-3 h-9 rounded-full',
                  'bg-key-green text-dark-gray',
                  'text-[12.5px] font-semibold tracking-[0.005em]',
                  'ring-1 ring-key-green/0',
                  'shadow-[0_1px_0_rgba(255,255,255,0.22)_inset]',
                  'hover:ring-key-green/35 hover:shadow-[0_1px_0_rgba(255,255,255,0.22)_inset,0_12px_36px_-10px_rgba(104,180,131,0.55)]',
                  'transition-[box-shadow,ring-color] duration-300 ease-out',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-key-green/60 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-gray',
                ].join(' ')}
              >
                <span>{t('nav.cta')}</span>
                <ArrowRight
                  size={13}
                  strokeWidth={2.25}
                  aria-hidden="true"
                  className="transition-transform duration-300 ease-out group-hover:translate-x-0.5"
                />
              </button>
            </div>
          </div>

          {/* ── Mobile toggles ── */}
          <div className="lg:hidden flex items-center gap-2.5 relative z-[60]">
            <LangSwitch lang={lang} setLang={setLang} t={t} variant="mobile" />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-key-green/50 rounded-full w-9 h-9 inline-flex items-center justify-center hover:bg-white/[0.06] transition-colors"
              aria-label={isOpen ? t('nav.closeMenu') : t('nav.openMenu')}
              aria-expanded={isOpen}
            >
              {isOpen ? <X size={19} strokeWidth={1.75} /> : <Menu size={19} strokeWidth={1.75} />}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile full-screen overlay — editorial type, refined spacing ── */}
      <div
        className={[
          'lg:hidden fixed inset-0 z-40 bg-dark-gray transition-opacity duration-500 ease-out',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
        aria-hidden={!isOpen}
      >
        {/* ambient green wash */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 -right-32 w-[520px] h-[520px] rounded-full bg-key-green/[0.08] blur-[120px]"
        />
        <div className="relative h-full flex flex-col justify-between pt-28 pb-10 px-6">
          <div>
            <p className="text-[10px] font-medium tracking-[0.28em] uppercase text-white/35 mb-7">
              {t('nav.menu')}
            </p>
            <ul className="space-y-0.5">
              {navItems.map((item, idx) => {
                const style = {
                  animationDelay: isOpen ? `${80 + idx * 45}ms` : '0ms',
                } as React.CSSProperties;
                const itemCls = [
                  'group block py-2.5 text-[28px] md:text-[32px] font-poppins font-medium',
                  'text-white/95 hover:text-key-green transition-colors duration-200',
                  'tracking-[-0.015em] leading-[1.15]',
                  isOpen ? 'animate-[fadeUp_0.55s_cubic-bezier(0.2,0.8,0.2,1)_both]' : '',
                ].join(' ');
                if ('to' in item) {
                  return (
                    <li key={item.key} style={style}>
                      <Link to={item.to} onClick={() => setIsOpen(false)} className={itemCls}>
                        <span className="inline-flex items-baseline gap-3">
                          <span
                            aria-hidden="true"
                            className="text-[10px] font-mono text-white/25 tracking-[0.1em] translate-y-[-4px] group-hover:text-key-green transition-colors"
                          >
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                          {t(item.labelKey)}
                        </span>
                      </Link>
                    </li>
                  );
                }
                return (
                  <li key={item.key} style={style}>
                    <a
                      href={`/#${item.anchor}`}
                      onClick={(e) => goToAnchor(e, item.anchor)}
                      className={itemCls}
                    >
                      <span className="inline-flex items-baseline gap-3">
                        <span
                          aria-hidden="true"
                          className="text-[10px] font-mono text-white/25 tracking-[0.1em] translate-y-[-4px] group-hover:text-key-green transition-colors"
                        >
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        {t(item.labelKey)}
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="space-y-5">
            <div className="h-px bg-white/[0.08]" />
            <div className="space-y-3">
              <a
                href="tel:+51912407529"
                aria-label="Llamar al +51 912 407 529"
                className="flex items-center gap-3 text-[13.5px] text-white/70 hover:text-key-green transition-colors"
              >
                <Phone size={15} strokeWidth={1.5} aria-hidden="true" />
                +51 912 407 529
              </a>
              <a
                href="mailto:contacto@homiebnb.com"
                aria-label="Enviar correo a contacto@homiebnb.com"
                className="flex items-center gap-3 text-[13.5px] text-white/70 hover:text-key-green transition-colors"
              >
                <Mail size={15} strokeWidth={1.5} aria-hidden="true" />
                contacto@homiebnb.com
              </a>
            </div>
            <button
              type="button"
              onClick={openProjection}
              className="group inline-flex w-full items-center justify-center gap-2 px-6 h-12 rounded-full bg-key-green text-dark-gray font-semibold tracking-[0.005em] text-[14px] ring-1 ring-key-green/40 shadow-[0_8px_28px_-10px_rgba(104,180,131,0.6)]"
            >
              {t('nav.cta')}
              <ArrowRight
                size={15}
                strokeWidth={2.25}
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:translate-x-0.5"
              />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
