import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Link,
  NavLink,
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { useAuth } from './AuthContext';
import SettingsDialog from './SettingsDialog';

// ── Layout persisted state ────────────────────────────────────────
const LS_WIDTH = 'homie-cms-sidebar-width';
const LS_COLLAPSED = 'homie-cms-sidebar-collapsed';
const LS_SECTIONS = 'homie-cms-sidebar-sections';

const MIN_W = 200;
const MAX_W = 420;
const DEFAULT_W = 248;

type NavChild = {
  to: string;
  label: string;
};

type NavSection = {
  id: string;
  label: string;
  children: NavChild[];
};

const SECTIONS: NavSection[] = [
  {
    id: 'crm',
    label: 'CRM',
    children: [
      {
        to: '/admin/leads',
        label: 'Leads',
      },
    ],
  },
  {
    id: 'website',
    label: 'Website',
    children: [
      {
        to: '/admin/hero',
        label: 'Imágenes del hero',
      },
      {
        to: '/admin/posts',
        label: 'Posts del blog',
      },
      {
        to: '/admin/testimonios-propietarios',
        label: 'Propietarios',
      },
      {
        to: '/admin/testimonios-huespedes',
        label: 'Huéspedes',
      },
    ],
  },
];

const AdminLayout: React.FC = () => {
  const { session, loading, signOut, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [width, setWidth] = useState<number>(() => {
    const stored = Number(localStorage.getItem(LS_WIDTH));
    return stored >= MIN_W && stored <= MAX_W ? stored : DEFAULT_W;
  });
  const [collapsed, setCollapsed] = useState<boolean>(
    () => localStorage.getItem(LS_COLLAPSED) === '1'
  );
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem(LS_SECTIONS) ?? '') ?? { crm: true, website: true };
    } catch {
      return { crm: true, website: true };
    }
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [resizing, setResizing] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem(LS_WIDTH, String(width));
  }, [width]);
  useEffect(() => {
    localStorage.setItem(LS_COLLAPSED, collapsed ? '1' : '0');
  }, [collapsed]);
  useEffect(() => {
    localStorage.setItem(LS_SECTIONS, JSON.stringify(openSections));
  }, [openSections]);

  // ── Close user menu on outside click / escape ───────────────────
  useEffect(() => {
    if (!userMenuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (!userMenuRef.current?.contains(e.target as Node)) setUserMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [userMenuOpen]);

  // ── Drag-to-resize ─────────────────────────────────────────────
  const startResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setResizing(true);
    const onMove = (ev: MouseEvent) => {
      const next = Math.max(MIN_W, Math.min(MAX_W, ev.clientX));
      setWidth(next);
    };
    const onUp = () => {
      setResizing(false);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  // ── Cmd/Ctrl+\ to toggle sidebar (Notion-style) ────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '\\') {
        e.preventDefault();
        setCollapsed((c) => !c);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-white text-dark-gray/50 text-sm">
        Cargando…
      </div>
    );
  }
  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  const handleSignOut = async () => {
    setUserMenuOpen(false);
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-white text-dark-gray flex overflow-hidden">
      {/* ── Sidebar (desktop) ──────────────────────────────────── */}
      <aside
        style={{ width: collapsed ? 0 : width }}
        className={`hidden lg:flex flex-col bg-white shrink-0 relative overflow-hidden ${
          resizing ? '' : 'transition-[width] duration-200 ease-out'
        }`}
      >
        <div className="flex flex-col h-full" style={{ width, minWidth: width }}>
          {/* Workspace header — now the user menu trigger */}
          <div className="px-2 pt-2.5 pb-1" ref={userMenuRef}>
            <div className="relative">
              <div
                className={`group/ws w-full flex items-center gap-2 px-2 py-1.5 rounded-[5px] transition-colors ${
                  userMenuOpen ? 'bg-[#0000000D]' : 'hover:bg-[#00000008]'
                }`}
              >
                <button
                  onClick={() => setUserMenuOpen((o) => !o)}
                  className="flex items-center gap-2 flex-1 min-w-0 text-left"
                >
                  <div className="w-[22px] h-[22px] rounded bg-white ring-1 ring-[#0000000F] overflow-hidden flex items-center justify-center flex-shrink-0">
                    <img src="/Homie-fondoblanco.jpeg" alt="" className="w-full h-full object-cover" />
                  </div>
                  <span className="flex-1 min-w-0 truncate text-[14px] font-medium text-[#37352F]">
                    Homie Admin
                  </span>
                  <span className="text-[#37352F80]">
                    <ChevronsUpDown />
                  </span>
                </button>
                <button
                  onClick={() => setCollapsed(true)}
                  title="Contraer barra lateral ⌘\"
                  className="opacity-0 group-hover/ws:opacity-100 transition-opacity text-[#37352F80] hover:text-[#37352F] hover:bg-[#0000000C] rounded p-0.5 flex-shrink-0"
                >
                  <DoubleChevronLeft />
                </button>
              </div>

              {userMenuOpen && (
                <UserMenu
                  name={(user?.user_metadata?.name as string | undefined) ?? ''}
                  email={user?.email ?? ''}
                  onSettings={() => {
                    setUserMenuOpen(false);
                    setSettingsOpen(true);
                  }}
                  onSignOut={handleSignOut}
                />
              )}
            </div>
          </div>

          {/* Quick actions */}
          <div className="px-2 pb-1">
            <NavRow
              icon={<HomeOutline />}
              label="Inicio"
              onClick={() => navigate('/admin')}
              active={location.pathname === '/admin'}
            />
            <NavRow
              icon={<ExternalIcon />}
              label="Ver sitio público"
              onClick={() => window.open('/', '_blank', 'noopener,noreferrer')}
            />
          </div>

          <nav className="flex-1 overflow-y-auto px-1 pb-3 pt-1">
            {SECTIONS.map((section) => {
              const open = openSections[section.id] !== false;
              return (
                <div key={section.id} className="mb-0.5">
                  <div className="group/section flex items-center px-2 py-1 rounded-[5px] hover:bg-[#00000006]">
                    <button
                      onClick={() =>
                        setOpenSections((s) => ({ ...s, [section.id]: !open }))
                      }
                      className="flex items-center gap-1 flex-1 min-w-0 text-left"
                    >
                      <span
                        className={`text-[#37352F80] transition-transform duration-150 ${
                          open ? 'rotate-90' : ''
                        }`}
                      >
                        <Chevron />
                      </span>
                      <span className="text-[12px] font-medium text-[#37352F80] uppercase tracking-[0.04em] truncate">
                        {section.label}
                      </span>
                    </button>
                  </div>

                  <div
                    className={`overflow-hidden transition-[max-height,opacity] duration-200 ${
                      open ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="pl-1">
                      {section.children.map((c) => (
                        <NavLeaf key={c.to} to={c.to} label={c.label} />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Drag handle */}
        {!collapsed && (
          <div
            onMouseDown={startResize}
            onDoubleClick={() => setWidth(DEFAULT_W)}
            className={`absolute top-0 right-0 h-full w-[3px] cursor-col-resize ${
              resizing ? 'bg-[#2383E2]' : 'hover:bg-[#2383E240]'
            } transition-colors`}
            title="Arrastra para redimensionar · doble clic para restablecer"
          />
        )}
      </aside>

      {/* ── Mobile sidebar (overlay) ──────────────────────────── */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-dark-gray/30 backdrop-blur-[2px]"
          onClick={() => setMobileOpen(false)}
        >
          <aside
            className="absolute left-0 top-0 bottom-0 w-[280px] bg-white shadow-[8px_0_24px_-12px_rgba(0,0,0,0.2)] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <MobileSidebar
              onClose={() => setMobileOpen(false)}
              onSignOut={handleSignOut}
              userEmail={user?.email ?? ''}
              userName={(user?.user_metadata?.name as string | undefined) ?? ''}
            />
          </aside>
        </div>
      )}

      {/* ── Main content ───────────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col bg-white">
        <header className="sticky top-0 z-20 bg-white">
          <div className="px-4 lg:px-6 py-2.5 flex items-center gap-2">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-1.5 rounded-md hover:bg-[#00000008] text-[#37352F80]"
              aria-label="Abrir menú"
            >
              <Hamburger />
            </button>

            {collapsed && (
              <button
                onClick={() => setCollapsed(false)}
                title="Expandir barra lateral ⌘\"
                className="hidden lg:inline-flex p-1.5 rounded-md hover:bg-[#00000008] text-[#37352F80] hover:text-[#37352F]"
              >
                <DoubleChevronRight />
              </button>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-white">
          <div className="max-w-[1400px] mx-auto px-6 py-10">
            <Outlet />
          </div>
        </main>
      </div>

      <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
};

// ── User menu popover ─────────────────────────────────────────────
const UserMenu: React.FC<{
  name: string;
  email: string;
  onSettings: () => void;
  onSignOut: () => void;
}> = ({ name, email, onSettings, onSignOut }) => {
  const displayName = name.trim() || email || '—';
  const initialSource = name.trim() || email || '?';
  return (
    <div
      role="menu"
      className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg ring-1 ring-[#00000014] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.25),0_2px_6px_-2px_rgba(0,0,0,0.08)] py-1 z-30"
    >
      <div className="px-3 py-2 flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-key-green/25 grid place-items-center text-[#37352F] font-semibold text-[12px] flex-shrink-0">
          {initialSource.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12.5px] text-[#37352F] truncate leading-tight font-medium">
            {displayName}
          </p>
          <p className="text-[10.5px] text-[#37352F66] leading-tight">Editor</p>
        </div>
      </div>
      <div className="h-px my-1 bg-[#0000000D]" />
      <MenuItem icon={<SettingsIcon />} label="Configuración" onClick={onSettings} />
      <div className="h-px my-1 bg-[#0000000D]" />
      <MenuItem icon={<LogoutIcon />} label="Cerrar sesión" onClick={onSignOut} danger />
    </div>
  );
};

const MenuItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}> = ({ icon, label, onClick, danger }) => (
  <button
    role="menuitem"
    onClick={onClick}
    className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-[13px] text-left hover:bg-[#00000008] transition-colors ${
      danger ? 'text-[#B91C1C]' : 'text-[#37352F]'
    }`}
  >
    <span className="w-4 h-4 flex items-center justify-center opacity-70">{icon}</span>
    <span>{label}</span>
  </button>
);

// ── Building blocks ───────────────────────────────────────────────
const NavRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  trailing?: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}> = ({ icon, label, trailing, active, disabled, onClick }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-full flex items-center gap-2 px-2 py-1 rounded-[5px] text-left transition-colors ${
      disabled
        ? 'text-[#37352F55] cursor-default'
        : active
        ? 'bg-[#0000000D] text-[#37352F]'
        : 'text-[#37352F] hover:bg-[#00000008]'
    }`}
  >
    <span className="w-4 h-4 flex items-center justify-center text-[#37352FAA] flex-shrink-0">
      {icon}
    </span>
    <span className="flex-1 min-w-0 truncate text-[13.5px]">{label}</span>
    {trailing && <span className="flex-shrink-0">{trailing}</span>}
  </button>
);

const NavLeaf: React.FC<{ to: string; label: string }> = ({ to, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-1.5 pl-6 pr-2 py-1 rounded-[5px] text-[13.5px] transition-colors ${
        isActive
          ? 'bg-[#0000000D] text-[#37352F] font-medium'
          : 'text-[#37352F] hover:bg-[#00000008]'
      }`
    }
  >
    <span className="flex-1 min-w-0 truncate">{label}</span>
  </NavLink>
);

const MobileSidebar: React.FC<{
  onClose: () => void;
  onSignOut: () => void;
  userEmail: string;
  userName: string;
}> = ({ onClose, onSignOut, userEmail, userName }) => (
  <>
    <div className="px-3 py-3 flex items-center justify-between">
      <Link to="/admin" onClick={onClose} className="flex items-center gap-2">
        <div className="w-6 h-6 rounded bg-white ring-1 ring-[#0000000F] overflow-hidden">
          <img src="/Homie-fondoblanco.jpeg" alt="" className="w-full h-full object-cover" />
        </div>
        <span className="text-[14px] font-medium text-[#37352F]">Homie Admin</span>
      </Link>
      <button onClick={onClose} className="p-1 text-[#37352F80] hover:text-[#37352F]" aria-label="Cerrar">
        <CloseIcon />
      </button>
    </div>
    <nav className="flex-1 overflow-y-auto p-2">
      {SECTIONS.map((s) => (
        <div key={s.id} className="mb-3">
          <p className="px-2 py-1 text-[11px] font-medium uppercase tracking-[0.08em] text-[#37352F80]">
            {s.label}
          </p>
          {s.children.map((c) => (
            <NavLink
              key={c.to}
              to={c.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center px-2 py-1.5 rounded-md text-[13.5px] ${
                  isActive ? 'bg-[#0000000D] font-medium' : 'hover:bg-[#00000008]'
                } text-[#37352F]`
              }
            >
              {c.label}
            </NavLink>
          ))}
        </div>
      ))}
    </nav>
    <div className="p-2">
      <div className="flex items-center gap-2 px-2 py-1.5">
        <div className="w-6 h-6 rounded-full bg-key-green/25 grid place-items-center text-[11px] font-semibold">
          {(userName || userEmail || '?').charAt(0).toUpperCase()}
        </div>
        <p className="flex-1 min-w-0 text-[12.5px] truncate">
          {userName.trim() || userEmail}
        </p>
        <button
          onClick={onSignOut}
          className="text-[#37352F80] hover:text-[#37352F] p-1"
          title="Cerrar sesión"
        >
          <LogoutIcon />
        </button>
      </div>
    </div>
  </>
);

// ── Icons ─────────────────────────────────────────────────────────
const Chevron = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
    <path d="M6.02 4.53a.5.5 0 0 1 .7 0l3 3a.5.5 0 0 1 0 .7l-3 3a.5.5 0 0 1-.7-.7L8.58 8 6.02 5.23a.5.5 0 0 1 0-.7Z" />
  </svg>
);
const ChevronsUpDown = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m7 15 5 5 5-5M7 9l5-5 5 5" />
  </svg>
);
const DoubleChevronLeft = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m11 17-5-5 5-5M18 17l-5-5 5-5" />
  </svg>
);
const DoubleChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m13 17 5-5-5-5M6 17l5-5-5-5" />
  </svg>
);
const HomeOutline = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1v-8Z" />
  </svg>
);
const ExternalIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" />
    <path d="M14 4h6v6M10 14 20 4" />
  </svg>
);
const Hamburger = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);
const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);
const SettingsIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
  </svg>
);
const LogoutIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
  </svg>
);

export default AdminLayout;
