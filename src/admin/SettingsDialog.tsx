import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

type SectionId = 'profile' | 'security';

type Props = {
  open: boolean;
  onClose: () => void;
};

const SettingsDialog: React.FC<Props> = ({ open, onClose }) => {
  const { user } = useAuth();
  const [section, setSection] = useState<SectionId>('profile');

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-gray/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl ring-1 ring-[#00000014] shadow-[0_30px_80px_-20px_rgba(40,40,40,0.35)] w-full max-w-[960px] h-[620px] max-h-[85vh] flex overflow-hidden relative"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute top-3 right-3 w-7 h-7 grid place-items-center rounded-md text-[#37352F80] hover:text-[#37352F] hover:bg-[#0000000A] transition-colors z-10"
        >
          <CloseIcon />
        </button>

        {/* ── Left sidebar ───────────────────────────────────── */}
        <aside className="w-[240px] shrink-0 bg-[#FBFBFA] border-r border-[#00000008] py-4 px-3 overflow-y-auto">
          <p className="px-2 pb-1.5 text-[11.5px] font-medium uppercase tracking-[0.06em] text-[#37352F66]">
            Cuenta
          </p>
          <SidebarItem
            icon={<UserIcon />}
            label="Mi perfil"
            active={section === 'profile'}
            onClick={() => setSection('profile')}
          />
          <SidebarItem
            icon={<ShieldIcon />}
            label="Seguridad"
            active={section === 'security'}
            onClick={() => setSection('security')}
          />
        </aside>

        {/* ── Right content ───────────────────────────────────── */}
        <main className="flex-1 min-w-0 overflow-y-auto">
          <div className="px-10 py-10 max-w-[640px]">
            {section === 'profile' && <ProfileSection email={user?.email ?? ''} userId={user?.id ?? ''} initialName={(user?.user_metadata?.name as string | undefined) ?? ''} />}
            {section === 'security' && <SecuritySection />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SettingsDialog;

// ── Sidebar item ────────────────────────────────────────────────
const SidebarItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left text-[13.5px] transition-colors ${
      active
        ? 'bg-[#0000000D] text-[#37352F]'
        : 'text-[#37352F] hover:bg-[#00000008]'
    }`}
  >
    <span className="w-4 h-4 flex items-center justify-center text-[#37352FAA]">{icon}</span>
    <span className="truncate">{label}</span>
  </button>
);

// ── Profile section ─────────────────────────────────────────────
const ProfileSection: React.FC<{ email: string; userId: string; initialName: string }> = ({
  email,
  userId,
  initialName,
}) => {
  const [name, setName] = useState(initialName);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const initial = useMemo(() => (name || email || '?').charAt(0).toUpperCase(), [name, email]);
  const dirty = name.trim() !== initialName.trim();

  const onSave = async () => {
    if (!supabase) return;
    setSaving(true);
    setMsg(null);
    try {
      const { error } = await supabase.auth.updateUser({ data: { name: name.trim() } });
      if (error) throw error;
      setMsg({ kind: 'ok', text: 'Nombre actualizado.' });
    } catch (e) {
      setMsg({ kind: 'err', text: (e as Error).message });
    } finally {
      setSaving(false);
    }
  };

  const onCopyId = async () => {
    try {
      await navigator.clipboard.writeText(userId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* noop */
    }
  };

  return (
    <>
      <Header
        title="Mi perfil"
        subtitle="Administra tu información de cuenta"
      />

      <SectionTitle>Cuenta</SectionTitle>

      <div className="flex items-center gap-4 mb-6">
        <div className="w-[60px] h-[60px] rounded-full bg-key-green/25 grid place-items-center text-[#37352F] font-semibold text-[22px] ring-1 ring-[#0000000A]">
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <label className="block text-[12px] text-[#37352F80] mb-1">Nombre preferido</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tu nombre"
            className="w-full h-9 px-3 rounded-md bg-white ring-1 ring-[#00000014] focus:ring-2 focus:ring-key-green focus:outline-none text-[13.5px] text-[#37352F] transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={onSave}
          disabled={!dirty || saving}
          className="text-[13px] font-semibold px-3.5 py-2 rounded-md bg-key-green text-white hover:bg-key-green/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? 'Guardando…' : 'Guardar cambios'}
        </button>
        {msg && (
          <span
            className={`text-[12.5px] ${
              msg.kind === 'ok' ? 'text-key-green' : 'text-red-700'
            }`}
          >
            {msg.text}
          </span>
        )}
      </div>

      <SectionTitle>Identidad</SectionTitle>

      <Row label="Email" description="Email asociado a tu cuenta (no editable)">
        <span className="text-[13px] text-[#37352F]">{email || '—'}</span>
      </Row>

      <Row label="ID de usuario" description="Identificador único de esta cuenta en Supabase">
        <div className="flex items-center gap-2">
          <code className="text-[12px] text-[#37352F80] bg-[#0000000A] ring-1 ring-[#00000010] rounded px-2 py-1 max-w-[240px] truncate">
            {userId}
          </code>
          <button
            onClick={onCopyId}
            className="text-[12px] px-2.5 py-1 rounded-md bg-[#0000000A] ring-1 ring-[#00000010] hover:bg-[#0000000F] text-[#37352F] transition-colors"
          >
            {copied ? '¡Copiado!' : 'Copiar'}
          </button>
        </div>
      </Row>
    </>
  );
};

// ── Security section ────────────────────────────────────────────
const SecuritySection: React.FC = () => {
  const [pwd, setPwd] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const [signingOut, setSigningOut] = useState(false);
  const [signOutMsg, setSignOutMsg] = useState<string | null>(null);

  const onUpdatePassword = async () => {
    if (!supabase) return;
    setMsg(null);
    if (pwd.length < 8) {
      setMsg({ kind: 'err', text: 'La contraseña debe tener al menos 8 caracteres.' });
      return;
    }
    if (pwd !== confirm) {
      setMsg({ kind: 'err', text: 'Las contraseñas no coinciden.' });
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: pwd });
      if (error) throw error;
      setPwd('');
      setConfirm('');
      setMsg({ kind: 'ok', text: 'Contraseña actualizada.' });
    } catch (e) {
      setMsg({ kind: 'err', text: (e as Error).message });
    } finally {
      setSaving(false);
    }
  };

  const onSignOutOthers = async () => {
    if (!supabase) return;
    if (!window.confirm('¿Cerrar sesión en todos los demás dispositivos? Mantendrás la sesión actual abierta.')) return;
    setSigningOut(true);
    setSignOutMsg(null);
    try {
      const { error } = await supabase.auth.signOut({ scope: 'others' });
      if (error) throw error;
      setSignOutMsg('Sesiones cerradas en los demás dispositivos.');
    } catch (e) {
      setSignOutMsg((e as Error).message);
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <>
      <Header title="Seguridad" subtitle="Protege el acceso a tu cuenta" />

      <SectionTitle>Cambiar contraseña</SectionTitle>

      <div className="space-y-3 mb-4">
        <div>
          <label className="block text-[12px] text-[#37352F80] mb-1">Nueva contraseña</label>
          <input
            type="password"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            placeholder="Mínimo 8 caracteres"
            className="w-full h-9 px-3 rounded-md bg-white ring-1 ring-[#00000014] focus:ring-2 focus:ring-key-green focus:outline-none text-[13.5px] text-[#37352F] transition-all"
          />
        </div>
        <div>
          <label className="block text-[12px] text-[#37352F80] mb-1">Confirma la nueva contraseña</label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Repite la contraseña"
            className="w-full h-9 px-3 rounded-md bg-white ring-1 ring-[#00000014] focus:ring-2 focus:ring-key-green focus:outline-none text-[13.5px] text-[#37352F] transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 mb-10">
        <button
          onClick={onUpdatePassword}
          disabled={saving || !pwd}
          className="text-[13px] font-semibold px-3.5 py-2 rounded-md bg-key-green text-white hover:bg-key-green/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? 'Actualizando…' : 'Actualizar contraseña'}
        </button>
        {msg && (
          <span
            className={`text-[12.5px] ${
              msg.kind === 'ok' ? 'text-key-green' : 'text-red-700'
            }`}
          >
            {msg.text}
          </span>
        )}
      </div>

      <SectionTitle>Dispositivos</SectionTitle>

      <Row
        label="Cerrar sesión en otros dispositivos"
        description="Mantienes esta sesión abierta; todas las demás sesiones se cerrarán."
      >
        <button
          onClick={onSignOutOthers}
          disabled={signingOut}
          className="text-[12.5px] px-3 py-1.5 rounded-md bg-red-500/10 ring-1 ring-red-500/30 text-red-700 hover:bg-red-500/15 disabled:opacity-50 transition-colors"
        >
          {signingOut ? 'Cerrando…' : 'Cerrar sesiones'}
        </button>
      </Row>
      {signOutMsg && (
        <p className="text-[12.5px] text-[#37352F80] mt-2">{signOutMsg}</p>
      )}
    </>
  );
};

// ── Shared building blocks ──────────────────────────────────────
const Header: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <div className="mb-8">
    <h2 className="text-[22px] font-semibold text-[#37352F] leading-tight">{title}</h2>
    {subtitle && <p className="text-[13px] text-[#37352F80] mt-1">{subtitle}</p>}
  </div>
);

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className="text-[13px] font-semibold text-[#37352F] mt-6 mb-3 pb-2 border-b border-[#00000010]">
    {children}
  </h3>
);

const Row: React.FC<{
  label: string;
  description?: string;
  children: React.ReactNode;
}> = ({ label, description, children }) => (
  <div className="flex items-start justify-between gap-6 py-3">
    <div className="min-w-0 flex-1">
      <p className="text-[13.5px] text-[#37352F] leading-tight">{label}</p>
      {description && (
        <p className="text-[12px] text-[#37352F80] mt-1 leading-[1.5]">{description}</p>
      )}
    </div>
    <div className="flex-shrink-0">{children}</div>
  </div>
);

// ── Icons ───────────────────────────────────────────────────────
const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);
const UserIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const ShieldIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
  </svg>
);
