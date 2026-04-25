import React, { useEffect, useRef, useState } from 'react';
import { Share2, Link as LinkIcon, Check, Twitter, Linkedin, MessageCircle } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

type Props = {
  url: string;
  title: string;
};

const ShareButton: React.FC<Props> = ({ url, title }) => {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  // Close on outside click / Esc
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        !buttonRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const handleNative = async () => {
    // Use Web Share API on mobile if available
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await (navigator as Navigator & { share: (data: { url: string; title: string }) => Promise<void> }).share({
          url,
          title,
        });
        return;
      } catch {
        // User cancelled or not allowed — fall through to popover
      }
    }
    setOpen((v) => !v);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    }
  };

  const encoded = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  return (
    <div className="relative inline-flex">
      <button
        ref={buttonRef}
        type="button"
        onClick={handleNative}
        aria-label={t('blog.share.native')}
        aria-expanded={open}
        aria-haspopup="menu"
        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-[12.5px] font-medium text-dark-gray/80 hover:text-dark-gray ring-1 ring-dark-gray/15 hover:ring-dark-gray/30 bg-white hover:bg-dark-gray/[0.03] transition-all duration-200"
      >
        <Share2 size={14} strokeWidth={1.8} aria-hidden="true" />
        <span>{t('blog.share.label')}</span>
      </button>

      {open && (
        <div
          ref={popoverRef}
          role="menu"
          className="absolute right-0 top-full mt-2 z-20 min-w-[200px] rounded-xl bg-white shadow-[0_12px_40px_-8px_rgba(20,20,20,0.18)] ring-1 ring-dark-gray/10 p-1.5 animate-in fade-in zoom-in-95 duration-150"
        >
          <ShareItem
            onClick={copyLink}
            icon={copied ? <Check size={14} strokeWidth={2} /> : <LinkIcon size={14} strokeWidth={1.8} />}
            label={copied ? t('blog.share.copied') : t('blog.share.copy')}
            highlight={copied}
          />
          <div className="my-1 h-px bg-dark-gray/[0.06]" />
          <ShareItem
            href={`https://twitter.com/intent/tweet?url=${encoded}&text=${encodedTitle}`}
            icon={<Twitter size={14} strokeWidth={1.8} />}
            label={t('blog.share.twitter')}
          />
          <ShareItem
            href={`https://wa.me/?text=${encodedTitle}%20${encoded}`}
            icon={<MessageCircle size={14} strokeWidth={1.8} />}
            label={t('blog.share.whatsapp')}
          />
          <ShareItem
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`}
            icon={<Linkedin size={14} strokeWidth={1.8} />}
            label={t('blog.share.linkedin')}
          />
        </div>
      )}
    </div>
  );
};

type ItemProps = {
  icon: React.ReactNode;
  label: string;
  href?: string;
  onClick?: () => void;
  highlight?: boolean;
};

const ShareItem: React.FC<ItemProps> = ({ icon, label, href, onClick, highlight }) => {
  const cls = [
    'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-colors text-left',
    highlight
      ? 'text-key-green font-medium'
      : 'text-dark-gray/80 hover:text-dark-gray hover:bg-dark-gray/[0.04]',
  ].join(' ');

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        role="menuitem"
        className={cls}
      >
        <span className="text-dark-gray/60" aria-hidden="true">{icon}</span>
        <span>{label}</span>
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} role="menuitem" className={cls}>
      <span className={highlight ? 'text-key-green' : 'text-dark-gray/60'} aria-hidden="true">{icon}</span>
      <span>{label}</span>
    </button>
  );
};

export default ShareButton;
