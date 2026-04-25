import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import ContactModal from './ContactModal';

// ─────────────────────────────────────────────────────────────────────────
//  ContactModal global provider
//
//  Single source of truth for the projection-request popup. The modal is
//  mounted ONCE at the top of the tree; any component anywhere in the app
//  (Navbar, Hero, Footer, Distrito pages, Blog posts, FAQ, etc.) opens it
//  via `useContactModal().open()` — without navigating to `#contacto` and
//  without needing to know whether the user is on `/`, `/blog/*`, or a
//  district page.
//
//  Rationale for centralization: we had 5+ call sites doing `href="/#contacto"`
//  which forced a page navigation for users on blog/district routes and
//  defeated the purpose of having a self-contained modal in the first place.
//  Centralizing also guarantees there's never more than one modal instance
//  rendered (no duplicated forms, no stale draft races).
// ─────────────────────────────────────────────────────────────────────────

type ContactModalContextValue = {
  /** Open the projection modal. Safe to call from any route. */
  open: () => void;
  /** Close the projection modal. */
  close: () => void;
  /** Whether the modal is currently open — rarely needed by consumers. */
  isOpen: boolean;
};

const ContactModalContext = createContext<ContactModalContextValue | null>(null);

export const ContactModalProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const value = useMemo<ContactModalContextValue>(
    () => ({ open, close, isOpen }),
    [open, close, isOpen],
  );

  return (
    <ContactModalContext.Provider value={value}>
      {children}
      {isOpen && <ContactModal onClose={close} />}
    </ContactModalContext.Provider>
  );
};

/**
 * Access the global ContactModal controls. Throws if used outside the
 * provider — by design, to catch mis-wirings at dev time.
 */
export const useContactModal = (): ContactModalContextValue => {
  const ctx = useContext(ContactModalContext);
  if (!ctx) {
    throw new Error(
      'useContactModal must be used inside <ContactModalProvider>',
    );
  }
  return ctx;
};
